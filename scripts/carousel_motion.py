"""Continuous camera transforms; crop coordinates stay fractional until resampling."""
from PIL import Image


def render_frame(image, size, zoom, pan_x, pan_y):
    width, height = size
    cover = max(width / image.width, height / image.height)
    step = 1 / (cover * zoom)
    left = (image.width - width * step) * pan_x
    top = (image.height - height * step) * pan_y
    return image.transform(
        size, Image.Transform.AFFINE, (step, 0, left, 0, step, top),
        resample=Image.Resampling.BICUBIC,
    )
