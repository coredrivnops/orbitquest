// Venus Game Logic - "PRESSURE DROP"
// Vertical descent through Venus's crushing atmosphere!
// Unique mechanic: Pressure increases as you descend, collect coolant to survive
import { soundManager } from '@/utils/soundManager';

interface AtmosphereLayer {
    name: string;
    yStart: number;
    yEnd: number;
    color: string;
    hazardType: 'acid' | 'heat' | 'lightning' | 'volcanic';
    pressureMultiplier: number;
}

interface HeatVent {
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
    timer: number;
}

interface Collectible {
    x: number;
    y: number;
    type: 'coolant' | 'data' | 'shield' | 'stardust';
    collected: boolean;
    value: number;
    pulsePhase: number;
}

interface AcidCloud {
    x: number;
    y: number;
    radius: number;
    speed: number;
    opacity: number;
}

interface Particle {
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
    { question: "What is Venus's surface pressure compared to Earth?", answers: ["Same as Earth", "10x Earth", "92x Earth", "500x Earth"], correct: 2, fact: "Venus's surface pressure is 92 times Earth's - like being 900m underwater!" },
    { question: "What is the surface temperature of Venus?", answers: ["100°C", "250°C", "465°C", "750°C"], correct: 2, fact: "Venus's surface is 465°C (900°F) - hot enough to melt lead! It's the hottest planet." },
    { question: "Venus rotates...", answers: ["Like Earth", "Faster than any planet", "Backwards (retrograde)", "Not at all"], correct: 2, fact: "Venus rotates backwards! A day on Venus is longer than its year, and the Sun rises in the west!" },
    { question: "What are Venus's clouds made of?", answers: ["Water vapor", "Sulfuric acid", "Carbon dioxide", "Nitrogen"], correct: 1, fact: "Venus's clouds are made of sulfuric acid droplets - extremely corrosive!" },
    { question: "Where could humans potentially live on Venus?", answers: ["Surface", "Underground", "50km altitude", "Orbit only"], correct: 2, fact: "At 50km altitude in Venus's atmosphere, conditions are surprisingly Earth-like! NASA has proposed floating cloud cities." },
    { question: "How fast do Venus's clouds rotate?", answers: ["Same as planet", "10x faster", "60x faster", "100x faster"], correct: 2, fact: "Venus's clouds rotate 60 times faster than the planet itself - called 'super-rotation'!" },
];

const ATMOSPHERE_LAYERS: AtmosphereLayer[] = [
    { name: "Upper Clouds (50km)", yStart: 0, yEnd: 0.25, color: "#5a4a2f", hazardType: "lightning", pressureMultiplier: 0.5 },
    { name: "Middle Clouds (45km)", yStart: 0.25, yEnd: 0.5, color: "#6b4423", hazardType: "acid", pressureMultiplier: 1.0 },
    { name: "Lower Clouds (35km)", yStart: 0.5, yEnd: 0.75, color: "#8b3a1d", hazardType: "heat", pressureMultiplier: 2.0 },
    { name: "Deep Atmosphere (20km)", yStart: 0.75, yEnd: 1.0, color: "#6b1a1a", hazardType: "volcanic", pressureMultiplier: 4.0 },
];

export class VenusGameLogic {
    width: number;
    height: number;

    // Player probe
    playerX: number;
    playerY: number;
    playerVx: number;
    playerVy: number;
    playerRadius: number;

    // Descent mechanics
    descentSpeed: number;
    baseDescentSpeed: number;
    maxDescentSpeed: number;
    depth: number; // Total depth descended
    currentLayer: number;

    // Pressure and heat system
    hullIntegrity: number;
    maxHullIntegrity: number;
    temperature: number;
    maxTemperature: number;
    coolingPower: number;

    // Shield
    shieldActive: boolean;
    shieldTimer: number;

    // Game elements
    heatVents: HeatVent[];
    collectibles: Collectible[];
    acidClouds: AcidCloud[];
    particles: Particle[];

    // Timing
    spawnTimer: number;
    collectibleTimer: number;
    cloudTimer: number;

    // Game state
    score: number;
    stardustCollected: number;
    dataProbesCollected: number;
    isGameOver: boolean;
    gameTime: number;
    combo: number;
    comboTimer: number;

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;
    lastTriviaDepth: number;

    // Visual
    backgroundOffset: number;
    warningFlash: number;
    screenShake: number;
    lightningFlash: number;

    // Session
    sessionStardust: number;
    maxSessionStardust: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.maxSessionStardust = 150;
        this.playerRadius = 25;

        // Descent settings
        this.baseDescentSpeed = 2;
        this.maxDescentSpeed = 8;
        this.descentSpeed = this.baseDescentSpeed;
        this.maxHullIntegrity = 100;
        this.maxTemperature = 100;

        // Initialize
        this.playerX = width / 2;
        this.playerY = 280;
        this.playerVx = 0;
        this.playerVy = 0;
        this.depth = 0;
        this.currentLayer = 0;

        this.hullIntegrity = 100;
        this.temperature = 0;
        this.coolingPower = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;

        this.heatVents = [];
        this.collectibles = [];
        this.acidClouds = [];
        this.particles = [];

        this.spawnTimer = 0;
        this.collectibleTimer = 0;
        this.cloudTimer = 0;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.dataProbesCollected = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.combo = 1;
        this.comboTimer = 0;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaDepth = 0;

        this.backgroundOffset = 0;
        this.warningFlash = 0;
        this.screenShake = 0;
        this.lightningFlash = 0;

