// Saturn Game Logic - "Ring Runner"
// ENDLESS horizontal platformer jumping across Saturn's rings
// Unique mechanic: Low gravity floaty jumps, ring gaps, debris
import { soundManager } from '@/utils/soundManager';

interface RingSegment {
    x: number;
    y: number;
    width: number;
    type: 'normal' | 'ice' | 'crumbling';
    crumbleTimer?: number;
}

interface Collectible {
    x: number;
    y: number;
    collected: boolean;
    value: number;
    type: 'normal' | 'bonus' | 'mega';
}

interface Hazard {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'debris' | 'moonlet';
    rotation: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

export class SaturnGameLogic {
    width: number;
    height: number;

    // Player
    playerX: number;
    playerY: number;
    playerVy = 0;
    playerWidth = 30;
    playerHeight = 40;
    isJumping = false;
    isOnGround = false;
    jumpHeld = false;

    // Physics - LOW GRAVITY for Saturn feel
    gravity = 0.25; // Much lower than Earth
    jumpForce = -9;
    maxFallSpeed = 8;

    // Game state
    scrollSpeed = 4;
    baseScrollSpeed = 4;
    score = 0;
    stardustCollected = 0;
    level = 1;
    distance = 0;
    isGameOver = false;
    isPaused = false;

    // Trivia
    showTrivia = false;
    currentTrivia: TriviaQuestion | null = null;
    triviaAnswered = false;
    triviaCorrect = false;
    triviaIndex = 0;
    nextTriviaDistance = 2000;

    // Entities
    ringSegments: RingSegment[] = [];
    collectibles: Collectible[] = [];
    hazards: Hazard[] = [];
    particles: Particle[] = [];

    // Visual
    frameCount = 0;
    saturnX = -200;
    ringLayers: { y: number; speed: number; opacity: number }[] = [];

    // Combo
    combo = 1;
    maxCombo = 1;
    lastCollectTime = 0;

    // Session cap
    readonly STARDUST_CAP = 60;

    // Trivia questions
    triviaQuestions: TriviaQuestion[] = [
        {
            question: "How many rings does Saturn have?",
            answers: ["3 main rings", "7 main rings", "100+ ringlets", "No rings"],
            correct: 1,
            fact: "Saturn has 7 main rings (A through G) made up of billions of particles. When you count all the ringlets, there are hundreds!"
        },
        {
            question: "What are Saturn's rings made of?",
            answers: ["Gas clouds", "Solid rock", "Ice and rock", "Pure metal"],
            correct: 2,
            fact: "Saturn's rings are made of billions of particles of ice and rock, ranging from tiny grains to house-sized chunks!"
        },
        {
            question: "Could Saturn float on water?",
            answers: ["Yes, it would", "No, too heavy", "It would sink halfway", "Water would evaporate"],
            correct: 0,
            fact: "Saturn is the only planet less dense than water! If you had a bathtub big enough, Saturn would float (but it would leave a giant ring)."
        },
        {
            question: "How long is a day on Saturn?",
            answers: ["24 hours", "10.7 hours", "48 hours", "7 days"],
            correct: 1,
            fact: "Saturn spins incredibly fast! A day on Saturn is only 10.7 hours, the second shortest in our solar system."
        },
        {
            question: "What is special about Saturn's north pole?",
            answers: ["It has rings", "Hexagonal storm", "It's frozen solid", "No storms there"],
            correct: 1,
            fact: "Saturn has a bizarre hexagonal storm at its north pole that's been raging for decades. Each side is larger than Earth!"
        },
        {
            question: "How many moons does Saturn have?",
            answers: ["12", "27", "62+", "146+"],
            correct: 3,
            fact: "Saturn has at least 146 known moons! The largest, Titan, is bigger than Mercury and has its own thick atmosphere."
        },
        {
            question: "What is Saturn mostly made of?",
            answers: ["Rock and metal", "Hydrogen and helium", "Water and ice", "Carbon dioxide"],
            correct: 1,
            fact: "Like Jupiter, Saturn is mostly hydrogen and helium gas. If you tried to land on it, you'd just sink into thicker and thicker gas!"
        }
    ];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.playerX = 150;
        this.playerY = height / 2;

        // Initialize ring layers for parallax background
        for (let i = 0; i < 5; i++) {
            this.ringLayers.push({
                y: 100 + i * 120,
                speed: 0.5 + i * 0.3,
                opacity: 0.1 + i * 0.05
            });
        }

        this.generateInitialPlatforms();
    }

    generateInitialPlatforms() {
        // Create starting platform
        this.ringSegments.push({
            x: 0,
            y: this.height / 2 + 50,
            width: 300,
            type: 'normal'
        });

        // Generate more platforms ahead
        let lastX = 300;
        for (let i = 0; i < 10; i++) {
            const gap = 80 + Math.random() * 60;
            const width = 100 + Math.random() * 150;
            const yVariation = (Math.random() - 0.5) * 100;

            this.ringSegments.push({
                x: lastX + gap,
                y: Math.max(200, Math.min(this.height - 150, this.height / 2 + 50 + yVariation)),
                width,
                type: Math.random() > 0.8 ? 'ice' : 'normal'
            });

            lastX = lastX + gap + width;
        }
    }

    reset() {
        this.playerX = 150;
        this.playerY = this.height / 2;
        this.playerVy = 0;
        this.isJumping = false;
        this.isOnGround = false;
        this.scrollSpeed = this.baseScrollSpeed;
        this.score = 0;
        this.stardustCollected = 0;
        this.level = 1;
        this.distance = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.ringSegments = [];
        this.collectibles = [];
        this.hazards = [];
        this.particles = [];
        this.frameCount = 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaIndex = 0;
        this.nextTriviaDistance = 2000;
        this.generateInitialPlatforms();
    }

