import os
import cv2
from datetime import datetime

class ViolationLogger:

    def __init__(self):

        self.folder = "screenshots"

        os.makedirs(self.folder, exist_ok=True)

    def save(self, frame, worker_id):

        now = datetime.now()

        filename = f"Worker_{worker_id}_{now.strftime('%Y%m%d_%H%M%S')}.jpg"

        path = os.path.join(self.folder, filename)

        cv2.imwrite(path, frame)

        print("Screenshot Saved:", path)