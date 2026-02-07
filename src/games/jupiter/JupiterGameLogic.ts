// Jupiter Game Logic - "STORM RIDER"
// Ride through Jupiter's atmospheric bands, dodging storms from the Great Red Spot!
// Simple one-click controls - Click/hold to rise, release to fall

interface Storm {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'low' | 'high' | 'full';
    passed: boolean;
    flash: number;
}

interface MoonPowerUp {
    x: number;
    y: number;
    name: string;
    color: string;
    collected: boolean;
    pulsePhase: number;
    effect: 'shield' | 'magnet' | 'slow' | 'bonus';
}

interface Stardust {
    x: number;
    y: number;
    value: number;
    type: 'normal' | 'bonus' | 'mega';
    collected: boolean;
    pulsePhase: number;
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

interface CloudBand {
    y: number;
    color: string;
    speed: number;
    offset: number;
}

interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

const TRIVIA: TriviaQuestion[] = [
    { question: "What is Jupiter's Great Red Spot?", answers: ["A volcano", "A giant storm", "A moon shadow", "An impact crater"], correct: 1, fact: "The Great Red Spot is a massive anticyclonic storm that has been raging for at least 400 years - bigger than Earth!" },
    { question: "How many Earths could fit inside Jupiter?", answers: ["100", "500", "1,300", "10,000"], correct: 2, fact: "Over 1,300 Earths could fit inside Jupiter! It's the largest planet in our solar system." },
    { question: "How long is a day on Jupiter?", answers: ["10 hours", "24 hours", "100 hours", "10 days"], correct: 0, fact: "Despite being the largest planet, Jupiter spins fastest - one day is only about 10 hours!" },
    { question: "What are Jupiter's bands made of?", answers: ["Water clouds", "Ammonia clouds", "Dust storms", "Ice crystals"], correct: 1, fact: "Jupiter's colorful bands are clouds of ammonia and other compounds, driven by powerful jet streams." },
    { question: "Which moon might have ocean life?", answers: ["Io", "Europa", "Ganymede", "Callisto"], correct: 1, fact: "Europa has a subsurface ocean under its icy crust that scientists believe might harbor microbial life!" },
    { question: "How strong is Jupiter's gravity?", answers: ["Same as Earth", "2.4x Earth", "10x Earth", "100x Earth"], correct: 1, fact: "Jupiter's surface gravity is about 2.4 times stronger than Earth's - you'd weigh 2.4 times more there!" },
    { question: "Does Jupiter have rings?", answers: ["No rings", "Yes, faint ones", "Yes, bright ones", "Not anymore"], correct: 1, fact: "Jupiter does have rings! They're very faint and made of dust, discovered by Voyager 1 in 1979." },
    { question: "What generates Jupiter's auroras?", answers: ["Sunlight", "Its moons", "Lightning", "All of these"], correct: 3, fact: "Jupiter has spectacular auroras powered by the Sun, volcanic material from Io, and massive lightning storms!" },
];

const MOON_POWERUPS = [
    { name: 'Io', color: '#f59e0b', effect: 'bonus' as const },
    { name: 'Europa', color: '#a5d8ff', effect: 'shield' as const },
    { name: 'Ganymede', color: '#94a3b8', effect: 'magnet' as const },
    { name: 'Callisto', color: '#6b7280', effect: 'slow' as const },
];

export class JupiterGameLogic {
    width: number;
    height: number;

    // Player (probe surfing the bands)
    playerX: number;
    playerY: number;
    playerVy: number;
    playerWidth: number;
    playerHeight: number;
    isRising: boolean;
    hasShield: boolean;
    shieldTimer: number;
    hasMagnet: boolean;
    magnetTimer: number;

    // Game state
    score: number;
    stardustCollected: number;
    sessionStardust: number;
    distance: number;
    isGameOver: boolean;
    gameTime: number;
    combo: number;
    comboTimer: number;
    stormsDodged: number;
    isPaused: boolean;

    // Difficulty
    gameSpeed: number;
    baseSpeed: number;
    maxSpeed: number;
    slowModeTimer: number;

    // Entities
    storms: Storm[];
    moonPowerUps: MoonPowerUp[];
    stardust: Stardust[];
    particles: Particle[];
    cloudBands: CloudBand[];

