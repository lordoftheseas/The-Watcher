import cv2
import time

def capture_frames(video_path, frame_interval=0.5):
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = 0
    last_capture = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        timestamp = cap.get(cv2.CAP_PROP_POS_MSEC) / 1000
        if timestamp - last_capture >= frame_interval:
            frame_count += 1
            yield frame, timestamp
            last_capture = timestamp

    cap.release()
