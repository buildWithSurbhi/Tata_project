import cv2
import config

class WorkerTracker:

    def __init__(self):
        self.workers = {}

    def update(self, results, frame):

        self.workers = {}

        for box in results[0].boxes:

            cls = int(box.cls[0])
            class_name = results[0].names[cls]

            # Only track PERSON
            if class_name != "Person":
                continue

            if box.id is None:
                continue

            worker_id = int(box.id[0])

            conf = float(box.conf[0])

            x1, y1, x2, y2 = map(int, box.xyxy[0])

            self.workers[worker_id] = {
                "box": (x1, y1, x2, y2),
                "helmet": False,
                "mask": False,
                "vest": False,
                "confidence": conf
            }

            # Draw Worker ID
            cv2.rectangle(frame, (x1, y1), (x2, y2), config.CYAN, 2)

            cv2.putText(
                frame,
                f"Worker {worker_id}",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                config.CYAN,
                2
            )

        return frame
    
    def get_workers(self):
        return self.workers