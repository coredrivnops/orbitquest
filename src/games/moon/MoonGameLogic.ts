// Moon Game Logic - "LUNAR LANDER"
// A retro arcade classic - land your module on the Moon!
import { soundManager } from '@/utils/soundManager';

export interface LandingZone {
    x: number;
    width: number;
    multiplier: number;
    label: string;
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

export interface FuelCanister {
    x: number;
    y: number;
    collected: boolean;
}

export interface Star {
    x: number;
    y: number;
    size: number;
    twinkle: number;
}

interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

const TRIVIA: TriviaQuestion[] = [
    { question: "How many humans have walked on the Moon?", answers: ["2", "6", "12", "24"], correct: 2, fact: "12 astronauts walked on the Moon during six Apollo missions (1969-1972)!" },
    { question: "Who was the first person on the Moon?", answers: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "Yuri Gagarin"], correct: 1, fact: "Neil Armstrong stepped onto the Moon on July 20, 1969, saying 'That's one small step for man...'" },
    { question: "How far is the Moon from Earth?", answers: ["238,000 miles", "93 million miles", "1 million miles", "500,000 miles"], correct: 0, fact: "The Moon is about 238,855 miles (384,400 km) from Earth on average!" },
    { question: "What is the Moon's gravity compared to Earth?", answers: ["Half", "One-sixth", "One-tenth", "Same"], correct: 1, fact: "The Moon's gravity is about 1/6th of Earth's - you'd weigh much less there!" },
    { question: "Why do footprints last forever on the Moon?", answers: ["Frozen ground", "No wind or weather", "Magic dust", "They don't"], correct: 1, fact: "With no atmosphere, there's no wind or rain to erode footprints - they could last millions of years!" },
    { question: "What is NASA's next Moon program called?", answers: ["Apollo 2", "Artemis", "Lunar Gateway", "Moon Base Alpha"], correct: 1, fact: "Artemis aims to land the first woman and next man on the Moon by the mid-2020s!" },
];

export class MoonGameLogic {
    width: number;
    height: number;

    // Lander
    landerX: number;
    landerY: number;
    landerVX: number;
    landerVY: number;
    landerAngle: number;
    landerAngularVel: number;
    landerWidth: number;
    landerHeight: number;

    // Physics
    gravity: number;
    thrustPower: number;
    rotationSpeed: number;
    maxLandingSpeed: number;
    maxLandingAngle: number;

    // Fuel
    fuel: number;
    maxFuel: number;
    fuelConsumption: number;
    fuelCanisters: FuelCanister[];

    // Terrain
    terrainPoints: { x: number; y: number }[];
    landingZones: LandingZone[];
    groundY: number;

    // Game state
    isThrusting: boolean;
    rotatingLeft: boolean;
    rotatingRight: boolean;
    isLanded: boolean;
    isCrashed: boolean;
    landingMultiplier: number;
    score: number;
    stardustCollected: number;
    level: number;
    successfulLandings: number;

    // Effects
    particles: Particle[];
    screenShake: number;

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;
    lastTriviaLevel: number;

    // Visual
    stars: Star[];
    earthX: number;
    earthY: number;

    // Session
    sessionStardust: number;
    maxSessionStardust: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.landerWidth = 40;
        this.landerHeight = 50;
        this.maxSessionStardust = 100;

        // Physics constants
        this.gravity = 0.02; // Moon gravity (low!)
        this.thrustPower = 0.06;
        this.rotationSpeed = 0.003;
        this.maxLandingSpeed = 1.5;
        this.maxLandingAngle = 0.3;

        // Initialize
        this.landerX = width / 2;
        this.landerY = 100;
        this.landerVX = 0;
        this.landerVY = 0;
        this.landerAngle = 0;
        this.landerAngularVel = 0;

        this.fuel = 100;
        this.maxFuel = 100;
        this.fuelConsumption = 0.3;
        this.fuelCanisters = [];

        this.terrainPoints = [];
        this.landingZones = [];
        this.groundY = height - 100;

        this.isThrusting = false;
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.isLanded = false;
        this.isCrashed = false;
        this.landingMultiplier = 1;
        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.level = 1;
        this.successfulLandings = 0;

        this.particles = [];
        this.screenShake = 0;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaLevel = 0;

        this.stars = [];
        this.earthX = 100;
        this.earthY = 80;

