// Sun Game Logic - "SOLAR SHOWDOWN"
// Final Boss arcade shooter - defend the Sun from aliens!
import { soundManager } from '@/utils/soundManager';

interface Alien {
    id: number;
    x: number;
    y: number;
    type: 'scout' | 'cruiser' | 'bomber' | 'elite' | 'boss';
    health: number;
    maxHealth: number;
    speed: number;
    size: number;
    angle: number;
    shootTimer: number;
    value: number;
}

interface Projectile {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    damage: number;
    type: 'player' | 'alien';
    size: number;
}

interface PowerUp {
    id: number;
    x: number;
    y: number;
    type: 'shield' | 'rapidFire' | 'multiShot' | 'solarFlare';
    size: number;
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

const SUN_TRIVIA: TriviaQuestion[] = [
    { question: "How long does light take to reach Earth from the Sun?", answers: ["8 seconds", "8 minutes", "8 hours", "80 minutes"], correct: 1, fact: "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth, traveling at 300,000 km/s!" },
    { question: "What is the Sun's core temperature?", answers: ["1 million °C", "15 million °C", "100 million °C", "1 billion °C"], correct: 1, fact: "The Sun's core reaches about 15 million degrees Celsius - hot enough to fuse hydrogen into helium!" },
    { question: "What percentage of the solar system's mass is the Sun?", answers: ["50%", "75%", "99.86%", "90%"], correct: 2, fact: "The Sun contains 99.86% of all mass in our solar system! Everything else is just 0.14%." },
    { question: "How old is our Sun?", answers: ["1 billion years", "4.6 billion years", "10 billion years", "100 million years"], correct: 1, fact: "Our Sun is about 4.6 billion years old - middle-aged for a star of its type!" },
    { question: "What process powers the Sun?", answers: ["Combustion", "Nuclear fission", "Nuclear fusion", "Chemical reaction"], correct: 2, fact: "The Sun is powered by nuclear fusion, converting 600 million tons of hydrogen into helium every second!" },
];

export class SunGameLogic {
    width: number;
    height: number;

    // Player (Astronaut ship)
    playerX: number;
    playerY: number;
    playerSize: number;

    // Game entities
    aliens: Alien[];
    projectiles: Projectile[];
    powerUps: PowerUp[];
    particles: Particle[];
    nextId: number;

    // Game state
    score: number;
    wave: number;
    lives: number;
    isGameOver: boolean;
    isVictory: boolean;
    stardustCollected: number;

    // Power-ups
    shieldActive: boolean;
    rapidFireActive: boolean;
    multiShotActive: boolean;
    powerUpTimer: number;

    // Shooting
    shootCooldown: number;

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;
    triviaCorrect: boolean;
    lastTriviaWave: number;

    // Visual
    stars: { x: number; y: number; size: number; brightness: number }[];
    screenShake: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.aliens = [];
        this.projectiles = [];
        this.powerUps = [];
        this.particles = [];
        this.nextId = 0;
        this.currentTrivia = null;

        this.playerX = width / 2;
        this.playerY = height - 80;
        this.playerSize = 25;
        this.score = 0;
        this.wave = 1;
        this.lives = 3;
        this.isGameOver = false;
        this.isVictory = false;
        this.stardustCollected = 0;
        this.shieldActive = false;
        this.rapidFireActive = false;
        this.multiShotActive = false;
        this.powerUpTimer = 0;
        this.shootCooldown = 0;
        this.showTrivia = false;
        this.triviaAnswered = false;
        this.triviaCorrect = false;
        this.lastTriviaWave = 0;
        this.screenShake = 0;

        this.initStars();
        this.reset();
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }

    reset() {
        this.playerX = this.width / 2;
        this.playerY = this.height - 80;
        this.aliens = [];
        this.projectiles = [];
        this.powerUps = [];
        this.particles = [];
        this.nextId = 0;
        this.score = 0;
        this.wave = 1;
        this.lives = 3;
        this.isGameOver = false;
        this.isVictory = false;
        this.stardustCollected = 0;
        this.shieldActive = false;
        this.rapidFireActive = false;
        this.multiShotActive = false;
        this.powerUpTimer = 0;
        this.shootCooldown = 0;
        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaWave = 0;
        this.screenShake = 0;

        this.spawnWave();
    }

