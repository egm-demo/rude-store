import subprocess, os, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
V = os.path.join(os.path.dirname(os.path.abspath(__file__)), sys.argv[1]) if len(sys.argv) > 1 and not sys.argv[1].isdigit() else os.path.dirname(os.path.abspath(__file__))
CH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
os.makedirs(os.path.join(V, 'shots'), exist_ok=True)
os.makedirs(os.path.join(V, 'shots', 'm'), exist_ok=True)
only = [a for a in sys.argv[1:] if a.isdigit()] or [f'{i:02d}' for i in range(1, 21)]

def shot(n, w, h, out):
    ud = tempfile.mkdtemp(prefix='chr', dir=os.environ.get('TMPDIR'))
    url = 'file:///' + os.path.join(V, f'{n}.html').replace('\\', '/') + '#shot'
    subprocess.run([CH, '--headless=new', '--disable-gpu', '--hide-scrollbars', f'--user-data-dir={ud}', '--virtual-time-budget=4000',
                    f'--window-size={w},{h}', f'--screenshot={out}', url], capture_output=True, timeout=90)

def job(n):
    shot(n, 1440, 900, os.path.join(V, 'shots', f'{n}.png'))
    shot(n, 390, 844, os.path.join(V, 'shots', 'm', f'{n}.png'))
    return n
with ThreadPoolExecutor(4) as ex:
    for r in ex.map(job, only): print(r, end=' ', flush=True)
from PIL import Image
for n in only:
    p = os.path.join(V, 'shots', f'{n}.png')
    if os.path.exists(p):
        Image.open(p).convert('RGB').resize((720, 450), Image.LANCZOS).save(os.path.join(V, 'shots', f'{n}.jpg'), quality=82)
print('done')
