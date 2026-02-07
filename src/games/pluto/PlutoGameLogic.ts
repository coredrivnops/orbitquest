// Pluto Game Logic - "ORBIT DEFENDER"
// A retro twin-stick shooter where Pluto defends against Kuiper Belt invaders

export interface Projectile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    trail: { x: number; y: number; alpha: number }[];
}

export interface Enemy {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    type: 'rock' | 'ice' | 'comet' | 'asteroid';
    health: number;
    rotation: number;
    rotationSpeed: number;
    points: number;
    color: string;
}

export interface Moon {
    id: string;
    name: string;
    angle: number;
    orbitRadius: number;
    radius: number;
    color: string;
    alive: boolean;
    respawnTimer: number;
    pulsePhase: number;
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
    type: 'explosion' | 'spark' | 'star' | 'trail';
}

export interface PowerUp {
    x: number;
    y: number;
    vx: number;
    vy: number;
    type: 'rapidfire' | 'spread' | 'shield' | 'freeze' | 'nuke' | 'heart';
    radius: number;
    pulsePhase: number;
}

interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

const MOON_DATA = [
    { id: 'charon', name: 'Charon', orbitRadius: 90, radius: 18, color: '#b8a090' },
    { id: 'nix', name: 'Nix', orbitRadius: 110, radius: 10, color: '#d0d0d0' },
    { id: 'hydra', name: 'Hydra', orbitRadius: 130, radius: 11, color: '#c8c8e0' },
    { id: 'kerberos', name: 'Kerberos', orbitRadius: 150, radius: 7, color: '#a8a8a8' },
    { id: 'styx', name: 'Styx', orbitRadius: 170, radius: 6, color: '#989898' },
];

const TRIVIA: TriviaQuestion[] = [
    { question: "What is Pluto's heart-shaped feature called?", answers: ["Pluto's Love", "Tombaugh Regio", "Heart Valley", "Icy Plain"], correct: 1, fact: "Tombaugh Regio is named after Clyde Tombaugh, who discovered Pluto in 1930!" },
    { question: "How many moons does Pluto have?", answers: ["1", "3", "5", "7"], correct: 2, fact: "Pluto has 5 moons: Charon, Nix, Hydra, Kerberos, and Styx!" },
    { question: "When was Pluto demoted from planet status?", answers: ["2000", "2006", "2010", "2015"], correct: 1, fact: "The IAU reclassified Pluto as a 'dwarf planet' in August 2006." },
    { question: "What spacecraft visited Pluto in 2015?", answers: ["Voyager", "Cassini", "New Horizons", "Juno"], correct: 2, fact: "New Horizons flew by Pluto after a 9.5-year journey!" },
    { question: "How long is a year on Pluto?", answers: ["165 years", "200 years", "248 years", "300 years"], correct: 2, fact: "Pluto takes 248 Earth years to orbit the Sun once!" },
    { question: "What gives Pluto its reddish color?", answers: ["Rust", "Tholins", "Iron", "Blood"], correct: 1, fact: "Tholins are complex organic molecules created by UV light hitting nitrogen and methane!" },
];

export class PlutoGameLogic {
    width: number;
    height: number;
    centerX: number;
    centerY: number;

    // Pluto
    plutoRadius: number;
    plutoRotation: number;
    aimAngle: number;

    // Shooting
    projectiles: Projectile[];
    shootCooldown: number;
    maxShootCooldown: number;
    spreadShot: boolean;
    spreadShotTimer: number;

    // Moons (shields)
    moons: Moon[];
    moonOrbitSpeed: number;

    // Enemies
    enemies: Enemy[];
    waveNumber: number;
    enemiesPerWave: number;
    enemiesSpawned: number;
    waveComplete: boolean;
    betweenWaves: boolean;
    waveTimer: number;
    spawnTimer: number;

    // Power-ups
    powerUps: PowerUp[];
    freezeActive: boolean;
    freezeTimer: number;
    heartShield: boolean;

    // Effects
    particles: Particle[];
    screenShake: number;

