from pytubefix import YouTube
from pytubefix.cli import on_progress

def download_youtube_video(url: str, dest: str): 
    yt = YouTube(url, on_progress_callback=on_progress)
    ys = yt.streams.get_highest_resolution()
    ys.download(output_path=dest)