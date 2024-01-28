from fastapi.responses import FileResponse
import numpy as np
import cv2
import base64

from fastapi import Body, FastAPI
from pydantic import BaseModel
from MatchBackground import get_edge_image_from_bytes, make_matching, get_cv2_image

class ImageItem(BaseModel):
    id: str
    image: str


class UserStates:
    """User class that keeps track of all user information"""

    def __init__(self) -> None:
        self.state = {}

    def setNewUser(self, id: str, keypoints, descriptors) -> None:
        self.state[id] = { "keypoints": keypoints, "descriptors": descriptors}

    def isUser(self, id: str) -> bool:
        return id in self.state

    # def getUserImg(self, id: str) -> bytes:
    #     return self.state[id]["image"]

    def getUserImgInfo(self, id: str) -> list[tuple, np.ndarray]:
        return [self.state[id]["keypoints"], self.state[id]["descriptors"]]

all_users = UserStates()
app = FastAPI()

@app.get("/")
async def root():
    print("HERE")
    return {"message": "Hello World"}


@app.post("/image-outline")
async def get_image_outline(image_item: ImageItem = Body(...)) -> str:
    overlay, keypoints, descriptors = get_edge_image_from_bytes(image_item.image)
    img_path = f"images/{image_item.id}.png"
    cv2.imwrite(img_path, overlay)
    all_users.setNewUser(image_item.id, keypoints, descriptors)

    return FileResponse(img_path)

@app.get("/overlay/{id}")
async def get_image(id: str) -> str:
    if all_users.isUser(id):
        img_path = f"images/{id}.png"
        return FileResponse(img_path)
    
    print("FUCK MY TITS")
    return ""
    

@app.post("/align-background")
async def get_image_alignment(image_item: ImageItem = Body(...)) -> dict:
    if not all_users.isUser(image_item.id):
        return {
            "error": "GAH USER NOT FOUND"
        }
    prev_keypoints, prev_descriptors = all_users.getUserImgInfo(image_item.id)
    is_aligned, direction = make_matching(prev_keypoints, prev_descriptors, image_item.image)


    return {
        "isAligned": bool(is_aligned),
        "direction": direction
    }

@app.get("/test")
async def test_image():
    img_str = all_users.getUserImg("Test")
    image = get_cv2_image(img_str)

    return "None"
