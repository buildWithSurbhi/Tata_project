import cv2
from detector import PPEDetector

detector = PPEDetector()

cap = cv2.VideoCapture(0)

while True:

    ret, frame = cap.read()

    if not ret:
        break

    results = detector.detect(frame)

    annotated_frame = results[0].plot()

    cv2.imshow(
        "YOLO PPE Detection",
        annotated_frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()