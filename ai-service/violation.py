# violation.py

def is_inside(person_box, object_box):
    """
    Check whether the center of the object lies inside the person's box.
    """

    px1, py1, px2, py2 = person_box
    ox1, oy1, ox2, oy2 = object_box

    cx = (ox1 + ox2) / 2
    cy = (oy1 + oy2) / 2

    return px1 <= cx <= px2 and py1 <= cy <= py2


def check_worker_ppe(results, model):
    """
    Returns PPE status for every detected worker.
    """

    workers = []

    helmets = []
    masks = []
    vests = []

    # -------------------------
    # Collect all detections
    # -------------------------

    for box in results[0].boxes:

        cls = int(box.cls[0])

        name = model.names[cls]

        x1, y1, x2, y2 = map(int, box.xyxy[0])

        bbox = (x1, y1, x2, y2)

        track_id = -1

        if box.id is not None:
            track_id = int(box.id[0])

        if name == "Person":

            workers.append({
                "id": track_id,
                "bbox": bbox
            })

        elif name == "Hardhat":
            helmets.append(bbox)

        elif name == "Mask":
            masks.append(bbox)

        elif name == "Safety Vest":
            vests.append(bbox)

    # -------------------------
    # Match PPE to Workers
    # -------------------------

    worker_status = []

    for worker in workers:

        person_box = worker["bbox"]

        helmet = any(is_inside(person_box, h) for h in helmets)

        mask = any(is_inside(person_box, m) for m in masks)

        vest = any(is_inside(person_box, v) for v in vests)

        violations = []

        if not helmet:
            violations.append("No Helmet")

        if not mask:
            violations.append("No Mask")

        if not vest:
            violations.append("No Safety Vest")

        worker_status.append({

            "id": worker["id"],

            "bbox": person_box,

            "helmet": helmet,

            "mask": mask,

            "vest": vest,

            "violations": violations

        })

    return worker_status