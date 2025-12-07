import fs from "fs";
import path from "path";
import sdk from "microsoft-cognitiveservices-speech-sdk";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { Buffer } from "buffer";
import { config } from "../config";

const oggAudioPath = path.join(process.cwd(), "/data/output.ogg");
const wavAudioPath = path.join(process.cwd(), "/data/output.wav");
const outputPath = oggAudioPath;

const { subscriptionKey, serviceRegion } = config;
ffmpeg.setFfmpegPath(ffmpegPath as string);

/**
 * Parses audio from a base64 string and returns recognized text.
 */
export const parseAudio = async (
  mimetype: string,
  dataBase64: string
): Promise<string | null> => {
  console.log("Parsing Audio ", mimetype);
  try {
    const audioText = await base64ToAudioFile(dataBase64, outputPath);
    return audioText;
  } catch (error) {
    console.error("Error parsing audio: ", error);
    return null;
  }
};

const reset = async (): Promise<void> => {
  try {
    await fs.promises.rm(oggAudioPath, { force: true });
    await fs.promises.rm(wavAudioPath, { force: true });
    console.log("Audio files deleted");
  } catch (err) {
    // Ignore errors if files do not exist
  }
};

const base64ToAudioFile = async (
  base64String: string,
  outputPath: string
): Promise<string | null> => {
  try {
    // Node.js Buffer can decode base64 directly
    const buffer = Buffer.from(base64String, "base64");
    await fs.promises.writeFile(outputPath, buffer);
    const audioText = await parseAudioFromFile();
    console.log(`Audio file created: ${outputPath}`);
    await reset();
    return audioText;
  } catch (error) {
    console.error("Error converting base64 to audio:", error);
    return null;
  }
};

const convertOggToWav = async (
  inputPath: string,
  outputPath: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .audioCodec("pcm_s16le") // Ensure PCM 16-bit little-endian
      .audioChannels(1) // Mono channel. Adjust as needed.
      .audioFrequency(16000) // 16kHz sample rate. Adjust as needed.
      .on("end", () => {
        console.log("Conversion finished!");
        resolve();
      })
      .on("error", (err: Error) => {
        console.error("Conversion error:", err);
        reject(err);
      })
      .run();
  });
};

const parseAudioFromFile = async (): Promise<string> => {
  await convertOggToWav(oggAudioPath, wavAudioPath);

  const wavBuffer = await fs.promises.readFile(wavAudioPath);
  const audioConfig = sdk.AudioConfig.fromWavFileInput(wavBuffer);
  const speechConfig = sdk.SpeechConfig.fromSubscription(
    subscriptionKey,
    serviceRegion
  );
  // Set the recognition language to Spanish
  speechConfig.speechRecognitionLanguage = "es-ES";

  return new Promise((resolve, reject) => {
    let recognizer: sdk.SpeechRecognizer | undefined = new sdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );
    recognizer.recognizeOnceAsync(
      (result: any) => {
        switch (result.reason) {
          case sdk.ResultReason.RecognizedSpeech:
            console.log(`RECOGNIZED: Text=${result.text}`);
            resolve(result.text);
            break;
          case sdk.ResultReason.NoMatch:
            console.log("NOMATCH: Speech could not be recognized.");
            resolve("NOMATCH");
            break;
          case sdk.ResultReason.Canceled:
            const cancellation = sdk.CancellationDetails.fromResult(result);
            console.log(`CANCELED: Reason=${cancellation.reason}`);
            if (cancellation.reason == sdk.CancellationReason.Error) {
              console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
              console.log(
                `CANCELED: ErrorDetails=${cancellation.errorDetails}`
              );
              console.log(
                "CANCELED: Did you set the speech resource key and region values?"
              );
            }
            resolve(`CANCELED: ${cancellation.errorDetails}`);
            break;
        }
        if (recognizer) recognizer.close();
        recognizer = undefined;
      },
      (err: string) => {
        console.trace(`RECOGNITION FAILED: ${err}`);
        if (recognizer) recognizer.close();
        recognizer = undefined;
        reject(err);
      }
    );
  });
};