    // Game state
    score: number;
    stardustCollected: number;
    isGameOver: boolean;
    gameTime: number;
    combo: number;
    comboTimer: number;

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;

    // Visual
    backgroundStars: { x: number; y: number; size: number; twinkle: number }[];
    pulsePhase: number;
    gridOffset: number;

    // Session
    sessionStardust: number;
    maxSessionStardust: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.plutoRadius = 35;
        this.maxSessionStardust = 80;

        // Initialize all properties
        this.plutoRotation = 0;
        this.aimAngle = 0;
        this.projectiles = [];
        this.shootCooldown = 0;
        this.maxShootCooldown = 12;
        this.spreadShot = false;
        this.spreadShotTimer = 0;
        this.moons = [];
        this.moonOrbitSpeed = 0.02;
        this.enemies = [];
        this.waveNumber = 0;
        this.enemiesPerWave = 5;
        this.enemiesSpawned = 0;
        this.waveComplete = false;
        this.betweenWaves = true;
        this.waveTimer = 0;
        this.spawnTimer = 0;
        this.powerUps = [];
        this.freezeActive = false;
        this.freezeTimer = 0;
        this.heartShield = false;
        this.particles = [];
        this.screenShake = 0;
        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.backgroundStars = [];
        this.pulsePhase = 0;
        this.gridOffset = 0;

