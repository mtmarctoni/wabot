const fs = require('fs');
const path = require('path');
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const { Buffer } = require('buffer');

const {config} = require('./config.js');
const oggAudioPath = path.join(__dirname, '/data/output.ogg')
const wavAudioPath = path.join(__dirname, '/data/output.wav')
const outputPath = oggAudioPath

const {subscriptionKey, serviceRegion} = config;
ffmpeg.setFfmpegPath(ffmpegPath);

const parseAudio = async (mimetype, dataBase64) => {
    console.log('Parsing Audio ', mimetype);
    try {
        const audioText = await base64ToAudioFile(dataBase64, outputPath)
        return audioText;
    } catch (error) {
        console.error('Error parsing audio: ', error);
        return  null;
    }
}

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
        const audioText = await parseAudioFromFile();
        console.log(`Audio file created: ${outputPath}`);
        await reset();
        return audioText;
    } catch (error) {
        console.error('Error converting base64 to audio:', error);
        return null;
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

    return new Promise(
        (resolve, reject) => {
            // Create the speech recognizer
            let recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);

            // Start the recognizer and wait for a result
            recognizer.recognizeOnceAsync(
                (result) => {
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
                                console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                                console.log("CANCELED: Did you set the speech resource key and region values?");
                            }
                            resolve(`CANCELED: ${cancellation.errorDetails}`)
                            break;
                    }
                    recognizer.close();
                    recognizer = undefined;
                },
                (err) => {
                    console.trace(`RECOGNITION FAILED: ${err}`);
                    recognizer.close();
                    recognizer = undefined;
                    reject(err)
                }
            );

        })
}

module.exports = { 
    parseAudio
 };

