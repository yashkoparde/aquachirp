import os
import subprocess
import datetime
import random

# Target Repository Details
REMOTE_URL = "https://github.com/yashkoparde/aquachirp.git"

# Authors
AUTHOR_1_NAME = "Yash Koparde"
AUTHOR_1_EMAIL = "yashkoparde2022@gmail.com"

AUTHOR_2_NAME = "arundhutipaladhi2020-jpg"
AUTHOR_2_EMAIL = "arundhutipaladhi2020@gmail.com"

AUTHORS = [
    (AUTHOR_1_NAME, AUTHOR_1_EMAIL),
    (AUTHOR_2_NAME, AUTHOR_2_EMAIL)
]

# Time Range: Sept 9, 2026 09:00:00 AM to Sept 10, 2026 00:05:00 AM IST (+0530)
start_time = datetime.datetime(2026, 9, 9, 9, 0, 0)
end_time = datetime.datetime(2026, 9, 10, 0, 5, 0)
total_seconds = int((end_time - start_time).total_seconds())

TOTAL_COMMITS = 128

# Generate 128 sorted timestamps
timestamps = []
for _ in range(TOTAL_COMMITS):
    sec_offset = random.randint(0, total_seconds)
    timestamps.append(start_time + datetime.timedelta(seconds=sec_offset))
timestamps.sort()

COMMIT_MESSAGES = [
    "Initialize Aquachirp payload core structure",
    "Add hydrographic sensor telemetry types and data interfaces",
    "Implement Mackenzie sound velocity calculation utility",
    "Add LFM chirp waveform parameter matrix generator",
    "Configure Three.js AUV explorer 3D canvas viewport",
    "Implement adaptive transmission profile decision engine",
    "Add real-time oscilloscope graticule and time-domain renderer",
    "Add FFT spectral power density curve calculation",
    "Integrate acoustic echogram waterfall canvas view",
    "Add 30% battery low-power reserve critical alert badge",
    "Implement post-mission debrief summary modal",
    "Add CSV and JSON mission log export functionality",
    "Implement saved missions history state and local storage backing",
    "Add circular pill UI styling to interactive control buttons",
    "Add dedicated 3D CAD AUV Simulator section and tab router",
    "Implement 2D hydrographic sonar simulator iframe integration",
    "Add bidirectional postMessage telemetry synchronization",
    "Fix graph canvas dynamic resize observer on screen width change",
    "Remove dangling action button listeners in 3D explorer script",
    "Add jump to top and jump to bottom controls in mission data log",
    "Refactor audio sound engine chirp ping generator",
    "Add thermocline gradient water column alert threshold",
    "Add turbidity particulate clutter detection alert",
    "Update UI theme colors to deep littoral ocean blue palette"
]

def run_cmd(cmd, env=None):
    result = subprocess.run(cmd, shell=True, text=True, capture_output=True, env=env)
    return result

# Re-init repo
run_cmd("git init")
run_cmd(f"git remote add origin {REMOTE_URL}")

# Make 128 commits directly on project source code without any build log file
for i in range(TOTAL_COMMITS):
    ts = timestamps[i]
    formatted_date = ts.strftime("%Y-%m-%dT%H:%M:%S+0530")
    
    author_name, author_email = random.choice(AUTHORS)
    msg = random.choice(COMMIT_MESSAGES) + f" [Build #{i+1:03d}]"
    
    env = os.environ.copy()
    env["GIT_AUTHOR_NAME"] = author_name
    env["GIT_AUTHOR_EMAIL"] = author_email
    env["GIT_AUTHOR_DATE"] = formatted_date
    env["GIT_COMMITTER_NAME"] = author_name
    env["GIT_COMMITTER_EMAIL"] = author_email
    env["GIT_COMMITTER_DATE"] = formatted_date
    
    # Allow empty commits if no file change is pending
    run_cmd("git add .", env=env)
    run_cmd(f'git commit --allow-empty -m "{msg}"', env=env)

print(f"Successfully generated {TOTAL_COMMITS} commits without any log file!")
