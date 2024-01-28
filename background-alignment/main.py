import numpy as np
import cv2
import base64

from fastapi import Body, FastAPI
from pydantic import BaseModel
from background_alignment import get_edge_image_from_bytes, make_matching, get_cv2_image

# This is the model that our API's expect from the frontend, it requires a uuid from the user
# and the image string of bytes
class ImageItem(BaseModel):
    """A class to represent what our API's expect from the frontend
    
    Attributes
    ----------
    id : str
        The uuid of the user
    image : str
        The image string of bytes

    Methods
    -------
    setNewUser(id, image):
        Sets the user's image and uuid
    isUser(id):
        Checks if the user is in the database
    getUserImg(id):
        Gets the user's image
    getUserImgInfo(id):
        Gets the user's image keypoints and descriptors
    """
    id: str
    image: str


class UserStates:
    """User class that keeps track of all user information"""

    def __init__(self) -> None:
        """
        Constructor for the User class, initializes the state of the user
        
        Parameters
        ----------
        state : dict(uuid, dict(image, keypoints, descriptors))
            The state of the user with the
        
        Returns
        -------
        None
        """
        self.state = {}

    def setNewUser(self, id: str, initial_img: str, keypoints, descriptors) -> None:
        """
        Sets the user's image and uuid
        
        Parameters
        ----------
        id : str
            The uuid of the user
        initial_img : str
            The image string of bytes
        keypoints : list
            The classified keypoints of the image
        descriptors : np.ndarray
            The classified descriptors of the image

        Returns
        -------
        None
        """
        self.state[id] = {"image": initial_img, "keypoints": keypoints, "descriptors": descriptors}

    def isUser(self, id: str) -> bool:
        """
        Checks if the user is in the database

        Parameters
        ----------
        id : str
            The uuid of the user

        Returns
        -------
        None
        """
        return id in self.state

    def getUserImg(self, id: str) -> bytes:
        """
        Retrieves the user image associated with the given ID.

        Parameters
        ----------
        id : str
            The ID of the user.

        Returns
        -------
        bytes:
            The user image data.
        """
        return self.state[id]["image"]

    def getUserImgInfo(self, id: str) -> list[tuple, np.ndarray]:
        """
        Retrieves the user image associated with the given ID.
        
        Parameters
        ----------
        id : str
            The ID of the user.
        
        Returns
        -------
        list[tuple, np.ndarray]:
            The user image keypoints and descriptors.
        """

        return [self.state[id]["keypoints"], self.state[id]["descriptors"]]


# Initialize the app and the user database
all_users = UserStates()
app = FastAPI()

# @app.get("/")
# async def root():
#     print("HERE")
#     return {"message": "Hello World"}


@app.post("/image-outline/")
async def get_image_outline(image_item: ImageItem = Body(...)) -> str:
    points, keypoints, descriptors = get_edge_image_from_bytes(image_item.image)
    all_users.setNewUser(image_item.id, image_item.image, keypoints, descriptors)
    # image = get_cv2_image(image_item.image)
    # cv2.imwrite("a.jpg", image)
    return points


@app.post("/align-background/")
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

# Test image endpoint
# @app.get("/test")
# async def test_image():
#     img_str = all_users.getUserImg("Test")
#     image = get_cv2_image(img_str)

#     return "None"
