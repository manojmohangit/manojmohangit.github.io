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

if (musicBtn) {
    musicBtn.addEventListener("click", () => {
        toggleMusic();
    });
}

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

let chordIndex = 0;
const BEAT_DURATION = 0.22; // Quick, joyful tempo

const CHORDS = [
    // C Major
    { bass: 130.81, notes: [261.63, 329.63, 392.00, 523.25] },
    // F Major
    { bass: 174.61, notes: [349.23, 440.00, 523.25, 698.46] },
    // G Major
    { bass: 196.00, notes: [392.00, 493.88, 587.33, 783.99] },
    // C Major (high resolution)
    { bass: 130.81, notes: [523.25, 659.25, 783.99, 1046.50] }
];

function playMeasure() {
    if (!isAudioPlaying) return;
    const now = audioContext.currentTime;
    const currentChord = CHORDS[chordIndex];

    // Bass note
    playPianoNote(currentChord.bass, BEAT_DURATION * 6, now, 0.08);

    // Arpeggio notes (ascending/descending)
    playPianoNote(currentChord.notes[0], BEAT_DURATION * 1.5, now + 0 * BEAT_DURATION, 0.05);
    playPianoNote(currentChord.notes[1], BEAT_DURATION * 1.5, now + 1 * BEAT_DURATION, 0.05);
    playPianoNote(currentChord.notes[2], BEAT_DURATION * 1.5, now + 2 * BEAT_DURATION, 0.05);
    playPianoNote(currentChord.notes[3], BEAT_DURATION * 1.5, now + 3 * BEAT_DURATION, 0.05);
    playPianoNote(currentChord.notes[2], BEAT_DURATION * 1.5, now + 4 * BEAT_DURATION, 0.05);
    playPianoNote(currentChord.notes[1], BEAT_DURATION * 1.5, now + 5 * BEAT_DURATION, 0.05);

    chordIndex = (chordIndex + 1) % CHORDS.length;
    soundInterval = setTimeout(playMeasure, BEAT_DURATION * 6 * 1000);
}

function toggleMusic() {
    if (!audioContext) {
        initAudio();
    }

    if (isAudioPlaying) {
        if (musicBtn) {
            musicBtn.classList.remove("playing");
            audioTooltip.innerText = "Play Celebration Music";
        }

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
        if (musicBtn) {
            musicBtn.classList.add("playing");
            audioTooltip.innerText = "Mute Music";
        }
        chordIndex = 0;
        playMeasure();
    }
}

// 3. Envelope Reveal & Interaction
const envelopeScreen = document.getElementById("envelope-screen");
const invitationContent = document.getElementById("invitation-content");

if (envelopeScreen) {
    document.getElementById("seal-trigger").addEventListener("click", openEnvelope);
    document.getElementById("envelope-clicker").addEventListener("click", openEnvelope);
}

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

// 4. Canvas Glitter Explosion (Confetti)
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

// 5. Lightbox for Photo Gallery
const lightbox = document.getElementById("gallery-lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxClose = document.getElementById("lightbox-close");
const galleryCards = document.querySelectorAll(".gallery-card");

galleryCards.forEach(card => {
    card.addEventListener("click", () => {
        const img = card.querySelector("img");
        const caption = card.querySelector(".gallery-card-title").innerText;
        lightboxImg.src = img.src;
        lightboxCaption.innerText = caption;
        lightbox.classList.add("active");
    });
});

if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
        lightbox.classList.remove("active");
    });
}

if (lightbox) {
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove("active");
        }
    });
}
