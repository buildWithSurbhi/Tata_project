from ultralytics import YOLO
import config


class PPEDetector:

    def __init__(self):
        print("Loading YOLO Model...")
        self.model = YOLO(config.MODEL_PATH)
        print("Model Loaded Successfully!")

    def detect(self, frame):

        results = self.model.track(
            frame,
            persist=True,
            tracker=config.TRACKER,
            conf=config.CONFIDENCE,
            verbose=False
        )

        return results