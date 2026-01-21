#!/usr/bin/env python3
"""
Virtual Makeup App using MediaPipe FaceMesh
Supports images via PIL, URL, or Base64 input
"""

import cv2
import numpy as np
import gradio as gr
from PIL import Image
import os
import io
import base64

from landmarks import detect_landmarks, normalize_landmarks
from utils import gamma_correction, mask_skin

# ----------------------------
# Color presets
# ----------------------------

LIPSTICK_COLORS = {
    "Red": (0, 0, 255),
    "Pink": (203, 192, 255),
    "Burgundy": (75, 0, 130),
    "Orange": (0, 165, 255),
    "Nude": (180, 140, 200),
    "Wine": (0, 0, 120),
    "Coral": (100, 165, 255),
}

BLUSH_COLORS = {
    "Coral": (66, 135, 245),
    "Pink": (192, 135, 220),
    "Peach": (152, 165, 255),
    "Rose": (100, 70, 200),
    "Berry": (140, 50, 150),
    "Apricot": (140, 140, 230),
}

FOUNDATION_PRESETS = {
    "Low": {"intensity": 0.2, "gamma": 1.15, "warm_shift": 0.0},
    "Medium": {"intensity": 0.35, "gamma": 1.3, "warm_shift": 0.0},
    "High": {"intensity": 0.5, "gamma": 1.45, "warm_shift": 0.0},
    "Warm": {"intensity": 0.35, "gamma": 1.3, "warm_shift": 0.08},
}

# ----------------------------
# Landmark indices
# ----------------------------