        this.initializeStars();
        this.reset();
    }

    initializeStars() {
        for (let i = 0; i < 100; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
            });
        }
    }

    reset() {
        this.plutoRotation = 0;
        this.aimAngle = 0;
        this.projectiles = [];
        this.shootCooldown = 0;
        this.maxShootCooldown = 12;
        this.spreadShot = false;
        this.spreadShotTimer = 0;

        // Initialize moons
        this.moons = MOON_DATA.map((data, index) => ({
            ...data,
            angle: (Math.PI * 2 * index) / MOON_DATA.length,
            alive: true,
            respawnTimer: 0,
            pulsePhase: Math.random() * Math.PI * 2,
        }));

        this.enemies = [];
        this.waveNumber = 0;
        this.enemiesPerWave = 5;
        this.enemiesSpawned = 0;
        this.waveComplete = false;
        this.betweenWaves = true;
        this.waveTimer = 120; // 2 seconds before first wave
        this.spawnTimer = 0;

        this.powerUps = [];
        this.freezeActive = false;
        this.freezeTimer = 0;
        this.heartShield = false;

        this.particles = [];
        this.screenShake = 0;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.combo = 1;
        this.comboTimer = 0;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
    }

    handleInput(mouseX: number, mouseY: number, shooting: boolean) {
        // Calculate aim angle
        const dx = mouseX - this.centerX;
        const dy = mouseY - this.centerY;
        this.aimAngle = Math.atan2(dy, dx);

        // Shooting
        if (shooting && this.shootCooldown <= 0 && !this.showTrivia && !this.isGameOver) {
            this.shoot();
        }
    }

    shoot() {
        const speed = 12;
        const spreadAngles = this.spreadShot ? [-0.2, 0, 0.2] : [0];

        spreadAngles.forEach(offset => {
            const angle = this.aimAngle + offset;
            this.projectiles.push({
                x: this.centerX + Math.cos(angle) * (this.plutoRadius + 10),
                y: this.centerY + Math.sin(angle) * (this.plutoRadius + 10),
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: 5,
                color: '#ff69b4',
                trail: [],
            });
        });

        this.shootCooldown = this.maxShootCooldown;

        // Muzzle flash particles
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.centerX + Math.cos(this.aimAngle) * (this.plutoRadius + 15),
                y: this.centerY + Math.sin(this.aimAngle) * (this.plutoRadius + 15),
                vx: Math.cos(this.aimAngle + (Math.random() - 0.5)) * 3,
                vy: Math.sin(this.aimAngle + (Math.random() - 0.5)) * 3,
                size: 3 + Math.random() * 3,
                color: '#ff69b4',
                life: 15,
                maxLife: 15,
                type: 'spark',
            });
        }
    }

    answerTrivia(index: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;

        if (index === this.currentTrivia.correct) {
            // Correct - bonus stardust and restore a moon
            const bonus = 5;
            if (this.sessionStardust < this.maxSessionStardust) {
                const earned = Math.min(bonus, this.maxSessionStardust - this.sessionStardust);
                this.stardustCollected += earned;
                this.sessionStardust += earned;
            }
            this.score += 500;

            // Restore a dead moon
            const deadMoon = this.moons.find(m => !m.alive);
            if (deadMoon) {
                deadMoon.alive = true;
                deadMoon.respawnTimer = 0;
            }

            this.createExplosion(this.centerX, this.centerY, '#00ff88', 30);
        }

        setTimeout(() => {
            this.showTrivia = false;
            this.currentTrivia = null;
            this.triviaAnswered = false;
            this.startNextWave();
        }, 2500);
    }

    startNextWave() {
        this.waveNumber++;
        this.enemiesPerWave = 5 + this.waveNumber * 2;
        this.enemiesSpawned = 0;
        this.waveComplete = false;
        this.betweenWaves = false;
        this.spawnTimer = 0;
    }

    spawnEnemy() {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.max(this.width, this.height) * 0.6;
        const x = this.centerX + Math.cos(angle) * distance;
        const y = this.centerY + Math.sin(angle) * distance;

        // Speed toward center with some randomness
        const speed = 1.5 + this.waveNumber * 0.2 + Math.random() * 0.5;
        const targetAngle = Math.atan2(this.centerY - y, this.centerX - x);
        const spread = (Math.random() - 0.5) * 0.3;

        const types: ('rock' | 'ice' | 'comet' | 'asteroid')[] = ['rock', 'ice', 'comet', 'asteroid'];
        const type = types[Math.floor(Math.random() * types.length)];

        const typeData = {
            rock: { radius: 20 + Math.random() * 15, health: 1, color: '#666666', points: 100 },
            ice: { radius: 15 + Math.random() * 10, health: 1, color: '#88ddff', points: 150 },
            comet: { radius: 18 + Math.random() * 12, health: 1, color: '#ffcc44', points: 200 },
            asteroid: { radius: 30 + Math.random() * 20, health: 2, color: '#885533', points: 300 },
        };

        const data = typeData[type];

        this.enemies.push({
            x, y,
            vx: Math.cos(targetAngle + spread) * speed,
            vy: Math.sin(targetAngle + spread) * speed,
            radius: data.radius,
            type,
            health: data.health,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            points: data.points,
            color: data.color,
        });

        this.enemiesSpawned++;
    }

    spawnPowerUp(x: number, y: number) {
        if (Math.random() > 0.15) return; // 15% chance

        const types: ('rapidfire' | 'spread' | 'shield' | 'freeze' | 'nuke' | 'heart')[] =
            ['rapidfire', 'spread', 'shield', 'freeze', 'nuke', 'heart'];
        const type = types[Math.floor(Math.random() * types.length)];

        this.powerUps.push({
            x, y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            type,
            radius: 15,
            pulsePhase: 0,
        });
    }

    collectPowerUp(powerUp: PowerUp) {
        switch (powerUp.type) {
            case 'rapidfire':
                this.maxShootCooldown = 6;
                setTimeout(() => { this.maxShootCooldown = 12; }, 8000);
                break;
            case 'spread':
                this.spreadShot = true;
                this.spreadShotTimer = 600; // 10 seconds
                break;
            case 'shield':
                const deadMoon = this.moons.find(m => !m.alive);
                if (deadMoon) {
                    deadMoon.alive = true;
                    deadMoon.respawnTimer = 0;
                }
                break;
            case 'freeze':
                this.freezeActive = true;
                this.freezeTimer = 300; // 5 seconds
                break;
            case 'nuke':
                // Destroy all enemies on screen
                this.enemies.forEach(e => {
                    this.createExplosion(e.x, e.y, e.color, 15);
                    this.score += e.points;
                });
                this.enemies = [];
                this.screenShake = 20;
                break;
            case 'heart':
                this.heartShield = true;
                break;
        }

        this.createExplosion(powerUp.x, powerUp.y, '#ffffff', 20);
    }

    update() {
        if (this.showTrivia || this.isGameOver) return;

        this.gameTime++;
        this.pulsePhase += 0.03;
        this.gridOffset = (this.gridOffset + 0.5) % 50;
        this.plutoRotation += 0.01;

        // Decrease screen shake
        if (this.screenShake > 0) this.screenShake *= 0.9;

        // Cooldowns
        if (this.shootCooldown > 0) this.shootCooldown--;
        if (this.spreadShotTimer > 0) {
            this.spreadShotTimer--;
            if (this.spreadShotTimer <= 0) this.spreadShot = false;
        }
        if (this.freezeTimer > 0) {
            this.freezeTimer--;
            if (this.freezeTimer <= 0) this.freezeActive = false;
        }

        // Combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.combo = 1;
        }

        // Wave management
        if (this.betweenWaves) {
            this.waveTimer--;
            if (this.waveTimer <= 0) {
                this.startNextWave();
            }
        } else {
            // Spawn enemies
            this.spawnTimer--;
            if (this.spawnTimer <= 0 && this.enemiesSpawned < this.enemiesPerWave) {
                this.spawnEnemy();
                this.spawnTimer = Math.max(30, 60 - this.waveNumber * 5);
            }

            // Check wave complete
            if (this.enemiesSpawned >= this.enemiesPerWave && this.enemies.length === 0) {
                this.waveComplete = true;
                this.betweenWaves = true;
                this.waveTimer = 120;

                // Trigger trivia every 2 waves
                if (this.waveNumber % 2 === 0) {
                    this.triggerTrivia();
                }
            }
        }

        // Update moons (orbit around Pluto)
        this.moons.forEach(moon => {
            moon.angle += this.moonOrbitSpeed;
            moon.pulsePhase += 0.05;
            if (!moon.alive) {
                moon.respawnTimer--;
                if (moon.respawnTimer <= 0 && Math.random() < 0.001) {
                    moon.alive = true;
                }
            }
        });

        // Update projectiles
        this.projectiles = this.projectiles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;

            // Trail
            p.trail.push({ x: p.x, y: p.y, alpha: 1 });
            if (p.trail.length > 10) p.trail.shift();
            p.trail.forEach(t => t.alpha *= 0.8);

            // Check collision with enemies
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                const dx = p.x - enemy.x;
                const dy = p.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < p.radius + enemy.radius) {
                    enemy.health--;
                    this.createExplosion(p.x, p.y, p.color, 8);

                    if (enemy.health <= 0) {
                        // Enemy destroyed!
                        this.createExplosion(enemy.x, enemy.y, enemy.color, 20);
                        const points = enemy.points * this.combo;
                        this.score += points;

                        // Stardust
                        const stars = Math.ceil(this.combo);
                        if (this.sessionStardust < this.maxSessionStardust) {
                            const earned = Math.min(stars, this.maxSessionStardust - this.sessionStardust);
                            this.stardustCollected += earned;
                            this.sessionStardust += earned;
                        }

                        // Combo
                        this.combo = Math.min(5, this.combo + 0.25);
                        this.comboTimer = 120;

                        // Power-up chance
                        this.spawnPowerUp(enemy.x, enemy.y);

                        this.enemies.splice(i, 1);
                        this.screenShake = 5;
                    }
                    return false; // Remove projectile
                }
            }

            // Remove if off screen
            return p.x > -50 && p.x < this.width + 50 && p.y > -50 && p.y < this.height + 50;
        });

        // Update enemies
        const freezeMultiplier = this.freezeActive ? 0.2 : 1;
        this.enemies.forEach(enemy => {
            enemy.x += enemy.vx * freezeMultiplier;
            enemy.y += enemy.vy * freezeMultiplier;
            enemy.rotation += enemy.rotationSpeed * freezeMultiplier;

            // Check collision with moons
            this.moons.forEach(moon => {
                if (!moon.alive) return;
                const moonX = this.centerX + Math.cos(moon.angle) * moon.orbitRadius;
                const moonY = this.centerY + Math.sin(moon.angle) * moon.orbitRadius;
                const dx = enemy.x - moonX;
                const dy = enemy.y - moonY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < enemy.radius + moon.radius) {
                    // Moon hit! Destroy enemy, disable moon temporarily
                    moon.alive = false;
                    moon.respawnTimer = 600; // 10 seconds
                    this.createExplosion(enemy.x, enemy.y, moon.color, 25);
                    this.createExplosion(moonX, moonY, '#ff4444', 15);

                    // Remove enemy
                    const idx = this.enemies.indexOf(enemy);
                    if (idx > -1) this.enemies.splice(idx, 1);

                    this.screenShake = 10;
                }
            });

            // Check collision with Pluto
            const dx = enemy.x - this.centerX;
            const dy = enemy.y - this.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < enemy.radius + this.plutoRadius) {
                if (this.heartShield) {
                    // Heart shield protects once
                    this.heartShield = false;
                    this.createExplosion(enemy.x, enemy.y, '#ff69b4', 30);
                    const idx = this.enemies.indexOf(enemy);
                    if (idx > -1) this.enemies.splice(idx, 1);
                    this.screenShake = 15;
                } else {
                    // Game over!
                    this.isGameOver = true;
                    this.createExplosion(this.centerX, this.centerY, '#ff4444', 50);
                    this.screenShake = 30;
                }
            }
        });

        // Update power-ups
        this.powerUps = this.powerUps.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.98;
            p.vy *= 0.98;
            p.pulsePhase += 0.1;

            // Check collection (near Pluto)
            const dx = p.x - this.centerX;
            const dy = p.y - this.centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.plutoRadius + 30) {
                this.collectPowerUp(p);
                return false;
            }

            // Remove if off screen
            return p.x > -50 && p.x < this.width + 50 && p.y > -50 && p.y < this.height + 50;
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;
            p.life--;
            return p.life > 0;
        });
    }

    triggerTrivia() {
        this.currentTrivia = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        this.showTrivia = true;
        this.triviaAnswered = false;
    }

    createExplosion(x: number, y: number, color: string, count: number) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                color,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                type: 'explosion',
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Apply screen shake
        ctx.save();
        if (this.screenShake > 0.5) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }

        // Background - deep space with grid
        this.drawBackground(ctx);

        // Draw danger zones (edges glow when enemies coming)
        this.drawDangerZones(ctx);

        // Draw projectile trails
        this.projectiles.forEach(p => {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            p.trail.forEach((t, i) => {
                ctx.globalAlpha = t.alpha * 0.5;
                if (i === 0) ctx.moveTo(t.x, t.y);
                else ctx.lineTo(t.x, t.y);
            });
            ctx.stroke();
            ctx.globalAlpha = 1;
        });

        // Draw projectiles
        this.projectiles.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Draw power-ups
        this.powerUps.forEach(p => {
            this.drawPowerUp(ctx, p);
        });

        // Draw enemies
        this.enemies.forEach(e => {
            this.drawEnemy(ctx, e);
        });

        // Draw moon orbit paths (faint)
        ctx.strokeStyle = 'rgba(168, 139, 250, 0.1)';
        ctx.lineWidth = 1;
        this.moons.forEach(moon => {
            ctx.beginPath();
            ctx.arc(this.centerX, this.centerY, moon.orbitRadius, 0, Math.PI * 2);
            ctx.stroke();
        });

        // Draw moons
        this.moons.forEach(moon => {
            if (moon.alive) {
                const x = this.centerX + Math.cos(moon.angle) * moon.orbitRadius;
                const y = this.centerY + Math.sin(moon.angle) * moon.orbitRadius;

                // Glow
                ctx.shadowColor = moon.color;
                ctx.shadowBlur = 15;

                const grad = ctx.createRadialGradient(x - moon.radius * 0.3, y - moon.radius * 0.3, 0, x, y, moon.radius);
                grad.addColorStop(0, moon.color);
                grad.addColorStop(1, this.darkenColor(moon.color));
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, moon.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
            }
        });

        // Draw Pluto
        this.drawPluto(ctx);

        // Draw aiming line
        if (!this.isGameOver && !this.showTrivia) {
            ctx.strokeStyle = 'rgba(255, 105, 180, 0.4)';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(
                this.centerX + Math.cos(this.aimAngle) * 200,
                this.centerY + Math.sin(this.aimAngle) * 200
            );
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        ctx.restore();

        // UI (not affected by screen shake)
        this.drawUI(ctx);
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        // Deep space gradient
        const bgGrad = ctx.createRadialGradient(this.centerX, this.centerY, 0, this.centerX, this.centerY, this.width);
        bgGrad.addColorStop(0, '#1a0a2a');
        bgGrad.addColorStop(0.5, '#0d0518');
        bgGrad.addColorStop(1, '#050208');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Grid lines (retro feel)
        ctx.strokeStyle = 'rgba(168, 139, 250, 0.1)';
        ctx.lineWidth = 1;
        for (let x = this.gridOffset; x < this.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
            ctx.stroke();
        }
        for (let y = this.gridOffset; y < this.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
            ctx.stroke();
        }

        // Stars
        this.backgroundStars.forEach(star => {
            const twinkle = Math.sin(star.twinkle + this.pulsePhase) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawDangerZones(ctx: CanvasRenderingContext2D) {
        // Glow at edges where enemies are coming from
        this.enemies.forEach(e => {
            // Only for enemies near edges
            const margin = 100;
            if (e.x < margin || e.x > this.width - margin || e.y < margin || e.y > this.height - margin) {
                const gradient = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 100);
                gradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(e.x - 100, e.y - 100, 200, 200);
            }
        });
    }

    drawPluto(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.rotate(this.plutoRotation);

        // Outer glow (pulsing)
        const glowSize = this.plutoRadius + 15 + Math.sin(this.pulsePhase) * 5;
        const glow = ctx.createRadialGradient(0, 0, this.plutoRadius, 0, 0, glowSize);
        glow.addColorStop(0, 'rgba(255, 105, 180, 0.6)');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Heart shield indicator
        if (this.heartShield) {
            ctx.strokeStyle = '#ff69b4';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(0, 0, this.plutoRadius + 25, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Main body
        const bodyGrad = ctx.createRadialGradient(-10, -10, 0, 0, 0, this.plutoRadius);
        bodyGrad.addColorStop(0, '#e8dcc8');
        bodyGrad.addColorStop(0.5, '#a89070');
        bodyGrad.addColorStop(1, '#6a5040');
        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = '#ff69b4';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, this.plutoRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Heart feature
        ctx.fillStyle = 'rgba(255, 220, 200, 0.8)';
        const hs = this.plutoRadius * 0.35;
        ctx.beginPath();
        ctx.moveTo(5, hs * 0.2);
        ctx.bezierCurveTo(5 + hs * 0.4, -hs * 0.3, 5 + hs * 0.8, hs * 0.1, 5, hs * 0.7);
        ctx.bezierCurveTo(5 - hs * 0.8, hs * 0.1, 5 - hs * 0.4, -hs * 0.3, 5, hs * 0.2);
        ctx.fill();

        ctx.restore();
    }

    drawEnemy(ctx: CanvasRenderingContext2D, enemy: Enemy) {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.rotation);

        // Freeze effect
        if (this.freezeActive) {
            ctx.fillStyle = 'rgba(136, 221, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(0, 0, enemy.radius + 10, 0, Math.PI * 2);
            ctx.fill();
        }

        // Enemy body
        ctx.fillStyle = enemy.color;
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 10;

        if (enemy.type === 'comet') {
            // Comet with tail
            ctx.beginPath();
            ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
            ctx.fill();

            // Tail
            ctx.fillStyle = `${enemy.color}66`;
            ctx.beginPath();
            ctx.moveTo(enemy.radius, 0);
            ctx.lineTo(enemy.radius * 2.5, -enemy.radius * 0.8);
            ctx.lineTo(enemy.radius * 2.5, enemy.radius * 0.8);
            ctx.closePath();
            ctx.fill();
        } else if (enemy.type === 'asteroid') {
            // Rough asteroid shape
            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 * i) / 8;
                const r = enemy.radius * (0.8 + Math.random() * 0.4);
                if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            // Round rock/ice
            ctx.beginPath();
            ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
            ctx.fill();

            if (enemy.type === 'ice') {
                // Ice highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(-enemy.radius * 0.3, -enemy.radius * 0.3, enemy.radius * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawPowerUp(ctx: CanvasRenderingContext2D, powerUp: PowerUp) {
        const pulse = Math.sin(powerUp.pulsePhase) * 0.2 + 1;
        const r = powerUp.radius * pulse;

        ctx.save();
        ctx.translate(powerUp.x, powerUp.y);

        // Glow
        const colors: Record<string, string> = {
            rapidfire: '#ff4444',
            spread: '#ff9900',
            shield: '#00ff88',
            freeze: '#88ddff',
            nuke: '#ff00ff',
            heart: '#ff69b4',
        };
        const color = colors[powerUp.type];

        ctx.shadowColor = color;
        ctx.shadowBlur = 20;

        // Hexagon shape
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();

        // Icon
        ctx.fillStyle = '#fff';
        ctx.font = `${r}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const icons: Record<string, string> = {
            rapidfire: '⚡',
            spread: '🔥',
            shield: '🛡️',
            freeze: '❄️',
            nuke: '💥',
            heart: '❤️',
        };
        ctx.fillText(icons[powerUp.type], 0, 2);

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // Wave indicator
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`WAVE ${this.waveNumber}`, this.centerX, 40);

        if (this.betweenWaves && !this.showTrivia && this.waveNumber > 0) {
            ctx.fillStyle = '#00ff88';
            ctx.font = '18px Arial';
            ctx.fillText('WAVE COMPLETE!', this.centerX, 70);
        }

        // Score (top left)
        ctx.textAlign = 'left';
        ctx.font = 'bold 28px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, 20, 40);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText(`Score: ${this.score.toLocaleString()}`, 20, 70);

        // Combo (if active)
        if (this.combo > 1) {
            ctx.fillStyle = '#ff69b4';
            ctx.font = 'bold 18px Arial';
            ctx.fillText(`x${this.combo.toFixed(1)} COMBO`, 20, 95);
        }

        // Power-up status
        ctx.textAlign = 'right';
        let statusY = 40;
        if (this.spreadShot) {
            ctx.fillStyle = '#ff9900';
            ctx.font = '14px Arial';
            ctx.fillText(`🔥 SPREAD: ${Math.ceil(this.spreadShotTimer / 60)}s`, this.width - 20, statusY);
            statusY += 20;
        }
        if (this.freezeActive) {
            ctx.fillStyle = '#88ddff';
            ctx.font = '14px Arial';
            ctx.fillText(`❄️ FREEZE: ${Math.ceil(this.freezeTimer / 60)}s`, this.width - 20, statusY);
            statusY += 20;
        }
        if (this.heartShield) {
            ctx.fillStyle = '#ff69b4';
            ctx.font = '14px Arial';
            ctx.fillText('❤️ SHIELD ACTIVE', this.width - 20, statusY);
            statusY += 20;
        }

        // Moon status (bottom)
        const aliveMoons = this.moons.filter(m => m.alive).length;
        ctx.textAlign = 'center';
        ctx.fillStyle = aliveMoons > 2 ? '#00ff88' : aliveMoons > 0 ? '#ffaa00' : '#ff4444';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`MOON SHIELDS: ${aliveMoons}/5`, this.centerX, this.height - 20);

        // Instructions (first few seconds)
        if (this.gameTime < 180 && !this.isGameOver) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '16px Arial';
            ctx.fillText('Move mouse to aim • Click to shoot • Protect Pluto!', this.centerX, this.height - 50);
        }
    }

    darkenColor(hex: string): string {
        const r = parseInt(hex.slice(1, 3), 16) * 0.6;
        const g = parseInt(hex.slice(3, 5), 16) * 0.6;
        const b = parseInt(hex.slice(5, 7), 16) * 0.6;
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
}