    handleInput(direction: string) {
        if (this.isGameOver || this.showTrivia) return;

        const speed = 8;
        switch (direction) {
            case 'left':
                this.playerX = Math.max(this.playerSize, this.playerX - speed);
                break;
            case 'right':
                this.playerX = Math.min(this.width - this.playerSize, this.playerX + speed);
                break;
            case 'up':
                this.playerY = Math.max(this.height / 2, this.playerY - speed);
                break;
            case 'down':
                this.playerY = Math.min(this.height - this.playerSize, this.playerY + speed);
                break;
            case 'shoot':
                this.shoot();
                break;
        }
    }

    shoot() {
        if (this.shootCooldown > 0 || this.showTrivia) return;

        this.shootCooldown = this.rapidFireActive ? 5 : 12;
        soundManager.playShoot();
        const bulletSpeed = 15;

        if (this.multiShotActive) {
            for (let i = -1; i <= 1; i++) {
                this.projectiles.push({
                    id: this.nextId++,
                    x: this.playerX,
                    y: this.playerY - this.playerSize,
                    vx: i * 2,
                    vy: -bulletSpeed,
                    damage: 1,
                    type: 'player',
                    size: 5
                });
            }
        } else {
            this.projectiles.push({
                id: this.nextId++,
                x: this.playerX,
                y: this.playerY - this.playerSize,
                vx: 0,
                vy: -bulletSpeed,
                damage: 1,
                type: 'player',
                size: 5
            });
        }
    }

    spawnWave() {
        const numAliens = Math.min(5 + this.wave * 2, 25);
        const hasBoss = this.wave >= 5 && this.wave % 3 === 0;

        for (let i = 0; i < numAliens; i++) {
            let type: Alien['type'] = 'scout';
            if (hasBoss && i === 0) type = 'boss';
            else if (this.wave >= 3 && Math.random() < 0.2) type = 'cruiser';
            else if (this.wave >= 5 && Math.random() < 0.15) type = 'bomber';
            else if (this.wave >= 7 && Math.random() < 0.1) type = 'elite';

            const stats: Record<Alien['type'], { health: number; speed: number; size: number; value: number }> = {
                scout: { health: 1, speed: 2 + this.wave * 0.2, size: 18, value: 50 },
                cruiser: { health: 3, speed: 1.5, size: 25, value: 100 },
                bomber: { health: 2, speed: 2, size: 22, value: 75 },
                elite: { health: 5, speed: 2.5, size: 28, value: 150 },
                boss: { health: 15 + this.wave * 2, speed: 1, size: 50, value: 500 },
            };

            const s = stats[type];
            this.aliens.push({
                id: this.nextId++,
                x: 50 + Math.random() * (this.width - 100),
                y: -50 - (i * 40),
                type,
                health: s.health,
                maxHealth: s.health,
                speed: s.speed,
                size: s.size,
                angle: Math.PI / 2,
                shootTimer: 60 + Math.random() * 60,
                value: s.value
            });
        }
    }

    triggerTrivia() {
        if (this.wave <= this.lastTriviaWave) return;
        this.lastTriviaWave = this.wave;

        const trivia = SUN_TRIVIA[Math.floor(Math.random() * SUN_TRIVIA.length)];
        this.currentTrivia = trivia;
        this.showTrivia = true;
        this.triviaAnswered = false;
    }

    answerTrivia(index: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;
        this.triviaCorrect = index === this.currentTrivia.correct;

        if (this.triviaCorrect) {
            this.score += 300;
            this.stardustCollected += 15;
            this.lives = Math.min(5, this.lives + 1);
            soundManager.playLevelUp();
        }

        setTimeout(() => {
            this.showTrivia = false;
            this.currentTrivia = null;
        }, 2500);
    }

    update(deltaTime: number = 1) {
        if (this.isGameOver || this.isVictory || this.showTrivia) return;

        // Shoot cooldown
        if (this.shootCooldown > 0) this.shootCooldown -= deltaTime;

        // Power-up timer
        if (this.powerUpTimer > 0) {
            this.powerUpTimer -= deltaTime;
            if (this.powerUpTimer <= 0) {
                this.shieldActive = false;
                this.rapidFireActive = false;
                this.multiShotActive = false;
            }
        }

        // Update projectiles
        this.projectiles = this.projectiles.filter(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            return p.y > -20 && p.y < this.height + 20 && p.x > -20 && p.x < this.width + 20;
        });

