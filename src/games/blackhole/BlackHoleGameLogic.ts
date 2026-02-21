// Black Hole Escape: SINGULARITY RESCUE
// 🚀 Indie-style rescue game! Save the astronauts from the void!
// Simple mouse controls - swoop in, collect survivors, deliver to safety!

import { TriviaQuestion, getShuffledTrivia } from '@/data/spaceTrivia';
import { soundManager } from '@/utils/soundManager';

interface Astronaut {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rescued: boolean;
    delivered: boolean;
    type: 'astronaut' | 'satellite' | 'alien';
    wobble: number;
    panicLevel: number;
}

interface Debris {
    x: number;
    y: number;
    angle: number;
    orbitRadius: number;
    orbitSpeed: number;
    size: number;
    rotation: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

interface Star {
    x: number;
    y: number;
    size: number;
    twinkle: number;
}

export class BlackHoleGameLogic {
    width: number;
    height: number;
    centerX: number;
    centerY: number;

    // Player ship
    shipX: number;
    shipY: number;
    shipTargetX: number;
    shipTargetY: number;
    shipAngle: number = 0;
    shipSize: number = 22;

    // Black hole
    blackHoleRadius: number = 40;
    eventHorizonRadius: number = 55;
    pullRadius: number = 250;
    gravitationalPull: number = 0.08;

    // Safe zone (top of screen)
    safeZoneHeight: number = 80;

    // Game state
    isGameOver: boolean = false;
    hasEscaped: boolean = false; // Win condition: rescue enough
    score: number = 0;
    rescued: number = 0;
    lost: number = 0;
    rescueGoal: number = 50;
    wave: number = 1;
    gameTime: number = 0;

    // Carrying astronauts
    carrying: Astronaut[] = [];
    maxCarry: number = 3;

    // Entities
    astronauts: Astronaut[] = [];
    debris: Debris[] = [];
    particles: Particle[] = [];
    stars: Star[] = [];

    // Spawning
    spawnTimer: number = 0;
    spawnInterval: number = 90;

    // Visual effects
    screenShake: number = 0;
    rescueFlash: number = 0;
    warningPulse: number = 0;
    accretionRotation: number = 0;

    // Combo
    comboTimer: number = 0;
    combo: number = 1;
    maxCombo: number = 1;

    // Stats for end screen
    satellitesRescued: number = 0;
    aliensRescued: number = 0;

    // Trivia/Poll system
    isPaused: boolean = false;
    showTrivia: boolean = false;
    currentTrivia: TriviaQuestion | null = null;
    triviaAnswered: boolean = false;
    triviaCorrect: boolean = false;
    triviaIndex: number = 0;
    nextTriviaRescue: number = 10; // Trigger every 10 rescues
    triviaFeedbackTimer: number = 0;

    // Shuffled trivia questions from shared database (104 questions!)
    triviaQuestions: TriviaQuestion[] = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2 + 100; // Black hole lower on screen

        // Get shuffled trivia questions for unique gameplay each time
        this.triviaQuestions = getShuffledTrivia();

        this.shipX = width / 2;
        this.shipY = 150;
        this.shipTargetX = width / 2;
        this.shipTargetY = 150;

        this.initStars();
        this.initDebris();
    }

    initStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    initDebris() {
        for (let i = 0; i < 5; i++) {
            const orbitRadius = 100 + Math.random() * 80;
            this.debris.push({
                x: 0,
                y: 0,
                angle: Math.random() * Math.PI * 2,
                orbitRadius,
                orbitSpeed: (0.3 + Math.random() * 0.2) / (orbitRadius / 80),
                size: 12 + Math.random() * 12,
                rotation: Math.random() * Math.PI * 2
            });
        }
    }

    reset() {
        this.shipX = this.width / 2;
        this.shipY = 150;
        this.shipTargetX = this.width / 2;
        this.shipTargetY = 150;
        this.isGameOver = false;
        this.hasEscaped = false;
        this.score = 0;
        this.rescued = 0;
        this.lost = 0;
        this.wave = 1;
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 90;
        this.carrying = [];
        this.astronauts = [];
        this.particles = [];
        this.combo = 1;
        this.maxCombo = 1;
        this.comboTimer = 0;
        this.satellitesRescued = 0;
        this.aliensRescued = 0;
        // Trivia reset
        this.isPaused = false;
        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.triviaCorrect = false;
        this.triviaIndex = 0;
        this.nextTriviaRescue = 10;
        this.triviaFeedbackTimer = 0;
        // Reshuffle trivia for unique questions each game
        this.triviaQuestions = getShuffledTrivia();
        this.initDebris();
    }

