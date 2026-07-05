import cv2
import requests
import time

BACKEND_URL = "https://edge-ai-operator-safety-system-3.onrender.com"

cap = cv2.VideoCapture(0)

last_sent = 0

while True:

    ret, frame = cap.read()

    if not ret:
        break

    current_time = time.time()

    if current_time - last_sent > 10:

        violation = {
            "workerId": "101",
            "violationType": "helmet_missing",
            "confidence": 0.95,
            "severity": "high"
        }

        try:
            requests.post(
                BACKEND_URL,
                json=violation
            )

            print("Violation sent")

        except Exception as e:
            print(e)

        last_sent = current_time

    cv2.imshow("Webcam", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()