    // Great Red Spot (visual element on left)
    redSpotX: number;
    redSpotY: number;
    redSpotPulse: number;

    // Spawning
    stormTimer: number;
    stardustTimer: number;
    moonTimer: number;

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;
    lastTriviaScore: number;

    // Visuals
    backgroundOffset: number;
    screenShake: number;

    // Constants
    readonly GRAVITY = 0.35;
    readonly RISE_POWER = -0.8;
    readonly MAX_FALL_SPEED = 8;
    readonly MAX_RISE_SPEED = -10;
    readonly STARDUST_CAP = 80;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.playerX = 180;
        this.playerY = height / 2;
        this.playerVy = 0;
        this.playerWidth = 50;
        this.playerHeight = 35;
        this.isRising = false;
        this.hasShield = false;
        this.shieldTimer = 0;
        this.hasMagnet = false;
        this.magnetTimer = 0;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.distance = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.stormsDodged = 0;
        this.isPaused = false;

        this.gameSpeed = 5;
        this.baseSpeed = 5;
        this.maxSpeed = 12;
        this.slowModeTimer = 0;

        this.storms = [];
        this.moonPowerUps = [];
        this.stardust = [];
        this.particles = [];
        this.cloudBands = [];

        this.redSpotX = 80;
        this.redSpotY = height / 2;
        this.redSpotPulse = 0;

        this.stormTimer = 0;
        this.stardustTimer = 0;
        this.moonTimer = 0;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaScore = 0;

        this.backgroundOffset = 0;
        this.screenShake = 0;

        this.initializeCloudBands();
        this.reset();
    }

    initializeCloudBands() {
        const bandColors = [
            '#8B4513', // Dark brown
            '#D2691E', // Chocolate
            '#DEB887', // Burlywood
            '#F4A460', // Sandy brown
            '#CD853F', // Peru
            '#D2691E', // Chocolate
            '#FFE4C4', // Bisque (light)
            '#F5DEB3', // Wheat
        ];

        const bandHeight = this.height / bandColors.length;
        bandColors.forEach((color, index) => {
            this.cloudBands.push({
                y: index * bandHeight,
                color,
                speed: 0.5 + (index % 2) * 0.3, // Alternating speeds
                offset: Math.random() * 100,
            });
        });
    }

    reset() {
        this.playerY = this.height / 2;
        this.playerVy = 0;
        this.isRising = false;
        this.hasShield = false;
        this.shieldTimer = 0;
        this.hasMagnet = false;
        this.magnetTimer = 0;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.distance = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.stormsDodged = 0;
        this.isPaused = false;

        this.gameSpeed = this.baseSpeed;
        this.slowModeTimer = 0;

        this.storms = [];
        this.moonPowerUps = [];
        this.stardust = [];
        this.particles = [];

        this.stormTimer = 60;
        this.stardustTimer = 0;
        this.moonTimer = 300;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaScore = 0;

        this.redSpotPulse = 0;
        this.backgroundOffset = 0;
        this.screenShake = 0;

        // Spawn initial stardust
        for (let i = 0; i < 5; i++) {
            this.spawnStardust();
        }
    }

    setRising(rising: boolean) {
        if (this.showTrivia || this.isGameOver) return;
        this.isRising = rising;
    }

    answerTrivia(index: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;
        const correct = index === this.currentTrivia.correct;

        if (correct) {
            const bonus = 15;
            this.sessionStardust = Math.min(this.STARDUST_CAP, this.sessionStardust + bonus);
            this.stardustCollected += bonus;
            this.score += 500;
            this.hasShield = true;
            this.shieldTimer = 300; // 5 second shield as reward
            this.createCelebrationEffect();
        } else {
            this.combo = 1;
        }

        setTimeout(() => {
            this.showTrivia = false;
            this.currentTrivia = null;
            this.triviaAnswered = false;
            this.isPaused = false;
        }, 2500);
    }

