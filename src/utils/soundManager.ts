'use client';

class SoundManager {
    private static instance: SoundManager;
    private audioCtx: AudioContext | null = null;
    private isMuted: boolean = false;
    private gainNode: GainNode | null = null;

    private constructor() {
        if (typeof window !== 'undefined') {
            const savedMute = localStorage.getItem('orbitquest_muted');
            this.isMuted = savedMute === 'true';
        }
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private analyser: AnalyserNode | null = null;
    public getAnalyser(): AnalyserNode | null { return this.analyser; }

    public async resumeAudioContext() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            await this.audioCtx.resume();
        }
    }

    private initAudio() {
        if (!this.audioCtx) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioCtx = new AudioContextClass();
                this.gainNode = this.audioCtx.createGain();
                this.analyser = this.audioCtx.createAnalyser();
                this.analyser.fftSize = 64; // Low resolution enough for simple visualizer

                this.gainNode.connect(this.analyser);
                this.analyser.connect(this.audioCtx.destination);

                this.updateMuteState();
            }
        }
    }

    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        if (typeof window !== 'undefined') {
            localStorage.setItem('orbitquest_muted', this.isMuted.toString());
        }
        this.updateMuteState();
        return this.isMuted;
    }

    public getMuted(): boolean {
        return this.isMuted;
    }

    private updateMuteState() {
        if (this.gainNode && this.audioCtx) {
            this.gainNode.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.audioCtx.currentTime);
        }
    }

    // Play a retro "ping" sound (high pitch)
    public playPing() {
        if (this.isMuted) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, this.audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    // Play a satisfying "collect" sound (chime)
    public playCollect() {
        if (this.isMuted) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const now = this.audioCtx.currentTime;
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio

        frequencies.forEach((freq, i) => {
            const osc = this.audioCtx!.createOscillator();
            const gain = this.audioCtx!.createGain();

            osc.connect(gain);
            gain.connect(this.gainNode!);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.05);

            gain.gain.setValueAtTime(0.3, now + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);

            osc.start(now + i * 0.05);
            osc.stop(now + i * 0.05 + 0.2);
        });
    }

    // Play a laser shoot sound (pew!)
    public playShoot() {
        if (this.isMuted) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
    }

    // Play an explosion sound (noise)
    public playExplosion() {
        if (this.isMuted) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const bufferSize = this.audioCtx.sampleRate * 0.5; // 0.5 seconds
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        const gain = this.audioCtx.createGain();

        // Lowpass filter for deep boomy sound
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.audioCtx.currentTime);
        filter.frequency.linearRampToValueAtTime(100, this.audioCtx.currentTime + 0.5);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.gainNode);

        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);

        noise.start();
    }

    // Play a thruster sound (continuous noise or loop) - simple version for now
    public playThrust() {
        if (this.isMuted) return;
        // Basic implementation for single pulse thrust
        this.playExplosion(); // Re-use explosion but quieter? No, dedicated:

        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.type = 'square';
        osc.frequency.setValueAtTime(110, this.audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(55, this.audioCtx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.1);
    }

    // Play a jump sound (slide up)
    public playJump() {
        if (this.isMuted) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(440, this.audioCtx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.15);
    }

    // Play a crash sound (dissonant)
    public playCrash() {
        if (this.isMuted) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.gainNode);

        osc1.type = 'sawtooth';
        osc2.type = 'square';

        osc1.frequency.setValueAtTime(110, this.audioCtx.currentTime);
        osc2.frequency.setValueAtTime(115, this.audioCtx.currentTime); // Dissonance

        osc1.frequency.exponentialRampToValueAtTime(55, this.audioCtx.currentTime + 0.3);
        osc2.frequency.exponentialRampToValueAtTime(57, this.audioCtx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.4, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.3);

        osc1.start();
        osc2.start();
        osc1.stop(this.audioCtx.currentTime + 0.3);
        osc2.stop(this.audioCtx.currentTime + 0.3);
    }

    // Play shield sound (protective hum)
    public playShield() {
        if (this.isMuted) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.gainNode);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, this.audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(880, this.audioCtx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, this.audioCtx.currentTime + 0.2);
        gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.4);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.4);
    }

    // Play level up (fanfare)
    public playLevelUp() {
        if (this.isMuted) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const now = this.audioCtx.currentTime;
        // Simple major triad fanfare
        const notes = [440, 554.37, 659.25, 880]; // A Major: A4, C#5, E5, A5

        notes.forEach((freq, i) => {
            const osc = this.audioCtx!.createOscillator();
            const gain = this.audioCtx!.createGain();

            osc.connect(gain);
            gain.connect(this.gainNode!);

            osc.type = 'square'; // Brighter sound
            osc.frequency.setValueAtTime(freq, now + i * 0.1);

            gain.gain.setValueAtTime(0.2, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.4);
        });
    }

    // Ambient Space Drone
    /**
     * Variable to store active ambient nodes for stopping them later.
     */
    private ambientNodes: AudioNode[] = [];

    public startAmbience() {
        if (this.isMuted || this.ambientNodes.length > 0) return;
        this.initAudio();
        if (!this.audioCtx || !this.gainNode) return;

        const now = this.audioCtx.currentTime;
        const masterGain = this.audioCtx.createGain();
        masterGain.connect(this.gainNode);
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.15, now + 2); // Fade in

        // Create a deep, ethereal drone
        // Frequencies: A1 (55), E2 (82.4), A2 (110), C#3 (138.6 - major 3rd for warmth), E3 (164.8)
        const freqs = [55, 82.41, 110, 138.59, 164.81];

        freqs.forEach((f, i) => {
            if (!this.audioCtx) return;

            const osc = this.audioCtx.createOscillator();
            const oscGain = this.audioCtx.createGain();
            const lfo = this.audioCtx.createOscillator();
            const lfoGain = this.audioCtx.createGain();

            // LFO for ultra-slow breathing (calming effect)
            // Period between 10s and 20s
            lfo.frequency.value = 0.05 + Math.random() * 0.05;
            lfo.connect(lfoGain);

            // Modulation depth
            lfoGain.gain.value = 0.15;
            lfoGain.connect(oscGain.gain);

            osc.type = i % 2 === 0 ? 'sine' : 'triangle'; // Mix sine and triangle for richness
            osc.frequency.value = f;
            osc.connect(oscGain);
            oscGain.connect(masterGain);

            // Lower volume for higher frequencies to keep it warm, not piercing
            // Base volume + random variation
            const baseVol = 0.15 / (i + 1);
            oscGain.gain.value = baseVol;

            osc.start();
            lfo.start();

            this.ambientNodes.push(osc, oscGain, lfo, lfoGain);
        });

        // Add a "sparkle" or "wind" noise layer using a filter
        const bufferSize = this.audioCtx.sampleRate * 2;
        const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.audioCtx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const noiseFilter = this.audioCtx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 800;
        noiseFilter.Q.value = 1;

        // Auto-sweep the filter
        const filterLfo = this.audioCtx.createOscillator();
        filterLfo.type = 'sine';
        filterLfo.frequency.value = 0.1;
        const filterLfoGain = this.audioCtx.createGain();
        filterLfoGain.gain.value = 400;

        filterLfo.connect(filterLfoGain);
        filterLfoGain.connect(noiseFilter.frequency);

        const noiseGain = this.audioCtx.createGain();
        noiseGain.gain.value = 0.03;

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        noise.start();
        filterLfo.start();

        this.ambientNodes.push(noise, noiseFilter, noiseGain, filterLfo, filterLfoGain, masterGain);
    }

    public stopAmbience() {
        if (this.ambientNodes.length === 0) return;

        // Check if master gain is the last element
        const masterGain = this.ambientNodes[this.ambientNodes.length - 1];
        if (masterGain instanceof GainNode && this.audioCtx) {
            // Fade out
            masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
            masterGain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + 1);
        }

        setTimeout(() => {
            this.ambientNodes.forEach(node => {
                if (node instanceof OscillatorNode || node instanceof AudioBufferSourceNode) {
                    try { node.stop(); } catch { }
                }
                node.disconnect();
            });
            this.ambientNodes = [];
        }, 1000);
    }
}

export const soundManager = SoundManager.getInstance();
