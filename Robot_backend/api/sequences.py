from fastapi import APIRouter #type: ignore
import json
import os
from datetime import datetime

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SEQUENCES_FILE = os.path.join(BASE_DIR, "..", "sequences.json")

def load_sequences():
    try:
        with open(SEQUENCES_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def save_sequences(data):
    with open(SEQUENCES_FILE, "w") as f:
        json.dump(data, f, indent=2)

@router.get("/sequences")
async def get_sequences():
    return load_sequences()

@router.post("/saveSeq")
async def save_seq(newData: dict):
    data = load_sequences()
    existing_index = next(
        (i for i, item in enumerate(data) if item["name"] == newData["name"]),
        None
    )
    if existing_index is not None:
        return {"status": "exists"}
    data.append(newData)
    save_sequences(data)
    return {"status": "ok"}

@router.post("/updateSeq")
async def update_sequence(sequence: dict):
    data = load_sequences()
    for item in data:
        if item["name"] == sequence["oldName"]:
            item["name"] = sequence["name"]
            item["steps"] = sequence["steps"]
            item["updated_at"] = datetime.now().isoformat()
            save_sequences(data)
            return {
                "status": "ok",
                "message": f"Secuencia '{item['name']}' actualizada"
            }
    return {"status": "not_found"}

@router.post("/deleteSeq")
async def delete_sequence(item: dict):
    if "name" not in item:
        return {"status": "error", "message": "Falta el campo 'name'."}
    data = load_sequences()
    new_data = [seq for seq in data if seq["name"] != item["name"]]
    if len(new_data) == len(data):
        return {"status": "not_found"}
    save_sequences(new_data)
    return {
        "status": "ok",
        "message": f"Secuencia '{item['name']}' eliminada."
    }