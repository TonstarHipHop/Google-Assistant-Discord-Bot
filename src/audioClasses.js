const { Readable } = require('stream');
const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

class Silence extends Readable {
  _read() {
    this.push(SILENCE_FRAME);
    this.destroy();
  }
}

class StreamConverter {
    static inputFlags = ['-f s16le', '-ac 2', '-ar 48000'];
    static outputFlags = [ '-ac 1', '-ar 16000']
    static outputFormat = 'f32le';
}


module.exports = { Silence, StreamConverter };