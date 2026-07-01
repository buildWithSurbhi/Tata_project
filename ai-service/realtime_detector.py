import cv2
import requests
import time

from detector import PPEDetector

detector = PPEDetector()

BACKEND_URL = "http://localhost:5000/api/violations"

cap = cv2.VideoCapture(0)

last_sent = 0

while True:

    ret, frame = cap.read()

    if not ret:
        break

    results = detector.detect(frame)

    annotated_frame = results[0].plot()

    cv2.imshow(
        "Edge AI PPE Detection",
        annotated_frame
    )

    current_time = time.time()

    if current_time - last_sent > 5:

        boxes = results[0].boxes

        for box in boxes:

            class_id = int(box.cls[0])

            confidence = float(box.conf[0])

            label = detector.model.names[class_id]

            violation = None

            if label == "NO-Hardhat":
                violation = {
                    "workerId": "101",
                    "violationType": "helmet_missing",
                    "confidence": confidence,
                    "severity": "high"
                }

            elif label == "NO-Mask":
                violation = {
                    "workerId": "101",
                    "violationType": "mask_missing",
                    "confidence": confidence,
                    "severity": "medium"
                }

            elif label == "NO-Safety Vest":
                violation = {
                    "workerId": "101",
                    "violationType": "vest_missing",
                    "confidence": confidence,
                    "severity": "high"
                }

            if violation:

                try:

                    response = requests.post(
                        BACKEND_URL,
                        json=violation
                    )

                    print(
                        "Violation Saved:",
                        violation["violationType"]
                    )

                except Exception as e:
                    print("Backend Error:", e)

        last_sent = current_time

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()