UPPER_LIP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 408, 415, 272, 271, 268, 12, 38, 41, 42, 191, 78, 76]
LOWER_LIP = [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
CHEEKS = [425, 205]  # Left and right cheek points

# ----------------------------
# Helper functions
# ----------------------------

def decode_base64_image(image_str):
    """Decode a base64 image string to PIL.Image"""
    if image_str.startswith("data:image"):
        image_str = image_str.split(",")[1]
    image_bytes = base64.b64decode(image_str)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return image

def apply_lipstick(image, color_rgb, landmarks, alpha=0.4):
    if landmarks is None:
        return image
    h, w = image.shape[:2]
    mask = np.zeros_like(image)
    lip_points = normalize_landmarks(landmarks, h, w, UPPER_LIP + LOWER_LIP)
    if len(lip_points) > 0:
        lip_points = lip_points.astype(np.int32)
        cv2.fillPoly(mask, [lip_points], color_rgb)
        mask = cv2.GaussianBlur(mask, (15, 15), 3)
    return cv2.addWeighted(image, 1.0, mask, alpha, 0)

def apply_blush(image, color_rgb, landmarks, intensity=0.3, radius=40):
    if landmarks is None:
        return image
    h, w = image.shape[:2]
    mask = np.zeros_like(image)
    cheek_points = normalize_landmarks(landmarks, h, w, CHEEKS)
    for point in cheek_points:
        x, y = int(point[0]), int(point[1])
        y_min, y_max = max(0, y-radius), min(h, y+radius+1)
        x_min, x_max = max(0, x-radius), min(w, x+radius+1)
        yy, xx = np.ogrid[y_min:y_max, x_min:x_max]
        dist = np.sqrt((yy - y)**2 + (xx - x)**2)
        gradient = np.zeros_like(dist, dtype=np.float32)
        valid = dist <= radius
        gradient[valid] = (1.0 + np.cos(np.pi * dist[valid] / radius)) / 2.0
        for c in range(3):
            color_val = color_rgb[c]
            mask[y_min:y_max, x_min:x_max, c] = np.maximum(
                mask[y_min:y_max, x_min:x_max, c],
                (color_val * gradient).astype(np.uint8)
            )
    blur_rad = max(3, radius // 3)
    if blur_rad % 2 == 0: blur_rad += 1
    mask = cv2.GaussianBlur(mask, (blur_rad, blur_rad), blur_rad // 2)
    alpha = intensity * 0.5
    return cv2.addWeighted(image, 1.0, mask, alpha, 0)

def apply_foundation(image, preset_name="Medium"):
    if image is None:
        return image
    preset = FOUNDATION_PRESETS.get(preset_name, FOUNDATION_PRESETS["Medium"])
    intensity, gamma_val, warm_shift = preset["intensity"], preset["gamma"], preset["warm_shift"]
    skin_mask_binary = mask_skin(image)
    if skin_mask_binary.ndim == 3:
        skin_mask_binary = skin_mask_binary[:, :, 0]
    corrected = gamma_correction(image, gamma_val, coefficient=1)
    if warm_shift > 0:
        corrected = corrected.astype(np.float32)
        corrected[:, :, 2] = np.clip(corrected[:, :, 2] * (1.0 + warm_shift), 0, 255)
        corrected = corrected.astype(np.uint8)
    output = image.copy()
    skin_pixels = skin_mask_binary > 0
    output[skin_pixels] = cv2.addWeighted(
        image[skin_pixels], 1.0 - intensity,
        corrected[skin_pixels], intensity, 0
    )
    return output.astype(np.uint8)

# ----------------------------
# Main processing function
# ----------------------------

def process_image(image, apply_lipstick_flag, lipstick_color, 
                  apply_blush_flag, blush_color, blush_intensity,
                  apply_foundation_flag, foundation_preset):
    """Process image with selected makeup features."""
    if image is None:
        return image, "No image provided"
    
    # Handle Base64 string input
    if isinstance(image, str):
        image = decode_base64_image(image)

    # Convert to OpenCV
    if isinstance(image, Image.Image):
        img = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    else:
        img = image.copy()

    landmarks = detect_landmarks(img)
    if landmarks is None:
        return cv2.cvtColor(img, cv2.COLOR_BGR2RGB), "No face detected"
    
    output = img.copy()
    applied_features = []

    if apply_lipstick_flag:
        color = LIPSTICK_COLORS.get(lipstick_color, LIPSTICK_COLORS["Red"])
        output = apply_lipstick(output, color, landmarks, alpha=0.4)
        applied_features.append("Lipstick")

    if apply_blush_flag:
        color = BLUSH_COLORS.get(blush_color, BLUSH_COLORS["Pink"])
        intensity = blush_intensity / 100.0
        output = apply_blush(output, color, landmarks, intensity=intensity)
        applied_features.append(f"Blush ({blush_intensity}%)")

    if apply_foundation_flag:
        output = apply_foundation(output, preset_name=foundation_preset)
        applied_features.append(f"Foundation ({foundation_preset})")

    output_rgb = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
    status = f"Applied: {', '.join(applied_features) if applied_features else 'None'}"
    
    return output_rgb, status

# ----------------------------
# Gradio UI
# ----------------------------

with gr.Blocks(title="Virtual Makeup App") as demo:
    gr.Markdown("# 💄 Virtual Makeup App")
    gr.Markdown("Upload a photo or provide a Base64 string and apply virtual makeup")

    with gr.Row():
        with gr.Column():
            image_input = gr.Image(label="Upload Image or Base64", type="pil")
            lipstick_check = gr.Checkbox(label="Apply Lipstick", value=True)
            lipstick_color = gr.Dropdown(list(LIPSTICK_COLORS.keys()), value="Red", label="Lipstick Color")
            blush_check = gr.Checkbox(label="Apply Blush", value=True)
            blush_color = gr.Dropdown(list(BLUSH_COLORS.keys()), value="Pink", label="Blush Color")
            blush_intensity = gr.Slider(0, 100, value=50, step=5, label="Blush Intensity (%)")
            foundation_check = gr.Checkbox(label="Apply Foundation", value=True)
            foundation_preset = gr.Dropdown(list(FOUNDATION_PRESETS.keys()), value="Medium", label="Foundation Level")
            apply_btn = gr.Button("✨ Apply Makeup", variant="primary")
        
        with gr.Column():
            image_output = gr.Image(label="Result", type="pil")
            status_text = gr.Textbox(label="Status", interactive=False)

    apply_btn.click(
        fn=process_image,
        inputs=[image_input, lipstick_check, lipstick_color,
                blush_check, blush_color, blush_intensity,
                foundation_check, foundation_preset],
        outputs=[image_output, status_text]
    )

# ----------------------------
# Launch app
# ----------------------------

if __name__ == "__main__":
    demo.launch()
