const EVENT_DATE = new Date("2026-05-28T19:00:00+05:30").getTime();

// 1. Ambient Background Particles System
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let confettiFlakes = [];
let isConfettiRunning = false;
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class GoldLeafParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height + canvas.height;
        this.size = Math.random() * 8 + 3;
        this.speedY = -(Math.random() * 0.8 + 0.3);
        this.speedX = Math.random() * 0.4 - 0.2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.wobble = Math.random() * 2;
        this.wobbleSpeed = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.wobble) * 0.25;
        this.wobble += this.wobbleSpeed;
        this.rotation += this.rotationSpeed;
        const dx = (mouseX - canvas.width / 2) * 0.005;
        this.x += dx * (this.size * 0.1);

        if (this.y < -20) {
            this.y = canvas.height + 20;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = this.opacity;

        const grad = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
        grad.addColorStop(0, '#D4AF37');
        grad.addColorStop(0.5, '#C5A880');
        grad.addColorStop(1, '#A57C1E');
        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, -this.size * 1.5);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size * 1.5);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(60, Math.floor(canvas.width / 20));
    for (let i = 0; i < count; i++) {
        const p = new GoldLeafParticle();
        p.y = Math.random() * canvas.height;
        particles.push(p);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    if (isConfettiRunning) {
        confettiFlakes = confettiFlakes.filter(f => f.opacity > 0);
        confettiFlakes.forEach(f => {
            f.update();
            f.draw();
        });
    }

    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

initParticles();
animate();

// 2. Gymnopédie No.1 Piano Synthesizer
let audioContext = null;
let isAudioPlaying = false;
let synthNodes = [];
let soundInterval = null;

const musicBtn = document.getElementById("music-toggle-btn");
const audioTooltip = document.getElementById("audio-tooltip");

musicBtn.addEventListener("click", () => {
    toggleMusic();
});

function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
}

function playPianoNote(note, duration, startTime, volume = 0.12) {
    if (!audioContext) return;

    const oscMain = audioContext.createOscillator();
    const oscOver = audioContext.createOscillator();
    const filter = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();

    oscMain.type = 'sine';
    oscOver.type = 'triangle';

    oscMain.frequency.setValueAtTime(note, startTime);
    oscOver.frequency.setValueAtTime(note * 2.002, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, startTime);
    filter.frequency.exponentialRampToValueAtTime(300, startTime + duration);

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.4, startTime + 0.35);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscMain.connect(filter);
    oscOver.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscMain.start(startTime);
    oscOver.start(startTime);

    oscMain.stop(startTime + duration);
    oscOver.stop(startTime + duration);

    synthNodes.push({ osc1: oscMain, osc2: oscOver, gainNode: gainNode });
}

let measureIndex = 0;
const BEAT_DURATION = 0.95;

function playMeasure() {
    if (!isAudioPlaying) return;
    const now = audioContext.currentTime;

    const isEven = measureIndex % 2 === 0;
    const bassFreq = isEven ? 98.00 : 73.42;
    const chordFreqs = isEven ? [246.94, 293.66, 369.99] : [220.00, 277.18, 369.99];

    playPianoNote(bassFreq, BEAT_DURATION * 2.8, now, 0.075);

    chordFreqs.forEach(freq => {
        playPianoNote(freq, BEAT_DURATION * 1.8, now + BEAT_DURATION, 0.035);
    });

    switch (measureIndex) {
        case 2:
            playPianoNote(369.99, BEAT_DURATION * 1.8, now, 0.12);
            playPianoNote(392.00, BEAT_DURATION * 0.8, now + BEAT_DURATION * 2, 0.12);
            break;
        case 3:
            playPianoNote(440.00, BEAT_DURATION * 1.8, now, 0.12);
            playPianoNote(493.88, BEAT_DURATION * 0.8, now + BEAT_DURATION * 2, 0.12);
            break;
        case 4:
            playPianoNote(554.37, BEAT_DURATION * 0.8, now, 0.12);
            playPianoNote(493.88, BEAT_DURATION * 0.8, now + BEAT_DURATION, 0.12);
            playPianoNote(440.00, BEAT_DURATION * 0.8, now + BEAT_DURATION * 2, 0.12);
            break;
        case 5:
            playPianoNote(369.99, BEAT_DURATION * 2.8, now, 0.12);
            break;
        case 7:
            playPianoNote(392.00, BEAT_DURATION * 1.8, now, 0.12);
            playPianoNote(369.99, BEAT_DURATION * 0.8, now + BEAT_DURATION * 2, 0.12);
            break;
        case 8:
            playPianoNote(329.63, BEAT_DURATION * 1.8, now, 0.12);
            playPianoNote(293.66, BEAT_DURATION * 0.8, now + BEAT_DURATION * 2, 0.12);
            break;
        case 9:
            playPianoNote(329.63, BEAT_DURATION * 0.8, now, 0.12);
            playPianoNote(369.99, BEAT_DURATION * 0.8, now + BEAT_DURATION, 0.12);
            playPianoNote(392.00, BEAT_DURATION * 0.8, now + BEAT_DURATION * 2, 0.12);
            break;
        case 10:
            playPianoNote(440.00, BEAT_DURATION * 1.8, now, 0.12);
            playPianoNote(369.99, BEAT_DURATION * 0.8, now + BEAT_DURATION * 2, 0.12);
            break;
        case 11:
            playPianoNote(293.66, BEAT_DURATION * 2.8, now, 0.12);
            break;
    }

    measureIndex = (measureIndex + 1) % 12;
    soundInterval = setTimeout(playMeasure, BEAT_DURATION * 3000);
}

