import cv2
import config
from detector import PPEDetector
from violation import check_worker_ppe
from csv_logger import CSVLogger

# ==============================
# Initialize Detector & Logger
# ==============================

detector = PPEDetector()
logger = CSVLogger()

# ==============================
# Open Webcam
# ==============================

cap = cv2.VideoCapture(config.CAMERA_ID)

if not cap.isOpened():
    print("Cannot open webcam")
    exit()

while True:

    ret, frame = cap.read()

    if not ret:
        break

    # ==============================
    # Run Detection
    # ==============================

    results = detector.detect(frame)

    annotated = results[0].plot()

    # ==============================
    # Check PPE
    # ==============================

    workers = check_worker_ppe(results, detector.model)

    total_workers = len(workers)
    safe_workers = 0
    unsafe_workers = 0

    # ==============================
    # Process Every Worker
    # ==============================

    for worker in workers:

        x1, y1, x2, y2 = worker["bbox"]
        worker_id = worker["id"]

        # --------------------------
        # SAFE Worker
        # --------------------------

        if len(worker["violations"]) == 0:

            safe_workers += 1

            color = (0,255,0)

            text = f"Worker {worker_id} : SAFE"

            logger.clear_violation(worker_id)

        # --------------------------
        # Unsafe Worker
        # --------------------------

        else:

            unsafe_workers += 1

            color = (0,0,255)

            text = f"Worker {worker_id}"

            print("Logging worker:", worker)
            logger.log_violation(worker)

        # Draw Worker Status

        cv2.putText(
            annotated,
            text,
            (x1, y1-10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            color,
            2
        )

        # Draw Violations

        yy = y1 + 20

        for violation in worker["violations"]:

            cv2.putText(
                annotated,
                violation,
                (x1, yy),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0,0,255),
                2
            )

            yy += 25

    # ==============================
    # Dashboard (Top Left)
    # ==============================

    cv2.rectangle(annotated, (5,5), (300,120), (40,40,40), -1)

    cv2.putText(
        annotated,
        f"Workers : {total_workers}",
        (15,30),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (255,255,255),
        2
    )

    cv2.putText(
        annotated,
        f"Safe : {safe_workers}",
        (15,60),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0,255,0),
        2
    )

    cv2.putText(
        annotated,
        f"Violations : {unsafe_workers}",
        (15,90),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.7,
        (0,0,255),
        2
    )

    # ==============================
    # Display Window
    # ==============================

    cv2.imshow(config.WINDOW_NAME, annotated)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()