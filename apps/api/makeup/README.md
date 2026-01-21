# Makeup Try-On API

FastAPI service for virtual makeup application using MediaPipe FaceMesh.

## Features

- **Lipstick**: 7 color options (Red, Pink, Burgundy, Orange, Nude, Wine, Coral)
- **Blush**: 6 color options with adjustable intensity (0-100%)
- **Foundation**: 4 presets (Low, Medium, High, Warm)

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# The API will be available at http://localhost:8000
```

### Option 2: Local Development

```bash
# Install dependencies
pip install -r requirements-api.txt

# Run the server
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will start on `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### GET `/health`
Health check endpoint

### GET `/api/makeup/colors`
Get available colors and presets

**Response:**
```json
{
  "lipstick": ["Red", "Pink", "Burgundy", "Orange", "Nude", "Wine", "Coral"],
  "blush": ["Coral", "Pink", "Peach", "Rose", "Berry", "Apricot"],
  "foundation": ["Low", "Medium", "High", "Warm"]
}
```

### POST `/api/makeup/apply`
Apply makeup to an uploaded image

**Parameters** (multipart/form-data):
- `file`: Image file (required)
- `apply_lipstick`: boolean (default: true)
- `lipstick_color`: string (default: "Red")
- `apply_blush`: boolean (default: true)
- `blush_color`: string (default: "Pink")
- `blush_intensity`: int 0-100 (default: 50)
- `apply_foundation`: boolean (default: true)
- `foundation_preset`: string (default: "Medium")
- `return_base64`: boolean (default: true)

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "status": "Applied: Lipstick, Blush (50%), Foundation (Medium)",
  "processing_time_ms": 2150
}
```

## Usage Examples

### Python
```python
import requests

with open('photo.jpg', 'rb') as f:
    files = {'file': f}
    data = {
        'apply_lipstick': True,
        'lipstick_color': 'Red',
        'apply_blush': True,
        'blush_color': 'Pink',
        'blush_intensity': 50
    }
    response = requests.post('http://localhost:8000/api/makeup/apply', files=files, data=data)
    print(response.json())
```

### JavaScript/TypeScript
```typescript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('lipstick_color', 'Red');

const response = await fetch('http://localhost:8000/api/makeup/apply', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

## Performance

- **Processing Time**: ~2-5 seconds per image
- **Memory Usage**: ~500MB-1GB
- **Recommended**: 2 CPU cores, 2GB RAM minimum

## Deployment

Build and push Docker image:
```bash
docker build -t makeup-api .
docker run -p 8000:8000 makeup-api
```

## License

Based on MediaPipe (Apache 2.0 License)
