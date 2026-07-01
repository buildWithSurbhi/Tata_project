from flask import Response
from flask import Flask, jsonify, request
from flask_cors import CORS

import cv2
import numpy as np

from detector import PPEDetector
from violation import check_worker_ppe
from response_builder import build_response

app = Flask(__name__)
CORS(app)

# =====================================
# Load YOLO Model (Loads only once)
# =====================================
print("Loading YOLO Model...")
detector = PPEDetector()
print("Model Loaded Successfully!")

# =====================================
# Camera Stream
# =====================================

camera = cv2.VideoCapture(0)

def generate_frames():

    while True:

        success, frame = camera.read()

        if not success:
            break

        results = detector.detect(frame)

        annotated = results[0].plot()

        ret, buffer = cv2.imencode(
            ".jpg",
            annotated
        )

        frame_bytes = buffer.tobytes()

        yield (
            b'--frame\r\n'
            b'Content-Type: image/jpeg\r\n\r\n'
            + frame_bytes +
            b'\r\n'
        )

# =====================================
# Home Route
# =====================================
@app.route("/")
def home():
    return jsonify({
        "message": "Industrial PPE Detection API",
        "status": "Running",
        "version": "1.0"
    })


# =====================================
# Health Check
# =====================================
@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "model": "YOLOv8 PPE Detection",
        "server": "Flask"
    })


# =====================================
# Temporary Detection API
# (Used before connecting real YOLO)
# =====================================
@app.route("/test-detect")
def test_detect():

    workers = [
        {
            "id": 101,
            "helmet": False,
            "mask": True,
            "vest": False,
            "helmet_confidence": 0.96,
            "mask_confidence": 0.98,
            "vest_confidence": 0.92
        },
        {
            "id": 102,
            "helmet": True,
            "mask": False,
            "vest": True,
            "helmet_confidence": 0.97,
            "mask_confidence": 0.88,
            "vest_confidence": 0.95
        }
    ]

    return jsonify(build_response(workers))
# =====================================
# Real YOLO Detection API
# =====================================
@app.route("/detect", methods=["POST"])
def detect():

    # Check if image is uploaded
    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded"
        }), 400

    file = request.files["image"]

    # Convert uploaded image to OpenCV format
    image_bytes = np.frombuffer(file.read(), np.uint8)

    frame = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

    if frame is None:
        return jsonify({
            "error": "Invalid image"
        }), 400

    # Run YOLO Detection
    results = detector.detect(frame)

    # Check PPE Status
    workers = check_worker_ppe(results, detector.model)

    # Convert to Backend JSON Format
    response = build_response(workers)

    return jsonify(response)

# =====================================
# Video Stream Route
# =====================================

@app.route("/video_feed")
def video_feed():

    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


# =====================================
# Run Flask
# =====================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )

