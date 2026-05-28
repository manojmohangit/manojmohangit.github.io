// 1. Ambient Background Particles System (reused and optimized from main site)
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
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
    const count = Math.min(45, Math.floor(canvas.width / 25));
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
    requestAnimationFrame(animate);
}

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

initParticles();
animate();

// 2. Dynamic Image Grid Generation (55 images)
const TOTAL_IMAGES = 55;
const photoGrid = document.getElementById("photo-grid");

// Helper to get formatted or general title for gallery cards
function getPhotoTitle(index) {
    const titles = [
        "Office Farewell", "With Colleagues", "Professional Journey", 
        "Milestones & Memories", "Warm Wishes & Smiles", "Distinguished Colleagues",
        "Legacy of Dedication", "New Beginnings", "Sharing Gratitude", 
        "Team Celebration", "Office Tribute", "Joyful Occasion"
    ];
    return titles[index % titles.length] + ` - Part ${Math.floor(index / titles.length) + 1}`;
}

// Generate the photo cards
for (let i = 1; i <= TOTAL_IMAGES; i++) {
    const indexStr = String(i).padStart(3, '0');
    const imagePath = `./assets/img/retirement-function/office/office-${indexStr}.jpeg`;
    const title = getPhotoTitle(i - 1);

    const card = document.createElement("div");
    card.className = "photo-card";
    card.dataset.index = i;

    // Use native lazy loading and fade-in on load
    card.innerHTML = `
        <img src="${imagePath}" alt="${title}" loading="lazy" />
        <div class="photo-card-overlay">
            <div class="photo-card-title">${title}</div>
        </div>
    `;

    photoGrid.appendChild(card);

    // Fade-in animation when image is loaded
    const imgElement = card.querySelector("img");
    if (imgElement.complete) {
        card.classList.add("loaded");
    } else {
        imgElement.addEventListener("load", () => {
            card.classList.add("loaded");
        });
    }
}

// 3. Lightbox Functionality
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxCounter = document.getElementById("lightbox-counter");
const btnClose = document.getElementById("btn-close");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");

let currentActiveIndex = 1;

function openLightbox(index) {
    currentActiveIndex = parseInt(index, 10);
    updateLightboxContent();
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden"; // Disable background scrolling
}

function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = ""; // Re-enable background scrolling
}

function updateLightboxContent() {
    const indexStr = String(currentActiveIndex).padStart(3, '0');
    const imagePath = `./assets/img/retirement-function/office/office-${indexStr}.jpeg`;
    const title = getPhotoTitle(currentActiveIndex - 1);

    lightboxImg.src = imagePath;
    lightboxCaption.innerText = title;
    lightboxCounter.innerText = `${currentActiveIndex} / ${TOTAL_IMAGES}`;
}

function navigatePrev() {
    currentActiveIndex = currentActiveIndex === 1 ? TOTAL_IMAGES : currentActiveIndex - 1;
    updateLightboxContent();
}

// Event Listeners for Grid Click
photoGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".photo-card");
    if (card) {
        openLightbox(card.dataset.index);
    }
});

function navigateNext() {
    currentActiveIndex = currentActiveIndex === TOTAL_IMAGES ? 1 : currentActiveIndex + 1;
    updateLightboxContent();
}

// Lightbox Buttons
if (btnClose) btnClose.addEventListener("click", closeLightbox);
if (btnPrev) btnPrev.addEventListener("click", navigatePrev);
if (btnNext) btnNext.addEventListener("click", navigateNext);

// Close on background click
if (lightbox) {
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-content-wrapper")) {
            closeLightbox();
        }
    });
}

// Keyboard Navigation
document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;

    if (e.key === "Escape") {
        closeLightbox();
    } else if (e.key === "ArrowLeft") {
        navigatePrev();
    } else if (e.key === "ArrowRight") {
        navigateNext();
    }
});
