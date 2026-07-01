from ultralytics import YOLO
import config

model = YOLO(config.MODEL_PATH)

print(model.names)