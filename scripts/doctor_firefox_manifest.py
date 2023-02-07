import json
from pathlib import Path

path = Path("build/firefox-mv2-dev/manifest.json")

data = json.loads(path.read_text())
data.pop("background")

path.write_text(json.dumps(data, indent=2))