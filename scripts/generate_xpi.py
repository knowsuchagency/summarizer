import zipfile
import sys
import os
import shutil

def generate_xpi(path, xpi_path):
    with zipfile.ZipFile(xpi_path, 'w') as xpi:
        for root, dirs, files in os.walk(path):
            for file in files:
                xpi.write(os.path.join(root, file))


xpi_path = "build/summarizer-dev.xpi"
generate_xpi("build/firefox-mv2-dev", xpi_path)
shutil.copy(xpi_path, "api/chalicelib/summarizer-dev.xpi")
print(f"generated xpi at {xpi_path}")
