import cv2
import numpy as np
import base64


index_params = dict(algorithm=1, trees=5)
search_params = dict()
flann = cv2.FlannBasedMatcher(index_params, search_params)

sift = cv2.SIFT_create()

def get_key_points(img) -> list[tuple, np.ndarray]:
    """Helper function to get the key points after given an image (represented as a np.ndarray)

    Function works by:
        - first converting the image to grayscale
        - then blurring to remove noise for better keypoint extraction, kernel_size=(15, 15)
        - then using SIFT to detect scale invariant features

    Parameters
    ----------
    img : np.ndarray
        The image to extract the keypoints from
    
    Returns
    -------
    list[tuple, np.ndarray]:
        The keypoints and descriptors of the image
    """

    img_grey = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img_grey_blurred = cv2.GaussianBlur(img_grey, (15, 15), 0)
    return sift.detectAndCompute(img_grey_blurred, None)


def get_sift_matches(descriptors_prev, descriptors_curr):
    """Helper function to get the SIFT matches between two images
    
    Function works by:
        - using the FLANN matcher to get the matches between the two images
        - then filtering the matches by the ratio test (0.75)
        - then sorting the matches by distance and returning the top 10 matches
    
    Parameters
    ----------
    descriptors_prev : np.ndarray
        The descriptors of the previous image
    descriptors_curr : np.ndarray
        The descriptors of the current image
    
    Returns
    ------
    list:
        The top 10 matches between the two images
    """

    matches = flann.knnMatch(descriptors_prev, descriptors_curr, k=2)

    good_matches = []
    for m, n in matches:
        if m.distance < 0.75 * n.distance:
            good_matches.append(m)

    sorted_matches = sorted(good_matches, key=lambda x: x.distance)

    return sorted_matches[:10]

def get_cv2_image(image_bytes_str: str) -> np.ndarray:
    """Given the image string of bytes, return the cv2 image

    Parameters
    ----------
    image_bytes_str : str
        The image string of bytes
    
    Returns
    -------
    np.ndarray:
        The cv2 image
    """

    image_bytes = base64.b64decode(image_bytes_str)
    nparr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


def get_edge_image_from_bytes(image_bytes_str: str) -> list:
    """Given the image string of bytes, return the edge image overlay
    
    Parameters
    ----------
    image_bytes_str : str
        The image string of bytes
    
    Return
    ------
    list:
        The edge image overlay, keypoints, and descriptors
    """

    img = get_cv2_image(image_bytes_str)

    low_thresh = np.mean(img) * 0.75
    high_thresh = np.mean(img) * 2.66
    edges = cv2.Canny(img, low_thresh, high_thresh)

    overlay = np.zeros((edges.shape[0], edges.shape[1], 4), dtype=np.uint8)
    overlay[:, :] = [0, 0, 255, 0]
    overlay[edges == 255, :4] = 255
    overlay_bytes = overlay.tobytes()
    overlay_byte_base64 = base64.b64encode(overlay_bytes)

    cv2.imwrite("overlay.png", overlay)

    keypoints_prev, descriptors_prev = get_key_points(img)

    return [overlay_byte_base64, keypoints_prev, descriptors_prev]


def make_matching(keypoints_1: tuple, descriptors_1: np.ndarray, image_bytes_str: str):
    """Given the keypoints and descriptors of the previous image, and the current image,
    return whether the images are aligned and the direction of movement
    
    Parameters
    ----------
    keypoints_1 : tuple
        The keypoints of the previous image
    descriptors_1 : np.ndarray
        The descriptors of the previous image
    image_bytes_str : str
        The current image string of bytes that we want to compare

    Return
    ------
    tuple:
        The boolean of whether the images are aligned, and the direction of movement
    """
    
    curr_image = get_cv2_image(image_bytes_str)
    keypoints_2, descriptors_2 = get_key_points(curr_image)

    good_matches = get_sift_matches(descriptors_1, descriptors_2)

    points1 = np.float32([keypoints_1[m.queryIdx].pt for m in good_matches])
    points2 = np.float32([keypoints_2[m.trainIdx].pt for m in good_matches])

    x_movement, y_movement = np.mean(points1 - points2, axis=0)

    is_aligned = -10 <= x_movement <= 10 and -10 <= y_movement <= 10

    return is_aligned, [int(x_movement), int(y_movement)]


