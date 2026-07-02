import cv2
import mediapipe as mp
from scipy.spatial import distance
import warnings
import json
from datetime import datetime

warnings.filterwarnings("ignore")

# Initialize MediaPipe Face Mesh
mp_face_mesh = mp.solutions.face_mesh

face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,
    refine_landmarks=True
)

# Eye Landmark IDs
LEFT_EYE = [33, 160, 158, 133, 153, 144]
RIGHT_EYE = [362, 385, 387, 263, 373, 380]

# Head Pose Landmarks
NOSE = 1
LEFT_CHEEK = 234
RIGHT_CHEEK = 454

# Blink Variables
blink_count = 0
blink_frames = 0

EAR_THRESHOLD = 0.21
CONSEC_FRAMES = 3

# Alert Variables
alert_active = False

# Distraction Variables
distraction_frames = 0
DISTRACTION_THRESHOLD = 60

# Drowsiness Variables
drowsy_frames = 0
DROWSY_THRESHOLD = 45


def eye_aspect_ratio(eye):
    A = distance.euclidean(eye[1], eye[5])
    B = distance.euclidean(eye[2], eye[4])
    C = distance.euclidean(eye[0], eye[3])

    return (A + B) / (2.0 * C)


cap = cv2.VideoCapture(0)

while True:

    success, frame = cap.read()

    if not success:
        break

    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = face_mesh.process(rgb)

    if results.multi_face_landmarks:

        for face_landmarks in results.multi_face_landmarks:

            h, w, _ = frame.shape
            # Head Pose Points
            nose = face_landmarks.landmark[NOSE]
            left_cheek = face_landmarks.landmark[LEFT_CHEEK]
            right_cheek = face_landmarks.landmark[RIGHT_CHEEK]

            nose_x = int(nose.x * w)
            left_x = int(left_cheek.x * w)
            right_x = int(right_cheek.x * w)

            # Draw Nose Point
            cv2.circle(frame, (nose_x, int(nose.y * h)), 5, (255, 0, 0), -1)

            # Head Direction Detection
            left_distance = nose_x - left_x
            right_distance = right_x - nose_x

            difference = left_distance - right_distance

            if abs(difference) < 15:
                head_direction = "FORWARD"

            elif difference > 15:
                head_direction = "LEFT"

            else:
                head_direction = "RIGHT"

            # Distraction Detection
            if head_direction != "FORWARD":
                distraction_frames += 1
            else:
                distraction_frames = 0

            if distraction_frames >= DISTRACTION_THRESHOLD:
                distraction = "YES"
            else:
                distraction = "NO"

            left_eye = []
            right_eye = []

            # Left Eye
            for idx in LEFT_EYE:
                x = int(face_landmarks.landmark[idx].x * w)
                y = int(face_landmarks.landmark[idx].y * h)

                left_eye.append((x, y))

                cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)

            # Right Eye
            for idx in RIGHT_EYE:
                x = int(face_landmarks.landmark[idx].x * w)
                y = int(face_landmarks.landmark[idx].y * h)

                right_eye.append((x, y))

                cv2.circle(frame, (x, y), 3, (0, 255, 0), -1)

            # EAR Calculation
            left_ear = eye_aspect_ratio(left_eye)
            right_ear = eye_aspect_ratio(right_eye)

            ear = (left_ear + right_ear) / 2

            # Blink Detection
            if ear < EAR_THRESHOLD:
                blink_frames += 1
            else:
                if blink_frames >= CONSEC_FRAMES:
                    blink_count += 1
                blink_frames = 0

            # Drowsiness Detection
            if ear < EAR_THRESHOLD:
                drowsy_frames += 1
            else:
                drowsy_frames = 0

            if drowsy_frames >= DROWSY_THRESHOLD:
                warning = "DROWSINESS DETECTED"
                color = (0, 0, 255)
            else:
                warning = "NORMAL"
                color = (0, 255, 0)

            # print("EAR:", round(ear, 2), "Frames:", drowsy_frames, "Warning:", warning)

            # Trigger Alert
            if warning == "DROWSINESS DETECTED":
                alert_active = True
            else:
                alert_active = False

            # Eye Status
            if ear < EAR_THRESHOLD:
                status = "CLOSED"
            else:
                status = "OPEN"

            # Display EAR
            cv2.putText(
                frame,
                f"EAR: {ear:.2f}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )

            # Display Blink Count
            cv2.putText(
                frame,
                f"Blinks: {blink_count}",
                (20, 80),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )

            # Display Eye Status
            cv2.putText(
                frame,
                f"Eyes: {status}",
                (20, 120),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2
            )

            # Display Head Direction
            cv2.putText(
                frame,
                f"Head: {head_direction}",
                (20, 200),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (255, 255, 0),
                2
            )

            # Display Distraction Status
            cv2.putText(
                frame,
                f"Distraction: {distraction}",
                (20, 240),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 0, 255) if distraction == "YES" else (0, 255, 0),
                2
            )

            # Fatigue Alert
            # if warning == "DROWSINESS DETECTED":

            #  cv2.rectangle(frame, (0, 0), (w, h), (0, 0, 255), 8)

            # cv2.putText(
            # frame,
            # "FATIGUE ALERT",
            # (120, 300),
            # cv2.FONT_HERSHEY_SIMPLEX,
            # 1.3,
            # (0, 0, 255),
            # 3
            # )

            # Display Drowsiness Status
            cv2.putText(
                frame,
                f"Status: {warning}",
                (20, 160),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                color,
                2
            )

            # Final Fatigue Decision
            if warning == "DROWSINESS DETECTED" and distraction == "YES":
                fatigue = "HIGH"
                fatigue_color = (0, 0, 255)
                confidence = 95

            elif warning == "DROWSINESS DETECTED":
                fatigue = "MEDIUM"
                fatigue_color = (0, 165, 255)
                confidence = 90

            elif distraction == "YES":
                fatigue = "LOW"
                fatigue_color = (0, 255, 255)
                confidence = 85

            else:
                fatigue = "NORMAL"
                fatigue_color = (0, 255, 0)
                confidence = 0

            # Display Fatigue Level
            cv2.putText(
                frame,
                f"Fatigue: {fatigue}",
                (20, 280),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                fatigue_color,
                2
            )

            # Display Confidence
            cv2.putText(
                frame,
                f"Confidence: {confidence}%",
                (20, 320),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                fatigue_color,
                2
            )
            # Create JSON Data
            fatigue_data = {
                "workerId": "101",
                "violationType": "fatigue_detected",
                "confidence": confidence / 100,
                "severity": fatigue.lower()
            }

            # Save JSON File
            with open("fatigue_data.json", "w") as file:
                json.dump(fatigue_data, file, indent=4)

            # Fatigue Alert
            if warning == "DROWSINESS DETECTED":

                # Red Border
                cv2.rectangle(
                    frame,
                    (0, 0),
                    (w, h),
                    (0, 0, 255),
                    8
                )

                # Warning Text
                cv2.putText(
                    frame,
                    "FATIGUE ALERT!",
                    (120, 300),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1.3,
                    (0, 0, 255),
                    3
                )

    #             # Fatigue Alert
    # if warning == "DROWSINESS DETECTED":

    #     cv2.rectangle(
    #         frame,
    #         (0, 0),
    #         (w, h),
    #         (0, 0, 255),
    #         8
    #     )

    #     cv2.putText(
    #         frame,
    #         "FATIGUE ALERT!",
    #         (120, 300),
    #         cv2.FONT_HERSHEY_SIMPLEX,
    #         1.3,
    #         (0, 0, 255),
    #         3
    #     )

    # SHOW FRAME
    cv2.imshow("Operator Safety AI", frame)

    # EXIT
    if cv2.waitKey(1) & 0xFF == 27:
        break



cap.release()
cv2.destroyAllWindows()