        this.initializeStars();
        this.generateTerrain();
        this.reset();
    }

    initializeStars() {
        for (let i = 0; i < 150; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.6),
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
            });
        }
    }

    generateTerrain() {
        this.terrainPoints = [];
        this.landingZones = [];

        // Generate rough lunar terrain
        let x = 0;
        let y = this.groundY;
        const segmentWidth = 20;

        while (x < this.width + segmentWidth) {
            this.terrainPoints.push({ x, y });
            x += segmentWidth;

            // Random terrain variation (craters and hills)
            const change = (Math.random() - 0.5) * 30;
            y = Math.max(this.height - 200, Math.min(this.height - 50, y + change));
        }

        // Create landing zones (flat areas)
        const numZones = 2 + Math.floor(this.level / 2);
        const zoneLabels = ['1x', '2x', '3x', '5x'];
        const zoneMultipliers = [1, 2, 3, 5];

        for (let i = 0; i < numZones; i++) {
            const zoneWidth = 80 - this.level * 5;
            const zoneX = 100 + (i * (this.width - 200) / numZones) + Math.random() * 50;
            const zoneY = this.height - 80 - Math.random() * 60;

            // Flatten terrain at landing zone
            const startIdx = Math.floor(zoneX / 20);
            const endIdx = Math.floor((zoneX + zoneWidth) / 20);
            for (let j = startIdx; j <= endIdx && j < this.terrainPoints.length; j++) {
                this.terrainPoints[j].y = zoneY;
            }

            const zoneIndex = Math.min(i, zoneLabels.length - 1);
            this.landingZones.push({
                x: zoneX,
                width: Math.max(50, zoneWidth),
                multiplier: zoneMultipliers[zoneIndex],
                label: zoneLabels[zoneIndex],
            });
        }

        // Spawn fuel canisters
        this.fuelCanisters = [];
        const numCanisters = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < numCanisters; i++) {
            this.fuelCanisters.push({
                x: 100 + Math.random() * (this.width - 200),
                y: 150 + Math.random() * (this.height - 400),
                collected: false,
            });
        }
    }

    reset() {
        this.landerX = this.width / 2 + (Math.random() - 0.5) * 200;
        this.landerY = 80;
        this.landerVX = (Math.random() - 0.5) * 1;
        this.landerVY = 0.5;
        this.landerAngle = 0;
        this.landerAngularVel = 0;

        this.fuel = this.maxFuel;
        this.isThrusting = false;
        this.rotatingLeft = false;
        this.rotatingRight = false;
        this.isLanded = false;
        this.isCrashed = false;
        this.landingMultiplier = 1;

        this.particles = [];
        this.screenShake = 0;

        this.generateTerrain();
    }

    fullReset() {
        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.level = 1;
        this.successfulLandings = 0;
        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaLevel = 0;
        this.reset();
    }

    handleInput(action: 'thrust-start' | 'thrust-stop' | 'left-start' | 'left-stop' | 'right-start' | 'right-stop') {
        if (this.showTrivia || this.isLanded || this.isCrashed) return;

        switch (action) {
            case 'thrust-start':
                this.isThrusting = true;
                break;
            case 'thrust-stop':
                this.isThrusting = false;
                break;
            case 'left-start':
                this.rotatingLeft = true;
                break;
            case 'left-stop':
                this.rotatingLeft = false;
                break;
            case 'right-start':
                this.rotatingRight = true;
                break;
            case 'right-stop':
                this.rotatingRight = false;
                break;
        }
    }

    answerTrivia(index: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;

        if (index === this.currentTrivia.correct) {
            const bonus = 15;
            if (this.sessionStardust < this.maxSessionStardust) {
                const earned = Math.min(bonus, this.maxSessionStardust - this.sessionStardust);
                this.stardustCollected += earned;
                this.sessionStardust += earned;
            }
            this.score += 500;
            this.fuel = Math.min(this.maxFuel, this.fuel + 30);
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
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            this.particles.push({
                x: this.landerX,
                y: this.landerY,
                vx: Math.cos(angle) * (3 + Math.random() * 3),
                vy: Math.sin(angle) * (3 + Math.random() * 3),
                size: 4 + Math.random() * 4,
                color: ['#ffd700', '#00ff88', '#ffffff'][Math.floor(Math.random() * 3)],
                life: 50,
                maxLife: 50,
            });
        }
    }

    update(deltaTime: number = 1) {
        if (this.showTrivia || this.isLanded || this.isCrashed) return;

        // Screen shake decay
        if (this.screenShake > 0) this.screenShake *= Math.pow(0.9, deltaTime);

        // Gravity
        this.landerVY += this.gravity * deltaTime;

        // Rotation
        if (this.rotatingLeft) {
            this.landerAngularVel -= this.rotationSpeed;
        }
        if (this.rotatingRight) {
            this.landerAngularVel += this.rotationSpeed;
        }
        this.landerAngularVel *= Math.pow(0.98, deltaTime); // Angular damping
        this.landerAngle += this.landerAngularVel * deltaTime;

        // Thrust
        if (this.isThrusting && this.fuel > 0) {
            const thrustX = Math.sin(this.landerAngle) * this.thrustPower;
            const thrustY = -Math.cos(this.landerAngle) * this.thrustPower;
            this.landerVX += thrustX * deltaTime;
            this.landerVY += thrustY * deltaTime;
            this.fuel -= this.fuelConsumption * deltaTime;
            soundManager.playThrust();

            // Thrust particles
            if (Math.random() > 0.3) {
                this.particles.push({
                    x: this.landerX - Math.sin(this.landerAngle) * 25,
                    y: this.landerY + Math.cos(this.landerAngle) * 25,
                    vx: -Math.sin(this.landerAngle) * (2 + Math.random() * 3) + (Math.random() - 0.5),
                    vy: Math.cos(this.landerAngle) * (2 + Math.random() * 3) + (Math.random() - 0.5),
                    size: 4 + Math.random() * 4,
                    color: Math.random() > 0.5 ? '#ff6600' : '#ffcc00',
                    life: 20 + Math.random() * 10,
                    maxLife: 30,
                });
            }
        }

        // Apply velocity
        this.landerX += this.landerVX * deltaTime;
        this.landerY += this.landerVY * deltaTime;

        // Screen bounds (wrap horizontally)
        if (this.landerX < 0) this.landerX = this.width;
        if (this.landerX > this.width) this.landerX = 0;

        // Ceiling
        if (this.landerY < 30) {
            this.landerY = 30;
            this.landerVY = Math.abs(this.landerVY) * 0.5;
        }

        // Check fuel canister collection
        this.fuelCanisters.forEach(canister => {
            if (canister.collected) return;
            const dx = this.landerX - canister.x;
            const dy = this.landerY - canister.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 40) {
                canister.collected = true;
                this.fuel = Math.min(this.maxFuel, this.fuel + 25);
                this.createCollectEffect(canister.x, canister.y);
                soundManager.playCollect();
            }
        });

        // Check terrain collision
        const groundHeight = this.getGroundHeight(this.landerX);
        if (this.landerY + this.landerHeight / 2 >= groundHeight) {
            // Collision!
            const speed = Math.sqrt(this.landerVX * this.landerVX + this.landerVY * this.landerVY);
            const angleFromVertical = Math.abs(this.landerAngle % (Math.PI * 2));
            const isUpright = angleFromVertical < this.maxLandingAngle || angleFromVertical > (Math.PI * 2 - this.maxLandingAngle);

            // Check if on landing zone
            let onLandingZone = false;
            let zoneMultiplier = 1;
            for (const zone of this.landingZones) {
                if (this.landerX >= zone.x && this.landerX <= zone.x + zone.width) {
                    onLandingZone = true;
                    zoneMultiplier = zone.multiplier;
                    break;
                }
            }

            if (speed <= this.maxLandingSpeed && isUpright && onLandingZone) {
                // Successful landing!
                this.isLanded = true;
                this.landingMultiplier = zoneMultiplier;
                this.successfulLandings++;

                const landingScore = 100 * zoneMultiplier * this.level;
                this.score += landingScore;

                const stars = 5 * zoneMultiplier;
                if (this.sessionStardust < this.maxSessionStardust) {
                    const earned = Math.min(stars, this.maxSessionStardust - this.sessionStardust);
                    this.stardustCollected += earned;
                    this.sessionStardust += earned;
                }

                soundManager.playLevelUp();
                this.createLandingEffect();
            } else {
                // Crash!
                this.isCrashed = true;
                this.screenShake = 20;
                this.createCrashEffect();
                soundManager.playCrash();
            }

            this.landerVX = 0;
            this.landerVY = 0;
            this.landerAngularVel = 0;
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 0.05 * deltaTime; // Light gravity on particles
            p.life -= deltaTime;
            return p.life > 0;
        });

        // Trivia trigger
        if (this.level > this.lastTriviaLevel + 1 && !this.showTrivia) {
            this.triggerTrivia();
            this.lastTriviaLevel = this.level;
        }
    }

    getGroundHeight(x: number): number {
        // Find terrain segment
        const segmentWidth = 20;
        const index = Math.floor(x / segmentWidth);
        if (index >= this.terrainPoints.length - 1) return this.groundY;

        const p1 = this.terrainPoints[index];
        const p2 = this.terrainPoints[index + 1];
        const t = (x - p1.x) / segmentWidth;
        return p1.y + (p2.y - p1.y) * t;
    }

    triggerTrivia() {
        this.currentTrivia = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        this.showTrivia = true;
        this.triviaAnswered = false;
    }

    createCollectEffect(x: number, y: number) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 4,
                color: '#00ff88',
                life: 25,
                maxLife: 25,
            });
        }
    }

    createLandingEffect() {
        for (let i = 0; i < 20; i++) {
            const angle = Math.PI + (Math.random() - 0.5) * Math.PI;
            this.particles.push({
                x: this.landerX + (Math.random() - 0.5) * 40,
                y: this.landerY + 25,
                vx: Math.cos(angle) * (1 + Math.random() * 2),
                vy: Math.sin(angle) * (1 + Math.random() * 2),
                size: 3 + Math.random() * 3,
                color: '#aaaaaa',
                life: 30,
                maxLife: 30,
            });
        }
    }

    createCrashEffect() {
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x: this.landerX,
                y: this.landerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                color: Math.random() > 0.5 ? '#ff4444' : '#ff8800',
                life: 40,
                maxLife: 40,
            });
        }
    }

    nextLevel() {
        this.level++;
        this.gravity += 0.003; // Slightly harder each level
        this.reset();
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

        // Terrain
        this.drawTerrain(ctx);

        // Landing zones
        this.drawLandingZones(ctx);

        // Fuel canisters
        this.fuelCanisters.forEach(c => {
            if (!c.collected) {
                this.drawFuelCanister(ctx, c);
            }
        });

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Lander
        if (!this.isCrashed) {
            this.drawLander(ctx);
        }

        ctx.restore();

        // UI
        this.drawUI(ctx);
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        // Space black
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        this.stars.forEach(star => {
            const twinkle = Math.sin(star.twinkle + Date.now() * 0.001) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Earth in background
        ctx.fillStyle = '#3b82f6';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(this.earthX, this.earthY, 40, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(this.earthX - 10, this.earthY - 5, 15, 0, Math.PI, true);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.earthX + 15, this.earthY + 10, 10, 0, Math.PI, true);
        ctx.fill();

        ctx.shadowBlur = 0;
    }

    drawTerrain(ctx: CanvasRenderingContext2D) {
        // Moon surface gradient
        const grad = ctx.createLinearGradient(0, this.height - 200, 0, this.height);
        grad.addColorStop(0, '#555555');
        grad.addColorStop(1, '#333333');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, this.height);
        this.terrainPoints.forEach(p => {
            ctx.lineTo(p.x, p.y);
        });
        ctx.lineTo(this.width, this.height);
        ctx.closePath();
        ctx.fill();

        // Terrain outline
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        this.terrainPoints.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Craters (decorative)
        ctx.fillStyle = '#444';
        for (let i = 0; i < 10; i++) {
            const cx = 50 + i * 130;
            const cy = this.getGroundHeight(cx) + 15;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 15 + i % 3 * 5, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawLandingZones(ctx: CanvasRenderingContext2D) {
        this.landingZones.forEach(zone => {
            const y = this.getGroundHeight(zone.x + zone.width / 2);

            // Landing pad
            ctx.fillStyle = '#00aa00';
            ctx.fillRect(zone.x, y - 3, zone.width, 6);

            // Lights
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(zone.x, y, 4, 0, Math.PI * 2);
            ctx.arc(zone.x + zone.width, y, 4, 0, Math.PI * 2);
            ctx.fill();

            // Multiplier label
            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(zone.label, zone.x + zone.width / 2, y + 20);
        });
    }

    drawFuelCanister(ctx: CanvasRenderingContext2D, canister: FuelCanister) {
        ctx.save();
        ctx.translate(canister.x, canister.y);

        // Glow
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;

        // Canister body
        ctx.fillStyle = '#00aa55';
        ctx.fillRect(-10, -15, 20, 30);

        // Cap
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(-8, -18, 16, 5);

        // "F" label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⛽', 0, 5);

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawLander(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.landerX, this.landerY);
        ctx.rotate(this.landerAngle);

        // Legs
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-15, 15);
        ctx.lineTo(-25, 25);
        ctx.moveTo(15, 15);
        ctx.lineTo(25, 25);
        ctx.stroke();

        // Feet
        ctx.fillStyle = '#888';
        ctx.beginPath();
        ctx.arc(-25, 25, 5, 0, Math.PI * 2);
        ctx.arc(25, 25, 5, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.moveTo(-20, 15);
        ctx.lineTo(-15, -15);
        ctx.lineTo(15, -15);
        ctx.lineTo(20, 15);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Top module
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(0, -20, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cc9900';
        ctx.stroke();

        // Window
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(0, -20, 6, 0, Math.PI * 2);
        ctx.fill();

        // Thruster
        ctx.fillStyle = '#666';
        ctx.fillRect(-8, 15, 16, 8);

        // Thrust flame
        if (this.isThrusting && this.fuel > 0) {
            const flameHeight = 20 + Math.random() * 10;
            const grad = ctx.createLinearGradient(0, 23, 0, 23 + flameHeight);
            grad.addColorStop(0, '#ff6600');
            grad.addColorStop(0.5, '#ffcc00');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(-10, 23);
            ctx.lineTo(0, 23 + flameHeight);
            ctx.lineTo(10, 23);
            ctx.closePath();
            ctx.fill();
        }

        ctx.restore();
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // Score and level
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Level ${this.level}`, this.width / 2, 35);
        ctx.font = '18px Arial';
        ctx.fillText(`Score: ${this.score.toLocaleString()}`, this.width / 2, 60);

        // Stardust
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, this.width - 20, 35);

        // Landings
        ctx.fillStyle = '#00ff88';
        ctx.font = '16px Arial';
        ctx.fillText(`Landings: ${this.successfulLandings}`, this.width - 20, 60);

        // Fuel gauge (left side)
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('FUEL', 20, 35);

        const fuelWidth = 150;
        const fuelHeight = 20;
        ctx.fillStyle = '#333';
        ctx.fillRect(20, 45, fuelWidth, fuelHeight);

        const fuelPercent = this.fuel / this.maxFuel;
        ctx.fillStyle = fuelPercent > 0.3 ? '#00ff88' : fuelPercent > 0.1 ? '#ffaa00' : '#ff4444';
        ctx.fillRect(20, 45, fuelWidth * fuelPercent, fuelHeight);

        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 45, fuelWidth, fuelHeight);

        // Speed and angle indicators
        const speed = Math.sqrt(this.landerVX * this.landerVX + this.landerVY * this.landerVY);
        const isSafeLanding = speed <= this.maxLandingSpeed;
        ctx.fillStyle = isSafeLanding ? '#00ff88' : '#ff4444';
        ctx.font = '14px Arial';
        ctx.fillText(`Speed: ${speed.toFixed(2)}`, 20, 90);
        ctx.fillText(isSafeLanding ? '✓ Safe' : '⚠ Too Fast!', 20, 108);

        // Controls hint
        if (!this.isLanded && !this.isCrashed) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '14px Arial';
            ctx.fillText('← → to rotate • ↑ or SPACE to thrust • Land gently on green pads!', this.width / 2, this.height - 20);
        }

        // Landing success message
        if (this.isLanded) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 36px Arial';
            ctx.fillText('🎉 PERFECT LANDING! 🎉', this.width / 2, this.height / 2 - 30);
            ctx.font = '24px Arial';
            ctx.fillText(`+${100 * this.landingMultiplier * (this.level)} points (${this.landingMultiplier}x)`, this.width / 2, this.height / 2 + 10);
            ctx.font = '18px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText('Press SPACE or click to continue...', this.width / 2, this.height / 2 + 50);
        }

        // Crash message
        if (this.isCrashed) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 36px Arial';
            ctx.fillText('💥 CRASHED! 💥', this.width / 2, this.height / 2 - 30);
            ctx.font = '18px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText('Press SPACE or click to try again...', this.width / 2, this.height / 2 + 20);
        }
    }
}