    update() {
        if (this.isGameOver || this.isPaused) return;
        if (this.showTrivia) return;

        this.gameTime++;
        this.backgroundOffset += this.gameSpeed * 0.3;
        this.redSpotPulse += 0.03;

        // Slow mode decay
        if (this.slowModeTimer > 0) {
            this.slowModeTimer--;
            this.gameSpeed = this.baseSpeed * 0.5;
        } else {
            // Gradually increase speed
            this.gameSpeed = Math.min(this.maxSpeed, this.baseSpeed + this.distance / 3000);
        }

        // Update distance
        this.distance += this.gameSpeed;

        // Player physics - simple gravity
        if (this.isRising) {
            this.playerVy += this.RISE_POWER;
        } else {
            this.playerVy += this.GRAVITY;
        }

        // Clamp velocity
        this.playerVy = Math.max(this.MAX_RISE_SPEED, Math.min(this.MAX_FALL_SPEED, this.playerVy));

        // Apply velocity
        this.playerY += this.playerVy;

        // Boundary collision
        if (this.playerY < 40) {
            this.playerY = 40;
            this.playerVy = 0;
        }
        if (this.playerY > this.height - 40) {
            this.playerY = this.height - 40;
            this.playerVy = 0;
        }

        // Shield timer
        if (this.shieldTimer > 0) {
            this.shieldTimer--;
            if (this.shieldTimer <= 0) this.hasShield = false;
        }

        // Magnet timer
        if (this.magnetTimer > 0) {
            this.magnetTimer--;
            if (this.magnetTimer <= 0) this.hasMagnet = false;
        }

        // Combo decay
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.combo = Math.max(1, this.combo - 0.5);
        }

        // Screen shake decay
        if (this.screenShake > 0) this.screenShake *= 0.9;

        // Spawn storms
        this.stormTimer--;
        if (this.stormTimer <= 0) {
            this.spawnStorm();
            // Gradually spawn more frequently
            this.stormTimer = Math.max(40, 90 - Math.floor(this.distance / 500));
        }

        // Spawn stardust
        this.stardustTimer--;
        if (this.stardustTimer <= 0) {
            this.spawnStardust();
            this.stardustTimer = 30;
        }

        // Spawn moon power-ups
        this.moonTimer--;
        if (this.moonTimer <= 0) {
            this.spawnMoonPowerUp();
            this.moonTimer = 400 + Math.floor(Math.random() * 200);
        }

        // Update storms
        this.updateStorms();

        // Update stardust
        this.updateStardust();

        // Update moon power-ups
        this.updateMoonPowerUps();

        // Update particles
        this.updateParticles();

        // Score over time
        if (this.gameTime % 20 === 0) {
            this.score += Math.floor(this.combo);
        }

        // Update cloud bands
        this.cloudBands.forEach(band => {
            band.offset += band.speed;
        });

        // Trivia trigger every 2000 points
        if (this.score >= this.lastTriviaScore + 2000 && !this.showTrivia) {
            this.triggerTrivia();
            this.lastTriviaScore = this.score;
        }
    }

    spawnStorm() {
        const types: ('low' | 'high' | 'full')[] = ['low', 'high', 'low', 'high', 'full'];
        const type = types[Math.floor(Math.random() * types.length)];

        let y = 0;
        let height = 0;
        const gapSize = 180; // Safe zone height

        switch (type) {
            case 'low':
                // Storm covers bottom, safe zone at top
                height = this.height - gapSize - 50;
                y = this.height - height;
                break;
            case 'high':
                // Storm covers top, safe zone at bottom
                height = this.height - gapSize - 50;
                y = 0;
                break;
            case 'full':
                // Gap in the middle
                const gapY = 100 + Math.random() * (this.height - 200 - gapSize);
                // Create two storms (top and bottom)
                this.storms.push({
                    x: this.width + 50,
                    y: 0,
                    width: 80 + Math.random() * 40,
                    height: gapY,
                    type: 'high',
                    passed: false,
                    flash: 0,
                });
                this.storms.push({
                    x: this.width + 50,
                    y: gapY + gapSize,
                    width: 80 + Math.random() * 40,
                    height: this.height - gapY - gapSize,
                    type: 'low',
                    passed: false,
                    flash: 0,
                });
                return; // Already added storms
        }

        this.storms.push({
            x: this.width + 50,
            y,
            width: 80 + Math.random() * 40,
            height,
            type,
            passed: false,
            flash: Math.random() > 0.7 ? 1 : 0, // Some storms have lightning
        });
    }

    spawnStardust() {
        const rand = Math.random();
        let type: 'normal' | 'bonus' | 'mega' = 'normal';
        let value = 1;

        if (rand > 0.95) {
            type = 'mega';
            value = 5;
        } else if (rand > 0.8) {
            type = 'bonus';
            value = 2;
        }

        this.stardust.push({
            x: this.width + 30 + Math.random() * 100,
            y: 80 + Math.random() * (this.height - 160),
            value,
            type,
            collected: false,
            pulsePhase: Math.random() * Math.PI * 2,
        });
    }

    spawnMoonPowerUp() {
        const moonData = MOON_POWERUPS[Math.floor(Math.random() * MOON_POWERUPS.length)];

        this.moonPowerUps.push({
            x: this.width + 50,
            y: 100 + Math.random() * (this.height - 200),
            name: moonData.name,
            color: moonData.color,
            collected: false,
            pulsePhase: 0,
            effect: moonData.effect,
        });
    }

    updateStorms() {
        for (let i = this.storms.length - 1; i >= 0; i--) {
            const storm = this.storms[i];
            storm.x -= this.gameSpeed;

            // Lightning flash
            if (storm.flash > 0) {
                storm.flash -= 0.05;
                if (storm.flash <= 0 && Math.random() > 0.95) {
                    storm.flash = 1;
                }
            }

            // Check if passed player (for scoring)
            if (!storm.passed && storm.x + storm.width < this.playerX) {
                storm.passed = true;
                this.stormsDodged++;
                this.score += 50 * Math.floor(this.combo);
                this.combo = Math.min(10, this.combo + 0.25);
                this.comboTimer = 120;
            }

            // Collision detection
            if (!this.hasShield) {
                const playerLeft = this.playerX - this.playerWidth / 2;
                const playerRight = this.playerX + this.playerWidth / 2;
                const playerTop = this.playerY - this.playerHeight / 2;
                const playerBottom = this.playerY + this.playerHeight / 2;

                const stormLeft = storm.x;
                const stormRight = storm.x + storm.width;
                const stormTop = storm.y;
                const stormBottom = storm.y + storm.height;

                if (playerRight > stormLeft && playerLeft < stormRight &&
                    playerBottom > stormTop && playerTop < stormBottom) {
                    this.gameOver();
                    return;
                }
            }

            // Remove if off screen
            if (storm.x + storm.width < -50) {
                this.storms.splice(i, 1);
            }
        }
    }

    updateStardust() {
        for (let i = this.stardust.length - 1; i >= 0; i--) {
            const star = this.stardust[i];
            star.x -= this.gameSpeed;
            star.pulsePhase += 0.08;

            // Magnet effect
            if (this.hasMagnet && !star.collected) {
                const dx = this.playerX - star.x;
                const dy = this.playerY - star.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    star.x += (dx / dist) * 5;
                    star.y += (dy / dist) * 5;
                }
            }

            // Collection check
            if (!star.collected) {
                const dx = this.playerX - star.x;
                const dy = this.playerY - star.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 40) {
                    star.collected = true;
                    const earned = Math.min(star.value, this.STARDUST_CAP - this.sessionStardust);
                    this.sessionStardust += earned;
                    this.stardustCollected += earned;
                    this.score += star.value * 30 * Math.floor(this.combo);
                    this.combo = Math.min(10, this.combo + 0.1);
                    this.comboTimer = 120;
                    this.createCollectEffect(star.x, star.y, star.type);
                }
            }

            // Remove if collected or off screen
            if (star.collected || star.x < -30) {
                this.stardust.splice(i, 1);
            }
        }
    }

    updateMoonPowerUps() {
        for (let i = this.moonPowerUps.length - 1; i >= 0; i--) {
            const moon = this.moonPowerUps[i];
            moon.x -= this.gameSpeed;
            moon.pulsePhase += 0.05;

            // Collection check
            if (!moon.collected) {
                const dx = this.playerX - moon.x;
                const dy = this.playerY - moon.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 50) {
                    moon.collected = true;
                    this.score += 200;
                    this.applyMoonEffect(moon.effect);
                    this.createMoonCollectEffect(moon.x, moon.y, moon.color);
                }
            }

            // Remove if collected or off screen
            if (moon.collected || moon.x < -40) {
                this.moonPowerUps.splice(i, 1);
            }
        }
    }

    applyMoonEffect(effect: 'shield' | 'magnet' | 'slow' | 'bonus') {
        switch (effect) {
            case 'shield':
                this.hasShield = true;
                this.shieldTimer = 300; // 5 seconds
                break;
            case 'magnet':
                this.hasMagnet = true;
                this.magnetTimer = 300;
                break;
            case 'slow':
                this.slowModeTimer = 180; // 3 seconds
                break;
            case 'bonus':
                const bonus = 5;
                this.sessionStardust = Math.min(this.STARDUST_CAP, this.sessionStardust + bonus);
                this.stardustCollected += bonus;
                break;
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life--;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    createCollectEffect(x: number, y: number, type: string) {
        const color = type === 'mega' ? '#ff69b4' : type === 'bonus' ? '#00ff88' : '#ffd700';
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
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

    createMoonCollectEffect(x: number, y: number, color: string) {
        for (let i = 0; i < 20; i++) {
            const angle = (Math.PI * 2 * i) / 20;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 6,
                vy: Math.sin(angle) * 6,
                size: 6,
                color,
                life: 35,
                maxLife: 35,
            });
        }
    }

    createCelebrationEffect() {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 5 + Math.random() * 5,
                color: ['#ffd700', '#00ff88', '#ff69b4', '#f97316'][Math.floor(Math.random() * 4)],
                life: 40,
                maxLife: 40,
            });
        }
    }

    triggerTrivia() {
        this.currentTrivia = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        this.showTrivia = true;
        this.triviaAnswered = false;
        this.isPaused = true;
    }

    gameOver() {
        this.isGameOver = true;
        this.screenShake = 20;

        // Death explosion
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 8;
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 5 + Math.random() * 8,
                color: Math.random() > 0.5 ? '#ff4444' : '#ff8800',
                life: 50,
                maxLife: 50,
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

        // Draw background (Jupiter bands)
        this.drawBackground(ctx);

        // Draw Great Red Spot on left
        this.drawGreatRedSpot(ctx);

        // Draw storms
        this.storms.forEach(storm => this.drawStorm(ctx, storm));

        // Draw stardust
        this.stardust.forEach(star => this.drawStardust(ctx, star));

        // Draw moon power-ups
        this.moonPowerUps.forEach(moon => this.drawMoonPowerUp(ctx, moon));

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

        ctx.restore();

        // Draw UI (not affected by shake)
        this.drawUI(ctx);
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        // Jupiter's colorful bands
        this.cloudBands.forEach((band, index) => {
            const bandHeight = this.height / this.cloudBands.length;

            // Draw band
            ctx.fillStyle = band.color;
            ctx.fillRect(0, band.y, this.width, bandHeight + 1);

            // Add cloud texture (horizontal streaks)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            for (let i = 0; i < 5; i++) {
                const streakY = band.y + (bandHeight * (i + 0.5)) / 5;
                const streakOffset = (band.offset + i * 30) % (this.width * 2) - this.width;
                ctx.fillRect(streakOffset, streakY - 2, this.width * 0.6, 4);
            }
        });

        // Atmospheric gradient overlay
        const overlay = ctx.createLinearGradient(0, 0, 0, this.height);
        overlay.addColorStop(0, 'rgba(0, 0, 30, 0.3)');
        overlay.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
        overlay.addColorStop(1, 'rgba(0, 0, 30, 0.3)');
        ctx.fillStyle = overlay;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    drawGreatRedSpot(ctx: CanvasRenderingContext2D) {
        const x = this.redSpotX;
        const y = this.redSpotY + Math.sin(this.gameTime * 0.02) * 20;
        const size = 120 + Math.sin(this.redSpotPulse) * 10;

        // Outer glow
        const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size);
        outerGlow.addColorStop(0, 'rgba(200, 50, 30, 0.8)');
        outerGlow.addColorStop(0.5, 'rgba(180, 50, 30, 0.5)');
        outerGlow.addColorStop(1, 'rgba(150, 40, 20, 0)');
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.ellipse(x, y, size, size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner red spot
        const innerGrad = ctx.createRadialGradient(x - 20, y - 10, 0, x, y, size * 0.6);
        innerGrad.addColorStop(0, '#ff6b4a');
        innerGrad.addColorStop(0.5, '#cc3020');
        innerGrad.addColorStop(1, '#992010');
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.ellipse(x, y, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Swirl pattern
        ctx.strokeStyle = 'rgba(255, 150, 100, 0.3)';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            const spiralOffset = (this.gameTime * 0.02 + i * 2) % (Math.PI * 2);
            for (let a = 0; a < Math.PI * 4; a += 0.1) {
                const r = (a / (Math.PI * 4)) * size * 0.5;
                const px = x + Math.cos(a + spiralOffset) * r;
                const py = y + Math.sin(a + spiralOffset) * r * 0.7;
                if (a === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
        }
    }

    drawStorm(ctx: CanvasRenderingContext2D, storm: Storm) {
        // Storm cloud
        const gradient = ctx.createLinearGradient(storm.x, storm.y, storm.x + storm.width, storm.y);
        gradient.addColorStop(0, 'rgba(60, 40, 30, 0.9)');
        gradient.addColorStop(0.5, 'rgba(80, 50, 40, 0.95)');
        gradient.addColorStop(1, 'rgba(60, 40, 30, 0.9)');
        ctx.fillStyle = gradient;
        ctx.fillRect(storm.x, storm.y, storm.width, storm.height);

        // Storm edge glow (danger indicator)
        ctx.strokeStyle = 'rgba(255, 100, 50, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeRect(storm.x, storm.y, storm.width, storm.height);

        // Inner turbulence
        ctx.fillStyle = 'rgba(40, 25, 20, 0.5)';
        for (let i = 0; i < 5; i++) {
            const cx = storm.x + (storm.width * (i + 0.5)) / 5;
            const cy = storm.y + (Math.sin(this.gameTime * 0.1 + i) * 0.5 + 0.5) * storm.height;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 15, 10, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Lightning effect
        if (storm.flash > 0.5) {
            ctx.fillStyle = `rgba(255, 255, 100, ${storm.flash * 0.5})`;
            ctx.fillRect(storm.x, storm.y, storm.width, storm.height);
        }
    }

    drawStardust(ctx: CanvasRenderingContext2D, star: Stardust) {
        const pulse = Math.sin(star.pulsePhase) * 0.2 + 1;
        ctx.save();
        ctx.translate(star.x, star.y);
        ctx.scale(pulse, pulse);

        let color = '#ffd700';
        if (star.type === 'mega') color = '#ff69b4';
        else if (star.type === 'bonus') color = '#00ff88';

        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;

        // Star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const nextAngle = angle + Math.PI / 5;
            const outerR = 12;
            const innerR = 5;

            ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
            ctx.lineTo(Math.cos(nextAngle) * innerR, Math.sin(nextAngle) * innerR);
        }
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawMoonPowerUp(ctx: CanvasRenderingContext2D, moon: MoonPowerUp) {
        const pulse = Math.sin(moon.pulsePhase) * 0.15 + 1;
        const size = 25 * pulse;

        ctx.save();
        ctx.translate(moon.x, moon.y);

        // Orbit ring
        ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, size + 10, 0, Math.PI * 2);
        ctx.stroke();

        // Moon glow
        ctx.shadowColor = moon.color;
        ctx.shadowBlur = 20;

        // Moon body
        const moonGrad = ctx.createRadialGradient(-5, -5, 0, 0, 0, size);
        moonGrad.addColorStop(0, '#ffffff');
        moonGrad.addColorStop(0.5, moon.color);
        moonGrad.addColorStop(1, '#333333');
        ctx.fillStyle = moonGrad;
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();

        // Moon name
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Rajdhani';
        ctx.textAlign = 'center';
        ctx.fillText(moon.name, 0, size + 22);

        ctx.restore();
    }

    drawPlayer(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.playerX, this.playerY);

        // Tilt based on velocity
        const tilt = this.playerVy * 0.03;
        ctx.rotate(tilt);

        // Shield effect
        if (this.hasShield) {
            const shieldPulse = Math.sin(this.gameTime * 0.2) * 0.2 + 1;
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 + Math.sin(this.gameTime * 0.3) * 0.3})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, 45 * shieldPulse, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = 'rgba(100, 200, 255, 0.1)';
            ctx.fill();
        }

        // Magnet effect
        if (this.hasMagnet) {
            ctx.strokeStyle = 'rgba(255, 200, 50, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, 200, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Engine trail
        if (this.isRising) {
            const flameGrad = ctx.createLinearGradient(0, 15, 0, 50);
            flameGrad.addColorStop(0, 'rgba(255, 150, 50, 0.9)');
            flameGrad.addColorStop(0.5, 'rgba(255, 100, 20, 0.6)');
            flameGrad.addColorStop(1, 'rgba(255, 50, 0, 0)');
            ctx.fillStyle = flameGrad;
            ctx.beginPath();
            ctx.moveTo(-12, 15);
            ctx.lineTo(0, 45 + Math.random() * 15);
            ctx.lineTo(12, 15);
            ctx.closePath();
            ctx.fill();
        }

        // Main body glow
        ctx.shadowColor = '#ffa500';
        ctx.shadowBlur = 15;

        // Probe body
        const bodyGrad = ctx.createLinearGradient(-25, -18, 25, 18);
        bodyGrad.addColorStop(0, '#ffe4b5');
        bodyGrad.addColorStop(0.5, '#ffa500');
        bodyGrad.addColorStop(1, '#cc6600');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.moveTo(30, 0); // Nose
        ctx.quadraticCurveTo(25, -18, -20, -18);
        ctx.lineTo(-25, 0);
        ctx.lineTo(-20, 18);
        ctx.quadraticCurveTo(25, 18, 30, 0);
        ctx.closePath();
        ctx.fill();

        // Window
        ctx.fillStyle = '#4fc3f7';
        ctx.shadowColor = '#00bfff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(10, 0, 10, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Window highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(13, -3, 4, 2, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#cc6600';
        ctx.shadowBlur = 0;

        // Top wing
        ctx.beginPath();
        ctx.moveTo(-10, -15);
        ctx.lineTo(-5, -35);
        ctx.lineTo(-20, -30);
        ctx.lineTo(-20, -18);
        ctx.closePath();
        ctx.fill();

        // Bottom wing
        ctx.beginPath();
        ctx.moveTo(-10, 15);
        ctx.lineTo(-5, 35);
        ctx.lineTo(-20, 30);
        ctx.lineTo(-20, 18);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // Distance / Score
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 24px Orbitron, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.floor(this.distance / 10).toLocaleString()}km`, 20, 35);

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Rajdhani';
        ctx.fillText(`Score: ${this.score.toLocaleString()}`, 20, 60);

        // Stardust
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.sessionStardust}`, 20, 85);

        // Storms dodged
        ctx.fillStyle = '#ff8c00';
        ctx.fillText(`🌪️ ${this.stormsDodged}`, 20, 110);

        // Combo
        if (this.combo > 1) {
            ctx.fillStyle = '#ff69b4';
            ctx.font = 'bold 22px Rajdhani';
            ctx.fillText(`🔥 x${Math.floor(this.combo)} COMBO`, 150, 110);
        }

        // Power-up indicators (top right)
        ctx.textAlign = 'right';
        let indicatorY = 35;

        if (this.hasShield) {
            ctx.fillStyle = '#00bfff';
            ctx.font = 'bold 18px Rajdhani';
            ctx.fillText(`🛡️ SHIELD: ${Math.ceil(this.shieldTimer / 60)}s`, this.width - 20, indicatorY);
            indicatorY += 25;
        }

        if (this.hasMagnet) {
            ctx.fillStyle = '#ffcc00';
            ctx.font = 'bold 18px Rajdhani';
            ctx.fillText(`🧲 MAGNET: ${Math.ceil(this.magnetTimer / 60)}s`, this.width - 20, indicatorY);
            indicatorY += 25;
        }

        if (this.slowModeTimer > 0) {
            ctx.fillStyle = '#88ff88';
            ctx.font = 'bold 18px Rajdhani';
            ctx.fillText(`⏱️ SLOW: ${Math.ceil(this.slowModeTimer / 60)}s`, this.width - 20, indicatorY);
        }

        // Controls hint
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '14px Rajdhani';
        ctx.fillText('Hold CLICK or SPACE to rise • Release to fall', this.width / 2, this.height - 15);
    }

    getState() {
        return {
            score: this.score,
            distance: this.distance,
            stardustCollected: this.sessionStardust,
            stormsDodged: this.stormsDodged,
            isGameOver: this.isGameOver,
            showTrivia: this.showTrivia,
            currentTrivia: this.currentTrivia,
            triviaAnswered: this.triviaAnswered,
            combo: Math.floor(this.combo),
            hasShield: this.hasShield,
            hasMagnet: this.hasMagnet,
        };
    }
}
