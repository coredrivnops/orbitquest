// Mars Game Logic - "ROVER RUSH"
// A simple sample-catching game as the Perseverance rover!
import { soundManager } from '@/utils/soundManager';

export interface FallingObject {
    id: number;
    x: number;
    y: number;
    type: 'sample' | 'crystal' | 'ice' | 'meteor' | 'dust';
    speed: number;
    rotation: number;
    collected: boolean;
    value: number;
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    maxLife: number;
}

interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

const TRIVIA: TriviaQuestion[] = [
    { question: "What is the tallest mountain on Mars?", answers: ["Mons Olympus", "Olympus Mons", "Everest Mons", "Mars Peak"], correct: 1, fact: "Olympus Mons is 21.9 km tall - nearly 3 times the height of Mount Everest!" },
    { question: "Which rovers are currently on Mars?", answers: ["Spirit & Opportunity", "Curiosity only", "Curiosity & Perseverance", "All of the above"], correct: 2, fact: "Curiosity landed in 2012 and Perseverance in 2021. Spirit and Opportunity are no longer active." },
    { question: "What gives Mars its red color?", answers: ["Red sand", "Iron oxide (rust)", "Copper", "Red algae"], correct: 1, fact: "Mars is red because its surface is rich in iron oxide - basically, the planet is rusty!" },
    { question: "How many moons does Mars have?", answers: ["0", "1", "2", "4"], correct: 2, fact: "Mars has two small moons: Phobos and Deimos, named after the Greek gods of fear and terror!" },
    { question: "How long is a day on Mars?", answers: ["12 hours", "24.6 hours", "48 hours", "687 hours"], correct: 1, fact: "A Martian day (called a 'sol') is 24 hours and 37 minutes - almost like Earth!" },
    { question: "What is Perseverance looking for?", answers: ["Water", "Signs of ancient life", "Gold", "Aliens"], correct: 1, fact: "Perseverance is searching for signs of ancient microbial life and collecting samples for future return to Earth!" },
];

export class MarsGameLogic {
    width: number;
    height: number;

    // Rover
    roverX: number;
    roverY: number;
    roverWidth: number;
    roverHeight: number;
    roverSpeed: number;
    targetX: number;
    roverTilt: number;

    // Falling objects
    objects: FallingObject[];
    nextObjectId: number;
    spawnTimer: number;
    baseSpawnRate: number;

    // Game state
    score: number;
    stardustCollected: number;
    samplesCollected: number;
    lives: number;
    maxLives: number;
    isGameOver: boolean;
    gameTime: number;
    level: number;
    combo: number;
    comboTimer: number;

    // Effects
    particles: Particle[];
    screenShake: number;
    flashAlpha: number;

    // Dust storm
    dustStormActive: boolean;
    dustStormTimer: number;
    dustParticles: { x: number; y: number; size: number; speed: number }[];

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;
    lastTriviaSamples: number;

    // Visual
    backgroundOffset: number;
    stars: { x: number; y: number; size: number }[];
    mountains: { x: number; height: number; width: number }[];

    // Session
    sessionStardust: number;
    maxSessionStardust: number;

    // Input
    movingLeft: boolean;
    movingRight: boolean;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.roverWidth = 80;
        this.roverHeight = 50;
        this.roverSpeed = 8;
        this.maxLives = 3;
        this.maxSessionStardust = 100;
        this.baseSpawnRate = 60;

        // Initialize
        this.roverX = width / 2;
        this.roverY = height - 80;
        this.targetX = this.roverX;
        this.roverTilt = 0;

        this.objects = [];
        this.nextObjectId = 0;
        this.spawnTimer = 0;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.samplesCollected = 0;
        this.lives = this.maxLives;
        this.isGameOver = false;
        this.gameTime = 0;
        this.level = 1;
        this.combo = 1;
        this.comboTimer = 0;

        this.particles = [];
        this.screenShake = 0;
        this.flashAlpha = 0;

        this.dustStormActive = false;
        this.dustStormTimer = 0;
        this.dustParticles = [];

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaSamples = 0;

        this.backgroundOffset = 0;
        this.stars = [];
        this.mountains = [];

        this.movingLeft = false;
        this.movingRight = false;

