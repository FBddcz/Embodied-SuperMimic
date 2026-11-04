#!/usr/bin/env python3
"""Read-only checks for the website allowlist, links, hashes and result boundaries."""

import hashlib
import json
import math
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
PUBLIC_METADATA = {
    '.github/workflows/pages.yml', '.gitignore', 'CONTRIBUTING.md', 'LICENSE',
    'README.md', 'THIRD_PARTY_NOTICES.md', 'docs/EXPERIMENTS.md',
    'docs/QUICKSTART.md', 'docs/RELEASE_STATUS.md', 'docs/REPRODUCIBILITY.md',
    'licenses/panda-Apache-2.0.txt', 'licenses/piper-MIT.txt', 'licenses/robosuite.txt',
    'licenses/robotiq-BSD.txt', 'licenses/upstream-manipulation-MIT.txt',
    'licenses/ur5e-BSD.txt', 'licenses/xarm7-BSD-3-Clause.txt',
    'results/mainline.json', 'scripts/check_site.py', 'scripts/serve.py',
    'scripts/test_preview.py',
}
README_MEDIA = {'docs/media/' + name for name in (
    'five-arms.gif', 'panda-dyna.gif', 'arx5-teacher.gif',
    'piper-teacher.gif', 'ur5e-teacher.gif', 'xarm7-teacher.gif')}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'}


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.stack, self.ids = [], [], set()

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                raise ValueError('Duplicate HTML ID: ' + attrs['id'])
            self.ids.add(attrs['id'])
        for key in ('href', 'src', 'poster'):
            if attrs.get(key):
                self.links.append(attrs[key])
        if tag not in VOID:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack or self.stack.pop() != tag:
            raise ValueError('Mismatched closing tag: ' + tag)


def local_file(url, base, boundary):
    parsed = urlsplit(url)
    if parsed.scheme or parsed.netloc or not parsed.path:
        return None
    if parsed.path.startswith('/'):
        raise ValueError('Use relative resource URLs: ' + url)
    path = (base / unquote(parsed.path)).resolve()
    if boundary.resolve() not in path.parents or not path.is_file():
        raise ValueError('Missing or out-of-scope resource: ' + url)
    return path


def verify_manifest(items, base, expected):
    seen = set()
    for item in items:
        name = item['path']
        if name in seen:
            raise ValueError('Duplicate manifest entry: ' + name)
        seen.add(name)
        path = local_file(name, base, base)
        if path is None or path.stat().st_size != item['bytes']:
            raise ValueError('Manifest size mismatch: ' + name)
        if hashlib.sha256(path.read_bytes()).hexdigest() != item['sha256']:
            raise ValueError('Manifest hash mismatch: ' + name)
    if seen != expected:
        raise ValueError('Manifest coverage mismatch: ' + str(sorted(seen ^ expected)))


def check_results():
    data = json.loads((ROOT / 'results/mainline.json').read_text(encoding='utf-8'))
    home = data['protocols']['home_fulltask_v1']
    if (home['authorization_status'], home['implementation_status'], home['frozen'],
            home['result_status'], home['evaluations']) != (
            'approved', 'in_progress', False, 'no_new_home_scores', []):
        raise ValueError('HOME status changed: review protocol, evidence and checker together')
    for entry in data['evaluations']:
        if entry['protocol_id'] != 'legacy_reset_v0' or entry['metric_scope'] != 'mixed_reset_bank':
            raise ValueError('Historical evaluation has been relabelled')
        categories = entry['per_reset_category'].values()
        if sum(c['episodes'] for c in categories) != entry['episodes']:
            raise ValueError('Category episode total mismatch')
        if sum(c['successes'] for c in categories) != entry['successes']:
            raise ValueError('Category success total mismatch')
        for row in [entry, *categories]:
            if not 0 <= row['successes'] <= row['episodes']:
                raise ValueError('Invalid success count')
            if not math.isclose(100 * row['successes'] / row['episodes'], row['success_percent']):
                raise ValueError('Success percentage mismatch')
        if not re.fullmatch(r'[0-9a-f]{64}', entry['evaluation_sha256']):
            raise ValueError('Malformed source evaluation hash')
    cells = data['development_validation']
    if len(cells) != 25 or sum(v['contract_status'] == 'passed' for v in cells.values()) != 25:
        raise ValueError('Contract snapshot mismatch')
    if sum(v['teacher_status'] == 'evaluated_legacy' for v in cells.values()) != 8:
        raise ValueError('Teacher coverage mismatch')
    if sum(v.get('bank_probe_status') == 'passed' for v in cells.values()) != 6:
        raise ValueError('Development pass count mismatch')
    if sum(v.get('readiness_status') == 'blocked' for v in cells.values()) != 9:
        raise ValueError('Blocked development count mismatch')