    handleInput(mouseX: number, mouseY: number) {
        if (this.isGameOver || this.isPaused) return;
        this.shipTargetX = mouseX;
        this.shipTargetY = mouseY;
    }

    answerTrivia(answerIndex: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;
        this.triviaCorrect = answerIndex === this.currentTrivia.correct;

        if (this.triviaCorrect) {
            this.score += 500;
            // Bonus: extra carrying capacity for 30 seconds
            this.maxCarry = 5;
            setTimeout(() => { this.maxCarry = 3; }, 30000);
            soundManager.playPing();
        }

        // Show feedback for 3 seconds then resume
        this.triviaFeedbackTimer = 180;
    }

    spawnAstronaut() {
        // Spawn from edges, moving toward center
        const side = Math.floor(Math.random() * 3); // 0=left, 1=right, 2=top
        let x, y, vx, vy;

        const types: Astronaut['type'][] = ['astronaut', 'astronaut', 'astronaut', 'satellite', 'alien'];
        const type = types[Math.floor(Math.random() * types.length)];

        switch (side) {
            case 0: // Left
                x = -20;
                y = 150 + Math.random() * (this.height - 300);
                vx = 0.5 + Math.random() * 0.5;
                vy = (Math.random() - 0.5) * 0.5;
                break;
            case 1: // Right
                x = this.width + 20;
                y = 150 + Math.random() * (this.height - 300);
                vx = -(0.5 + Math.random() * 0.5);
                vy = (Math.random() - 0.5) * 0.5;
                break;
            default: // Top
                x = 100 + Math.random() * (this.width - 200);
                y = this.safeZoneHeight + 20;
                vx = (Math.random() - 0.5) * 0.5;
                vy = 0.3 + Math.random() * 0.3;
                break;
        }

        this.astronauts.push({
            x, y, vx, vy,
            rescued: false,
            delivered: false,
            type,
            wobble: Math.random() * Math.PI * 2,
            panicLevel: 0
        });
    }

    spawnParticle(x: number, y: number, vx: number, vy: number, color: string, size: number = 4) {
        this.particles.push({
            x, y, vx, vy,
            life: 30 + Math.random() * 20,
            maxLife: 50,
            size,
            color
        });
    }

    update(deltaTime: number = 1) {
        if (this.isGameOver) return;

        // Handle trivia pause
        if (this.isPaused && this.showTrivia) {
            if (this.triviaAnswered) {
                this.triviaFeedbackTimer -= deltaTime;
                if (this.triviaFeedbackTimer <= 0) {
                    this.isPaused = false;
                    this.showTrivia = false;
                    this.triviaAnswered = false;
                }
            }
            return; // Don't update game while paused
        }

        this.gameTime++;
        this.accretionRotation += 0.02 * deltaTime;

        // Spawn astronauts
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnAstronaut();
            this.spawnTimer = 0;
            // Speed up spawning as game progresses
            this.spawnInterval = Math.max(40, 90 - Math.floor(this.gameTime / 300) * 5);
        }

        // Wave progression
        const newWave = Math.floor(this.rescued / 5) + 1;
        if (newWave > this.wave) {
            this.wave = newWave;
            // Add more debris each wave
            if (this.debris.length < 12) {
                const orbitRadius = 90 + Math.random() * 100;
                this.debris.push({
                    x: 0, y: 0,
                    angle: Math.random() * Math.PI * 2,
                    orbitRadius,
                    orbitSpeed: (0.25 + Math.random() * 0.2) / (orbitRadius / 80),
                    size: 12 + Math.random() * 15,
                    rotation: 0
                });
            }
            // Increase gravity slightly
            this.gravitationalPull = Math.min(0.15, 0.08 + this.wave * 0.008);
        }

        // Move ship toward mouse (smooth follow)
        const dx = this.shipTargetX - this.shipX;
        const dy = this.shipTargetY - this.shipY;
        const shipLerp = 1 - Math.pow(1 - 0.12, deltaTime);
        this.shipX += dx * shipLerp;
        this.shipY += dy * shipLerp;