        this.reset();
    }

    reset() {
        this.playerX = this.width / 2;
        this.playerY = 280;
        this.playerVx = 0;
        this.playerVy = 0;
        this.depth = 0;
        this.currentLayer = 0;
        this.descentSpeed = this.baseDescentSpeed;

        this.hullIntegrity = 100;
        this.temperature = 0;
        this.coolingPower = 0;
        this.shieldActive = false;
        this.shieldTimer = 0;

        this.heatVents = [];
        this.collectibles = [];
        this.acidClouds = [];
        this.particles = [];

        this.spawnTimer = 60;
        this.collectibleTimer = 30;
        this.cloudTimer = 100;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.dataProbesCollected = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.combo = 1;
        this.comboTimer = 0;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaDepth = 0;

        this.warningFlash = 0;
        this.screenShake = 0;
        this.lightningFlash = 0;
    }

    handleInput(x: number) {
        if (this.showTrivia || this.isGameOver) return;
        // Player moves horizontally toward cursor
        const targetX = Math.max(50, Math.min(this.width - 50, x));
        this.playerVx = (targetX - this.playerX) * 0.15;
    }

    answerTrivia(index: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;

        if (index === this.currentTrivia.correct) {
            const bonus = 20;
            if (this.sessionStardust < this.maxSessionStardust) {
                const earned = Math.min(bonus, this.maxSessionStardust - this.sessionStardust);
                this.stardustCollected += earned;
                this.sessionStardust += earned;
            }
            this.score += 1000;
            this.hullIntegrity = Math.min(this.maxHullIntegrity, this.hullIntegrity + 30);
            this.temperature = Math.max(0, this.temperature - 30);
            this.shieldActive = true;
            this.shieldTimer = 180;
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
                x: this.playerX,
                y: this.playerY,
                vx: Math.cos(angle) * (4 + Math.random() * 4),
                vy: Math.sin(angle) * (4 + Math.random() * 4),
                size: 5 + Math.random() * 5,
                color: ['#ffd700', '#00ff88', '#ff69b4', '#00bfff'][Math.floor(Math.random() * 4)],
                life: 50,
                maxLife: 50,
            });
        }
    }

    getCurrentLayer(): AtmosphereLayer {
        const depthRatio = Math.min(1, this.depth / 50000);
        for (let i = ATMOSPHERE_LAYERS.length - 1; i >= 0; i--) {
            if (depthRatio >= ATMOSPHERE_LAYERS[i].yStart) {
                return ATMOSPHERE_LAYERS[i];
            }
        }
        return ATMOSPHERE_LAYERS[0];
    }

    spawnHeatVent() {
        const width = 60 + Math.random() * 80;
        this.heatVents.push({
            x: Math.random() * (this.width - width),
            y: -100,
            width,
            height: 200 + Math.random() * 150,
            active: true,
            timer: 0,
        });
    }

    spawnCollectible() {
        const rand = Math.random();
        let type: 'coolant' | 'data' | 'shield' | 'stardust' = 'stardust';
        let value = 1;

        if (rand > 0.9) {
            type = 'shield';
            value = 0;
        } else if (rand > 0.75) {
            type = 'coolant';
            value = 0;
        } else if (rand > 0.6) {
            type = 'data';
            value = 5;
        }

        this.collectibles.push({
            x: 80 + Math.random() * (this.width - 160),
            y: -30,
            type,
            collected: false,
            value,
            pulsePhase: Math.random() * Math.PI * 2,
        });
    }

    spawnAcidCloud() {
        this.acidClouds.push({
            x: Math.random() * this.width,
            y: -80,
            radius: 40 + Math.random() * 60,
            speed: 0.5 + Math.random() * 1.5,
            opacity: 0.4 + Math.random() * 0.4,
        });
    }

    update() {
        if (this.showTrivia || this.isGameOver) return;

        this.gameTime++;
        this.depth += this.descentSpeed;
        this.backgroundOffset = (this.backgroundOffset + this.descentSpeed * 0.5) % 100;

        const layer = this.getCurrentLayer();
        this.currentLayer = ATMOSPHERE_LAYERS.indexOf(layer);

        // Increase descent speed over time
        this.descentSpeed = Math.min(this.maxDescentSpeed, this.baseDescentSpeed + this.depth / 10000);

        // Timers
        if (this.shieldTimer > 0) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                this.shieldActive = false;
            }
        }

        if (this.coolingPower > 0) {
            this.coolingPower--;
            this.temperature = Math.max(0, this.temperature - 0.5);
        }

        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) {
                this.combo = 1;
            }
        }

        if (this.warningFlash > 0) this.warningFlash -= 0.05;
        if (this.screenShake > 0) this.screenShake *= 0.9;
        if (this.lightningFlash > 0) this.lightningFlash -= 0.1;

        // Temperature increases based on depth
        const heatRate = layer.pressureMultiplier * 0.1;
        if (!this.shieldActive && this.coolingPower <= 0) {
            this.temperature = Math.min(this.maxTemperature, this.temperature + heatRate);
        }

        // Lightning in upper layer
        if (layer.hazardType === 'lightning' && Math.random() < 0.002) {
            this.lightningFlash = 1;
            this.screenShake = 5;
        }

        // Player movement
        this.playerX += this.playerVx;
        this.playerVx *= 0.92;

        // Clamp to bounds
        this.playerX = Math.max(this.playerRadius, Math.min(this.width - this.playerRadius, this.playerX));

        // Spawn hazards
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            this.spawnHeatVent();
            this.spawnTimer = Math.max(40, 100 - Math.floor(this.depth / 2000));
        }

        // Spawn collectibles
        this.collectibleTimer--;
        if (this.collectibleTimer <= 0) {
            this.spawnCollectible();
            this.collectibleTimer = 40;
        }

        // Spawn acid clouds
        this.cloudTimer--;
        if (this.cloudTimer <= 0 && this.currentLayer >= 1) {
            this.spawnAcidCloud();
            this.cloudTimer = 80;
        }

        // Update heat vents
        this.heatVents = this.heatVents.filter(vent => {
            vent.y += this.descentSpeed * 1.2;
            vent.timer++;

            // Pulsing heat
            vent.active = Math.sin(vent.timer * 0.05) > 0;

            // Check collision
            if (vent.active && !this.shieldActive) {
                if (this.playerX > vent.x - 10 - this.playerRadius &&
                    this.playerX < vent.x + vent.width + 10 + this.playerRadius &&
                    this.playerY > vent.y - this.playerRadius &&
                    this.playerY < vent.y + vent.height + this.playerRadius) {
                    this.temperature = Math.min(this.maxTemperature, this.temperature + 2);
                    this.createHeatParticles(this.playerX, this.playerY);
                }
            }

            return vent.y < this.height + 100;
        });

        // Update acid clouds
        this.acidClouds = this.acidClouds.filter(cloud => {
            cloud.y += this.descentSpeed + cloud.speed;
            cloud.x += Math.sin(cloud.y * 0.01) * 2;

            // Check collision
            const dx = this.playerX - cloud.x;
            const dy = this.playerY - cloud.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < cloud.radius + this.playerRadius && !this.shieldActive) {
                this.hullIntegrity -= 0.5;
                this.createAcidParticles(this.playerX, this.playerY);
                if (Math.random() < 0.1) soundManager.playCrash(); // Occasional sound for continuous damage
            }

            return cloud.y < this.height + cloud.radius;
        });

        // Update collectibles
        this.collectibles = this.collectibles.filter(col => {
            col.y += this.descentSpeed;
            col.pulsePhase += 0.1;

            // Check collision
            const dx = this.playerX - col.x;
            const dy = this.playerY - col.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 40 && !col.collected) {
                col.collected = true;

                if (col.type === 'stardust') {
                    if (this.sessionStardust < this.maxSessionStardust) {
                        this.stardustCollected++;
                        this.sessionStardust++;
                    }
                    this.score += 25 * this.combo;
                } else if (col.type === 'coolant') {
                    this.coolingPower = 180; // 3 seconds of cooling
                    this.temperature = Math.max(0, this.temperature - 20);
                    this.score += 100;
                } else if (col.type === 'shield') {
                    this.shieldActive = true;
                    this.shieldTimer = 300; // 5 seconds
                    this.score += 150;
                } else if (col.type === 'data') {
                    this.dataProbesCollected++;
                    if (this.sessionStardust < this.maxSessionStardust) {
                        const earned = Math.min(5, this.maxSessionStardust - this.sessionStardust);
                        this.stardustCollected += earned;
                        this.sessionStardust += earned;
                    }
                    this.score += 500;
                }

                this.combo = Math.min(5, this.combo + 0.25);
                this.comboTimer = 120;
                this.createCollectEffect(col.x, col.y, col.type);
                soundManager.playCollect();
                return false;
            }

            return col.y < this.height + 50;
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy + this.descentSpeed * 0.5;
            p.life--;
            return p.life > 0;
        });

        // Check damage from overheating
        if (this.temperature >= this.maxTemperature) {
            this.hullIntegrity -= 0.5;
            this.warningFlash = Math.max(this.warningFlash, 0.5);
        }

        // Check game over
        if (this.hullIntegrity <= 0) {
            this.isGameOver = true;
            this.createDeathEffect();
            soundManager.playCrash();
        }

        // Score increases with depth
        if (this.gameTime % 10 === 0) {
            this.score += Math.floor(this.descentSpeed * 2);
        }

        // Trivia trigger
        if (this.depth >= this.lastTriviaDepth + 10000 && !this.showTrivia) {
            this.triggerTrivia();
            this.lastTriviaDepth = this.depth;
        }
    }

    triggerTrivia() {
        this.currentTrivia = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        this.showTrivia = true;
        this.triviaAnswered = false;
    }

    createCollectEffect(x: number, y: number, type: string) {
        const colors: { [key: string]: string } = {
            stardust: '#ffd700',
            coolant: '#00bfff',
            shield: '#a855f7',
            data: '#00ff88',
        };
        const color = colors[type] || '#fff';
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4,
                size: 4,
                color,
                life: 25,
                maxLife: 25,
            });
        }
    }

    createHeatParticles(x: number, y: number) {
        if (Math.random() > 0.3) return;
        this.particles.push({
            x: x + (Math.random() - 0.5) * 30,
            y,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 4 - 2,
            size: 4 + Math.random() * 4,
            color: Math.random() > 0.5 ? '#ff4444' : '#ff8800',
            life: 25,
            maxLife: 25,
        });
    }

    createAcidParticles(x: number, y: number) {
        if (Math.random() > 0.5) return;
        this.particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            size: 3,
            color: '#aaff00',
            life: 20,
            maxLife: 20,
        });
    }

    createDeathEffect() {
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 5 + Math.random() * 7,
                color: Math.random() > 0.5 ? '#ff4444' : '#ff8800',
                life: 60,
                maxLife: 60,
            });
        }
        this.screenShake = 20;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // Apply screen shake
        if (this.screenShake > 0.5) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }

        // Background - Venus atmosphere gradient
        this.drawBackground(ctx);

        // Draw acid clouds
        this.acidClouds.forEach(cloud => {
            this.drawAcidCloud(ctx, cloud);
        });

        // Draw heat vents
        this.heatVents.forEach(vent => {
            this.drawHeatVent(ctx, vent);
        });

        // Draw collectibles
        this.collectibles.forEach(col => {
            if (!col.collected) {
                this.drawCollectible(ctx, col);
            }
        });

        // Draw player
        if (!this.isGameOver) {
            this.drawPlayer(ctx);
        }

        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Warning flash
        if (this.warningFlash > 0) {
            ctx.fillStyle = `rgba(255, 0, 0, ${this.warningFlash * 0.3})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Lightning flash
        if (this.lightningFlash > 0) {
            ctx.fillStyle = `rgba(255, 255, 200, ${this.lightningFlash * 0.5})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();

        // UI (after restore to not be affected by shake)
        this.drawUI(ctx);
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        const layer = this.getCurrentLayer();
        const nextLayerIndex = Math.min(ATMOSPHERE_LAYERS.length - 1, this.currentLayer + 1);
        const nextLayer = ATMOSPHERE_LAYERS[nextLayerIndex];

        // === BEAUTIFUL MULTI-LAYER GRADIENT ===
        const grad = ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(0.5, this.blendColors(layer.color, nextLayer.color, 0.5));
        grad.addColorStop(1, nextLayer.color);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // === DRAMATIC AMBIENT GLOW ===
        // Top atmospheric glow (subtle light from above)
        const topGlow = ctx.createLinearGradient(0, 0, 0, 200);
        topGlow.addColorStop(0, 'rgba(255, 180, 100, 0.15)');
        topGlow.addColorStop(1, 'rgba(255, 150, 50, 0)');
        ctx.fillStyle = topGlow;
        ctx.fillRect(0, 0, this.width, 200);

        // Bottom volcanic glow
        const bottomGlow = ctx.createLinearGradient(0, this.height - 150, 0, this.height);
        bottomGlow.addColorStop(0, 'rgba(255, 50, 0, 0)');
        bottomGlow.addColorStop(1, 'rgba(255, 80, 20, 0.2)');
        ctx.fillStyle = bottomGlow;
        ctx.fillRect(0, this.height - 150, this.width, 150);

        // === FLOATING CLOUD LAYERS ===
        // Cloud layer 1 - large soft clouds
        for (let i = 0; i < 8; i++) {
            const cloudX = ((i * 180 + this.gameTime * 0.3) % (this.width + 200)) - 100;
            const cloudY = ((i * 123 + this.backgroundOffset * 0.8) % (this.height + 100)) - 50;
            const cloudSize = 80 + (i % 3) * 40;

            const cloudGrad = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
            cloudGrad.addColorStop(0, 'rgba(200, 150, 100, 0.12)');
            cloudGrad.addColorStop(0.5, 'rgba(180, 120, 80, 0.08)');
            cloudGrad.addColorStop(1, 'rgba(150, 100, 60, 0)');
            ctx.fillStyle = cloudGrad;
            ctx.beginPath();
            ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // Cloud layer 2 - medium drifting clouds
        for (let i = 0; i < 12; i++) {
            const cloudX = ((i * 120 + this.gameTime * 0.5) % (this.width + 150)) - 75;
            const cloudY = ((i * 89 + this.backgroundOffset * 1.2) % (this.height + 80)) - 40;
            const cloudSize = 50 + (i % 4) * 25;

            const cloudGrad = ctx.createRadialGradient(cloudX, cloudY, 0, cloudX, cloudY, cloudSize);
            cloudGrad.addColorStop(0, 'rgba(255, 180, 120, 0.1)');
            cloudGrad.addColorStop(0.6, 'rgba(220, 140, 80, 0.06)');
            cloudGrad.addColorStop(1, 'rgba(180, 100, 50, 0)');
            ctx.fillStyle = cloudGrad;
            ctx.beginPath();
            ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
            ctx.fill();
        }

        // === SCROLLING DEPTH INDICATORS ===
        // More visible depth lines
        for (let y = -this.backgroundOffset; y < this.height; y += 60) {
            const lineAlpha = 0.08 + Math.sin((y + this.backgroundOffset) * 0.02) * 0.04;
            ctx.strokeStyle = `rgba(255, 200, 150, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // === RISING HEAT PARTICLES (ambient) ===
        for (let i = 0; i < 15; i++) {
            const px = (i * 97 + this.gameTime * 0.2) % this.width;
            const py = this.height - ((i * 67 + this.gameTime * 2) % (this.height * 1.2));
            const pSize = 2 + (i % 3);
            const pAlpha = 0.3 - (py / this.height) * 0.25;

            if (pAlpha > 0) {
                ctx.fillStyle = `rgba(255, 150, 50, ${pAlpha})`;
                ctx.beginPath();
                ctx.arc(px, py, pSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // === SULFURIC ACID HAZE (shimmer effect) ===
        const hazeIntensity = 0.03 + Math.sin(this.gameTime * 0.01) * 0.01;
        ctx.fillStyle = `rgba(200, 180, 100, ${hazeIntensity})`;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    // Helper function to blend two hex colors
    blendColors(color1: string, color2: string, ratio: number): string {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');

        const r1 = parseInt(hex1.substring(0, 2), 16);
        const g1 = parseInt(hex1.substring(2, 4), 16);
        const b1 = parseInt(hex1.substring(4, 6), 16);

        const r2 = parseInt(hex2.substring(0, 2), 16);
        const g2 = parseInt(hex2.substring(2, 4), 16);
        const b2 = parseInt(hex2.substring(4, 6), 16);

        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);

        return `rgb(${r}, ${g}, ${b})`;
    }

    drawHeatVent(ctx: CanvasRenderingContext2D, vent: HeatVent) {
        if (vent.active) {
            // Hot glow
            const gradient = ctx.createLinearGradient(vent.x, vent.y, vent.x, vent.y + vent.height);
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0)');
            gradient.addColorStop(0.3, 'rgba(255, 50, 0, 0.6)');
            gradient.addColorStop(0.7, 'rgba(255, 50, 0, 0.6)');
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(vent.x, vent.y, vent.width, vent.height);

            // Inner core
            ctx.fillStyle = 'rgba(255, 200, 50, 0.4)';
            ctx.fillRect(vent.x + vent.width * 0.2, vent.y, vent.width * 0.6, vent.height);

            // Particles rising
            for (let i = 0; i < 3; i++) {
                const px = vent.x + Math.random() * vent.width;
                const py = vent.y + (vent.timer * 3 + i * 50) % vent.height;
                ctx.fillStyle = 'rgba(255, 255, 100, 0.8)';
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Dormant vent
            ctx.fillStyle = 'rgba(100, 50, 0, 0.3)';
            ctx.fillRect(vent.x, vent.y, vent.width, vent.height);
        }

        // Warning markers
        ctx.strokeStyle = vent.active ? '#ff4444' : '#884400';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(vent.x, vent.y, vent.width, vent.height);
        ctx.setLineDash([]);
    }

    drawAcidCloud(ctx: CanvasRenderingContext2D, cloud: AcidCloud) {
        const gradient = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
        gradient.addColorStop(0, `rgba(200, 255, 0, ${cloud.opacity})`);
        gradient.addColorStop(0.5, `rgba(150, 200, 0, ${cloud.opacity * 0.7})`);
        gradient.addColorStop(1, `rgba(100, 150, 0, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
        ctx.fill();

        // Toxic symbol
        ctx.fillStyle = `rgba(255, 255, 0, ${cloud.opacity})`;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('☢️', cloud.x, cloud.y + 7);
    }

    drawCollectible(ctx: CanvasRenderingContext2D, col: Collectible) {
        const pulse = Math.sin(col.pulsePhase) * 0.2 + 1;
        ctx.save();
        ctx.translate(col.x, col.y);
        ctx.scale(pulse, pulse);

        ctx.shadowBlur = 15;

        if (col.type === 'stardust') {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            // Star shape
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const r = i % 2 === 0 ? 12 : 6;
                if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
        } else if (col.type === 'coolant') {
            ctx.fillStyle = '#00bfff';
            ctx.shadowColor = '#00bfff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❄️', 0, 8);
        } else if (col.type === 'shield') {
            ctx.fillStyle = '#a855f7';
            ctx.shadowColor = '#a855f7';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🛡️', 0, 8);
        } else if (col.type === 'data') {
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('📡', 0, 8);
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawPlayer(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.playerX, this.playerY);

        // === ALWAYS-ON VISIBILITY GLOW ===
        // Strong outer glow that makes ship visible against any background
        const glowGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, 60);
        glowGrad.addColorStop(0, 'rgba(0, 220, 255, 0.4)');
        glowGrad.addColorStop(0.5, 'rgba(0, 180, 255, 0.2)');
        glowGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();

        // Shield effect (purple bubble)
        if (this.shieldActive) {
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.9)';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, 0, 45, 0, Math.PI * 2);
            ctx.stroke();

            const shieldGrad = ctx.createRadialGradient(0, 0, 20, 0, 0, 50);
            shieldGrad.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
            shieldGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
            ctx.fillStyle = shieldGrad;
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.fill();
        }

        // === ENGINE TRAIL FLAMES ===
        // Descending probe has engine flames going UP (slowing descent)
        for (let i = 0; i < 3; i++) {
            const flameOffset = (this.gameTime * 0.3 + i * 2) % 8;
            const flameSize = 8 - flameOffset;
            if (flameSize > 0) {
                ctx.fillStyle = `rgba(0, 200, 255, ${0.6 - flameOffset * 0.07})`;
                ctx.beginPath();
                ctx.ellipse(
                    (Math.random() - 0.5) * 6,
                    -35 - flameOffset * 3,
                    flameSize * 0.6,
                    flameSize,
                    0, 0, Math.PI * 2
                );
                ctx.fill();
            }
        }

        // Temperature danger glow
        if (this.temperature > 50) {
            const heatGlow = (this.temperature - 50) / 50;
            ctx.shadowColor = `rgba(255, ${Math.floor(80 - heatGlow * 80)}, 0, 1)`;
            ctx.shadowBlur = 20 + heatGlow * 20;
        } else {
            // Normal cyan glow
            ctx.shadowColor = '#00e5ff';
            ctx.shadowBlur = 15;
        }

        // Cooling effect (override with blue)
        if (this.coolingPower > 0) {
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 25;
        }

        // === WHITE OUTLINE for visibility ===
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 32, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Probe body - capsule shape (metallic silver)
        const bodyGrad = ctx.createLinearGradient(-20, -30, 20, 30);
        bodyGrad.addColorStop(0, '#f8fafc');
        bodyGrad.addColorStop(0.3, '#e2e8f0');
        bodyGrad.addColorStop(0.5, '#cbd5e1');
        bodyGrad.addColorStop(0.7, '#94a3b8');
        bodyGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 20, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heat shield (bottom) - glowing orange
        const heatShieldGrad = ctx.createLinearGradient(0, 15, 0, 28);
        heatShieldGrad.addColorStop(0, '#fb923c');
        heatShieldGrad.addColorStop(0.5, '#ea580c');
        heatShieldGrad.addColorStop(1, '#c2410c');
        ctx.fillStyle = heatShieldGrad;
        ctx.beginPath();
        ctx.ellipse(0, 20, 24, 10, 0, 0, Math.PI);
        ctx.fill();

        // Heat shield glow line
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 22, 20, 6, 0, Math.PI, Math.PI * 2);
        ctx.stroke();

        // Window/sensor (bright cyan - key visibility element)
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 12;
        const windowGrad = ctx.createRadialGradient(-3, -10, 0, 0, -8, 12);
        windowGrad.addColorStop(0, '#ffffff');
        windowGrad.addColorStop(0.3, '#67e8f9');
        windowGrad.addColorStop(0.7, '#22d3ee');
        windowGrad.addColorStop(1, '#0891b2');
        ctx.fillStyle = windowGrad;
        ctx.beginPath();
        ctx.arc(0, -8, 11, 0, Math.PI * 2);
        ctx.fill();

        // Window highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(-4, -11, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Antenna (bright white)
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(0, -48);
        ctx.stroke();

        // Antenna tip (glowing)
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#00ff88';
        ctx.beginPath();
        ctx.arc(0, -48, 5, 0, Math.PI * 2);
        ctx.fill();

        // Antenna blink
        if (Math.sin(this.gameTime * 0.15) > 0.7) {
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, -48, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        const layer = this.getCurrentLayer();

        // Depth indicator (top center)
        ctx.textAlign = 'center';
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        const depthKm = (this.depth / 1000).toFixed(1);
        ctx.strokeText(`DEPTH: ${depthKm}km`, this.width / 2, 40);
        ctx.fillText(`DEPTH: ${depthKm}km`, this.width / 2, 40);

        // Layer name
        ctx.font = '16px Arial';
        ctx.fillStyle = layer.color;
        ctx.fillText(layer.name, this.width / 2, 65);

        // Hull Integrity (top left)
        ctx.textAlign = 'left';
        const hullWidth = 200;
        const hullX = 20;
        const hullY = 25;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(hullX, hullY, hullWidth, 20);

        const hullColor = this.hullIntegrity > 50 ? '#22c55e' : this.hullIntegrity > 25 ? '#f59e0b' : '#dc2626';
        ctx.fillStyle = hullColor;
        ctx.fillRect(hullX, hullY, hullWidth * (this.hullIntegrity / this.maxHullIntegrity), 20);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(hullX, hullY, hullWidth, 20);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.fillText(`HULL: ${Math.floor(this.hullIntegrity)}%`, hullX + 5, hullY + 14);

        // Temperature (below hull)
        const tempY = hullY + 30;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(hullX, tempY, hullWidth, 15);

        const tempGrad = ctx.createLinearGradient(hullX, tempY, hullX + hullWidth, tempY);
        tempGrad.addColorStop(0, '#22c55e');
        tempGrad.addColorStop(0.5, '#f59e0b');
        tempGrad.addColorStop(1, '#dc2626');
        ctx.fillStyle = tempGrad;
        ctx.fillRect(hullX, tempY, hullWidth * (this.temperature / this.maxTemperature), 15);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(hullX, tempY, hullWidth, 15);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.fillText(`🌡️ ${Math.floor(this.temperature)}°C`, hullX + 5, tempY + 11);

        // Active buffs
        let buffY = tempY + 25;
        if (this.shieldActive) {
            ctx.fillStyle = '#a855f7';
            ctx.fillText(`🛡️ Shield: ${Math.ceil(this.shieldTimer / 60)}s`, hullX, buffY);
            buffY += 18;
        }
        if (this.coolingPower > 0) {
            ctx.fillStyle = '#00bfff';
            ctx.fillText(`❄️ Cooling: ${Math.ceil(this.coolingPower / 60)}s`, hullX, buffY);
        }

        // Score (top right)
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, this.width - 20, 35);

        ctx.font = '18px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Score: ${this.score.toLocaleString()}`, this.width - 20, 60);

        ctx.fillStyle = '#00ff88';
        ctx.fillText(`📡 Data: ${this.dataProbesCollected}`, this.width - 20, 85);

        // Combo
        if (this.combo > 1) {
            ctx.fillStyle = '#ff69b4';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`x${this.combo.toFixed(1)} COMBO`, this.width - 20, 110);
        }

        // Controls hint
        if (this.gameTime < 300 && !this.isGameOver) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '14px Arial';
            ctx.fillText('Move mouse left/right to dodge hazards • Collect ❄️ to cool down • 🛡️ protects from damage', this.width / 2, this.height - 20);
        }
    }
}