def main():
    parser = Links()
    html = (SITE / 'index.html').read_text(encoding='utf-8')
    parser.feed(html)
    parser.close()
    if parser.stack:
        raise ValueError('Unclosed HTML tags: ' + str(parser.stack))
    site_files = {'index.html', '.nojekyll'}
    for value in parser.links:
        path = local_file(value, SITE, SITE)
        if path and path.name != 'release-manifest.json':
            site_files.add(path.relative_to(SITE).as_posix())
        if value.startswith('#') and value[1:] not in parser.ids:
            raise ValueError('Missing anchor: ' + value)
    script = (SITE / 'static/js/gallery.js').read_text(encoding='utf-8')
    clips = 0
    for line in script.splitlines():
        if not re.search(r"\bid:'", line):
            continue
        clips += 1
        robot = re.search(r"\brobot:'([^']+)'", line).group(1)
        task = re.search(r"\btask:'([^']+)'", line).group(1)
        for key, name in re.findall(r"\b(plain|hud|poster|posterHud):'([^']+)'", line):
            extension = '.mp4' if key in ('plain', 'hud') else '.jpg'
            relative = 'static/videos/rollouts/' + robot + '/' + task + '/' + name + extension
            local_file(relative, SITE, SITE)
            site_files.add(relative)
    for css in (SITE / 'static/css').glob('*.css'):
        for url in re.findall(r"""url\(["']?([^)"']+)""", css.read_text()):
            path = local_file(url.strip(), css.parent, SITE)
            if path:
                site_files.add(path.relative_to(SITE).as_posix())
    manifest = json.loads((SITE / 'release-manifest.json').read_text(encoding='utf-8'))
    verify_manifest(manifest['assets'], SITE, site_files)
    verify_manifest(manifest['public_metadata'], ROOT, PUBLIC_METADATA)
    verify_manifest(manifest['readme_media'], ROOT, README_MEDIA)
    expected = PUBLIC_METADATA | README_MEDIA | {'site/' + n for n in site_files} | {'site/release-manifest.json'}
    actual = set()
    patterns = [
        r'/(?:Users|user|home)/[A-Za-z0-9_]', r'\bdevspace-\d+',
        r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
        r'\bgh[pousr]_[A-Za-z0-9]{20,}', r'github_pat_[A-Za-z0-9_]{20,}',
        r'sk-ant-[A-Za-z0-9_-]{20,}', r'\bAKIA[0-9A-Z]{16}\b',
        r"""(?i)(?:password|api[_-]?key|access[_-]?token)\s*[:=]\s*["'][^"']{12,}["']""",
        r'(?i)(?:Author|Affiliation) One',
    ]
    for path in ROOT.rglob('*'):
        relative = path.relative_to(ROOT)
        if '.git' in relative.parts or '__pycache__' in relative.parts:
            continue
        if path.is_symlink():
            raise ValueError('Symlink outside public boundary: ' + str(relative))
        if not path.is_file():
            continue
        name = relative.as_posix()
        actual.add(name)
        if name not in expected or path.stat().st_size > 25 * 1024 * 1024:
            raise ValueError('File outside approved release: ' + name)
        if path.suffix in {'.md', '.txt', '.html', '.css', '.js', '.json', '.py', '.yml'} or name in {'LICENSE', '.gitignore'}:
            text = path.read_text(encoding='utf-8')
            for pattern in patterns:
                if re.search(pattern, text):
                    raise ValueError('Private/credential/placeholder pattern in ' + name)
            if path.suffix == '.md':
                for target in re.findall(r'\[[^\]]*\]\(([^\s)]+)\)', text):
                    local_file(target, path.parent, ROOT)
    if actual != expected:
        raise ValueError('Missing public files: ' + str(sorted(expected - actual)))
    for name in README_MEDIA:
        data = (ROOT / name).read_bytes()
        if len(data) >= 4 * 1024 * 1024 or not data.startswith(b'GIF89a'):
            raise ValueError('README GIF exceeds size/format limit: ' + name)
        if b'NETSCAPE2.0' + bytes([3, 1, 0, 0, 0]) not in data:
            raise ValueError('README GIF does not loop continuously: ' + name)
    readme = (ROOT / 'README.md').read_text(encoding='utf-8')
    for name in README_MEDIA:
        if name not in readme:
            raise ValueError('Unreferenced README media: ' + name)
    for target in re.findall(r'(?:src|href)="([^"<>]+)"', readme):
        local_file(target, ROOT, ROOT)
    check_results()
    media = [ROOT / name for name in expected if Path(name).suffix in {'.mp4', '.jpg', '.png', '.gif'}]
    inventory = {
        'public_file_count_including_manifest': len(actual),
        'hashed_file_count': len(actual) - 1,
        'hashed_file_bytes_excluding_manifest': sum(
            (ROOT / name).stat().st_size for name in actual
            if name != 'site/release-manifest.json'),
        'media_file_count': len(media),
        'video_file_count': sum(p.suffix == '.mp4' for p in media),
        'image_file_count': sum(p.suffix in {'.jpg', '.png', '.gif'} for p in media),
        'animated_gif_count': sum(p.suffix == '.gif' for p in media),
        'media_bytes': sum(p.stat().st_size for p in media),
    }
    if manifest['inventory'] != inventory:
        raise ValueError('Manifest inventory totals are stale')
    if manifest['protocol_status'] != {
            'numeric_results': 'legacy_reset_v0',
            'home_fulltask_v1': 'approved_implementation_in_progress_not_frozen_no_new_scores',
            'home_jitter_v1': 'planned_no_scores'}:
        raise ValueError('Manifest protocol metadata disagrees with the result snapshot')
    print(f'OK: {len(actual)} public files; {clips} gallery entries; {len(media)} media files ({sum(p.stat().st_size for p in media)} bytes).')
    print('HTML nesting/IDs, local links, exact allowlist, byte sizes, asset/metadata SHA256, secret patterns and result boundaries passed.')
    print('No remote deployment, browser playback, media-rights clearance or private raw-evaluation hashes are verified by this static check.')


if __name__ == '__main__':
    main()
