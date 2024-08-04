import json
from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import httpx

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/search")
async def search(q: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"https://nominatim.openstreetmap.org/search?q={q}&format=json")
        data = response.json()
        if data:
            return {"lat": float(data[0]["lat"]), "lon": float(data[0]["lon"])}
        return {"error": "Location not found"}

@app.post("/api/hotspots/wifi")
async def add_wifi_hotspot(hotspot: dict):
    with open('static/data/wifiHotspots.json', 'r+') as f:
        data = json.load(f)
        data.append(hotspot)
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()
    return {"message": "WiFi hotspot added successfully"}

@app.post("/api/hotspots/relief")
async def add_relief_hotspot(hotspot: dict):
    with open('static/data/reliefHotspots.json', 'r+') as f:
        data = json.load(f)
        data.append(hotspot)
        f.seek(0)
        json.dump(data, f, indent=2)
        f.truncate()
    return {"message": "Relief hotspot added successfully"}