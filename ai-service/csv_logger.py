import csv
import os
from datetime import datetime


class CSVLogger:

    def __init__(self):

        self.log_folder = "logs"
        self.log_file = os.path.join(self.log_folder, "violations.csv")

        os.makedirs(self.log_folder, exist_ok=True)

        # Stores workers currently in violation
        self.active_violations = set()

        # Create CSV if it doesn't exist
        if not os.path.exists(self.log_file):

            with open(self.log_file, "w", newline="") as f:

                writer = csv.writer(f)

                writer.writerow([
                    "Date",
                    "Time",
                    "Worker ID",
                    "Helmet",
                    "Mask",
                    "Safety Vest",
                    "Status"
                ])

    def log_violation(self, worker):

        worker_id = worker["id"]

        # Already logged
        if worker_id in self.active_violations:
            return

        self.active_violations.add(worker_id)

        date = datetime.now().strftime("%Y-%m-%d")
        time = datetime.now().strftime("%H:%M:%S")

        helmet = "Yes" if worker["helmet"] else "No"
        mask = "Yes" if worker["mask"] else "No"
        vest = "Yes" if worker["vest"] else "No"

        with open(self.log_file, "a", newline="") as f:

            writer = csv.writer(f)

            writer.writerow([
                date,
                time,
                worker_id,
                helmet,
                mask,
                vest,
                "Violation"
            ])

        print(f"Violation Logged -> Worker {worker_id}")

    def clear_violation(self, worker_id):

        if worker_id in self.active_violations:
            self.active_violations.remove(worker_id)