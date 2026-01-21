---
title: Virtual Makeup Try-On
emoji: 💄
colorFrom: pink
colorTo: purple
sdk: gradio
sdk_version: "4.44.0"
app_file: app.py
pinned: false
---

# Virtual-Makeup

Python, OpenCV based virtual try-on for makeup such as **lip color, blush, foundation** (and potentially eyewear).

These Python scripts apply virtual makeup onto:
- A static image of a person’s face
- Or a live webcam feed

Currently supported:
- Lip color
- Face blush
- Foundation

Default makeup color is `rgb(157, 0, 153)` and can be customized.

---

## How to use

1. Clone this repository  
2. Create a virtual environment  
   ```bash
   python3 -m venv env