        this.initializeBackground();
        this.reset();
    }

    initializeBackground() {
        // Stars
        for (let i = 0; i < 80; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.4),
                size: Math.random() * 2 + 0.5,
            });
        }

        // Mountains
        for (let i = 0; i < 8; i++) {
            this.mountains.push({
                x: i * 200 - 100,
                height: 80 + Math.random() * 120,
                width: 150 + Math.random() * 100,
            });
        }

        // Dust particles
        for (let i = 0; i < 50; i++) {
            this.dustParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 2 + Math.random() * 4,
                speed: 1 + Math.random() * 2,
            });
        }
    }

    reset() {
        this.roverX = this.width / 2;
        this.targetX = this.roverX;
        this.roverTilt = 0;

        this.objects = [];
        this.nextObjectId = 0;
        this.spawnTimer = 30;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.samplesCollected = 0;
        this.lives = this.maxLives;
        this.isGameOver = false;
        this.gameTime = 0;
        this.level = 1;
        this.combo = 1;
        this.comboTimer = 0;

        this.particles = [];
        this.screenShake = 0;
        this.flashAlpha = 0;

        this.dustStormActive = false;
        this.dustStormTimer = 0;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaSamples = 0;

        this.movingLeft = false;
        this.movingRight = false;
    }

    handleInput(direction: 'left' | 'right' | 'stop-left' | 'stop-right') {
        if (this.showTrivia || this.isGameOver) return;

        if (direction === 'left') {
            this.movingLeft = true;
        } else if (direction === 'right') {
            this.movingRight = true;
        } else if (direction === 'stop-left') {
            this.movingLeft = false;
        } else if (direction === 'stop-right') {
            this.movingRight = false;
        }
    }

    setTargetX(x: number) {
        if (this.showTrivia || this.isGameOver) return;
        this.targetX = Math.max(this.roverWidth / 2, Math.min(this.width - this.roverWidth / 2, x));
    }

    answerTrivia(index: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;

        if (index === this.currentTrivia.correct) {
            const bonus = 10;
            if (this.sessionStardust < this.maxSessionStardust) {
                const earned = Math.min(bonus, this.maxSessionStardust - this.sessionStardust);
                this.stardustCollected += earned;
                this.sessionStardust += earned;
            }
            this.score += 500;
            this.lives = Math.min(this.maxLives, this.lives + 1);
            this.createCelebration();
            soundManager.playLevelUp();
        }

        setTimeout(() => {
            this.showTrivia = false;
            this.currentTrivia = null;
            this.triviaAnswered = false;
        }, 2500);
    }

    createCelebration() {
        for (let i = 0; i < 25; i++) {
            const angle = (Math.PI * 2 * i) / 25;
            this.particles.push({
                x: this.roverX,
                y: this.roverY,
                vx: Math.cos(angle) * (3 + Math.random() * 3),
                vy: Math.sin(angle) * (3 + Math.random() * 3),
                size: 4 + Math.random() * 4,
                color: ['#ffd700', '#ff6b6b', '#ef4444'][Math.floor(Math.random() * 3)],
                life: 40,
                maxLife: 40,
            });
        }
    }

    spawnObject() {
        const x = 50 + Math.random() * (this.width - 100);
        const rand = Math.random();

        let type: 'sample' | 'crystal' | 'ice' | 'meteor' | 'dust';
        let value: number;
        let speed: number;

        if (rand < 0.4) {
            type = 'sample';
            value = 1;
            speed = 2 + this.level * 0.3;
        } else if (rand < 0.55) {
            type = 'crystal';
            value = 3;
            speed = 2.5 + this.level * 0.3;
        } else if (rand < 0.65) {
            type = 'ice';
            value = 2;
            speed = 2 + this.level * 0.2;
        } else if (rand < 0.85) {
            type = 'meteor';
            value = 0;
            speed = 3 + this.level * 0.4;
        } else {
            type = 'dust';
            value = 0;
            speed = 2 + this.level * 0.2;
        }

        this.objects.push({
            id: this.nextObjectId++,
            x,
            y: -30,
            type,
            speed,
            rotation: Math.random() * Math.PI * 2,
            collected: false,
            value,
        });
    }

    update() {
        if (this.showTrivia || this.isGameOver) return;

        this.gameTime++;
        this.backgroundOffset += 0.5;

        // Level up
        if (this.gameTime % 600 === 0) {
            this.level++;
        }

        // Effects decay
        if (this.screenShake > 0) this.screenShake *= 0.9;
        if (this.flashAlpha > 0) this.flashAlpha -= 0.05;
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.combo = 1;
        }

        // Move rover based on input
        if (this.movingLeft) {
            this.roverX -= this.roverSpeed;
            this.roverTilt = Math.max(-0.2, this.roverTilt - 0.05);
        } else if (this.movingRight) {
            this.roverX += this.roverSpeed;
            this.roverTilt = Math.min(0.2, this.roverTilt + 0.05);
        } else {
            this.roverTilt *= 0.9;
        }

        // Clamp rover position
        this.roverX = Math.max(this.roverWidth / 2, Math.min(this.width - this.roverWidth / 2, this.roverX));

        // Spawn objects
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            this.spawnObject();
            this.spawnTimer = Math.max(20, this.baseSpawnRate - this.level * 5);
        }

        // Dust storm
        if (!this.dustStormActive && Math.random() < 0.001) {
            this.dustStormActive = true;
            this.dustStormTimer = 300;
        }
        if (this.dustStormActive) {
            this.dustStormTimer--;
            if (this.dustStormTimer <= 0) {
                this.dustStormActive = false;
            }
        }

        // Update dust particles
        this.dustParticles.forEach(p => {
            p.x += this.dustStormActive ? p.speed * 3 : p.speed * 0.5;
            if (p.x > this.width + 20) p.x = -20;
        });

        // Update falling objects
        this.objects = this.objects.filter(obj => {
            obj.y += obj.speed;
            obj.rotation += 0.05;

            // Check collision with rover
            const dx = obj.x - this.roverX;
            const dy = obj.y - this.roverY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.roverWidth / 2 + 20 && !obj.collected) {
                obj.collected = true;

                if (obj.type === 'meteor' || obj.type === 'dust') {
                    // Hit by bad object!
                    this.lives--;
                    this.combo = 1;
                    this.screenShake = 15;
                    this.flashAlpha = 0.5;
                    this.screenShake = 15;
                    this.flashAlpha = 0.5;
                    this.createHitEffect(obj.x, obj.y);
                    soundManager.playCrash();

                    if (this.lives <= 0) {
                        this.isGameOver = true;
                    }
                } else {
                    // Collected sample!
                    this.samplesCollected++;
                    const points = obj.value * 100 * this.combo;
                    this.score += points;

                    const stars = Math.ceil(obj.value * this.combo);
                    if (this.sessionStardust < this.maxSessionStardust) {
                        const earned = Math.min(stars, this.maxSessionStardust - this.sessionStardust);
                        this.stardustCollected += earned;
                        this.sessionStardust += earned;
                    }

                    this.combo = Math.min(5, this.combo + 0.25);
                    this.comboTimer = 90;
                    this.createCollectEffect(obj.x, obj.y, obj.type);
                    soundManager.playCollect();
                }
                return false;
            }

            // Remove if off screen (missed)
            if (obj.y > this.height + 50) {
                return false;
            }

            return true;
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.life--;
            return p.life > 0;
        });

        // Trivia trigger
        if (this.samplesCollected >= this.lastTriviaSamples + 15 && !this.showTrivia) {
            this.triggerTrivia();
            this.lastTriviaSamples = this.samplesCollected;
        }
    }

    triggerTrivia() {
        this.currentTrivia = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        this.showTrivia = true;
        this.triviaAnswered = false;
    }

    createCollectEffect(x: number, y: number, type: string) {
        const color = type === 'crystal' ? '#a855f7' : type === 'ice' ? '#38bdf8' : '#ef4444';
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4 - 2,
                size: 4,
                color,
                life: 25,
                maxLife: 25,
            });
        }
    }

    createHitEffect(x: number, y: number) {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: '#ff4444',
                life: 30,
                maxLife: 30,
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // Screen shake
        if (this.screenShake > 0.5) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }

        // Background
        this.drawBackground(ctx);

        // Draw falling objects
        this.objects.forEach(obj => {
            this.drawObject(ctx, obj);
        });

        // Draw rover
        this.drawRover(ctx);

        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Dust storm overlay
        if (this.dustStormActive) {
            ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.fillStyle = 'rgba(210, 180, 140, 0.6)';
            this.dustParticles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Warning text
            ctx.fillStyle = '#ffaa00';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️ DUST STORM! ⚠️', this.width / 2, 60);
        }

        // Flash effect
        if (this.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 68, 68, ${this.flashAlpha * 0.5})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();

        // UI
        this.drawUI(ctx);
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        // Mars sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, '#1a0505');
        skyGrad.addColorStop(0.3, '#3d1a1a');
        skyGrad.addColorStop(0.6, '#8b4513');
        skyGrad.addColorStop(1, '#cd853f');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(star => {
            ctx.globalAlpha = 0.5 + Math.sin(this.gameTime * 0.05 + star.x) * 0.3;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Mountains (silhouette)
        ctx.fillStyle = '#5a2d0c';
        this.mountains.forEach(m => {
            ctx.beginPath();
            ctx.moveTo(m.x, this.height * 0.5);
            ctx.lineTo(m.x + m.width / 2, this.height * 0.5 - m.height);
            ctx.lineTo(m.x + m.width, this.height * 0.5);
            ctx.closePath();
            ctx.fill();
        });

        // Mars surface
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);

        // Surface texture
        ctx.fillStyle = '#8b4513';
        for (let i = 0; i < 20; i++) {
            const x = (i * 70 + this.backgroundOffset * 0.2) % this.width;
            ctx.beginPath();
            ctx.arc(x, this.height * 0.6 + 50 + (i % 3) * 30, 5 + (i % 4) * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Ground line
        ctx.strokeStyle = '#cd853f';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, this.height - 50);
        ctx.lineTo(this.width, this.height - 50);
        ctx.stroke();
    }

    drawRover(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.roverX, this.roverY);
        ctx.rotate(this.roverTilt);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 20, this.roverWidth / 2, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wheels
        ctx.fillStyle = '#333';
        const wheelPositions = [-30, -10, 10, 30];
        wheelPositions.forEach(wx => {
            ctx.beginPath();
            ctx.arc(wx, 15, 12, 0, Math.PI * 2);
            ctx.fill();
            // Wheel spokes
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(wx, 15, 8, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Body
        ctx.fillStyle = '#f5f5dc';
        ctx.fillRect(-35, -20, 70, 30);

        // Solar panel
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(-40, -30, 80, 12);
        ctx.strokeStyle = '#4a4a6a';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            ctx.moveTo(-40 + i * 10, -30);
            ctx.lineTo(-40 + i * 10, -18);
            ctx.stroke();
        }

        // Camera mast
        ctx.fillStyle = '#888';
        ctx.fillRect(-5, -45, 10, 25);

        // Camera head
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, -50, 10, 0, Math.PI * 2);
        ctx.fill();

        // Camera lens
        ctx.fillStyle = '#00aaff';
        ctx.beginPath();
        ctx.arc(5, -50, 4, 0, Math.PI * 2);
        ctx.fill();

        // Antenna
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(25, -20);
        ctx.lineTo(35, -40);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(35, -40, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawObject(ctx: CanvasRenderingContext2D, obj: FallingObject) {
        ctx.save();
        ctx.translate(obj.x, obj.y);
        ctx.rotate(obj.rotation);

        if (obj.type === 'sample') {
            // Rock sample
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(12, -5);
            ctx.lineTo(10, 10);
            ctx.lineTo(-10, 10);
            ctx.lineTo(-12, -5);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = '#5a3a1a';
            ctx.lineWidth = 2;
            ctx.stroke();
        } else if (obj.type === 'crystal') {
            // Rare crystal
            ctx.fillStyle = '#a855f7';
            ctx.shadowColor = '#a855f7';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(10, 0);
            ctx.lineTo(0, 15);
            ctx.lineTo(-10, 0);
            ctx.closePath();
            ctx.fill();
        } else if (obj.type === 'ice') {
            // Ice chunk
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(-5, -5, 6, 0, Math.PI * 2);
            ctx.fill();
        } else if (obj.type === 'meteor') {
            // Dangerous meteor
            ctx.fillStyle = '#444';
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const r = 15 + Math.sin(i * 3) * 5;
                if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
            // Fire trail
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(8, -35);
            ctx.lineTo(0, -28);
            ctx.lineTo(-8, -35);
            ctx.closePath();
            ctx.fill();
        } else if (obj.type === 'dust') {
            // Dust devil
            ctx.fillStyle = 'rgba(139, 69, 19, 0.6)';
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(Math.sin(i * 2) * 5, i * 8 - 10, 12 - i * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // Score
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(`Score: ${this.score.toLocaleString()}`, this.width / 2, 40);
        ctx.fillText(`Score: ${this.score.toLocaleString()}`, this.width / 2, 40);

        // Stardust (top right)
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, this.width - 20, 40);

        // Samples collected
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`🪨 ${this.samplesCollected} samples`, this.width - 20, 70);

        // Lives (top left)
        ctx.textAlign = 'left';
        ctx.font = '24px Arial';
        for (let i = 0; i < this.maxLives; i++) {
            ctx.fillText(i < this.lives ? '❤️' : '🖤', 20 + i * 35, 40);
        }

        // Level
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Level ${this.level}`, 20, 70);

        // Combo
        if (this.combo > 1) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`x${this.combo.toFixed(1)} COMBO`, this.width / 2, 75);
        }

        // Instructions (early game)
        if (this.gameTime < 180 && !this.isGameOver) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = 'bold 18px Arial';
            ctx.fillText('← → or A/D to move • Collect samples, avoid meteors!', this.width / 2, this.height - 20);
        }

        // Legend
        if (this.gameTime < 300) {
            ctx.textAlign = 'left';
            ctx.font = '12px Arial';
            ctx.fillStyle = '#8b4513';
            ctx.fillText('🪨 Sample', 20, this.height - 60);
            ctx.fillStyle = '#a855f7';
            ctx.fillText('💎 Crystal (3x)', 100, this.height - 60);
            ctx.fillStyle = '#38bdf8';
            ctx.fillText('🧊 Ice (2x)', 200, this.height - 60);
            ctx.fillStyle = '#ff4444';
            ctx.fillText('☄️ AVOID!', 280, this.height - 60);
        }
    }
}
