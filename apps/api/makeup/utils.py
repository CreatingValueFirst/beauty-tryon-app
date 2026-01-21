import cv2
import numpy as np
from landmarks import detect_landmarks, normalize_landmarks, plot_landmarks
from mediapipe.python.solutions.face_detection import FaceDetection

upper_lip = [61, 185, 40, 39, 37, 0, 267, 269, 270, 408, 415, 272, 271, 268, 12, 38, 41, 42, 191, 78, 76]
lower_lip = [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
face_conn = [10, 338, 297, 332, 284, 251, 389, 264, 447, 376, 433, 288, 367, 397, 365, 379, 378, 400, 377, 152,
             148, 176, 149, 150, 136, 172, 138, 213, 147, 234, 127, 162, 21, 54, 103, 67, 109]
cheeks = [425, 205]


def apply_makeup(src: np.ndarray, is_stream: bool, feature: str, show_landmarks: bool = False):
    """
    Takes in a source image and applies effects onto it.
    """
    ret_landmarks = detect_landmarks(src, is_stream)
    height, width, _ = src.shape
    feature_landmarks = None
    if feature == 'lips':
        feature_landmarks = normalize_landmarks(ret_landmarks, height, width, upper_lip + lower_lip)
        mask = lip_mask(src, feature_landmarks, [153, 0, 157])
        output = cv2.addWeighted(src, 1.0, mask, 0.4, 0.0)
    elif feature == 'blush':
        feature_landmarks = normalize_landmarks(ret_landmarks, height, width, cheeks)
        mask = blush_mask(src, feature_landmarks, [153, 0, 157], 50)
        output = cv2.addWeighted(src, 1.0, mask, 0.3, 0.0)
    else:  # Defaults to blush for any other thing
        skin_mask = mask_skin(src)
        output = np.where(src * skin_mask >= 1, gamma_correction(src, 1.75), src)
    if show_landmarks and feature_landmarks is not None:
        plot_landmarks(src, feature_landmarks, True)
    return output


def apply_feature(src: np.ndarray, feature: str, landmarks: list, normalize: bool = False,
                  show_landmarks: bool = False):
    """
    Performs similar to `apply_makeup` but needs the landmarks explicitly
    Specifically implemented to reduce the computation on the server
    """
    height, width, _ = src.shape
    if normalize:
        landmarks = normalize_landmarks(landmarks, height, width)
    if feature == 'lips':
        mask = lip_mask(src, landmarks, [153, 0, 157])
        output = cv2.addWeighted(src, 1.0, mask, 0.4, 0.0)
    elif feature == 'blush':
        mask = blush_mask(src, landmarks, [153, 0, 157], 50)
        output = cv2.addWeighted(src, 1.0, mask, 0.3, 0.0)
    else:  # Does not require any landmarks for skin masking -> Foundation
        skin_mask = mask_skin(src)
        output = np.where(src * skin_mask >= 1, gamma_correction(src, 1.75), src)
    if show_landmarks:  # Refrain from using this during an API Call
        plot_landmarks(src, landmarks, True)
    return output


def lip_mask(src: np.ndarray, points: np.ndarray, color: list):
    """
    Given a src image, points of lips and a desired color
    Returns a colored mask that can be added to the src with improved quality.
    Includes glossy finish, better blending, and edge feathering.
    """
    mask = np.zeros_like(src)  # Create a mask
    
    # Ensure points is proper type for cv2.fillPoly
    if isinstance(points, np.ndarray):
        points = points.astype(np.int32)
    else:
        points = np.array(points, dtype=np.int32)
    
    mask = cv2.fillPoly(mask, [points], color)  # Mask for the required facial feature
    
    # Multi-stage blurring for smoother, more natural edges
    mask = cv2.GaussianBlur(mask, (11, 11), 3)  # First pass - soften edges
    mask = cv2.GaussianBlur(mask, (7, 7), 2)   # Second pass - refined smoothing
    
    # Create edge feathering for seamless blend
    mask_float = mask.astype(np.float32) / 255.0
    # Apply smooth falloff at edges using morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    eroded = cv2.erode(mask, kernel, iterations=1)
    eroded_float = eroded.astype(np.float32) / 255.0
    
    # Blend between full mask and eroded mask for gradual transition
    mask = (mask_float * 0.7 + eroded_float * 0.3) * 255
    mask = mask.astype(np.uint8)
    
    return mask


def blush_mask(src: np.ndarray, points: np.ndarray, color: list, radius: int):
    """
    Given a src image, points of the cheeks, desired color and radius
    Returns a colored mask that can be added to the src with improved quality.
    Includes gradient blending, soft feathering, and natural-looking diffusion.
    """
    mask = np.zeros_like(src)  # Mask that will be used for the cheeks
    
    # Create high-quality blush with gradient falloff
    for point in points:
        # Create a circular gradient mask for smooth transition
        py, px = int(point[1]), int(point[0])
        
        # Limit region to avoid processing entire image
        y_min = max(0, py - radius)
        y_max = min(src.shape[0], py + radius + 1)
        x_min = max(0, px - radius)
        x_max = min(src.shape[1], px + radius + 1)
        
        # Create local gradient for efficiency
        yy, xx = np.ogrid[y_min:y_max, x_min:x_max]
        dist = np.sqrt((yy - py) ** 2 + (xx - px) ** 2)
        
        # Smooth falloff using cosine function for natural gradient
        gradient = np.zeros_like(dist, dtype=np.float32)
        valid = dist <= radius
        gradient[valid] = (1.0 + np.cos(np.pi * dist[valid] / radius)) / 2.0
        
        # Apply color with gradient opacity
        for c in range(3):  # For each color channel
            color_val = color[c] if c < len(color) else 0
            mask[y_min:y_max, x_min:x_max, c] = np.maximum(
                mask[y_min:y_max, x_min:x_max, c], 
                (color_val * gradient).astype(np.uint8)
            )
    
    # Apply Gaussian blur for ultra-smooth blending
    blur_radius = int(radius * 0.4)
    if blur_radius % 2 == 0:
        blur_radius += 1
    blur_radius = max(3, blur_radius)  # Ensure minimum blur size
    mask = cv2.GaussianBlur(mask, (blur_radius, blur_radius), radius // 3)
    
    # Apply vignette for natural feathering at edges
    for point in points:
        x, y = int(point[0]) - radius, int(point[1]) - radius
        x = max(0, x)
        y = max(0, y)
        end_x = min(src.shape[1], x + 2 * radius)
        end_y = min(src.shape[0], y + 2 * radius)
        if end_y - y > 0 and end_x - x > 0:
            region = mask[y:end_y, x:end_x]
            if region.size > 0:
                vignetted = vignette(region, 8)
                mask[y:end_y, x:end_x] = vignetted
    
    return mask


def mask_skin(src: np.ndarray):
    """
    Given a source image of a person (face image)
    returns a mask that can be identified as the skin
    """
    lower = np.array([0, 133, 77], dtype='uint8')  # The lower bound of skin color
    upper = np.array([255, 173, 127], dtype='uint8')  # Upper bound of skin color
    dst = cv2.cvtColor(src, cv2.COLOR_BGR2YCR_CB)  # Convert to YCR_CB
    skin_mask = cv2.inRange(dst, lower, upper)  # Get the skin
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    skin_mask = cv2.dilate(skin_mask, kernel, iterations=2)[..., np.newaxis]  # Dilate to fill in blobs

    if skin_mask.ndim != 3:
        skin_mask = np.expand_dims(skin_mask, axis=-1)
    return (skin_mask / 255).astype("uint8")  # A binary mask containing only 1s and 0s


def face_mask(src: np.ndarray, points: np.ndarray):
    """
    Given a list of face landmarks, return a closed polygon mask for the same
    """
    mask = np.zeros_like(src)
    mask = cv2.fillPoly(mask, [points], (255, 255, 255))
    return mask


def clicked_at(event, x, y, flags, params):
    """
    A useful callback that spits out the landmark index when clicked on a particular landmark
    Note: Very sensitive to location, should be clicked exactly on the pixel
    """
    # TODO: Add some atol to np.allclose
    if event == cv2.EVENT_LBUTTONDOWN:
        print(f"Clicked at {x, y}")
        point = np.array([x, y])
        landmarks = params.get("landmarks", None)
        image = params.get("image", None)
        if landmarks is not None and image is not None:
            for idx, landmark in enumerate(landmarks):
                if np.allclose(landmark, point):
                    print(f"Landmark: {idx}")
                    break
            print("Found no landmark close to the click")


def vignette(src: np.ndarray, sigma: int):
    """
    Given a src image and a sigma, returns a vignette of the src
    """
    height, width, _ = src.shape
    kernel_x = cv2.getGaussianKernel(width, sigma)
    kernel_y = cv2.getGaussianKernel(height, sigma)

    kernel = kernel_y * kernel_x.T
    mask = kernel / kernel.max()
    blurred = cv2.convertScaleAbs(src.copy() * np.expand_dims(mask, axis=-1))
    return blurred


def face_bbox(src: np.ndarray, offset_x: int = 0, offset_y: int = 0):
    """
    Performs face detection on a src image, return bounding box coordinates with
    an optional offset applied to the coordinates
    """
    height, width, _ = src.shape
    with FaceDetection(model_selection=0) as detector:  # 0 -> dist <= 2mts from the camera
        results = detector.process(cv2.cvtColor(src, cv2.COLOR_BGR2RGB))
        if not results.detections:
            return None
    results = results.detections[0].location_data
    x_min, y_min = results.relative_bounding_box.xmin, results.relative_bounding_box.ymin
    box_height, box_width = results.relative_bounding_box.height, results.relative_bounding_box.width
    x_min = int(width * x_min) - offset_x
    y_min = int(height * y_min) - offset_y
    box_height, box_width = int(height * box_height) + offset_y, int(width * box_width) + offset_x
    return (x_min, y_min), (box_height, box_width)


def gamma_correction(src: np.ndarray, gamma: float, coefficient: int = 1):
    """
    Performs gamma correction on a source image
    gamma > 1 => Darker Image
    gamma < 1 => Brighted Image
    """
    dst = src.copy()
    dst = dst / 255.  # Converted to float64
    dst = coefficient * np.power(dst, gamma)
    dst = (dst * 255).astype('uint8')
    return dst
