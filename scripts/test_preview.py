"""Standard-library smoke tests for the portable preview server."""
import http.client
import http.server
import tempfile
import threading
import unittest
from functools import partial
from pathlib import Path

from serve import RangeHandler


class PreviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        root = Path(cls.tmp.name)
        (root / 'index.html').write_text('<html>Preview</html>', encoding='utf-8')
        (root / 'clip.mp4').write_bytes(bytes(range(100)))
        cls.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), partial(RangeHandler, directory=str(root)))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)
        cls.tmp.cleanup()

    def request(self, path, range_value=None):
        conn = http.client.HTTPConnection('127.0.0.1', self.server.server_port)
        headers = {} if range_value is None else {'Range': range_value}
        conn.request('GET', path, headers=headers)
        res = conn.getresponse()
        result = res.status, dict(res.getheaders()), res.read()
        conn.close()
        return result

    def test_home(self):
        status, headers, data = self.request('/')
        self.assertEqual(status, 200)
        self.assertIn(b'Preview', data)
        self.assertIn('no-store', headers['Cache-Control'])

    def test_prefix_range(self):
        status, headers, data = self.request('/clip.mp4', 'bytes=0-9')
        self.assertEqual(status, 206)
        self.assertEqual(data, bytes(range(10)))
        self.assertEqual(headers['Content-Range'], 'bytes 0-9/100')

    def test_suffix_range(self):
        status, headers, data = self.request('/clip.mp4', 'bytes=-5')
        self.assertEqual(status, 206)
        self.assertEqual(data, bytes(range(95, 100)))

    def test_unsatisfiable_range(self):
        status, headers, data = self.request('/clip.mp4', 'bytes=110-120')
        self.assertEqual(status, 416)
        self.assertEqual(headers['Content-Range'], 'bytes */100')


if __name__ == '__main__':
    unittest.main()
