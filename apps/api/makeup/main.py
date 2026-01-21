#!/usr/bin/env python3
"""
FastAPI Makeup Try-On Service
Provides REST API endpoints for virtual makeup application
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional, List
import cv2
import numpy as np
from PIL import Image
import io
import base64
import logging

from landmarks import detect_landmarks, normalize_landmarks
from utils import gamma_correction, mask_skin

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Makeup Try-On API",
    description="Virtual makeup application service using MediaPipe FaceMesh",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Landmark indices
UPPER_LIP = [61, 185, 40, 39, 37, 0, 267, 269, 270, 408, 415, 272, 271, 268, 12, 38, 41, 42, 191, 78, 76]
LOWER_LIP = [61, 146, 91, 181, 84, 17, 314, 405, 320, 307, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
CHEEKS = [425, 205]

# ----------------------------
# Pydantic Models
# ----------------------------

class MakeupConfig(BaseModel):
    apply_lipstick: bool = Field(default=True, description="Apply lipstick effect")
    lipstick_color: str = Field(default="Red", description="Lipstick color")
    apply_blush: bool = Field(default=True, description="Apply blush effect")
    blush_color: str = Field(default="Pink", description="Blush color")
    blush_intensity: int = Field(default=50, ge=0, le=100, description="Blush intensity (0-100)")
    apply_foundation: bool = Field(default=True, description="Apply foundation effect")
    foundation_preset: str = Field(default="Medium", description="Foundation preset")

class ColorInfo(BaseModel):
    lipstick: List[str]
    blush: List[str]
    foundation: List[str]

class ProcessResponse(BaseModel):
    success: bool
    image: Optional[str] = None
    status: str
    processing_time_ms: Optional[int] = None

# ----------------------------
# Helper functions
# ----------------------------

def decode_base64_image(image_str: str) -> Image.Image:
    """Decode a base64 image string to PIL.Image"""
    if image_str.startswith("data:image"):
        image_str = image_str.split(",")[1]
    image_bytes = base64.b64decode(image_str)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return image

def encode_image_to_base64(image: np.ndarray) -> str:
    """Encode numpy image to base64 string"""
    # Convert BGR to RGB if needed
    if len(image.shape) == 3 and image.shape[2] == 3:
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    else:
        image_rgb = image

    # Convert to PIL Image
    pil_image = Image.fromarray(image_rgb)

    # Encode to base64
    buffer = io.BytesIO()
    pil_image.save(buffer, format="PNG", quality=95)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{image_base64}"

def apply_lipstick(image: np.ndarray, color_rgb: tuple, landmarks, alpha: float = 0.4) -> np.ndarray:
    """Apply lipstick to the image"""
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

def apply_blush(image: np.ndarray, color_rgb: tuple, landmarks, intensity: float = 0.3, radius: int = 40) -> np.ndarray:
    """Apply blush to the image"""
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
    if blur_rad % 2 == 0:
        blur_rad += 1
    mask = cv2.GaussianBlur(mask, (blur_rad, blur_rad), blur_rad // 2)

    alpha = intensity * 0.5
    return cv2.addWeighted(image, 1.0, mask, alpha, 0)

def apply_foundation(image: np.ndarray, preset_name: str = "Medium") -> np.ndarray:
    """Apply foundation to the image"""
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
# API Endpoints
# ----------------------------

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "service": "Makeup Try-On API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "POST /api/makeup/apply": "Apply makeup to an image",
            "GET /api/makeup/colors": "Get available colors",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "makeup-api"}

@app.get("/api/makeup/colors", response_model=ColorInfo)
async def get_colors():
    """Get available makeup colors and presets"""
    return ColorInfo(
        lipstick=list(LIPSTICK_COLORS.keys()),
        blush=list(BLUSH_COLORS.keys()),
        foundation=list(FOUNDATION_PRESETS.keys())
    )

@app.post("/api/makeup/apply")
async def apply_makeup_endpoint(
    file: UploadFile = File(...),
    apply_lipstick: bool = Form(True),
    lipstick_color: str = Form("Red"),
    apply_blush: bool = Form(True),
    blush_color: str = Form("Pink"),
    blush_intensity: int = Form(50),
    apply_foundation: bool = Form(True),
    foundation_preset: str = Form("Medium"),
    return_base64: bool = Form(True)
):
    """
    Apply makeup to an uploaded image

    Args:
        file: Image file to process
        apply_lipstick: Whether to apply lipstick
        lipstick_color: Color of lipstick
        apply_blush: Whether to apply blush
        blush_color: Color of blush
        blush_intensity: Intensity of blush (0-100)
        apply_foundation: Whether to apply foundation
        foundation_preset: Foundation preset level
        return_base64: Return image as base64 string (default) or binary

    Returns:
        Processed image with makeup applied
    """
    import time
    start_time = time.time()

    try:
        # Read image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Detect facial landmarks
        logger.info("Detecting facial landmarks...")
        landmarks = detect_landmarks(img)

        if landmarks is None:
            return ProcessResponse(
                success=False,
                status="No face detected in the image",
                processing_time_ms=int((time.time() - start_time) * 1000)
            )

        # Apply makeup effects
        output = img.copy()
        applied_features = []

        if apply_lipstick:
            logger.info(f"Applying lipstick: {lipstick_color}")
            color = LIPSTICK_COLORS.get(lipstick_color, LIPSTICK_COLORS["Red"])
            output = apply_lipstick(output, color, landmarks, alpha=0.4)
            applied_features.append("Lipstick")

        if apply_blush:
            logger.info(f"Applying blush: {blush_color} at {blush_intensity}%")
            color = BLUSH_COLORS.get(blush_color, BLUSH_COLORS["Pink"])
            intensity = blush_intensity / 100.0
            output = apply_blush(output, color, landmarks, intensity=intensity)
            applied_features.append(f"Blush ({blush_intensity}%)")

        if apply_foundation:
            logger.info(f"Applying foundation: {foundation_preset}")
            output = apply_foundation(output, preset_name=foundation_preset)
            applied_features.append(f"Foundation ({foundation_preset})")

        processing_time = int((time.time() - start_time) * 1000)
        status = f"Applied: {', '.join(applied_features) if applied_features else 'None'}"

        logger.info(f"Processing completed in {processing_time}ms")

        # Return response
        if return_base64:
            # Return as base64 JSON response
            image_base64 = encode_image_to_base64(output)
            return ProcessResponse(
                success=True,
                image=image_base64,
                status=status,
                processing_time_ms=processing_time
            )
        else:
            # Return as binary image
            output_rgb = cv2.cvtColor(output, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(output_rgb)
            buffer = io.BytesIO()
            pil_image.save(buffer, format="PNG", quality=95)
            buffer.seek(0)

            return StreamingResponse(
                buffer,
                media_type="image/png",
                headers={"X-Processing-Time": str(processing_time)}
            )

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/api/makeup/apply-base64")
async def apply_makeup_base64(config: MakeupConfig, image_base64: str):
    """
    Apply makeup to a base64 encoded image

    Args:
        config: Makeup configuration
        image_base64: Base64 encoded image string

    Returns:
        Processed image as base64 string
    """
    import time
    start_time = time.time()

    try:
        # Decode base64 image
        image_pil = decode_base64_image(image_base64)
        img = cv2.cvtColor(np.array(image_pil), cv2.COLOR_RGB2BGR)

        # Detect facial landmarks
        landmarks = detect_landmarks(img)

        if landmarks is None:
            return ProcessResponse(
                success=False,
                status="No face detected in the image",
                processing_time_ms=int((time.time() - start_time) * 1000)
            )

        # Apply makeup effects
        output = img.copy()
        applied_features = []

        if config.apply_lipstick:
            color = LIPSTICK_COLORS.get(config.lipstick_color, LIPSTICK_COLORS["Red"])
            output = apply_lipstick(output, color, landmarks, alpha=0.4)
            applied_features.append("Lipstick")

        if config.apply_blush:
            color = BLUSH_COLORS.get(config.blush_color, BLUSH_COLORS["Pink"])
            intensity = config.blush_intensity / 100.0
            output = apply_blush(output, color, landmarks, intensity=intensity)
            applied_features.append(f"Blush ({config.blush_intensity}%)")

        if config.apply_foundation:
            output = apply_foundation(output, preset_name=config.foundation_preset)
            applied_features.append(f"Foundation ({config.foundation_preset})")

        processing_time = int((time.time() - start_time) * 1000)
        status = f"Applied: {', '.join(applied_features) if applied_features else 'None'}"

        # Encode result
        image_base64_result = encode_image_to_base64(output)

        return ProcessResponse(
            success=True,
            image=image_base64_result,
            status=status,
            processing_time_ms=processing_time
        )

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# ----------------------------
# Run server
# ----------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
