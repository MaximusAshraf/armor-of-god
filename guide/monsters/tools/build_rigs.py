# Builds the animated monster rigs: resizes the cut parts into public/monsters/ and writes public/monsters/rig.js
#   python3 tools/build_rigs.py
# A layer: p=part id, x/y = centre on a 1000x1000 canvas, w = width, z = stacking, c = animation class,
#          o = transform-origin, r = rotation (deg), fx = flip horizontally, v = 'attack' (only while attacking) | 'idle' (hidden while attacking)
import json, os, cv2, shutil
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, '..', '..', 'public', 'monsters')
MAXPX = 620

L = lambda p, x, y, w, z=1, c='', o='50% 50%', r=0, fx=False, v='', k='', ref=None: dict(p=p, x=x, y=y, w=w, z=z, c=c, o=o, r=r, fx=fx, v=v, k=k, ref=ref)
GROUP = {}   # monster -> class applied to the whole rig (e.g. breathing)

RIGS = {
  1: [  # The Liar
    L(0, 345, 262, 110, 0, 'a-sway', '50% 100%', -8), L(1, 655, 262, 110, 0, 'a-sway d2', '50% 100%', 8),
    L(2, 500, 560, 620, 1, 'a-bob', '50% 90%'),
    L(3, 398, 505, 150, 2, 'a-blink'), L(4, 602, 505, 150, 2, 'a-blink'),
    L(7, 392, 410, 150, 3, 'a-brow'), L(8, 608, 410, 130, 3, 'a-brow d2'),
    L(11, 520, 770, 150, 2, 'a-tongue', '50% 0%'),
    L(10, 500, 700, 300, 3, '', v='idle'),
    L(9, 625, 600, 330, 4, 'a-nose', '0% 50%'),
    L(12, 190, 660, 130, 2, 'a-sway', '80% 10%', 10), L(13, 810, 660, 130, 2, 'a-sway d2', '20% 10%', -10),
    L(16, 130, 220, 56, 5, 'a-float'), L(17, 870, 230, 80, 5, 'a-float d2'),
  ],
  2: [  # The Accuser: the approved whole picture is mesh-warped in the browser (public/mwarp.js); only the effects are layers
    L('full', 500, 500, 1000, 0, ''),
    L(None, 255, 205, 90, 4, 'a-steam', '50% 100%', v='attack', ref=('m6c', '01.png')),
    L(None, 745, 205, 90, 4, 'a-steam d2', '50% 100%', v='attack', ref=('m6c', '01.png')),
  ],
  3: [  # The Fear Phantom
    L(7, 215, 610, 130, 0, 'a-sway', '60% 10%', 6), L(8, 785, 610, 130, 0, 'a-sway d2', '40% 10%', -6),
    L(2, 500, 540, 560, 1, 'a-bob', '50% 100%'),
    L(0, 412, 325, 140, 3, 'a-blink a-glow'), L(1, 588, 325, 140, 3, 'a-blink a-glow d2'),
    L(5, 500, 520, 230, 3, 'a-mouth'),
    L(9, 150, 300, 70, 4, 'a-float'), L(13, 860, 330, 90, 4, 'a-float d2'), L(10, 840, 180, 60, 4, 'a-twinkle'), L(11, 180, 140, 40, 4, 'a-twinkle d2'),
  ],
  4: [  # The Doubt Cyclops
    L(9, 170, 230, 230, 0, 'a-dart'), L(8, 830, 230, 230, 0, 'a-dart d2'), L(10, 840, 800, 230, 0, 'a-dart d3'),
    L(0, 365, 290, 95, 1, 'a-sway', '50% 100%', -8), L(1, 635, 290, 95, 1, 'a-sway d2', '50% 100%', 8),
    L(2, 500, 570, 560, 2, 'a-bob', '50% 95%'),
    L(3, 506, 519, 245, 3, 'a-look'),
    L(4, 500, 405, 300, 4, 'a-brow'),
    L(5, 500, 700, 170, 3, 'a-mouth'),
    L(6, 225, 650, 80, 3, 'a-sway', '50% 10%', 8), L(7, 775, 650, 80, 3, 'a-sway d2', '50% 10%', -8),
  ],
  5: [  # The Storm of Despair
    L(18, 500, 790, 190, 0, 'a-bolt'), L(17, 300, 820, 90, 0, 'a-bolt d2'), L(19, 700, 820, 90, 0, 'a-bolt d3'),
    L(2, 500, 410, 720, 1, 'a-bob', '50% 50%'),
    L(12, 175, 600, 130, 2, 'a-sway', '70% 0%', 8), L(13, 825, 600, 130, 2, 'a-sway d2', '30% 0%', -8),
    L(3, 410, 400, 120, 3, 'a-blink'), L(4, 590, 400, 120, 3, 'a-blink'),
    L(0, 405, 318, 150, 3, 'a-brow'), L(1, 595, 318, 150, 3, 'a-brow d2'),
    L(11, 500, 505, 200, 3, 'a-mouth'),
    L(7, 395, 480, 44, 4, 'a-tear'), L(9, 605, 480, 44, 4, 'a-tear d2'), L(8, 435, 470, 38, 4, 'a-tear d3'), L(10, 565, 470, 38, 4, 'a-tear d4'),
    L(15, 280, 700, 28, 0, 'a-rain'), L(21, 380, 730, 28, 0, 'a-rain d2'), L(22, 620, 720, 30, 0, 'a-rain d3'), L(24, 720, 690, 30, 0, 'a-rain d4'), L(20, 200, 760, 34, 0, 'a-rain d5'), L(27, 810, 750, 32, 0, 'a-rain d6'),
  ],
  6: [  # The Great Dragon: whole picture mesh-warped (wings, head, tail, breathing); fire + smoke are layers
    L('full', 500, 500, 1000, 0, ''),
    L(None, 505, 440, 120, 3, 'a-fire', '50% 0%', 180, v='attack', ref=('m6d', '20.png')),
    L(None, 505, 285, 70, 3, 'a-puff', '50% 100%', ref=('m6c', '01.png')),
  ],
}

