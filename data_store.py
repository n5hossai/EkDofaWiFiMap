import json
import os

DATA_FILE = 'data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {"wifi_hotspots": [], "relief_hotspots": []}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def get_hotspots():
    return load_data()

def add_wifi_hotspot(hotspot):
    data = load_data()
    data["wifi_hotspots"].append(hotspot)
    save_data(data)

def add_relief_hotspot(hotspot):
    data = load_data()
    data["relief_hotspots"].append(hotspot)
    save_data(data)