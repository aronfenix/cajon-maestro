# Veta de madera repetible (haya clara) y corcho, en color: se usan tal cual.
import numpy as np
from PIL import Image
rng = np.random.default_rng(11)
OUT = '/home/claude/cajon/public/juegos/motores/tex/'
def ruido(n, m, ex, ey):
    fx = np.fft.fftfreq(m)[None, :]; fy = np.fft.fftfreq(n)[:, None]
    z = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((n, m))) * np.exp(-((fx * m / ex) ** 2 + (fy * n / ey) ** 2))))
    return (z - z.mean()) / z.std()
H, W = 256, 512
y, x = np.mgrid[0:H, 0:W]
warp = 4 * ruido(H, W, 5, 3)
anillos = np.sin((y + warp) / H * 2 * np.pi * 16 + 1.0 * ruido(H, W, 3, 8))
fibra = ruido(H, W, 140, 6)
t = 0.5 + 0.5 * anillos
base = np.array([226, 186, 128]); osc = np.array([196, 146, 88])
img = base[None, None, :] * (1 - t[..., None] * 0.32) + osc[None, None, :] * (t[..., None] * 0.32)
img += (4 * fibra + 2 * rng.standard_normal((H, W)))[..., None]
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGB').save(OUT + 'madera.webp', 'WEBP', quality=84)
N = 256
c = ruido(N, N, 30, 30) * 10 + ruido(N, N, 90, 90) * 8
gr = rng.random((N, N))
img = np.stack([200 + c, 152 + c * 0.9, 96 + c * 0.7], -1)
img[gr > 0.985] *= 0.7; img[gr < 0.012] *= 1.12
Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'RGB').save(OUT + 'corcho.webp', 'WEBP', quality=84)
print('ok')