SRC = {2: 'm2d', 6: 'm6d'}
FULL = {2: 'm2.png', 6: 'm6.png'}
WARP = {2: '/monsters/m2/full.webp', 6: '/monsters/m6/full.webp'}   # drawn as one warped picture by mwarp.js   # monsters rebuilt from the second (rig-friendly) sheets
def part_path(m, pid): return os.path.join(ROOT, 'parts', SRC.get(m, f'm{m}'), f'{pid:02d}.png')

import numpy as np
GLOW = {(3, 0), (3, 1), (3, 9), (3, 10), (3, 11), (3, 13), (3, 14), (3, 15), (3, 16)}
def unwhite(im):
    # treat white as transparent: alpha from how far each pixel is from white, colour un-mixed from it (no white halo on dark backgrounds)
    bgr = im[:, :, :3].astype(np.float32); a0 = im[:, :, 3].astype(np.float32) / 255
    a = np.clip((255 - bgr.min(axis=2)) / 255 * 1.25, 0, 1) * a0
    col = np.where(a[..., None] > 0.02, (bgr - 255 * (1 - a[..., None])) / np.maximum(a[..., None], 0.02), bgr)
    return np.dstack([np.clip(col, 0, 255), a * 255]).astype(np.uint8)

CROP_TOP = {(2, 8): 0.55, (6, 6): 0.58, (6, 7): 0.58}     # keep only the top part (the brow), the dot below it is a pupil
def load(m, pid, ref=None):
    if ref: return cv2.imread(os.path.join(ROOT, 'parts', ref[0], ref[1]), cv2.IMREAD_UNCHANGED)
    if pid == 'full': return cv2.imread(os.path.join(ROOT, 'full', FULL[m]), cv2.IMREAD_UNCHANGED)
    im = cv2.imread(part_path(m, pid), cv2.IMREAD_UNCHANGED)
    if (m, pid) in CROP_TOP:
        im = im[:int(im.shape[0] * CROP_TOP[(m, pid)])]
        ys, xs = (im[:, :, 3] > 10).nonzero(); im = im[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    if (m, pid) in GLOW: im = unwhite(im)
    if m == 1 and pid == 9:                     # the nose sheet piece also holds a loose smile curve on its left: keep the nose only
        im = im[:, int(im.shape[1] * 0.30):]
        ys, xs = (im[:, :, 3] > 10).nonzero(); im = im[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return im

rig_js = {}
if os.path.isdir(OUT): shutil.rmtree(OUT)
for m, layers in RIGS.items():
    os.makedirs(os.path.join(OUT, f'm{m}'), exist_ok=True)
    out = []
    for i, ly in enumerate(layers):
        im = load(m, ly['p'], ly['ref']); h, w = im.shape[:2]
        s = min(1, (860 if ly['p'] == 'full' else MAXPX) / max(h, w))
        if s < 1: im = cv2.resize(im, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA)
        name = 'full.webp' if ly['p'] == 'full' else (f"fx{ly['ref'][0]}_{ly['ref'][1][:2]}.webp" if ly['ref'] else f"{ly['p']:02d}.webp")
        cv2.imwrite(os.path.join(OUT, f'm{m}', name), im, [cv2.IMWRITE_WEBP_QUALITY, 92])
        hh = ly['w'] * h / w
        if ly['p'] == 'full': continue                    # the whole picture is a warp texture, not a layer
        out.append(dict(src=f'/monsters/m{m}/{name}', l=round((ly['x'] - ly['w'] / 2) / 10, 2), t=round((ly['y'] - hh / 2) / 10, 2),
                        w=round(ly['w'] / 10, 2), z=ly['z'] * 10 + i, c=ly['c'], o=ly['o'], r=ly['r'], fx=ly['fx'], v=ly['v'], k=ly['k']))
    rig_js[m - 1] = dict(warp=WARP[m], layers=out) if m in WARP else out
open(os.path.join(OUT, 'rig.js'), 'w').write('window.MONSTER_RIG = ' + json.dumps(rig_js, separators=(',', ':')) + ';')
print('ok', sum(len(v) for v in rig_js.values()), 'layers')
