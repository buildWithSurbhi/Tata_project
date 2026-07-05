import base64
from flask import Response, Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import cv2
import mediapipe as mp
from scipy.spatial import distance
import requests
import time

from detector import PPEDetector
from violation import check_worker_ppe
from response_builder import build_response

BACKEND_URL = "https://edge-ai-operator-safety-system-3.onrender.com"

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
# Fatigue Detection Setup (Tasks API)
# =====================================
BaseOptions = mp.tasks.BaseOptions
FaceLandmarker = mp.tasks.vision.FaceLandmarker
FaceLandmarkerOptions = mp.tasks.vision.FaceLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = FaceLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="face_landmarker.task"),
    running_mode=VisionRunningMode.IMAGE
)
face_landmarker = FaceLandmarker.create_from_options(options)

LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

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
    global drowsy_frames, last_alert_time
    while True:
        if not camera_running:
            time.sleep(0.1)
            continue

        success, frame = camera.read()
        if not success:
            break

        results = detector.detect(frame)
        annotated = results[0].plot()

        rgb = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
        fatigue_results = face_landmarker.detect(mp_image)

        if fatigue_results.face_landmarks:
            h, w, _ = annotated.shape
            landmarks = fatigue_results.face_landmarks[0]

            left_eye = [(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in LEFT_EYE]
            right_eye = [(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in RIGHT_EYE]

            left_ear = eye_aspect_ratio(left_eye)
            right_ear = eye_aspect_ratio(right_eye)
            ear = (left_ear + right_ear) / 2

            cv2.putText(annotated, f"EAR: {ear:.2f}", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

            if ear < EAR_THRESHOLD:
                drowsy_frames += 1
            else:
                drowsy_frames = 0

            if drowsy_frames >= DROWSY_THRESHOLD:
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
                        last_alert_time = current_time
                    except Exception as e:
                        print("Backend Error:", e)

                cv2.putText(annotated, "FATIGUE DETECTED", (20, 60),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
                cv2.rectangle(annotated, (0, 0), (w, h), (0, 0, 255), 5)

        ret, buffer = cv2.imencode(".jpg", annotated)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# =====================================
# Routes
# =====================================
@app.route("/")
def home():
    return jsonify({"message": "Industrial PPE Detection API", "status": "Running", "version": "1.0"})

@app.route("/health")
def health():
    return jsonify({"status": "healthy", "model": "YOLOv8 PPE Detection", "server": "Flask"})

@app.route("/test-detect")
def test_detect():
    workers = [
        {"id": 101, "helmet": False, "mask": True, "vest": False,
         "helmet_confidence": 0.96, "mask_confidence": 0.98, "vest_confidence": 0.92},
        {"id": 102, "helmet": True, "mask": False, "vest": True,
         "helmet_confidence": 0.97, "mask_confidence": 0.88, "vest_confidence": 0.95}
    ]
    return jsonify(build_response(workers))

@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    file = request.files["image"]
    image_bytes = np.frombuffer(file.read(), np.uint8)
    frame = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({"error": "Invalid image"}), 400

    results = detector.detect(frame)
    workers = check_worker_ppe(results, detector.model)
    response = build_response(workers)
    return jsonify(response)

@app.route("/video_feed")
def video_feed():
    return Response(generate_frames(), mimetype="multipart/x-mixed-replace; boundary=frame")

@app.route("/camera/start", methods=["GET", "POST"])
def start_camera():
    global camera_running
    camera_running = True
    return jsonify({"message": "Camera Started"})

@app.route("/camera/stop", methods=["GET", "POST"])
def stop_camera():
    global camera_running
    camera_running = False
    return jsonify({"message": "Camera Stopped"})

@app.route("/detect-frame", methods=["POST"])
def detect_frame():
    data = request.json
    if not data:
        return jsonify({"error": "No frame"}), 400

    image_data = data["image"].split(",")[1]
    image_bytes = base64.b64decode(image_data)
    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({"error": "Invalid frame"}), 400

    results = detector.detect(frame)
    workers = check_worker_ppe(results, detector.model)

    fatigue_status = "NORMAL"
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    fatigue_results = face_landmarker.detect(mp_image)

    global drowsy_frames
    if fatigue_results.face_landmarks:
        h, w, _ = frame.shape
        landmarks = fatigue_results.face_landmarks[0]

        left_eye = [(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in LEFT_EYE]
        right_eye = [(int(landmarks[idx].x * w), int(landmarks[idx].y * h)) for idx in RIGHT_EYE]

        left_ear = eye_aspect_ratio(left_eye)
        right_ear = eye_aspect_ratio(right_eye)
        ear = (left_ear + right_ear) / 2

        if ear < EAR_THRESHOLD:
            drowsy_frames += 1
        else:
            drowsy_frames = 0

        if drowsy_frames >= DROWSY_THRESHOLD:
            fatigue_status = "HIGH"

    print("Workers:", workers)
    print("Fatigue:", fatigue_status)

    return jsonify({"workers": workers, "fatigue": fatigue_status})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
