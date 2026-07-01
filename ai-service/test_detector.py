import cv2
from detector import PPEDetector
import config

detector = PPEDetector()

cap = cv2.VideoCapture(config.CAMERA_ID)

while True:

    ret, frame = cap.read()

    if not ret:
        break

    results = detector.detect(frame)

    annotated = results[0].plot()

    cv2.imshow(config.WINDOW_NAME, annotated)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()