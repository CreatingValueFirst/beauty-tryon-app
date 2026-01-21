#!/usr/bin/env python
"""Quick test of makeup functions"""
import cv2
import numpy as np
from PIL import Image
from landmarks import detect_landmarks, normalize_landmarks
from utils import gamma_correction, mask_skin

# Import functions from app
from app import apply_lipstick, apply_blush, apply_foundation, process_image, LIPSTICK_COLORS, BLUSH_COLORS

# Load test image
print("Loading pic.jpg...")
img_pil = Image.open('pic.jpg')
img_cv = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)

print(f"Image shape: {img_cv.shape}")

# Test with all features enabled
print("\nTesting makeup application...")
result, status = process_image(
    image=img_pil,
    apply_lipstick_flag=True,
    lipstick_color="Red",
    apply_blush_flag=True,
    blush_color="Pink",
    blush_intensity=50,
    apply_foundation_flag=True,
    foundation_preset="Medium"
)

print(f"Status: {status}")
if result is not None:
    if isinstance(result, np.ndarray):
        cv2.imwrite('test_result.jpg', cv2.cvtColor(result, cv2.COLOR_RGB2BGR))
    else:
        result.save('test_result.jpg')
    print("Result saved to test_result.jpg")
else:
    print("No result returned")
