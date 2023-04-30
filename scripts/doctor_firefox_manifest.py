#!/usr/bin/env python3
import json
from pathlib import Path

def update_manifest(path: str="build/firefox-mv2-dev/manifest.json"):
    print(f"Updating {path}")

    path = Path(path)

    data = json.loads(path.read_text())

    data["browser_specific_settings"] = {
      "gecko": {
        "id": "summarizer@web.com",
        "strict_min_version": "42.0"
      }
    }

    path.write_text(json.dumps(data, indent=2))

    print("Done!")

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Update the manifest.json file for Firefox")
    parser.add_argument("--path", type=str, default="build/firefox-mv2-dev/manifest.json", help="Path to the manifest.json file")

    args = parser.parse_args()

    update_manifest(args.path)