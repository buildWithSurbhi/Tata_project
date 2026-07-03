from flask import Response
from flask import Flask, jsonify, request
from flask_cors import CORS

import cv2
import numpy as np

import mediapipe as mp
from scipy.spatial import distance

from detector import PPEDetector
from violation import check_worker_ppe
from response_builder import build_response
import requests
import time

BACKEND_URL = "http://localhost:5000/api/violations"

last_alert_time = 0

app = Flask(__name__)
CORS(app)

# =====================================
# Load YOLO Model (Loads only once)
# =====================================
print("Loading YOLO Model...")
detector = PPEDetector()
print("Model Loaded Successfully!")
# =====================================
# Fatigue Detection Setup
# =====================================

mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True
)

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

NOSE = 1
LEFT_CHEEK = 234
RIGHT_CHEEK = 454

EAR_THRESHOLD = 0.21
DROWSY_THRESHOLD = 30

drowsy_frames = 0

def eye_aspect_ratio(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])

    return (A + B) / (2.0 * C)

# =====================================
# Camera Stream
# =====================================

camera = cv2.VideoCapture(0)
camera_running = True

def generate_frames():

    while True:

        global camera_running

        if not camera_running:
            time.sleep(0.1)
            continue

        success, frame = camera.read()

        if not success:
            break

        results = detector.detect(frame)

        annotated = results[0].plot()
        global drowsy_frames

        rgb = cv2.cvtColor(
            annotated,
            cv2.COLOR_BGR2RGB
        )

        fatigue_results = face_mesh.process(rgb)

        if fatigue_results.multi_face_landmarks:
            #print("Face detected")

            for face_landmarks in fatigue_results.multi_face_landmarks:

                h, w, _ = annotated.shape

                left_eye = []
                right_eye = []

                for idx in LEFT_EYE:
                    x = int(face_landmarks.landmark[idx].x * w)
                    y = int(face_landmarks.landmark[idx].y * h)
                    left_eye.append((x, y))

                for idx in RIGHT_EYE:
                    x = int(face_landmarks.landmark[idx].x * w)
                    y = int(face_landmarks.landmark[idx].y * h)
                    right_eye.append((x, y))

                left_ear = eye_aspect_ratio(left_eye)
                right_ear = eye_aspect_ratio(right_eye)

                ear = (left_ear + right_ear) / 2
                #print("EAR =", ear)
                print("Threshold =", EAR_THRESHOLD)
                cv2.putText(
                    annotated,
                    f"EAR: {ear:.2f}",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2
                )
                if ear < EAR_THRESHOLD:
                    drowsy_frames += 1
                    print("Eyes Closed | Frames =", drowsy_frames)
                else:
                    drowsy_frames = 0
                    print("Eyes Open | Frames =", drowsy_frames)
                if drowsy_frames >= DROWSY_THRESHOLD:
                    print("Current drowsy frames:", drowsy_frames)

                    global last_alert_time

                    current_time = time.time()

                    if current_time - last_alert_time > 30:

                        try:
                            requests.post(
                                BACKEND_URL,
                                json={
                                    "workerId": "101",
                                    "violationType": "fatigue",
                                    "confidence": 0.95,
                                    "severity": "high"
                                }
                            )

                            print("Fatigue sent to backend")

                            last_alert_time = current_time

                        except Exception as e:
                            print("Backend Error:", e)

                    cv2.putText(
                        annotated,
                        "FATIGUE DETECTED",
                        (20, 60),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1,
                        (0, 0, 255),
                        3
                    )

                    cv2.rectangle(
                        annotated,
                        (0, 0),
                        (w, h),
                        (0, 0, 255),
                        5
                    )

                    cv2.putText(
                    annotated,
                    f"EAR: {ear:.2f}",
                    (20, 40),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0,255,0),
                    2
                )

                    cv2.putText(
                    annotated,
                    f"Drowsy Frames: {drowsy_frames}",
                    (20, 80),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0,255,255),
                    2
                )

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
@app.route("/camera/start", methods=["GET", "POST"])
def start_camera():

    global camera_running

    camera_running = True

    return jsonify({
        "message": "Camera Started"
    })
@app.route("/camera/stop", methods=["GET", "POST"])
def stop_camera():

    global camera_running

    camera_running = False

    return jsonify({
        "message": "Camera Stopped"
    })
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )

