import os
import whisper
import json


def transcribe_audio():
    model = whisper.load_model("base")
    result = model.transcribe("audio.wav")
    with open(os.path.join("./", " audio.json"), "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)
    return result


# Convert the result to a JSON string and print it to stdout
print(transcribe_audio())
