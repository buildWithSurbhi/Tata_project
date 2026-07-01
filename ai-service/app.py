from flask import Flask, jsonify
from flask_cors import CORS

from detector import PPEDetector
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
# Run Flask
# =====================================
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )