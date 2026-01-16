// Uranus Game Logic - "Polar Night"
// ENDLESS Red Light Green Light inspired by Uranus's 42-year seasons
// Move during SUMMER (light), freeze during WINTER (dark)

interface Collectible {
    x: number;
    y: number;
    collected: boolean;
    value: number; // Different stardust values
    type: 'normal' | 'bonus' | 'mega';
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

interface Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class UranusGameLogic {
    width: number;
    height: number;

    // Player
    playerX: number;
    playerY: number;
    playerRadius = 18;
    targetX: number;
    targetY: number;
    lastX: number;
    lastY: number;

    // Season state
    isSummer = true;
    seasonTimer = 0;
    baseSummerDuration = 180;
    baseWinterDuration = 90;
    summerDuration = 180;
    winterDuration = 90;
    warningFrames = 30;

    // Game state
    score = 0;
    stardustCollected = 0;
    level = 1;
    isGameOver = false;
    combo = 1; // Multiplier for consecutive level completions
    maxCombo = 1;
    totalLevelsCompleted = 0;

    // Session cap
    readonly STARDUST_CAP = 60;

    // Goal
    goalX: number;
    goalY: number;
    goalRadius = 35;

    // Entities
    collectibles: Collectible[] = [];
    obstacles: Obstacle[] = [];
    particles: Particle[] = [];

    // Visual
    screenBrightness = 1;
    frameCount = 0;

    // Movement detection
    movementThreshold = 2.5;

    // Timer for survival bonus
    survivalTime = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.playerX = 100;
        this.playerY = height / 2;
        this.targetX = this.playerX;
        this.targetY = this.playerY;
        this.lastX = this.playerX;
        this.lastY = this.playerY;
        this.goalX = width - 100;
        this.goalY = height / 2;
        this.generateLevel(1);
    }

    reset() {
        this.playerX = 100;
        this.playerY = this.height / 2;
        this.targetX = this.playerX;
        this.targetY = this.playerY;
        this.lastX = this.playerX;
        this.lastY = this.playerY;
        this.score = 0;
        this.stardustCollected = 0;
        this.level = 1;
        this.isGameOver = false;
        this.isSummer = true;
        this.seasonTimer = 0;
        this.screenBrightness = 1;
        this.particles = [];
        this.frameCount = 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.totalLevelsCompleted = 0;
        this.survivalTime = 0;
        this.generateLevel(1);
    }

    generateLevel(level: number) {
        this.collectibles = [];
        this.obstacles = [];
        this.isSummer = true;
        this.seasonTimer = 0;
        this.screenBrightness = 1;

        // Increase difficulty: shorter summers, longer winters
        this.summerDuration = Math.max(80, this.baseSummerDuration - level * 8);
        this.winterDuration = Math.min(180, this.baseWinterDuration + level * 5);

        // Randomize goal position (but always on right side)
        this.goalX = this.width - 80 - Math.random() * 50;
        this.goalY = 100 + Math.random() * (this.height - 200);

        // Player start (left side, random Y)
        this.playerX = 80 + Math.random() * 50;
        this.playerY = 100 + Math.random() * (this.height - 200);
        this.targetX = this.playerX;
        this.targetY = this.playerY;
        this.lastX = this.playerX;
        this.lastY = this.playerY;

        // More obstacles at higher levels
        const numObstacles = Math.min(8, 1 + Math.floor(level / 2));
        for (let i = 0; i < numObstacles; i++) {
            const obs: Obstacle = {
                x: 180 + Math.random() * (this.width - 400),
                y: 40 + Math.random() * (this.height - 120),
                width: 50 + Math.random() * 70,
                height: 30 + Math.random() * 50
            };

            // Don't block start or goal
            const distToStart = Math.hypot(obs.x - this.playerX, obs.y - this.playerY);
            const distToGoal = Math.hypot(obs.x - this.goalX, obs.y - this.goalY);

            if (distToStart > 120 && distToGoal > 120) {
                this.obstacles.push(obs);
            }
        }

        // More collectibles with BALANCED values
        const numCollectibles = Math.min(12, 4 + level);
        for (let i = 0; i < numCollectibles; i++) {
            const roll = Math.random();
            let type: 'normal' | 'bonus' | 'mega' = 'normal';
            let value = 2; // REDUCED from 5

            // Higher levels = more chance of bonus collectibles
            if (roll > 0.93) { // Rarer mega
                type = 'mega';
                value = 8; // REDUCED from 25
            } else if (roll > 0.75) {
                type = 'bonus';
                value = 4; // REDUCED from 10
            }

            const c: Collectible = {
                x: 150 + Math.random() * (this.width - 350),
                y: 60 + Math.random() * (this.height - 120),
                collected: false,
                value,
                type
            };
            this.collectibles.push(c);
        }
    }

