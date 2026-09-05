"""Download + compress demo listing gallery images into frontend/public/media."""
from __future__ import annotations

import os
import urllib.request
from io import BytesIO

from PIL import Image

OUT = os.path.join(os.path.dirname(__file__), "..", "frontend", "public", "media")
os.makedirs(OUT, exist_ok=True)

# Penthouse hero MUST be a high-rise / apartment look — never villa+pool
# (photo-1613490493576 is the iconic white villa Unsplash; do not use it here).
ASSETS = [
    # marina
    ("marina", "exterior", "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80&fm=jpg"),
    ("marina", "living-room", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=80&fm=jpg"),
    ("marina", "kitchen", "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1600&q=80&fm=jpg"),
    ("marina", "bedroom", "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80&fm=jpg"),
    ("marina", "bathroom", "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1600&q=80&fm=jpg"),
    ("marina", "balcony", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1600&q=80&fm=jpg"),
    # downtown studio
    ("downtown", "living-room", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=80&fm=jpg"),
    ("downtown", "kitchen", "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&fm=jpg"),
    ("downtown", "bedroom", "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80&fm=jpg"),
    ("downtown", "bathroom", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1600&q=80&fm=jpg"),
    ("downtown", "workspace", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80&fm=jpg"),
    ("downtown", "exterior", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1600&q=80&fm=jpg"),
    # palm penthouse — high-rise / apartment (prefix penthouse- for card clarity)
    ("penthouse", "skyline", "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80&fm=jpg"),
    ("penthouse", "living-room", "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1600&q=80&fm=jpg"),
    ("penthouse", "kitchen", "https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1600&q=80&fm=jpg"),
    ("penthouse", "bedroom", "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600&q=80&fm=jpg"),
    ("penthouse", "terrace", "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1600&q=80&fm=jpg"),
    ("penthouse", "dining", "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=1600&q=80&fm=jpg"),
]

# Force re-fetch these prefixes (used when replacing lookalike assets).
FORCE_PREFIXES = {"penthouse"}

UA = {"User-Agent": "PropertyNexusDemo/1.0"}


def save_webp(img: Image.Image, path: str, quality: int, max_w: int) -> None:
    img = img.convert("RGB")
    w, h = img.size
    if w > max_w:
        nh = int(h * max_w / w)
        img = img.resize((max_w, nh), Image.Resampling.LANCZOS)
    img.save(path, "WEBP", quality=quality, method=6)


def main() -> None:
    for prefix, slug, url in ASSETS:
        full = os.path.join(OUT, f"{prefix}-{slug}.webp")
        thumb = os.path.join(OUT, f"{prefix}-{slug}-thumb.webp")
        force = prefix in FORCE_PREFIXES
        if (
            not force
            and os.path.exists(full)
            and os.path.exists(thumb)
            and os.path.getsize(full) > 1000
        ):
            print("skip", os.path.basename(full))
            continue
        print("fetch", prefix, slug)
        req = urllib.request.Request(url, headers=UA)
        with urllib.request.urlopen(req, timeout=90) as res:
            data = res.read()
        img = Image.open(BytesIO(data))
        save_webp(img, full, quality=78, max_w=1600)
        save_webp(img, thumb, quality=70, max_w=480)
        print(
            " wrote",
            os.path.basename(full),
            os.path.getsize(full),
            os.path.basename(thumb),
            os.path.getsize(thumb),
        )
    print("DONE")


if __name__ == "__main__":
    main()