    jump() {
        if (this.isOnGround && !this.showTrivia) {
            this.playerVy = this.jumpForce;
            this.isJumping = true;
            this.isOnGround = false;
            this.jumpHeld = true;

            // Jump particles
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: this.playerX,
                    y: this.playerY + this.playerHeight / 2,
                    vx: (Math.random() - 0.5) * 3,
                    vy: Math.random() * 2,
                    life: 1,
                    color: '#fbbf24',
                    size: 4
                });
            }
            soundManager.playJump();
        }
    }

    releaseJump() {
        this.jumpHeld = false;
        // Cut jump short if released early
        if (this.playerVy < -3) {
            this.playerVy = -3;
        }
    }

    answerTrivia(answerIndex: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;
        this.triviaCorrect = answerIndex === this.currentTrivia.correct;

        if (this.triviaCorrect) {
            // Session cap applied
            if (this.stardustCollected < this.STARDUST_CAP) {
                this.stardustCollected = Math.min(this.STARDUST_CAP, this.stardustCollected + 8);
            }
            this.score += 300;
            this.combo = Math.min(3, this.combo + 1); // Capped at x3
            soundManager.playLevelUp(); // Rewards sound
        } else {
            this.combo = 1;
        }
        this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));

        setTimeout(() => {
            this.showTrivia = false;
            this.isPaused = false;
            this.triviaAnswered = false;
            this.currentTrivia = null;
            this.nextTriviaDistance = this.distance + 3000;
        }, 2500);
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        this.frameCount++;
        this.distance += this.scrollSpeed;

        // Level progression
        if (this.distance > this.level * 3000) {
            this.level++;
            this.scrollSpeed = Math.min(10, this.baseScrollSpeed + this.level * 0.4);
        }

        // Trigger trivia
        if (this.distance >= this.nextTriviaDistance) {
            this.isPaused = true;
            this.showTrivia = true;
            this.triviaAnswered = false;
            this.triviaCorrect = false;
            this.currentTrivia = this.triviaQuestions[this.triviaIndex % this.triviaQuestions.length];
            this.triviaIndex++;
            return;
        }

        // Apply gravity (low gravity!)
        this.playerVy += this.gravity;

        // Variable jump height
        if (this.jumpHeld && this.playerVy < 0) {
            this.playerVy += this.gravity * 0.3; // Slower fall while holding
        }

        this.playerVy = Math.min(this.maxFallSpeed, this.playerVy);
        this.playerY += this.playerVy;

        // Move platforms left (auto-scroll)
        this.isOnGround = false;
        for (const segment of this.ringSegments) {
            segment.x -= this.scrollSpeed;

            // Collision detection
            if (this.playerVy >= 0 &&
                this.playerX + this.playerWidth / 2 > segment.x &&
                this.playerX - this.playerWidth / 2 < segment.x + segment.width &&
                this.playerY + this.playerHeight / 2 >= segment.y &&
                this.playerY + this.playerHeight / 2 <= segment.y + 20) {

                this.playerY = segment.y - this.playerHeight / 2;
                this.playerVy = 0;
                this.isOnGround = true;
                this.isJumping = false;

                // Ice platform = slippery
                if (segment.type === 'ice') {
                    // Could add slide effect here
                }

                // Crumbling platform
                if (segment.type === 'crumbling') {
                    segment.crumbleTimer = (segment.crumbleTimer || 0) + 1;
                    if (segment.crumbleTimer > 30) {
                        segment.y += 15; // Falls away
                    }
                }
            }
        }

        // Remove off-screen platforms and generate new ones
        this.ringSegments = this.ringSegments.filter(s => s.x + s.width > -50);

        const lastSegment = this.ringSegments[this.ringSegments.length - 1];
        if (lastSegment && lastSegment.x + lastSegment.width < this.width + 500) {
            const gap = 70 + Math.random() * (50 + this.level * 5);
            const width = Math.max(60, 150 - this.level * 5 + Math.random() * 100);
            const yVariation = (Math.random() - 0.5) * (80 + this.level * 10);

            let type: 'normal' | 'ice' | 'crumbling' = 'normal';
            const roll = Math.random();
            if (roll > 0.85 && this.level > 2) {
                type = 'crumbling';
            } else if (roll > 0.7) {
                type = 'ice';
            }

            this.ringSegments.push({
                x: lastSegment.x + lastSegment.width + gap,
                y: Math.max(150, Math.min(this.height - 100, lastSegment.y + yVariation)),
                width,
                type
            });

            // Spawn collectibles on platforms (BALANCED values)
            if (Math.random() > 0.4) {
                const roll = Math.random();
                let cType: 'normal' | 'bonus' | 'mega' = 'normal';
                let value = 2; // REDUCED from 5
                if (roll > 0.95) { cType = 'mega'; value = 8; } // REDUCED from 30
                else if (roll > 0.8) { cType = 'bonus'; value = 4; } // REDUCED from 12

                this.collectibles.push({
                    x: lastSegment.x + lastSegment.width + gap + width / 2,
                    y: Math.max(150, Math.min(this.height - 100, lastSegment.y + yVariation)) - 50,
                    collected: false,
                    value,
                    type: cType
                });
            }

            // Spawn hazards occasionally
            if (Math.random() > 0.85 && this.level > 1) {
                this.hazards.push({
                    x: lastSegment.x + lastSegment.width + gap / 2,
                    y: Math.random() * (this.height - 200) + 100,
                    width: 25,
                    height: 25,
                    type: Math.random() > 0.5 ? 'debris' : 'moonlet',
                    rotation: 0
                });
            }
        }

        // Move and check collectibles
        for (const c of this.collectibles) {
            c.x -= this.scrollSpeed;

            if (!c.collected) {
                const dx = this.playerX - c.x;
                const dy = this.playerY - c.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 35) {
                    c.collected = true;
                    // Apply session cap
                    const valueToAdd = Math.min(c.value, this.STARDUST_CAP - this.stardustCollected);
                    if (valueToAdd > 0) {
                        this.stardustCollected += valueToAdd;
                    }
                    this.score += c.value * 8 * Math.floor(this.combo);

                    // Combo (capped at x3)
                    if (Date.now() - this.lastCollectTime < 1500) {
                        this.combo = Math.min(3, this.combo + 0.2);
                    }
                    this.lastCollectTime = Date.now();
                    this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));

                    const color = c.type === 'mega' ? '#ff00ff' : c.type === 'bonus' ? '#00ffff' : '#ffd700';
                    this.createExplosion(c.x, c.y, color);
                    soundManager.playCollect();
                }
            }
        }
        this.collectibles = this.collectibles.filter(c => c.x > -50 && !c.collected);

        // Move and check hazards
        for (const h of this.hazards) {
            h.x -= this.scrollSpeed;
            h.rotation += 0.05;

            const dx = this.playerX - h.x;
            const dy = this.playerY - h.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 30) {
                this.gameOver();
                return;
            }
        }
        this.hazards = this.hazards.filter(h => h.x > -50);

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx - this.scrollSpeed * 0.3;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 0.025;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Fall death
        if (this.playerY > this.height + 50) {
            this.gameOver();
        }

        // Distance bonus (REDUCED: every 1000 instead of 500)
        if (Math.floor(this.distance / 1000) > Math.floor((this.distance - this.scrollSpeed) / 1000)) {
            this.score += 50 * this.level;
            // Respect session cap
            if (this.stardustCollected < this.STARDUST_CAP) {
                this.stardustCollected = Math.min(this.STARDUST_CAP, this.stardustCollected + 1);
            }
        }

        // Decay combo over time
        if (Date.now() - this.lastCollectTime > 3000) {
            this.combo = Math.max(1, this.combo - 0.005);
        }
    }

    createExplosion(x: number, y: number, color: string) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                life: 1,
                color,
                size: 5
            });
        }
    }

    gameOver() {
        this.isGameOver = true;
        soundManager.playCrash();
        // Small death bonus (capped)
        const deathBonus = Math.min(3, Math.floor(this.distance / 500));
        if (this.stardustCollected < this.STARDUST_CAP) {
            this.stardustCollected = Math.min(this.STARDUST_CAP, this.stardustCollected + deathBonus);
        }

        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                color: '#fbbf24',
                size: 6
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Background - Saturn's golden atmosphere
        const bgGradient = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGradient.addColorStop(0, '#1a0a05');
        bgGradient.addColorStop(0.3, '#2d1810');
        bgGradient.addColorStop(0.7, '#1a1005');
        bgGradient.addColorStop(1, '#0a0500');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 60; i++) {
            const x = (i * 137 + this.frameCount * 0.2) % this.width;
            const y = (i * 89) % this.height;
            ctx.beginPath();
            ctx.arc(x, y, 1 + (i % 2), 0, Math.PI * 2);
            ctx.fill();
        }

        // Parallax ring layers in background
        for (const layer of this.ringLayers) {
            ctx.strokeStyle = `rgba(210, 180, 140, ${layer.opacity})`;
            ctx.lineWidth = 40;
            ctx.beginPath();
            const offset = (this.frameCount * layer.speed) % 200;
            for (let x = -100 + offset; x < this.width + 100; x += 200) {
                ctx.moveTo(x, layer.y);
                ctx.lineTo(x + 100, layer.y);
            }
            ctx.stroke();
        }

        // Draw ring segments (platforms)
        for (const segment of this.ringSegments) {
            let color = '#d4a574';
            let borderColor = '#8b7355';

            if (segment.type === 'ice') {
                color = '#87ceeb';
                borderColor = '#4a90a4';
            } else if (segment.type === 'crumbling') {
                color = '#a08060';
                borderColor = '#705030';
                // Shake effect
                if (segment.crumbleTimer && segment.crumbleTimer > 0) {
                    ctx.save();
                    ctx.translate((Math.random() - 0.5) * 4, 0);
                }
            }

            // Platform shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(segment.x + 3, segment.y + 3, segment.width, 15);

            // Platform body
            const platGradient = ctx.createLinearGradient(segment.x, segment.y - 10, segment.x, segment.y + 15);
            platGradient.addColorStop(0, color);
            platGradient.addColorStop(1, borderColor);
            ctx.fillStyle = platGradient;
            ctx.fillRect(segment.x, segment.y, segment.width, 15);

            // Top highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(segment.x, segment.y, segment.width, 3);

            if (segment.type === 'crumbling' && segment.crumbleTimer) {
                ctx.restore();
            }
        }

        // Draw hazards
        for (const h of this.hazards) {
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.rotate(h.rotation);

            if (h.type === 'debris') {
                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.moveTo(-h.width / 2, 0);
                ctx.lineTo(0, -h.height / 2);
                ctx.lineTo(h.width / 2, 0);
                ctx.lineTo(0, h.height / 2);
                ctx.closePath();
                ctx.fill();
            } else {
                // Moonlet
                ctx.fillStyle = '#888';
                ctx.beginPath();
                ctx.arc(0, 0, h.width / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#666';
                ctx.beginPath();
                ctx.arc(-3, -3, 4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // Draw collectibles
        for (const c of this.collectibles) {
            if (!c.collected) {
                let color = '#ffd700';
                let glowColor = 'rgba(255, 215, 0, 0.5)';
                let size = 12;

                if (c.type === 'bonus') {
                    color = '#00ffff';
                    glowColor = 'rgba(0, 255, 255, 0.5)';
                    size = 14;
                } else if (c.type === 'mega') {
                    color = '#ff00ff';
                    glowColor = 'rgba(255, 0, 255, 0.5)';
                    size = 16;
                }

                const pulse = Math.sin(this.frameCount * 0.1 + c.x * 0.01) * 0.3 + 0.7;

                ctx.fillStyle = glowColor;
                ctx.beginPath();
                ctx.arc(c.x, c.y, size + 8, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10 * pulse;
                ctx.beginPath();
                ctx.arc(c.x, c.y, size * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        // Draw particles
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Draw player (astronaut/probe)
        if (!this.isGameOver) {
            ctx.save();
            ctx.translate(this.playerX, this.playerY);

            // Jetpack flame when jumping up
            if (this.playerVy < 0) {
                const flameGradient = ctx.createRadialGradient(0, this.playerHeight / 2 + 10, 0, 0, this.playerHeight / 2 + 10, 20);
                flameGradient.addColorStop(0, 'rgba(255, 200, 50, 0.9)');
                flameGradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.6)');
                flameGradient.addColorStop(1, 'rgba(255, 50, 0, 0)');
                ctx.fillStyle = flameGradient;
                ctx.fillRect(-10, this.playerHeight / 2, 20, 25);
            }

            // Body
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.playerWidth / 2, this.playerHeight / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Visor
            ctx.fillStyle = '#00bfff';
            ctx.beginPath();
            ctx.ellipse(0, -5, 10, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Visor reflection
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.ellipse(-3, -8, 4, 5, -0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // HUD
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 22px Rajdhani, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`LEVEL ${this.level}`, 20, 35);
        ctx.fillText(`DIST: ${Math.floor(this.distance / 10)}m`, 20, 60);

        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, 20, 85);

        if (Math.floor(this.combo) > 1) {
            ctx.fillStyle = '#ff00ff';
            ctx.fillText(`🔥 x${Math.floor(this.combo)} COMBO`, 20, 110);
        }

        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Rajdhani';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.width - 20, 35);

        // Jump indicator
        ctx.fillStyle = this.isOnGround ? 'rgba(0, 255, 100, 0.8)' : 'rgba(255, 100, 0, 0.5)';
        ctx.font = '14px Rajdhani';
        ctx.fillText(this.isOnGround ? '🟢 READY' : '🔴 AIRBORNE', this.width - 20, 60);

        // Trivia overlay
        if (this.showTrivia && this.currentTrivia) {
            ctx.fillStyle = 'rgba(20, 10, 5, 0.95)';
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 28px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🪐 SATURN TRIVIA', this.width / 2, 100);

            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Rajdhani, sans-serif';
            ctx.fillText(this.currentTrivia.question, this.width / 2, 160);

            if (!this.triviaAnswered) {
                ctx.fillStyle = '#ffd700';
                ctx.font = '18px Rajdhani';
                ctx.fillText('Answer correctly for +25⭐ bonus!', this.width / 2, 200);
            }
        }

        // Game Over
        if (this.isGameOver) {
            ctx.fillStyle = 'rgba(10, 5, 0, 0.92)';
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 48px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('LOST IN THE RINGS', this.width / 2, this.height / 2 - 80);

            ctx.fillStyle = '#ffffff';
            ctx.font = '26px Rajdhani, sans-serif';
            ctx.fillText(`Reached Level ${this.level} - Distance: ${Math.floor(this.distance / 10)}m`, this.width / 2, this.height / 2 - 25);

            ctx.fillStyle = '#fbbf24';
            ctx.font = 'bold 36px Rajdhani';
            ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.width / 2, this.height / 2 + 25);

            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 28px Rajdhani';
            ctx.fillText(`⭐ +${this.stardustCollected} STARDUST`, this.width / 2, this.height / 2 + 70);

            if (this.maxCombo > 1) {
                ctx.fillStyle = '#ff00ff';
                ctx.font = '20px Rajdhani';
                ctx.fillText(`Max Combo: x${this.maxCombo}`, this.width / 2, this.height / 2 + 110);
            }
        }
    }
}
