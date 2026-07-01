def build_response(workers):

    response = []

    for worker in workers:

        worker_id = str(worker["id"])

        if not worker["helmet"]:

            response.append({
                "workerId": worker_id,
                "violationType": "helmet_missing",
                "confidence": round(worker.get("helmet_confidence", 0.95), 2),
                "severity": "high"
            })

        if not worker["mask"]:

            response.append({
                "workerId": worker_id,
                "violationType": "mask_missing",
                "confidence": round(worker.get("mask_confidence", 0.95), 2),
                "severity": "medium"
            })

        if not worker["vest"]:

            response.append({
                "workerId": worker_id,
                "violationType": "vest_missing",
                "confidence": round(worker.get("vest_confidence", 0.95), 2),
                "severity": "high"
            })

    return response