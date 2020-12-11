const { Readable } = require('stream');
const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);
const ffmpeg = require('fluent-ffmpeg');
const Porcupine = require('@picovoice/porcupine-node');
const { HEY_GOOGLE, OK_GOOGLE } = require("@picovoice/porcupine-node/builtin_keywords");

class Silence extends Readable {
  _read() {
    this.push(SILENCE_FRAME);
    this.destroy();
  }
}

class StreamConverter {
    inputFlags = ['-f s16le', '-ac 2', '-ar 48000'];
    outputFlags = [ '-ac 1', '-ar 16000']
    outputFormat = 's16le';


    static count = 0;

    detectHotwords(audioStream) {

      // Convert audioStream (48kHz, 2 channel) to 16kHz, 1 channel
      try {
        var transcodedStream = new ffmpeg().input(audioStream)
          .inputOptions(this.inputFlags)
          .outputOptions(this.outputFlags)
          .format(this.outputFormat).pipe();
      } catch (err) {
        console.error(err);
      }
      
      
      // Create the handle for keyword detector
      var handle = new Porcupine([HEY_GOOGLE, OK_GOOGLE], [1.0, 1.0]);
      var frameLength = handle.frameLength;
      var frameAccumulator = [];
      transcodedStream.on('data', (chunk) => {
        // No clue what this does lmao but i think it converts chunk into
        // appropriate lengthed buffer arrays for porcupine to process later
        let newFrames16 = new Array(chunk.length/2);
        for (let i=0; i <chunk.length; i += 2) {
          newFrames16[i/2] = chunk.readInt16LE(i);
        }

        frameAccumulator = frameAccumulator.concat(newFrames16);
        let frames = this.chunkArray(frameAccumulator, frameLength);
        if (frames[frames.length - 1].length !== frameLength) {
          // store remainder from divisions of frameLength
          frameAccumulator = frames.pop();
        } else {
          frameAccumulator = [];
        }
        
        // Process each frame of the audio data
        for (let frame of frames) {
          let index = handle.process(frame);
          if (index !== -1) {
            StreamConverter.count++;
            console.log(`Detected keyword ${StreamConverter.count}`);
          }
        }
      });
    }
  

    chunkArray(array, size) {
      return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
        array.slice(index * size, index * size + size)
      );
    }
}


module.exports = { Silence, StreamConverter };