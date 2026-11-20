/**
 * ============================================================
 * MOTOR DE SONS AMBIENTES (WEB AUDIO API)
 * ============================================================
 * Gera sons ambientes relaxantes diretamente no navegador,
 * sem depender de links MP3 externos que podem expirar.
 * Você pode misturar vários sons ao mesmo tempo!
 */

class AmbientSoundEngine {
  constructor() {
    this.ctx = null;
    this.channels = {};
    this.crackleTimer = null;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  createNoiseBuffer(type = "white", seconds = 3) {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === "white") {
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
        b6 = white * 0.115926;
      }
    } else if (type === "brown") {
      let lastOut = 0.0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 2.8;
      }
    }
    return buffer;
  }

  startSound(id, volume = 0.5) {
    this.ensureContext();
    if (this.channels[id]) return;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.45), this.ctx.currentTime + 0.35);
    gain.connect(this.ctx.destination);

    const nodes = [];

    if (id === "rain") {
      // Chuva suave: ruído rosa com filtro passa-banda + leve modulação de vento
      const src = this.ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer("pink", 4);
      src.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1100;
      filter.Q.value = 0.55;

      const lowFilter = this.ctx.createBiquadFilter();
      lowFilter.type = "lowpass";
      lowFilter.frequency.value = 3400;

      src.connect(filter);
      filter.connect(lowFilter);
      lowFilter.connect(gain);
      src.start();
      nodes.push(src);
    } else if (id === "fireplace") {
      // Lareira: grave acolhedor + estalos sutis da madeira
      const src = this.ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer("brown", 4);
      src.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 380;

      src.connect(filter);
      filter.connect(gain);
      src.start();
      nodes.push(src);

      const crackleInterval = setInterval(() => {
        if (!this.channels.fireplace) return;
        if (Math.random() > 0.45) {
          this.triggerCrackle(gain);
        }
      }, 280);

      this.channels[id] = { gain, nodes, volume, interval: crackleInterval };
      return;
    } else if (id === "brown") {
      // Ruído Marrom (Foco Profundo)
      const src = this.ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer("brown", 5);
      src.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 520;

      src.connect(filter);
      filter.connect(gain);
      src.start();
      nodes.push(src);
    } else if (id === "lofi") {
      // Pad Lo-Fi / Biblioteca Calma (acorde quente + leve chiado de vinil)
      const freqs = [174.61, 220.0, 261.63, 329.63]; // Fmaj7 suave
      freqs.forEach((f) => {
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = f;

        const oscGain = this.ctx.createGain();
        oscGain.gain.value = 0.08;

        osc.connect(oscGain);
        oscGain.connect(gain);
        osc.start();
        nodes.push(osc);
      });

      const vinyl = this.ctx.createBufferSource();
      vinyl.buffer = this.createNoiseBuffer("pink", 3);
      vinyl.loop = true;

      const vFilter = this.ctx.createBiquadFilter();
      vFilter.type = "highpass";
      vFilter.frequency.value = 2400;

      const vGain = this.ctx.createGain();
      vGain.gain.value = 0.09;

      vinyl.connect(vFilter);
      vFilter.connect(vGain);
      vGain.connect(gain);
      vinyl.start();
      nodes.push(vinyl);
    }

    this.channels[id] = { gain, nodes, volume };
  }

  triggerCrackle(targetGain) {
    if (!this.ctx) return;
    const osc = this.ctx.createBufferSource();
    osc.buffer = this.createNoiseBuffer("white", 0.03);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1800 + Math.random() * 2600;
    filter.Q.value = 4;

    const popGain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    popGain.gain.setValueAtTime(0.001, now);
    popGain.gain.linearRampToValueAtTime(0.45 + Math.random() * 0.4, now + 0.004);
    popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

    osc.connect(filter);
    filter.connect(popGain);
    popGain.connect(targetGain);
    osc.start(now);
  }

  stopSound(id) {
    const ch = this.channels[id];
    if (!ch) return;
    if (ch.interval) clearInterval(ch.interval);

    const now = this.ctx.currentTime;
    try {
      ch.gain.gain.cancelScheduledValues(now);
      ch.gain.gain.setValueAtTime(ch.gain.gain.value, now);
      ch.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
    } catch (_) {}

    setTimeout(() => {
      ch.nodes.forEach((n) => {
        try { n.stop(); } catch (_) {}
      });
    }, 280);

    delete this.channels[id];
  }

  toggle(id, volume) {
    if (this.channels[id]) {
      this.stopSound(id);
      return false;
    } else {
      this.startSound(id, volume);
      return true;
    }
  }

  setVolume(id, volume) {
    const ch = this.channels[id];
    if (!ch || !this.ctx) return;
    ch.volume = volume;
    ch.gain.gain.setTargetAtTime(Math.max(0.001, volume * 0.45), this.ctx.currentTime, 0.05);
  }

  stopAll() {
    Object.keys(this.channels).forEach((id) => this.stopSound(id));
  }

  // Sino suave ao encerrar um ciclo do Pomodoro
  playBell() {
    this.ensureContext();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 - E5 - G5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;

      const t = now + idx * 0.16;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.9);
    });
  }
}

window.soundEngine = new AmbientSoundEngine();