        // Update aliens
        this.updateAliens();

        // Check collisions
        this.checkCollisions();

        // Spawn power-ups randomly
        if (Math.random() < 0.003) {
            this.spawnPowerUp();
        }

        // Update power-ups
        this.powerUps = this.powerUps.filter(p => {
            p.y += 2 * deltaTime;
            return p.y < this.height + 30;
        });

        // Collect power-ups
        this.collectPowerUps();

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 0.1 * deltaTime;
            p.life -= deltaTime;
            return p.life > 0;
        });

        // Screen shake decay
        this.screenShake = Math.max(0, this.screenShake - 0.5 * deltaTime);

        // Check wave completion
        if (this.aliens.length === 0 && !this.isGameOver) {
            if (this.wave >= 10) {
                this.isVictory = true;
                this.score += 2000;
                this.stardustCollected += 100;
            } else {
                this.score += 200;
                this.wave++;

                // Trivia every 2 waves
                if (this.wave % 2 === 0) {
                    this.triggerTrivia();
                }

                this.spawnWave();
            }
        }
    }

    updateAliens() {
        for (const alien of this.aliens) {
            alien.y += alien.speed;

            // Slight horizontal movement for variety
            alien.x += Math.sin(alien.y * 0.02 + alien.id) * 0.5;
            alien.x = Math.max(alien.size, Math.min(this.width - alien.size, alien.x));

            // Alien shooting (cruisers and above)
            if (alien.type !== 'scout') {
                alien.shootTimer--;
                if (alien.shootTimer <= 0) {
                    alien.shootTimer = alien.type === 'boss' ? 40 : 90;

                    const angle = Math.atan2(this.playerY - alien.y, this.playerX - alien.x);
                    const count = alien.type === 'boss' ? 3 : 1;

                    for (let i = 0; i < count; i++) {
                        const spread = count > 1 ? (i - 1) * 0.3 : 0;
                        this.projectiles.push({
                            id: this.nextId++,
                            x: alien.x,
                            y: alien.y + alien.size,
                            vx: Math.cos(angle + spread) * 5,
                            vy: Math.sin(angle + spread) * 5,
                            damage: alien.type === 'boss' ? 1 : 1,
                            type: 'alien',
                            size: 6
                        });
                    }
                }
            }

            // Alien passed bottom
            if (alien.y > this.height + alien.size) {
                alien.health = 0;
                this.lives--;
                this.screenShake = 10;
                if (this.lives <= 0) {
                    this.isGameOver = true;
                }
            }
        }

        this.aliens = this.aliens.filter(a => a.health > 0);
    }

    checkCollisions() {
        // Player bullets hitting aliens
        for (const proj of this.projectiles.filter(p => p.type === 'player')) {
            for (const alien of this.aliens) {
                const dist = Math.hypot(proj.x - alien.x, proj.y - alien.y);
                if (dist < alien.size + proj.size) {
                    alien.health -= proj.damage;
                    proj.damage = 0; // Mark for removal

                    this.createHitEffect(proj.x, proj.y);

                    if (alien.health <= 0) {
                        this.score += alien.value;
                        this.stardustCollected += Math.floor(alien.value / 20);
                        this.createExplosion(alien.x, alien.y, alien.size);
                    }
                }
            }
        }

        // Remove used projectiles
        this.projectiles = this.projectiles.filter(p => p.damage > 0);

        // Alien bullets hitting player
        if (!this.shieldActive) {
            for (const proj of this.projectiles.filter(p => p.type === 'alien')) {
                const dist = Math.hypot(proj.x - this.playerX, proj.y - this.playerY);
                if (dist < this.playerSize + proj.size) {
                    this.lives--;
                    proj.damage = 0;
                    this.screenShake = 8;
                    this.createExplosion(this.playerX, this.playerY, 20);
                    soundManager.playCrash();

                    if (this.lives <= 0) {
                        this.isGameOver = true;
                    }
                }
            }
        }

        // Remove used alien projectiles
        this.projectiles = this.projectiles.filter(p => p.damage > 0);

        // Player collision with aliens
        if (!this.shieldActive) {
            for (const alien of this.aliens) {
                const dist = Math.hypot(alien.x - this.playerX, alien.y - this.playerY);
                if (dist < alien.size + this.playerSize) {
                    this.lives--;
                    alien.health = 0;
                    this.screenShake = 12;
                    this.createExplosion(alien.x, alien.y, alien.size);
                    soundManager.playCrash();

                    if (this.lives <= 0) {
                        this.isGameOver = true;
                    }
                }
            }
        }
    }

    spawnPowerUp() {
        const types: PowerUp['type'][] = ['shield', 'rapidFire', 'multiShot', 'solarFlare'];
        this.powerUps.push({
            id: this.nextId++,
            x: 50 + Math.random() * (this.width - 100),
            y: -20,
            type: types[Math.floor(Math.random() * types.length)],
            size: 18
        });
    }

    collectPowerUps() {
        this.powerUps = this.powerUps.filter(p => {
            const dist = Math.hypot(p.x - this.playerX, p.y - this.playerY);
            if (dist < p.size + this.playerSize) {
                this.powerUpTimer = 300; // 5 seconds

                switch (p.type) {
                    case 'shield':
                        this.shieldActive = true;
                        break;
                    case 'rapidFire':
                        this.rapidFireActive = true;
                        break;
                    case 'multiShot':
                        this.multiShotActive = true;
                        break;
                    case 'solarFlare':
                        // Clear all aliens
                        for (const alien of this.aliens) {
                            this.score += Math.floor(alien.value / 2);
                            this.createExplosion(alien.x, alien.y, alien.size);
                        }
                        this.aliens = [];
                        break;
                }
                soundManager.playCollect();
                return false;
            }
            return true;
        });
    }

    createExplosion(x: number, y: number, size: number) {
        soundManager.playExplosion();
        for (let i = 0; i < size; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 4,
                color: ['#fbbf24', '#f97316', '#ef4444', '#fcd34d'][Math.floor(Math.random() * 4)],
                life: 20 + Math.random() * 20,
                maxLife: 40
            });
        }
    }

    createHitEffect(x: number, y: number) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 2,
                color: '#fbbf24',
                life: 15,
                maxLife: 15
            });
        }
    }

    getState() {
        return {
            score: this.score,
            wave: this.wave,
            lives: this.lives,
            isGameOver: this.isGameOver,
            isVictory: this.isVictory,
            stardustCollected: this.stardustCollected,
            shieldActive: this.shieldActive,
            rapidFireActive: this.rapidFireActive,
            multiShotActive: this.multiShotActive,
            showTrivia: this.showTrivia,
            currentTrivia: this.currentTrivia,
            triviaAnswered: this.triviaAnswered,
            triviaCorrect: this.triviaCorrect
        };
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();

        // Apply screen shake
        if (this.screenShake > 0) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }

        // Background gradient (solar theme)
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#1a0a00');
        bgGrad.addColorStop(0.3, '#0a0510');
        bgGrad.addColorStop(1, '#050510');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        for (const star of this.stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sun glow at top
        const sunGlow = ctx.createRadialGradient(this.width / 2, -50, 0, this.width / 2, -50, 300);
        sunGlow.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
        sunGlow.addColorStop(0.3, 'rgba(249, 115, 22, 0.3)');
        sunGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, this.width, 300);

        // Draw particles (behind entities)
        this.drawParticles(ctx);

        // Draw power-ups
        this.drawPowerUps(ctx);

        // Draw projectiles
        this.drawProjectiles(ctx);

        // Draw aliens
        this.drawAliens(ctx);

        // Draw player
        this.drawPlayer(ctx);

        ctx.restore();
    }

    drawPlayer(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.playerX, this.playerY);

        // Shield effect
        if (this.shieldActive) {
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#22d3ee';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, this.playerSize + 10, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Ship body
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(0, -this.playerSize);
        ctx.lineTo(-this.playerSize * 0.8, this.playerSize * 0.7);
        ctx.lineTo(0, this.playerSize * 0.4);
        ctx.lineTo(this.playerSize * 0.8, this.playerSize * 0.7);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(0, -5, 8, 0, Math.PI * 2);
        ctx.fill();

        // Thruster glow
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(-6, this.playerSize * 0.5);
        ctx.lineTo(0, this.playerSize * 0.8 + Math.random() * 8);
        ctx.lineTo(6, this.playerSize * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    drawAliens(ctx: CanvasRenderingContext2D) {
        for (const alien of this.aliens) {
            ctx.save();
            ctx.translate(alien.x, alien.y);

            // Health bar for bigger aliens
            if (alien.type !== 'scout') {
                const barWidth = alien.size * 2;
                const healthPercent = alien.health / alien.maxHealth;
                ctx.fillStyle = '#333';
                ctx.fillRect(-barWidth / 2, -alien.size - 12, barWidth, 4);
                ctx.fillStyle = healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
                ctx.fillRect(-barWidth / 2, -alien.size - 12, barWidth * healthPercent, 4);
            }

            // Different alien designs
            switch (alien.type) {
                case 'boss':
                    // Large menacing ship
                    ctx.fillStyle = '#dc2626';
                    ctx.shadowColor = '#dc2626';
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.moveTo(0, -alien.size);
                    ctx.lineTo(-alien.size, alien.size * 0.3);
                    ctx.lineTo(-alien.size * 0.5, alien.size);
                    ctx.lineTo(alien.size * 0.5, alien.size);
                    ctx.lineTo(alien.size, alien.size * 0.3);
                    ctx.closePath();
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    // Eye
                    ctx.fillStyle = '#fbbf24';
                    ctx.beginPath();
                    ctx.arc(0, 0, 15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#000';
                    ctx.beginPath();
                    ctx.arc(0, 0, 6, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'elite':
                    ctx.fillStyle = '#a855f7';
                    ctx.beginPath();
                    ctx.moveTo(0, -alien.size);
                    ctx.lineTo(-alien.size * 0.9, 0);
                    ctx.lineTo(-alien.size * 0.5, alien.size);
                    ctx.lineTo(alien.size * 0.5, alien.size);
                    ctx.lineTo(alien.size * 0.9, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#c084fc';
                    ctx.beginPath();
                    ctx.arc(0, 0, 8, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'cruiser':
                    ctx.fillStyle = '#22c55e';
                    ctx.beginPath();
                    ctx.moveTo(0, -alien.size);
                    ctx.lineTo(-alien.size * 0.7, alien.size * 0.5);
                    ctx.lineTo(alien.size * 0.7, alien.size * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#86efac';
                    ctx.beginPath();
                    ctx.arc(0, 0, 6, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                case 'bomber':
                    ctx.fillStyle = '#f97316';
                    ctx.beginPath();
                    ctx.arc(0, 0, alien.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#fdba74';
                    ctx.beginPath();
                    ctx.arc(0, 0, alien.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    break;

                default: // scout
                    ctx.fillStyle = '#3b82f6';
                    ctx.beginPath();
                    ctx.moveTo(0, -alien.size);
                    ctx.lineTo(-alien.size * 0.6, alien.size * 0.5);
                    ctx.lineTo(alien.size * 0.6, alien.size * 0.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#93c5fd';
                    ctx.beginPath();
                    ctx.arc(0, -2, 5, 0, Math.PI * 2);
                    ctx.fill();
            }

            ctx.restore();
        }
    }

    drawProjectiles(ctx: CanvasRenderingContext2D) {
        for (const proj of this.projectiles) {
            if (proj.type === 'player') {
                ctx.fillStyle = this.multiShotActive ? '#22d3ee' : '#fbbf24';
                ctx.shadowColor = this.multiShotActive ? '#22d3ee' : '#fbbf24';
            } else {
                ctx.fillStyle = '#ef4444';
                ctx.shadowColor = '#ef4444';
            }
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    drawPowerUps(ctx: CanvasRenderingContext2D) {
        for (const p of this.powerUps) {
            const colors: Record<PowerUp['type'], string> = {
                shield: '#22d3ee',
                rapidFire: '#ef4444',
                multiShot: '#a855f7',
                solarFlare: '#fbbf24'
            };
            const icons: Record<PowerUp['type'], string> = {
                shield: '🛡️',
                rapidFire: '⚡',
                multiShot: '✨',
                solarFlare: '☀️'
            };

            ctx.fillStyle = colors[p.type];
            ctx.shadowColor = colors[p.type];
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icons[p.type], p.x, p.y);
        }
    }

    drawParticles(ctx: CanvasRenderingContext2D) {
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}
