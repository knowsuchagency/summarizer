#!/usr/bin/env python3
import json
from pathlib import Path

path = Path("build/firefox-mv2-dev/manifest.json")

data = json.loads(path.read_text())
data["browser_specific_settings"] = {
  "gecko": {
    "id": "summarizer@kagi.com",
    "strict_min_version": "42.0"
  }
}

path.write_text(json.dumps(data, indent=2))