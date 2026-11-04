#!/usr/bin/env python3
"""Preview the static site with HTTP Range support; Python 3.9+, no packages."""

import argparse
import http.server
import os
import re
from functools import partial
from pathlib import Path


class LimitedReader:
    def __init__(self, stream, remaining):
        self.stream = stream
        self.remaining = remaining

    def read(self, size=-1):
        if self.remaining <= 0:
            return b''
        size = self.remaining if size < 0 else min(size, self.remaining)
        data = self.stream.read(size)
        self.remaining -= len(data)
        return data

    def close(self):
        self.stream.close()


class RangeHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.mp4': 'video/mp4', '.js': 'text/javascript', '.css': 'text/css'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        header = self.headers.get('Range')
        if not header or not os.path.isfile(path):
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', header.strip())
        size = os.path.getsize(path)
        if not match or not any(match.groups()) or size == 0:
            return self.invalid_range(size)
        first, last = match.groups()
        if first:
            start = int(first)
            end = min(int(last), size - 1) if last else size - 1
        else:
            length = int(last)
            if length <= 0:
                return self.invalid_range(size)
            start, end = max(0, size - length), size - 1
        if start >= size or start > end:
            return self.invalid_range(size)
        stream = open(path, 'rb')
        stream.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        return LimitedReader(stream, end - start + 1)

    def invalid_range(self, size):
        self.send_response(416)
        self.send_header('Content-Range', f'bytes */{size}')
        self.send_header('Content-Length', '0')
        self.end_headers()
        return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--directory', type=Path, default=Path(__file__).resolve().parents[1] / 'site')
    args = parser.parse_args()
    site = args.directory.resolve()
    if not (site / 'index.html').is_file():
        parser.error('directory must contain index.html')
    if not 1 <= args.port <= 65535:
        parser.error('port must be between 1 and 65535')
    try:
        server = http.server.ThreadingHTTPServer(('127.0.0.1', args.port), partial(RangeHandler, directory=str(site)))
    except OSError as error:
        parser.exit(1, f'Cannot start preview: {error}. Try --port 8766.' + chr(10))
    print(f'Open http://127.0.0.1:{args.port}/#gallery', flush=True)
    print('Press Ctrl+C to stop. Nothing is uploaded.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
