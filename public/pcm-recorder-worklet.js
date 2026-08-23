class PcmRecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) {
      return true;
    }

    const channel = input[0];
    let sum = 0;
    for (let i = 0; i < channel.length; i++) {
      sum += channel[i] * channel[i];
    }
    const rms = Math.sqrt(sum / channel.length);
    if (rms >= 0.012) {
      this.port.postMessage(channel);
    }
    return true;
  }
}

registerProcessor('pcm-recorder', PcmRecorderProcessor);