        // Update ship angle
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            this.shipAngle = Math.atan2(dy, dx);
        }

        // Keep ship in bounds
        this.shipX = Math.max(30, Math.min(this.width - 30, this.shipX));
        this.shipY = Math.max(30, Math.min(this.height - 30, this.shipY));

        // Check if ship is too close to black hole
        const shipDist = Math.sqrt((this.shipX - this.centerX) ** 2 + (this.shipY - this.centerY) ** 2);
        if (shipDist < this.eventHorizonRadius + 15) {
            this.isGameOver = true;
            this.hasEscaped = false;
            this.screenShake = 20;
            // Death explosion
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                this.spawnParticle(this.shipX, this.shipY, Math.cos(angle) * 5, Math.sin(angle) * 5, '#ff4444', 6);
            }
            return;
        }

        // Warning when close
        if (shipDist < this.eventHorizonRadius + 60) {
            this.warningPulse = Math.max(this.warningPulse, 0.5);
        }

        // Apply gravity to ship when in pull radius
        if (shipDist < this.pullRadius && shipDist > this.eventHorizonRadius) {
            const pullStrength = this.gravitationalPull * (1 - shipDist / this.pullRadius);
            const pullAngle = Math.atan2(this.centerY - this.shipY, this.centerX - this.shipX);
            this.shipX += Math.cos(pullAngle) * pullStrength * 3 * deltaTime;
            this.shipY += Math.sin(pullAngle) * pullStrength * 3 * deltaTime;
        }

        // Update astronauts
        for (let i = this.astronauts.length - 1; i >= 0; i--) {
            const astro = this.astronauts[i];
            if (astro.rescued) continue;

            astro.wobble += 0.1 * deltaTime;

            // Apply gravity toward black hole
            const astroDx = this.centerX - astro.x;
            const astroDy = this.centerY - astro.y;
            const astroDist = Math.sqrt(astroDx * astroDx + astroDy * astroDy);

            if (astroDist < this.pullRadius) {
                const pullStrength = this.gravitationalPull * (1 - astroDist / this.pullRadius) * 1.2;
                astro.vx += (astroDx / astroDist) * pullStrength * deltaTime;
                astro.vy += (astroDy / astroDist) * pullStrength * deltaTime;

                // Increase panic as they get closer
                astro.panicLevel = Math.min(1, 1 - astroDist / this.pullRadius);
            }

            // Apply velocity
            astro.x += astro.vx * deltaTime;
            astro.y += astro.vy * deltaTime;

            // Check if fallen into black hole
            if (astroDist < this.eventHorizonRadius) {
                this.astronauts.splice(i, 1);
                this.lost++;
                this.combo = 1;
                this.screenShake = 8;
                // Sad particles
                for (let j = 0; j < 10; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    this.spawnParticle(astro.x, astro.y, Math.cos(angle) * 2, Math.sin(angle) * 2, '#ff8888', 3);
                }

                // Game over if too many lost
                if (this.lost >= 5) {
                    this.isGameOver = true;
                    this.hasEscaped = false;
                }
                continue;
            }

            // Check if ship can rescue (if not carrying max)
            if (this.carrying.length < this.maxCarry) {
                const rescueDist = Math.sqrt((this.shipX - astro.x) ** 2 + (this.shipY - astro.y) ** 2);
                if (rescueDist < this.shipSize + 18) {
                    astro.rescued = true;
                    this.carrying.push(astro);
                    this.astronauts.splice(i, 1);

                    // Pickup particles
                    for (let j = 0; j < 8; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        this.spawnParticle(astro.x, astro.y, Math.cos(angle) * 3, Math.sin(angle) * 3, '#88ff88', 4);
                    }
                    soundManager.playCollect();
                }
            }
        }

        // Update carrying astronauts (follow ship)
        this.carrying.forEach((astro, idx) => {
            // const followAngle = this.shipAngle + Math.PI + (idx - 1) * 0.4; // Unused but kept for reference if needed
            const followDist = 25 + idx * 12;
            const targetX = this.shipX - Math.cos(this.shipAngle) * followDist;
            const targetY = this.shipY - Math.sin(this.shipAngle) * followDist;
            astro.x += (targetX - astro.x) * 0.2;
            astro.y += (targetY - astro.y) * 0.2;
        });

        // Deliver to safe zone (top of screen)
        if (this.shipY < this.safeZoneHeight && this.carrying.length > 0) {
            const delivered = this.carrying.length;
            this.carrying.forEach(astro => {
                if (astro.type === 'satellite') this.satellitesRescued++;
                else if (astro.type === 'alien') this.aliensRescued++;

                // Celebration particles
                for (let j = 0; j < 12; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const color = astro.type === 'alien' ? '#88ff88' : astro.type === 'satellite' ? '#88ccff' : '#ffcc00';
                    this.spawnParticle(astro.x, astro.y, Math.cos(angle) * 4, Math.sin(angle) * 4, color, 5);
                }
            });

            this.rescued += delivered;
            this.carrying = [];
            this.rescueFlash = 1;

            // Combo
            this.combo = Math.min(5, this.combo + delivered * 0.5);
            this.comboTimer = 120;
            this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));

            // Score
            const baseScore = delivered * 100;
            this.score += Math.floor(baseScore * this.combo);

            // Win condition
            if (this.rescued >= this.rescueGoal) {
                this.isGameOver = true;
                this.hasEscaped = true;
            }

            // Trigger trivia every 10 rescues
            if (this.rescued >= this.nextTriviaRescue && !this.isGameOver) {
                this.isPaused = true;
                this.showTrivia = true;
                this.triviaAnswered = false;
                this.triviaCorrect = false;
                this.currentTrivia = this.triviaQuestions[this.triviaIndex % this.triviaQuestions.length];
                this.triviaIndex++;
                this.nextTriviaRescue += 10;
            }
        }

        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
        } else if (this.combo > 1) {
            this.combo = Math.max(1, this.combo - 0.01 * deltaTime);
        }

        // Update debris (orbiting black hole)
        this.debris.forEach(d => {
            d.angle += d.orbitSpeed * 0.03 * deltaTime;
            d.x = this.centerX + Math.cos(d.angle) * d.orbitRadius;
            d.y = this.centerY + Math.sin(d.angle) * d.orbitRadius;
            d.rotation += 0.02 * deltaTime;

            // Check collision with ship
            const debrisDist = Math.sqrt((this.shipX - d.x) ** 2 + (this.shipY - d.y) ** 2);
            if (debrisDist < this.shipSize + d.size * 0.4) {
                this.screenShake = 10;
                // Bounce ship away
                const bounceAngle = Math.atan2(this.shipY - d.y, this.shipX - d.x);
                this.shipX += Math.cos(bounceAngle) * 30;
                this.shipY += Math.sin(bounceAngle) * 30;
                // Drop one carried astronaut
                if (this.carrying.length > 0) {
                    const dropped = this.carrying.pop()!;
                    dropped.rescued = false;
                    dropped.x = this.shipX;
                    dropped.y = this.shipY;
                    dropped.vx = Math.cos(bounceAngle) * 2;
                    dropped.vy = Math.sin(bounceAngle) * 2;
                    this.astronauts.push(dropped);
                }
            }
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.life -= deltaTime;

            // Gravity on particles near black hole
            const pdist = Math.sqrt((p.x - this.centerX) ** 2 + (p.y - this.centerY) ** 2);
            if (pdist < this.pullRadius && pdist > 30) {
                const pAngle = Math.atan2(this.centerY - p.y, this.centerX - p.x);
                p.vx += Math.cos(pAngle) * 0.05 * deltaTime;
                p.vy += Math.sin(pAngle) * 0.05 * deltaTime;
            }

            return p.life > 0;
        });

        // Spawn accretion disk particles
        if (Math.random() < 0.15) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.eventHorizonRadius + 5 + Math.random() * 30;
            this.spawnParticle(
                this.centerX + Math.cos(angle) * radius,
                this.centerY + Math.sin(angle) * radius,
                Math.cos(angle + Math.PI / 2) * 1.5,
                Math.sin(angle + Math.PI / 2) * 1.5,
                `hsl(${30 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%)`,
                2
            );
        }

        // Visual effects decay
        this.screenShake *= Math.pow(0.9, deltaTime);
        this.rescueFlash *= Math.pow(0.92, deltaTime);
        this.warningPulse *= Math.pow(0.95, deltaTime);

        // Update star twinkle
        this.stars.forEach(s => s.twinkle += 0.03 * deltaTime);
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // Screen shake
        if (this.screenShake > 0.5) {
            ctx.translate((Math.random() - 0.5) * this.screenShake * 2, (Math.random() - 0.5) * this.screenShake * 2);
        }

        // Background
        this.drawBackground(ctx);

        // Stars
        this.drawStars(ctx);

        // Safe zone
        this.drawSafeZone(ctx);

        // Accretion disk
        this.drawAccretionDisk(ctx);

        // Particles (behind everything)
        this.drawParticles(ctx);

        // Debris
        this.drawDebris(ctx);

        // Black hole
        this.drawBlackHole(ctx);

        // Astronauts
        this.drawAstronauts(ctx);

        // Ship + carrying
        if (!this.isGameOver || this.hasEscaped) {
            this.drawShip(ctx);
        }

        // UI
        this.drawUI(ctx);

        // Warning overlay
        if (this.warningPulse > 0.1) {
            ctx.fillStyle = `rgba(255, 50, 50, ${this.warningPulse * 0.2})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Rescue flash
        if (this.rescueFlash > 0.1) {
            ctx.fillStyle = `rgba(100, 255, 150, ${this.rescueFlash * 0.15})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Trivia overlay
        if (this.showTrivia) {
            this.drawTrivia(ctx);
        }

        ctx.restore();
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        // Deep space gradient
        const grad = ctx.createRadialGradient(this.centerX, this.centerY, 0, this.centerX, this.centerY, this.width);
        grad.addColorStop(0, '#0a0018');
        grad.addColorStop(0.2, '#050012');
        grad.addColorStop(0.5, '#02000a');
        grad.addColorStop(1, '#000005');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Nebula clouds
        const t = this.gameTime * 0.003;
        for (let i = 0; i < 4; i++) {
            const nebulaX = (this.width * 0.2 + i * 300 + Math.sin(t + i) * 50) % (this.width + 200) - 100;
            const nebulaY = 150 + i * 150 + Math.cos(t * 0.7 + i) * 30;
            const nebulaGrad = ctx.createRadialGradient(nebulaX, nebulaY, 0, nebulaX, nebulaY, 180);
            const hue = [280, 320, 200, 260][i];
            nebulaGrad.addColorStop(0, `hsla(${hue}, 80%, 30%, 0.08)`);
            nebulaGrad.addColorStop(0.5, `hsla(${hue}, 60%, 20%, 0.04)`);
            nebulaGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = nebulaGrad;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Subtle vignette
        const vignette = ctx.createRadialGradient(this.width / 2, this.height / 2, this.height * 0.3, this.width / 2, this.height / 2, this.width * 0.8);
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    drawStars(ctx: CanvasRenderingContext2D) {
        this.stars.forEach((star, idx) => {
            // Gravitational lensing near black hole
            const dx = star.x - this.centerX;
            const dy = star.y - this.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.eventHorizonRadius + 30) return;

            // Lensing distortion effect near singularity
            let drawX = star.x;
            let drawY = star.y;
            if (dist < 200) {
                const lensStrength = (200 - dist) / 200 * 0.3;
                drawX += dx * lensStrength * 0.2;
                drawY += dy * lensStrength * 0.2;
            }

            const alpha = 0.5 + Math.sin(star.twinkle) * 0.4;
            const starColors = ['#ffffff', '#ffe4c4', '#cce8ff', '#ffffcc', '#ffd4e4'];
            const color = starColors[idx % starColors.length];

            // Star glow
            if (star.size > 1.5) {
                ctx.beginPath();
                ctx.arc(drawX, drawY, star.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.1})`;
                ctx.fill();
            }

            // Star core
            ctx.beginPath();
            ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = alpha;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }

    drawSafeZone(ctx: CanvasRenderingContext2D) {
        const grad = ctx.createLinearGradient(0, 0, 0, this.safeZoneHeight);
        grad.addColorStop(0, 'rgba(50, 200, 100, 0.3)');
        grad.addColorStop(1, 'rgba(50, 200, 100, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.safeZoneHeight);

        ctx.strokeStyle = 'rgba(100, 255, 150, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(0, this.safeZoneHeight);
        ctx.lineTo(this.width, this.safeZoneHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 14px Orbitron';
        ctx.fillStyle = 'rgba(100, 255, 150, 0.7)';
        ctx.textAlign = 'center';
        ctx.fillText('🏠 SAFE ZONE - Deliver survivors here!', this.width / 2, 25);
    }

    drawAccretionDisk(ctx: CanvasRenderingContext2D) {
        for (let ring = 0; ring < 4; ring++) {
            const radius = this.eventHorizonRadius + 8 + ring * 10;
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, ${100 + ring * 30}, 50, ${0.4 - ring * 0.08})`;
            ctx.lineWidth = 5;
            ctx.stroke();
        }
    }

    drawParticles(ctx: CanvasRenderingContext2D) {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    drawDebris(ctx: CanvasRenderingContext2D) {
        this.debris.forEach(d => {
            ctx.save();
            ctx.translate(d.x, d.y);
            ctx.rotate(d.rotation);

            // Rocky asteroid shape
            ctx.beginPath();
            ctx.moveTo(-d.size / 2, -d.size / 3);
            ctx.lineTo(d.size / 3, -d.size / 2);
            ctx.lineTo(d.size / 2, d.size / 4);
            ctx.lineTo(-d.size / 4, d.size / 2);
            ctx.lineTo(-d.size / 2, 0);
            ctx.closePath();

            ctx.fillStyle = '#4a4a5a';
            ctx.fill();
            ctx.strokeStyle = '#6a6a7a';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });
    }

    drawBlackHole(ctx: CanvasRenderingContext2D) {
        const t = this.gameTime * 0.02;

        // Outer gravitational distortion field
        for (let i = 5; i >= 0; i--) {
            const radius = this.eventHorizonRadius + 60 + i * 25;
            const alpha = 0.03 + Math.sin(t + i) * 0.02;
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(100, 50, 150, ${alpha})`;
            ctx.lineWidth = 15;
            ctx.stroke();
        }

        // Rotating accretion disk - outer glow
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.accretionRotation * 0.5);

        for (let ring = 6; ring >= 0; ring--) {
            const radius = this.eventHorizonRadius + 15 + ring * 12;
            const hue = 30 + ring * 8;
            const lightness = 50 + ring * 5;
            const alpha = 0.6 - ring * 0.07;

            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(${hue}, 100%, ${lightness}%, ${alpha})`;
            ctx.lineWidth = 8 - ring * 0.5;
            ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
            ctx.shadowBlur = 15;
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.restore();

        // Photon sphere (bright ring at 1.5x event horizon)
        const photonRadius = this.eventHorizonRadius * 1.3;
        const photonPulse = 0.7 + Math.sin(t * 2) * 0.3;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, photonRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 200, 100, ${photonPulse * 0.5})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ffcc44';
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Dark shadow void
        const shadowGrad = ctx.createRadialGradient(
            this.centerX, this.centerY, this.blackHoleRadius * 0.5,
            this.centerX, this.centerY, this.blackHoleRadius + 30
        );
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        shadowGrad.addColorStop(0.7, 'rgba(0, 0, 0, 1)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.blackHoleRadius + 30, 0, Math.PI * 2);
        ctx.fill();

        // Core - absolute black
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.blackHoleRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        // Event horizon edge glow
        const ehPulse = 0.5 + Math.sin(t * 1.5) * 0.3;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.eventHorizonRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 80, 255, ${ehPulse})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#aa44ff';
        ctx.shadowBlur = 25;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Danger label
        ctx.font = 'bold 11px Orbitron';
        ctx.fillStyle = `rgba(255, 80, 80, ${0.6 + Math.sin(t * 3) * 0.3})`;
        ctx.textAlign = 'center';
        ctx.fillText('☠️ SINGULARITY ☠️', this.centerX, this.centerY + this.eventHorizonRadius + 30);
    }

    drawAstronauts(ctx: CanvasRenderingContext2D) {
        this.astronauts.forEach(astro => {
            ctx.save();
            ctx.translate(astro.x, astro.y);

            // Wobble animation
            const wobble = Math.sin(astro.wobble) * 0.15;
            ctx.rotate(wobble);

            // Panic effect (shake more when closer to black hole)
            if (astro.panicLevel > 0.3) {
                ctx.translate((Math.random() - 0.5) * astro.panicLevel * 4, (Math.random() - 0.5) * astro.panicLevel * 4);
            }

            if (astro.type === 'astronaut') {
                // Body (white suit)
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(0, 0, 10, 14, 0, 0, Math.PI * 2);
                ctx.fill();

                // Helmet
                ctx.fillStyle = astro.panicLevel > 0.5 ? '#ffaaaa' : '#aaddff';
                ctx.beginPath();
                ctx.arc(0, -6, 8, 0, Math.PI * 2);
                ctx.fill();

                // Face
                ctx.fillStyle = '#ffddaa';
                ctx.beginPath();
                ctx.arc(0, -6, 5, 0, Math.PI * 2);
                ctx.fill();

                // SOS indicator when panicking
                if (astro.panicLevel > 0.4) {
                    ctx.font = 'bold 10px Arial';
                    ctx.fillStyle = '#ff4444';
                    ctx.textAlign = 'center';
                    ctx.fillText('SOS!', 0, -22);
                }
            } else if (astro.type === 'satellite') {
                // Satellite body
                ctx.fillStyle = '#88aacc';
                ctx.fillRect(-8, -6, 16, 12);
                // Solar panels
                ctx.fillStyle = '#4488aa';
                ctx.fillRect(-22, -3, 12, 6);
                ctx.fillRect(10, -3, 12, 6);
                // Antenna
                ctx.strokeStyle = '#cccccc';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.lineTo(0, -16);
                ctx.stroke();
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.arc(0, -16, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Alien! (cute green blob)
                ctx.fillStyle = '#44ff88';
                ctx.beginPath();
                ctx.ellipse(0, 0, 12, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(-4, -2, 4, 0, Math.PI * 2);
                ctx.arc(4, -2, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(-3, -3, 2, 0, Math.PI * 2);
                ctx.arc(5, -3, 2, 0, Math.PI * 2);
                ctx.fill();
                // Antenna
                ctx.strokeStyle = '#44ff88';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-4, -10);
                ctx.lineTo(-6, -18);
                ctx.moveTo(4, -10);
                ctx.lineTo(6, -18);
                ctx.stroke();
            }

            ctx.restore();
        });
    }

    drawShip(ctx: CanvasRenderingContext2D) {
        // Draw carrying astronauts first (behind ship)
        this.carrying.forEach(astro => {
            ctx.save();
            ctx.translate(astro.x, astro.y);
            ctx.scale(0.7, 0.7);

            if (astro.type === 'astronaut') {
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(0, 0, 8, 10, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#88ff88';
                ctx.beginPath();
                ctx.arc(0, -4, 6, 0, Math.PI * 2);
                ctx.fill();
            } else if (astro.type === 'satellite') {
                ctx.fillStyle = '#88aacc';
                ctx.fillRect(-6, -4, 12, 8);
                ctx.fillStyle = '#4488aa';
                ctx.fillRect(-14, -2, 6, 4);
                ctx.fillRect(8, -2, 6, 4);
            } else {
                ctx.fillStyle = '#44ff88';
                ctx.beginPath();
                ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        });

        // Draw ship
        ctx.save();
        ctx.translate(this.shipX, this.shipY);
        ctx.rotate(this.shipAngle);

        // Animated engine flames
        const flameLength = 20 + Math.sin(this.gameTime * 0.5) * 8;
        const flameGrad = ctx.createLinearGradient(-15 - flameLength, 0, -12, 0);
        flameGrad.addColorStop(0, 'rgba(255, 100, 50, 0)');
        flameGrad.addColorStop(0.3, 'rgba(255, 150, 50, 0.6)');
        flameGrad.addColorStop(0.6, 'rgba(100, 200, 255, 0.8)');
        flameGrad.addColorStop(1, 'rgba(200, 230, 255, 1)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(-12, -5);
        ctx.lineTo(-15 - flameLength, 0);
        ctx.lineTo(-12, 5);
        ctx.closePath();
        ctx.fill();

        // Engine glow
        ctx.shadowColor = '#44aaff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = 'rgba(100, 200, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-12, 0, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Ship body with metallic gradient
        ctx.beginPath();
        ctx.moveTo(22, 0);
        ctx.lineTo(-10, -14);
        ctx.lineTo(-6, -4);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-6, 4);
        ctx.lineTo(-10, 14);
        ctx.closePath();

        const shipGrad = ctx.createLinearGradient(-10, -14, 22, 14);
        shipGrad.addColorStop(0, '#3366cc');
        shipGrad.addColorStop(0.3, '#5588ee');
        shipGrad.addColorStop(0.5, '#77aaff');
        shipGrad.addColorStop(0.7, '#5588ee');
        shipGrad.addColorStop(1, '#4477dd');
        ctx.fillStyle = shipGrad;
        ctx.fill();
        ctx.strokeStyle = '#aaccff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Wing accents
        ctx.strokeStyle = '#66aaff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-5, -10);
        ctx.lineTo(10, -3);
        ctx.moveTo(-5, 10);
        ctx.lineTo(10, 3);
        ctx.stroke();

        // Cockpit glow
        ctx.shadowColor = '#aaddff';
        ctx.shadowBlur = 10;
        ctx.fillStyle = 'rgba(180, 220, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(8, 0, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Cockpit highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(6, -2, 3, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Carrying indicator with glow
        if (this.carrying.length > 0) {
            ctx.shadowColor = '#88ff88';
            ctx.shadowBlur = 10;
            ctx.font = 'bold 14px Orbitron';
            ctx.fillStyle = '#88ff88';
            ctx.textAlign = 'center';
            ctx.fillText(`🧑‍🚀 x${this.carrying.length}`, this.shipX, this.shipY - 38);
            ctx.shadowBlur = 0;
        }
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // Rescued counter
        ctx.font = 'bold 20px Orbitron';
        ctx.fillStyle = '#88ff88';
        ctx.textAlign = 'left';
        ctx.fillText(`RESCUED: ${this.rescued}/${this.rescueGoal}`, 20, 60);

        // Progress bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(20, 68, 200, 14);
        ctx.fillStyle = '#88ff88';
        ctx.fillRect(22, 70, Math.min(196, (this.rescued / this.rescueGoal) * 196), 10);

        // Lost counter
        ctx.font = '14px Orbitron';
        ctx.fillStyle = '#ff8888';
        ctx.fillText(`Lost: ${this.lost}/5`, 20, 100);

        // Wave
        ctx.font = 'bold 16px Orbitron';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`WAVE ${this.wave}`, 20, 125);

        // Score
        ctx.font = 'bold 18px Orbitron';
        ctx.fillStyle = '#ffcc00';
        ctx.textAlign = 'right';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.width - 20, 60);

        // Combo
        if (this.combo > 1) {
            ctx.font = 'bold 16px Orbitron';
            ctx.fillStyle = `rgba(255, 150, 255, ${0.7 + Math.sin(this.gameTime * 0.1) * 0.3})`;
            ctx.fillText(`${this.combo.toFixed(1)}x COMBO`, this.width - 20, 85);
        }

        // Capacity
        ctx.font = '14px Orbitron';
        ctx.fillStyle = this.carrying.length >= this.maxCarry ? '#ffaa00' : '#88ccff';
        ctx.fillText(`Carrying: ${this.carrying.length}/${this.maxCarry}`, this.width - 20, 110);

        // Instructions at bottom
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, this.height - 40, this.width, 40);

        ctx.font = '13px Orbitron';
        ctx.fillStyle = '#aaaaaa';
        ctx.textAlign = 'center';
        ctx.fillText('🖱️ Move mouse to control ship | Rescue drifting survivors | Deliver to green zone | Avoid debris!', this.width / 2, this.height - 16);
    }

    drawTrivia(ctx: CanvasRenderingContext2D) {
        if (!this.showTrivia || !this.currentTrivia) return;

        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, this.width, this.height);

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const panelWidth = 600;
        const panelHeight = 400;

        // Panel background with gradient
        const panelGrad = ctx.createLinearGradient(centerX - panelWidth / 2, centerY - panelHeight / 2, centerX + panelWidth / 2, centerY + panelHeight / 2);
        panelGrad.addColorStop(0, '#1a0a2e');
        panelGrad.addColorStop(1, '#0d0520');
        ctx.fillStyle = panelGrad;
        ctx.beginPath();
        ctx.roundRect(centerX - panelWidth / 2, centerY - panelHeight / 2, panelWidth, panelHeight, 20);
        ctx.fill();

        // Panel border
        ctx.strokeStyle = '#6b21a8';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Header
        ctx.font = 'bold 18px Orbitron';
        ctx.fillStyle = '#a855f7';
        ctx.textAlign = 'center';
        ctx.fillText('🧠 BLACK HOLE TRIVIA 🕳️', centerX, centerY - 150);

        // Question
        ctx.font = 'bold 22px Orbitron';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.currentTrivia.question, centerX, centerY - 100);

        // Answer buttons
        const buttonWidth = 260;
        const buttonHeight = 50;
        const startY = centerY - 40;
        const gap = 60;

        this.currentTrivia.answers.forEach((answer, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const x = centerX - buttonWidth - 10 + col * (buttonWidth + 20);
            const y = startY + row * gap;

            let bgColor = '#2d1b4e';
            let borderColor = '#6b21a8';

            if (this.triviaAnswered) {
                if (idx === this.currentTrivia!.correct) {
                    bgColor = '#166534';
                    borderColor = '#22c55e';
                } else if (idx !== this.currentTrivia!.correct) {
                    bgColor = '#7f1d1d';
                    borderColor = '#ef4444';
                }
            }

            // Button background
            ctx.fillStyle = bgColor;
            ctx.beginPath();
            ctx.roundRect(x, y, buttonWidth, buttonHeight, 10);
            ctx.fill();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Button text
            ctx.font = '16px Orbitron';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(answer, x + buttonWidth / 2, y + buttonHeight / 2 + 6);
        });

        // Show fact after answering
        if (this.triviaAnswered && this.currentTrivia.fact) {
            const factY = startY + gap * 2 + 30;
            ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
            ctx.beginPath();
            ctx.roundRect(centerX - panelWidth / 2 + 20, factY, panelWidth - 40, 60, 10);
            ctx.fill();

            ctx.font = '14px Orbitron';
            ctx.fillStyle = this.triviaCorrect ? '#22c55e' : '#f97316';
            ctx.textAlign = 'center';
            const prefix = this.triviaCorrect ? '✓ CORRECT! ' : '✗ Wrong! ';
            ctx.fillText(prefix + this.currentTrivia.fact.substring(0, 70), centerX, factY + 25);
            if (this.currentTrivia.fact.length > 70) {
                ctx.fillText(this.currentTrivia.fact.substring(70), centerX, factY + 45);
            }

            // Bonus notification
            if (this.triviaCorrect) {
                ctx.font = 'bold 16px Orbitron';
                ctx.fillStyle = '#fbbf24';
                ctx.fillText('🎁 +500 points & Carry 5 for 30s!', centerX, factY + 80);
            }
        }
    }

    // Helper to get trivia button bounds (for click handling in page)
    getTriviaButtonBounds(): { x: number, y: number, width: number, height: number, index: number }[] {
        if (!this.showTrivia || !this.currentTrivia || this.triviaAnswered) return [];

        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const buttonWidth = 260;
        const buttonHeight = 50;
        const startY = centerY - 40;
        const gap = 60;

        return this.currentTrivia.answers.map((_, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            return {
                x: centerX - buttonWidth - 10 + col * (buttonWidth + 20),
                y: startY + row * gap,
                width: buttonWidth,
                height: buttonHeight,
                index: idx
            };
        });
    }
}
