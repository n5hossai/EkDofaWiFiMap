from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import httpx
from data_store import get_hotspots, add_wifi_hotspot, add_relief_hotspot

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

@app.get("/hotspots")
def get_all_hotspots():
    return get_hotspots()

@app.post("/hotspots/wifi")
async def create_wifi_hotspot(hotspot: dict):
    add_wifi_hotspot(hotspot)
    return {"message": "WiFi hotspot added successfully"}

@app.post("/hotspots/relief")
async def create_relief_hotspot(hotspot: dict):
    add_relief_hotspot(hotspot)
    return {"message": "Relief hotspot added successfully"}