    handleInput(x: number, y: number) {
        this.targetX = x;
        this.targetY = y;
    }

    update() {
        if (this.isGameOver) return;

        this.frameCount++;
        this.survivalTime++;

        // Survival bonus every 10 seconds
        if (this.survivalTime % 600 === 0) {
            this.score += 50 * this.level;
            this.stardustCollected += Math.floor(this.level / 2) + 1;
        }

        // --- SEASON CYCLE ---
        this.seasonTimer++;

        const currentDuration = this.isSummer ? this.summerDuration : this.winterDuration;

        if (this.seasonTimer >= currentDuration) {
            this.seasonTimer = 0;
            this.isSummer = !this.isSummer;

            // Bonus for surviving each winter
            if (this.isSummer) {
                this.score += 20 * this.combo;
            }
        }

        // Smooth brightness transition
        const targetBrightness = this.isSummer ? 1 : 0.12;
        this.screenBrightness += (targetBrightness - this.screenBrightness) * 0.15;

        // --- MOVEMENT ---
        const prevX = this.playerX;
        const prevY = this.playerY;

        // Only move during summer
        if (this.isSummer) {
            this.playerX += (this.targetX - this.playerX) * 0.12;
            this.playerY += (this.targetY - this.playerY) * 0.12;
        }

        // Clamp to bounds
        this.playerX = Math.max(this.playerRadius + 10, Math.min(this.width - this.playerRadius - 10, this.playerX));
        this.playerY = Math.max(this.playerRadius + 10, Math.min(this.height - this.playerRadius - 10, this.playerY));

        // --- MOVEMENT DETECTION DURING WINTER ---
        if (!this.isSummer) {
            const targetMoved = Math.hypot(this.targetX - this.lastX, this.targetY - this.lastY);

            // If cursor moved significantly during winter
            if (targetMoved > this.movementThreshold * 4) {
                this.gameOver();
                return;
            }
        }

        // Update last position at end of summer
        if (this.isSummer && this.seasonTimer >= this.summerDuration - 1) {
            this.lastX = this.playerX;
            this.lastY = this.playerY;
        }

        // --- OBSTACLE COLLISION ---
        for (const obs of this.obstacles) {
            if (this.playerX + this.playerRadius > obs.x &&
                this.playerX - this.playerRadius < obs.x + obs.width &&
                this.playerY + this.playerRadius > obs.y &&
                this.playerY - this.playerRadius < obs.y + obs.height) {

                this.playerX = prevX;
                this.playerY = prevY;
            }
        }

        // --- COLLECTIBLES (with session cap) ---
        for (const c of this.collectibles) {
            if (!c.collected) {
                const dist = Math.hypot(this.playerX - c.x, this.playerY - c.y);
                if (dist < this.playerRadius + 15) {
                    c.collected = true;
                    // Apply session cap
                    const valueToAdd = Math.min(c.value, this.STARDUST_CAP - this.stardustCollected);
                    if (valueToAdd > 0) {
                        this.stardustCollected += valueToAdd;
                    }
                    this.score += c.value * 8 * Math.floor(this.combo);

                    const color = c.type === 'mega' ? '#ff00ff' : c.type === 'bonus' ? '#00ffff' : '#ffd700';
                    this.createExplosion(c.x, c.y, color);
                }
            }
        }

        // --- GOAL CHECK ---
        const goalDist = Math.hypot(this.playerX - this.goalX, this.playerY - this.goalY);
        if (goalDist < this.playerRadius + this.goalRadius) {
            this.levelComplete();
        }

        // --- PARTICLES ---
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // Gravity
            p.life -= 0.02;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Ambient ice particles during winter
        if (!this.isSummer && this.frameCount % 4 === 0) {
            this.particles.push({
                x: Math.random() * this.width,
                y: -10,
                vx: (Math.random() - 0.5) * 2,
                vy: 2 + Math.random() * 2,
                life: 1,
                color: '#a5f3fc',
                size: 2 + Math.random() * 3
            });
        }
    }

    createExplosion(x: number, y: number, color: string) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * (3 + Math.random() * 2),
                vy: Math.sin(angle) * (3 + Math.random() * 2),
                life: 1,
                color,
                size: 5 + Math.random() * 3
            });
        }
    }

    levelComplete() {
        // Level completion rewards (BALANCED)
        const levelBonus = 100 + this.level * 25;
        const comboBonus = Math.floor(this.combo) * 50;
        const collectedAll = this.collectibles.every(c => c.collected);
        const perfectBonus = collectedAll ? 100 : 0;

        this.score += levelBonus + comboBonus + perfectBonus;

        // Stardust with session cap (REDUCED: was 5+level*2)
        const stardustGain = 2 + (collectedAll ? 3 : 0);
        if (this.stardustCollected < this.STARDUST_CAP) {
            this.stardustCollected = Math.min(this.STARDUST_CAP, this.stardustCollected + stardustGain);
        }

        // Increase combo (capped at x3 instead of x5)
        this.combo = Math.min(3, this.combo + 1);
        this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));
        this.totalLevelsCompleted++;

        this.createExplosion(this.goalX, this.goalY, '#00ff00');

        // Show level complete briefly, then continue
        this.level++;

        setTimeout(() => {
            if (!this.isGameOver) {
                this.generateLevel(this.level);
            }
        }, 800);
    }

    gameOver() {
        this.isGameOver = true;
        this.combo = 1;

        // Final survival bonus
        const survivalBonus = Math.floor(this.survivalTime / 60);
        this.stardustCollected += survivalBonus;
        this.score += survivalBonus * 10;

        // Shatter effect
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                color: '#a5f3fc',
                size: 6 + Math.random() * 4
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // --- BACKGROUND ---
        const summerColor = { r: 13, g: 79, b: 92 };
        const winterColor = { r: 5, g: 12, b: 25 };

        const r = Math.floor(summerColor.r * this.screenBrightness + winterColor.r * (1 - this.screenBrightness));
        const g = Math.floor(summerColor.g * this.screenBrightness + winterColor.g * (1 - this.screenBrightness));
        const b = Math.floor(summerColor.b * this.screenBrightness + winterColor.b * (1 - this.screenBrightness));

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        const starOpacity = 0.2 + (1 - this.screenBrightness) * 0.6;
        ctx.fillStyle = `rgba(255, 255, 255, ${starOpacity})`;
        for (let i = 0; i < 80; i++) {
            const x = (i * 137) % this.width;
            const y = (i * 89) % this.height;
            const size = (i % 3) + 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- SEASON INDICATOR ---
        const timeRemaining = this.isSummer ?
            this.summerDuration - this.seasonTimer :
            this.winterDuration - this.seasonTimer;
        const isWarning = this.isSummer && timeRemaining < this.warningFrames;

        ctx.font = 'bold 36px Orbitron, sans-serif';
        ctx.textAlign = 'center';

        if (this.isSummer) {
            ctx.fillStyle = isWarning ? '#fbbf24' : '#22d3ee';
            ctx.fillText(isWarning ? '⚠️ FREEZE INCOMING!' : '☀️ MOVE!', this.width / 2, 50);
        } else {
            ctx.fillStyle = '#ff4444';
            ctx.fillText('❄️ FREEZE!', this.width / 2, 50);
        }

        // Progress bar
        const barWidth = 250;
        const barX = (this.width - barWidth) / 2;
        const currentDuration = this.isSummer ? this.summerDuration : this.winterDuration;
        const progress = this.seasonTimer / currentDuration;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fillRect(barX, 62, barWidth, 8);
        ctx.fillStyle = this.isSummer ? (isWarning ? '#fbbf24' : '#22d3ee') : '#3b82f6';
        ctx.fillRect(barX, 62, barWidth * progress, 8);

        // --- OBSTACLES ---
        ctx.fillStyle = 'rgba(80, 120, 150, 0.7)';
        for (const obs of this.obstacles) {
            ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

            // Ice crystal pattern
            ctx.strokeStyle = 'rgba(165, 243, 252, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(obs.x, obs.y);
            ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
            ctx.moveTo(obs.x + obs.width, obs.y);
            ctx.lineTo(obs.x, obs.y + obs.height);
            ctx.stroke();
        }

        // --- GOAL ---
        const goalPulse = (Math.sin(this.frameCount * 0.08) + 1) * 0.5;
        const goalGlow = ctx.createRadialGradient(
            this.goalX, this.goalY, 0,
            this.goalX, this.goalY, this.goalRadius + 25 + goalPulse * 10
        );
        goalGlow.addColorStop(0, 'rgba(0, 255, 100, 0.9)');
        goalGlow.addColorStop(0.6, 'rgba(0, 255, 100, 0.3)');
        goalGlow.addColorStop(1, 'rgba(0, 255, 100, 0)');
        ctx.fillStyle = goalGlow;
        ctx.beginPath();
        ctx.arc(this.goalX, this.goalY, this.goalRadius + 25 + goalPulse * 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.arc(this.goalX, this.goalY, this.goalRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText('WARP', this.goalX, this.goalY + 5);

        // --- COLLECTIBLES ---
        for (const c of this.collectibles) {
            if (!c.collected) {
                const glow = (Math.sin(this.frameCount * 0.1 + c.x) + 1) * 0.5;

                let color = '#ffd700';
                let glowColor = 'rgba(255, 215, 0, 0.8)';
                let size = 10;
                if (c.type === 'bonus') {
                    color = '#00ffff';
                    glowColor = 'rgba(0, 255, 255, 0.8)';
                    size = 12;
                } else if (c.type === 'mega') {
                    color = '#ff00ff';
                    glowColor = 'rgba(255, 0, 255, 0.8)';
                    size = 15;
                }

                const glowSize = size + 10 + glow * 8;
                const cGlow = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, glowSize);
                cGlow.addColorStop(0, glowColor);
                cGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = cGlow;
                ctx.fillRect(c.x - glowSize, c.y - glowSize, glowSize * 2, glowSize * 2);

                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(c.x, c.y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Value label
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`+${c.value}`, c.x, c.y + size + 12);
            }
        }

        // --- PARTICLES ---
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // --- PLAYER ---
        if (!this.isGameOver) {
            // Shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.beginPath();
            ctx.ellipse(this.playerX + 3, this.playerY + 5, this.playerRadius, this.playerRadius * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Player probe
            const playerGradient = ctx.createRadialGradient(
                this.playerX - 5, this.playerY - 5, 0,
                this.playerX, this.playerY, this.playerRadius
            );
            playerGradient.addColorStop(0, '#ffffff');
            playerGradient.addColorStop(0.5, '#00f0ff');
            playerGradient.addColorStop(1, '#0088aa');
            ctx.fillStyle = playerGradient;
            ctx.beginPath();
            ctx.arc(this.playerX, this.playerY, this.playerRadius, 0, Math.PI * 2);
            ctx.fill();

            // Face
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.playerX - 5, this.playerY - 3, 3, 0, Math.PI * 2);
            ctx.arc(this.playerX + 5, this.playerY - 3, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (this.isSummer) {
                ctx.arc(this.playerX, this.playerY + 2, 6, 0.1 * Math.PI, 0.9 * Math.PI);
            } else {
                ctx.arc(this.playerX, this.playerY + 8, 6, 1.1 * Math.PI, 1.9 * Math.PI);
            }
            ctx.stroke();

            // Freeze ring during winter
            if (!this.isSummer) {
                ctx.strokeStyle = 'rgba(165, 243, 252, 0.6)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(this.playerX, this.playerY, this.playerRadius + 6, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // --- HUD ---
        // Left side
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 22px Rajdhani, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`LEVEL ${this.level}`, 20, 30);

        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, 20, 55);

        // Combo indicator
        if (this.combo > 1) {
            ctx.fillStyle = '#ff00ff';
            ctx.fillText(`🔥 x${this.combo} COMBO!`, 20, 80);
        }

        // Right side
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.width - 20, 30);

        const minutes = Math.floor(this.survivalTime / 3600);
        const seconds = Math.floor((this.survivalTime % 3600) / 60);
        ctx.fillStyle = '#888888';
        ctx.font = '16px Rajdhani, sans-serif';
        ctx.fillText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`, this.width - 20, 52);

        // --- GAME OVER OVERLAY ---
        if (this.isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 40, 0.92)';
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.fillStyle = '#a5f3fc';
            ctx.font = 'bold 48px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('❄️ FROZEN!', this.width / 2, this.height / 2 - 100);

            ctx.fillStyle = '#ffffff';
            ctx.font = '28px Rajdhani, sans-serif';
            ctx.fillText(`Reached Level ${this.level}`, this.width / 2, this.height / 2 - 40);

            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 36px Rajdhani, sans-serif';
            ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.width / 2, this.height / 2 + 10);

            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 28px Rajdhani, sans-serif';
            ctx.fillText(`⭐ +${this.stardustCollected} STARDUST EARNED`, this.width / 2, this.height / 2 + 60);

            if (this.maxCombo > 1) {
                ctx.fillStyle = '#ff00ff';
                ctx.font = '22px Rajdhani, sans-serif';
                ctx.fillText(`Max Combo: x${this.maxCombo}`, this.width / 2, this.height / 2 + 100);
            }
        }
    }
}
