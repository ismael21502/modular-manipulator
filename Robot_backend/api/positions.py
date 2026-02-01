from fastapi import APIRouter #type: ignore
import json
import os

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSITIONS_FILE = os.path.join(BASE_DIR, "..", "positions.json")

def load_positions():
    try:
        with open(POSITIONS_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def save_positions(data):
    with open(POSITIONS_FILE, "w") as f:
        json.dump(data, f, indent=2)


@router.get("/positions")
async def get_positions():
    return load_positions()


@router.post("/savePos")
async def save_pos(newData: dict):
    data = load_positions()

    if any(item["name"] == newData["name"] for item in data):
        return {"status": "exists"}

    data.append(newData)
    save_positions(data)
    return {"status": "ok"}


@router.post("/updatePos")
async def update_position(position: dict):
    data = load_positions()

    for item in data:
        if item["name"] == position["oldName"]:
            item["name"] = position["name"]
            item["values"] = position["values"]
            item["endEffectorValues"] = position["endEffectorValues"]
            save_positions(data)
            return {"status": "ok"}

    return {"status": "not_found"}


@router.post("/delete")
async def delete_position(item: dict):
    if "name" not in item:
        return {"status": "error", "message": "Missing name"}

    data = load_positions()
    new_data = [pos for pos in data if pos["name"] != item["name"]]

    if len(new_data) == len(data):
        return {"status": "not_found"}

    save_positions(new_data)
    return {"status": "ok"}