function toggleMusic() {
    if (!audioContext) {
        initAudio();
    }

    if (isAudioPlaying) {
        musicBtn.classList.remove("playing");
        audioTooltip.innerText = "Play Atmospheric Music";

        const now = audioContext ? audioContext.currentTime : 0;
        synthNodes.forEach(nodes => {
            try {
                nodes.gainNode.gain.cancelScheduledValues(now);
                nodes.gainNode.gain.linearRampToValueAtTime(0, now + 0.8);
                setTimeout(() => {
                    nodes.osc1.disconnect();
                    nodes.osc2.disconnect();
                }, 8000);
            } catch (e) { }
        });
        synthNodes = [];
        clearTimeout(soundInterval);
        isAudioPlaying = false;
    } else {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        isAudioPlaying = true;
        musicBtn.classList.add("playing");
        audioTooltip.innerText = "Mute Music";
        measureIndex = 0;
        playMeasure();
    }
}

// 3. Envelope Reveal & Interaction
const envelopeScreen = document.getElementById("envelope-screen");
const invitationContent = document.getElementById("invitation-content");

document.getElementById("seal-trigger").addEventListener("click", openEnvelope);
document.getElementById("envelope-clicker").addEventListener("click", openEnvelope);

function openEnvelope(e) {
    e.stopPropagation();
    envelopeScreen.classList.add("opening");

    setTimeout(() => {
        toggleMusic();
        triggerGoldConfettiBlast();
    }, 600);

    setTimeout(() => {
        envelopeScreen.classList.add("opened");
        invitationContent.classList.add("revealed");
        initParticles();
    }, 1000);
}

// 4. Live Countdown Timer Loop
function updateCountdown() {
    const now = new Date().getTime();
    const difference = EVENT_DATE - now;

    if (difference < 0) {
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";
        document.querySelector(".countdown-title").innerText = "Celebration has Commenced!";
        return;
    }

    const d = Math.floor(difference / (1000 * 60 * 60 * 24));
    const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((difference % (1000 * 60)) / 1000);

    document.getElementById("days").innerText = d < 10 ? "0" + d : d;
    document.getElementById("hours").innerText = h < 10 ? "0" + h : h;
    document.getElementById("minutes").innerText = m < 10 ? "0" + m : m;
    document.getElementById("seconds").innerText = s < 10 ? "0" + s : s;
}

setInterval(updateCountdown, 1000);
updateCountdown();

// 5. Canvas Glitter Explosion (Confetti)
class ConfettiGlitter {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 8 + 4;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 12 + 5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed - 6;
        this.gravity = 0.25;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 20 - 10;
        this.opacity = 1;
        this.fade = Math.random() * 0.015 + 0.01;

        const golds = ['#D4AF37', '#F3E5AB', '#FFDF00', '#C5A880', '#A57C1E'];
        this.color = golds[Math.floor(Math.random() * golds.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.fade;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5);
        ctx.restore();
    }
}

function triggerGoldConfettiBlast() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    confettiFlakes = [];
    for (let i = 0; i < 200; i++) {
        confettiFlakes.push(new ConfettiGlitter(centerX, centerY));
    }
    isConfettiRunning = true;
}
