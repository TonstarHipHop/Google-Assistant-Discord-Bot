const { Readable } = require('stream');
const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);
const ffmpeg = require('fluent-ffmpeg');
const Porcupine = require('@picovoice/porcupine-node');
const { BUMBLEBEE } = require("@picovoice/porcupine-node/builtin_keywords");

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
    handle = new Porcupine([BUMBLEBEE], [0.8]);
    frameLength = this.handle.frameLength;
    static count = 0;
    detectHotwords(audioStream) {
      const transcodedStream = new ffmpeg().input(audioStream)
        .inputOptions(this.inputFlags)
        .outputOptions(this.outputFlags)
        .format(this.outputFormat).pipe();

      var frameAccumulator = [];
      transcodedStream.on('data', (chunk) => {
        let newFrames16 = new Array(chunk.length/2);
        for (let i=0; i <chunk.length; i += 2) {
          newFrames16[i/2] = chunk.readInt16LE(i);
        }

        frameAccumulator = frameAccumulator.concat(newFrames16);
        let frames = this.chunkArray(frameAccumulator, this.frameLength);
        if (frames[frames.length - 1].length !== this.frameLength) {
          // store remainder from divisions of frameLength
          frameAccumulator = frames.pop();
        } else {
          frameAccumulator = [];
        }
        
        for (let frame of frames) {
          let index = this.handle.process(frame);
          if (index !== -1) {
            console.log(`Detected keyword ${StreamConverter.count}`);
            StreamConverter.count++;
          }
        }
      });
      // audioStream.on('end', () => {
      //   this.releaseHandle();
      // })
    }
    
    releaseHandle() {
      this.handle.release();
    }

    chunkArray(array, size) {
      return Array.from({ length: Math.ceil(array.length / size) }, (v, index) =>
        array.slice(index * size, index * size + size)
      );
    }
}


module.exports = { Silence, StreamConverter };