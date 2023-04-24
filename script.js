import { config } from "dotenv";
import cors from "cors";
import express from "express";
import { exec } from "child_process";
import fs from "fs";
import bodyParser from "body-parser";
import youtubedl from "youtube-dl-exec";
import { Configuration, OpenAIApi } from "openai";
import { spawn } from "child_process";
config();
const PORT = 5000;
const corsOption = {
  origin: "http://localhost:3000",
};

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.API_KEY,
  })
);

const app = express();
app.use(cors(corsOption));
app.use(bodyParser.json()); // body의 데이터를 json형식으로 받음
app.use(bodyParser.urlencoded({ extended: true })); // qs모듈로 쿼리스트링 파싱

app.post("/file", (req, res) => {
  res.send("Hello World");
});

app.post("/link", async (req, res) => {
  console.log(req.body);
  const url = req.body.url;
  const output = await youtubedl(url, {
    dumpJson: true,
    noWarnings: true,
    noCallHome: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true,
    referer: "https://www.youtube.com",
  });
  const audioUrl = output.formats.find((format) => format.ext === "webm").url;

  // Use ffmpeg to download the audio and convert it to a WAV file
  const cmd = `ffmpeg -y -i "${audioUrl}" -vn -acodec pcm_s16le -ar 44100 -ac 2 audio.wav`;
  await exec(cmd);

  console.log(`Audio file extracted successfully!`);

  const pythonProcess = spawn("python", ["testwhisper.py"]);
  pythonProcess.on("spawn", () => {
    console.log("Python process has been spawned");
  });
  // Listen for data from the Python process
  pythonProcess.stdout.on("data", (data) => {
    console.log(`Received data from Python: ${data}`);
  });

  // Listen for errors from the Python process
  pythonProcess.stderr.on("data", (data) => {
    console.error(`Error from Python: ${data}`);
  });

  // Listen for the Python process to exit
  pythonProcess.on("close", (code) => {
    console.log(`Python process exited with code ${code}`);
  });
});

app.listen(PORT, () => console.log("Port 5000 is ready!"));