# Below please find the original code for reference, we tested with stereo for 3D reconstruction of the
# translation vector and rotation matrix, but it was not stable enough, it kept giving us different
# results for the same movement, so we decided to go with the simpler approach of just using the
# SIFT keypoints and descriptors to find the direction of movement.

# Our current approach doesn't work well with rotation, and dept but it works well with general x y coordinate
# translation estimation.

# bins = {
#     "left": (-45, 45),
#     "right": (135, -135),
#     "up": (-45, 45),
#     "down": (135, -135),
#     "forwards": (45, 135),
#     "backwards": (-135, -45),
# }
#
#
# def get_rotation_translation_matrices(good_matches, keypoints_1, keypoints_2, img_shape,
#                                       focal_length=1.0):
#     principal_point = (img_shape[1] // 2, img_shape[0] // 2)
#     camera_matrix = np.array(
#         [[focal_length, 0, principal_point[0]],
#          [0, focal_length, principal_point[1]],
#          [0, 0, 1]], dtype=float)
#
#     # Extract matched keypoints
#     points1 = np.float32([keypoints_1[m.queryIdx].pt for m in good_matches])
#     points2 = np.float32([keypoints_2[m.trainIdx].pt for m in good_matches])
#
#     if points1.shape[0] < 5:
#         return None, None
#
#     essential_matrix, mask = cv2.findEssentialMat(points1, points2, camera_matrix,
#                                                   method=cv2.RANSAC, prob=0.999, threshold=1.0)
#     if essential_matrix.shape != (3, 3):
#         return None, None
#
#     _, R, t, _ = cv2.recoverPose(essential_matrix, points1, points2, camera_matrix)
#
#     return R, t
#
#
# def print_directions(unit_vector):
#
#     x, y, z = unit_vector
#
#     direction_str = ""
#
#     threshold = 0.5
#
#     if x[0] <= -threshold:
#         direction_str += "left "
#     elif x[0] >= threshold:
#         direction_str += "right "
#
#     if y[0] <= -threshold:
#         direction_str += "down "
#     elif y[0] >= threshold:
#         direction_str += "up "
#
#     if z[0] <= -threshold:
#         direction_str += "backwards "
#     elif z[0] >= threshold:
#         direction_str += "forwards "
#
#
# def main():
#     if len(sys.argv) != 3:
#         print("USAGE: python3 main.py img1_filepath img2_filepath")
#         return
#
#     IMG_PATH_1 = sys.argv[1]
#     IMG_PATH_2 = sys.argv[2]
#
#     cap = cv2.VideoCapture(0)
#
#     if not cap.isOpened():
#         print("Error: Could not open camera.")
#         exit()
#
#     _, prev_img = cap.read()
#
#     low_thresh = np.mean(prev_img) * 0.75
#     high_thresh = np.mean(prev_img) * 2.66
#     edges = cv2.Canny(prev_img, low_thresh, high_thresh)
#
#     keypoints_prev, descriptors_prev = get_key_points(prev_img)
#
#     while True:
#         # Read a frame from the camera
#         ret, frame = cap.read()
#
#         # Break the loop if reading the frame fails
#         if not ret:
#             print("Error: Failed to capture frame.")
#             break
#
#         keypoints_curr, descriptors_curr = get_key_points(frame)
#         good_matches = get_sift_matches(descriptors_prev, descriptors_curr)
#         matched = cv2.drawMatches(prev_img, keypoints_prev, frame, keypoints_curr, good_matches,
#                                   None, flags=2)
#
#         points1 = np.float32([keypoints_prev[m.queryIdx].pt for m in good_matches])
#         points2 = np.float32([keypoints_curr[m.trainIdx].pt for m in good_matches])
#
#         x_movement, y_movement = np.mean(points2 - points1, axis=0)
#
#         direction = "move "
#
#         if -10 > x_movement:
#             direction += "right "
#         elif 10 < x_movement:
#             direction += "left "
#         if -10 > y_movement:
#             direction += "down "
#         elif 10 < y_movement:
#             direction += "up "
#         print(direction)
#
#         frame[edges == 255, :] = (0, 255, 0) if -10 <= x_movement <= 10 and -10 <= y_movement <= 10 else (0, 0, 255)
#         cv2.imshow("matching", frame)
#
#         # Break the loop if 'q' key is pressed
#         if cv2.waitKey(1) & 0xFF == ord('q'):
#             break
#
#     # Release the camera and close the window
#     cap.release()
#     cv2.destroyAllWindows()

# if __name__ == '__main__':
    # main()
