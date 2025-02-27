const fs = require('fs')
const path = require('path')
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { Buffer } = require('buffer');

const oggAudioPath = path.join(__dirname, '/data/output.ogg')
const wavAudioPath = path.join(__dirname, '/data/output.wav')
const outputPath = oggAudioPath
ffmpeg.setFfmpegPath(ffmpegPath);


const subscriptionKey = '5hZmblhQ5FHQAACdwngHCavKAPJLHWWYBpdp1St44ex9eYYorDrPJQQJ99BBAC5RqLJXJ3w3AAAYACOGTiwv';
const serviceRegion = 'westeurope';

const { base64String } = require('./data/audioExample.json')

const reset = async () => {
    await fs.promises.rm(oggAudioPath)
    await fs.promises.rm(wavAudioPath)
    console.log('Audio files deleted');
    
}

const base64ToAudioFile = async (base64String, outputPath) => {
    try {
        const binaryString = atob(base64String);

        // Create Uint8Array
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }

        // Create Buffer from Uint8Array
        const buffer = Buffer.from(uint8Array);

        await fs.promises.writeFile(outputPath, buffer);
        await parseAudioFromFile()
        console.log(`Audio file created: ${outputPath}`);
        await reset()
    } catch (error) {
        console.error('Error converting base64 to audio:', error);
    }
}

const convertOggToWav = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .output(outputPath)
            .audioCodec('pcm_s16le') // Ensure PCM 16-bit little-endian
            .audioChannels(1) // Mono channel. Adjust as needed.
            .audioFrequency(16000) // 16kHz sample rate. Adjust as needed.
            .on('end', () => {
                console.log('Conversion finished!');
                resolve();
            })
            .on('error', (err) => {
                console.error('Conversion error:', err);
                reject(err);
            })
            .run();
    });
};

const parseAudioFromFile = async () => {
    await convertOggToWav(oggAudioPath, wavAudioPath);

    let audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(wavAudioPath));
    
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);

    // Set the recognition language to English
    speechConfig.speechRecognitionLanguage = 'es-ES';

    // Create the speech recognizer
    let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

    // Start the recognizer and wait for a result
    recognizer.recognizeOnceAsync(
        (result) => {
            switch (result.reason) {
                case sdk.ResultReason.RecognizedSpeech:
                    console.log(`RECOGNIZED: Text=${result.text}`);
                    break;
                case sdk.ResultReason.NoMatch:
                    console.log("NOMATCH: Speech could not be recognized.");
                    break;
                case sdk.ResultReason.Canceled:
                    const cancellation = sdk.CancellationDetails.fromResult(result);
                    console.log(`CANCELED: Reason=${cancellation.reason}`);
    
                    if (cancellation.reason == sdk.CancellationReason.Error) {
                        console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                        console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                        console.log("CANCELED: Did you set the speech resource key and region values?");
                    }
                    break;
            }
            recognizer.close();
            recognizer = undefined;
        },
        (err) => {
            console.trace(`RECOGNITION FAILED: ${err}`);
            recognizer.close();
            recognizer = undefined;
        }
    );
}

base64ToAudioFile(base64String, outputPath)







