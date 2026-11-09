# Texturas en gris, repetibles (se colorean en CSS con multiply). Ruido filtrado por FFT: periódico por construcción.
import numpy as np
from PIL import Image
rng = np.random.default_rng(7)
OUT = '/home/claude/cajon/public/juegos/motores/tex/'
def ruido(n, escala, pot=1.0):
    f = np.fft.fftfreq(n)
    fx, fy = np.meshgrid(f, f)
    r = np.sqrt(fx**2 + fy**2) + 1e-6
    filtro = np.exp(-(r * n / escala) ** 2) * r ** -pot if pot else np.exp(-(r * n / escala) ** 2)
    z = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((n, n))) * filtro))
    return (z - z.mean()) / (z.std() + 1e-9)
def guarda(a, nombre, q=82):
    a = np.clip(a, 0, 255).astype(np.uint8)
    Image.fromarray(a, 'L').save(OUT + nombre, 'WEBP', quality=q)
N = 256
# tela de lona: hilos de 4 px, sarga simple
y, x = np.mgrid[0:N, 0:N]
t = 4
hx = (x // t) % 2; hy = (y // t) % 2
encima = (hx ^ hy).astype(float)
perf_h = np.cos((y % t + .5) / t * np.pi - np.pi / 2)  # sección del hilo horizontal
perf_v = np.cos((x % t + .5) / t * np.pi - np.pi / 2)
varh = rng.normal(0, 1, N // t + 1)[y // t]; varv = rng.normal(0, 1, N // t + 1)[x // t]
lona = np.where(encima > 0, 150 + 70 * perf_h + 10 * varh, 150 + 70 * perf_v + 10 * varv)
lona += 10 * ruido(N, 60, 0) + 6 * rng.standard_normal((N, N))
guarda(lona * 0.55 + 255 * 0.45, 'lona.webp')
# fieltro: nubes + fibras
f = 14 * ruido(N, 18, 0.6) + 9 * ruido(N, 90, 0) + 7 * rng.standard_normal((N, N))
guarda(222 + f, 'fieltro.webp')
# papel: grano muy fino
p = 5 * ruido(N, 120, 0) + 4 * ruido(N, 25, 0.5)
guarda(242 + p, 'papel.webp')
# alfombrilla de corte: grano mate
m = 6 * ruido(N, 140, 0) + 5 * ruido(N, 12, 0.8)
guarda(236 + m, 'mate.webp')
# cartulina: fibras alargadas
c = np.real(np.fft.ifft2(np.fft.fft2(rng.standard_normal((N, N))) * np.exp(-((np.fft.fftfreq(N)[None, :] * N / 90) ** 2 + (np.fft.fftfreq(N)[:, None] * N / 14) ** 2))))
c = (c - c.mean()) / c.std()
guarda(240 + 6 * c + 3 * rng.standard_normal((N, N)), 'cartulina.webp')
print('ok')
