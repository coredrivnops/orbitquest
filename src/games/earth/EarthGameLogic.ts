// Earth Game Logic - "LAST STAND: EARTH"
// Bullet Heaven / Vampire Survivors style alien defense!
// Auto-fire weapons, collect XP, evolve your arsenal!
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
    type: 'laser' | 'missile' | 'plasma' | 'lightning' | 'pulse' | 'alien';
    size: number;
    piercing: boolean;
    hitsLeft: number;
}

interface XPOrb {
    x: number;
    y: number;
    value: number;
    magnetized: boolean;
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
    type: 'explosion' | 'spark' | 'smoke' | 'xp' | 'levelup';
}

interface Weapon {
    type: 'laser' | 'missile' | 'plasma' | 'lightning' | 'pulse' | 'orbital';
    level: number;
    cooldown: number;
    currentCooldown: number;
    damage: number;
    projectileSpeed: number;
    projectileCount: number;
}

interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

const EARTH_TRIVIA: TriviaQuestion[] = [
    { question: "What percentage of Earth is covered by water?", answers: ["50%", "71%", "85%", "60%"], correct: 1, fact: "About 71% of Earth's surface is covered by water, mostly in oceans!" },
    { question: "How old is planet Earth?", answers: ["1 billion years", "4.5 billion years", "10 billion years", "100 million years"], correct: 1, fact: "Earth formed about 4.5 billion years ago from a cloud of gas and dust!" },
    { question: "What protects Earth from solar radiation?", answers: ["The Moon", "Ozone layer", "Magnetic field", "Both B & C"], correct: 3, fact: "Earth's magnetic field and ozone layer work together to protect life from harmful radiation!" },
    { question: "What is Earth's only natural satellite?", answers: ["Mars", "The Sun", "The Moon", "Venus"], correct: 2, fact: "The Moon is Earth's only natural satellite, formed about 4.5 billion years ago!" },
    { question: "What is the hottest layer of Earth?", answers: ["Crust", "Mantle", "Outer Core", "Inner Core"], correct: 3, fact: "Earth's inner core is as hot as the Sun's surface - about 5,400°C!" },
];

const WEAPON_UPGRADES = [
    { type: 'laser', name: '⚡ Laser Beam', desc: '+1 Laser | Fast, reliable' },
    { type: 'missile', name: '🚀 Homing Missile', desc: '+1 Missile | Seeks targets' },
    { type: 'plasma', name: '💥 Plasma Burst', desc: '+1 Plasma | High damage' },
    { type: 'lightning', name: '⛈️ Chain Lightning', desc: '+1 Lightning | Chains to enemies' },
    { type: 'pulse', name: '🌀 Pulse Wave', desc: '+1 Pulse | 360° attack' },
    { type: 'orbital', name: '🛡️ Orbital Shield', desc: '+1 Orbital | Rotating protection' },
];

export class EarthGameLogic {
    width: number;
    height: number;

    // Player (Defense Satellite)
    playerX: number;
    playerY: number;
    playerSize: number;
    targetX: number;
    targetY: number;

    // Weapons
    weapons: Weapon[];
    orbitals: { angle: number; speed: number }[];

    // Game entities
    aliens: Alien[];
    projectiles: Projectile[];
    xpOrbs: XPOrb[];
    particles: Particle[];
    nextId: number;

    // Game state
    score: number;
    xp: number;
    xpToLevel: number;
    level: number;
    earthHealth: number;
    maxEarthHealth: number;
    gameTime: number;
    waveNumber: number;
    isGameOver: boolean;
    isPaused: boolean;

    // Combo system
    combo: number;
    comboTimer: number;
    killStreak: number;
    lastKillStreakAnnounce: number;

    // Visual effects
    screenShake: number;
    flashIntensity: number;

    // Level up
    showLevelUp: boolean;
    levelUpChoices: typeof WEAPON_UPGRADES;

    // Spawn control
    alienSpawnTimer: number;
    bossActive: boolean;

    // Stars background
    stars: { x: number; y: number; size: number; brightness: number }[];

    // Session stardust
    sessionStardust: number;
    maxSessionStardust: number;

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;
    lastTriviaIndex: number;

    // Callbacks
    onScoreUpdate?: (score: number) => void;
    onHealthUpdate?: (health: number) => void;
    onGameOver?: () => void;
    onLevelUp?: (choices: typeof WEAPON_UPGRADES) => void;
    onKillStreak?: (streak: number, name: string) => void;
    onStardustCollected?: (amount: number) => void;
    onTriviaShow?: (trivia: TriviaQuestion) => void;
    onTriviaResult?: (correct: boolean, fact: string) => void;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.initStars();
        this.weapons = [];
        this.orbitals = [];
        this.aliens = [];
        this.projectiles = [];
        this.xpOrbs = [];
        this.particles = [];
        this.nextId = 0;
        this.levelUpChoices = [];
        this.currentTrivia = null;

        // Initialize default values
        this.playerX = width / 2;
        this.playerY = height / 2;
        this.playerSize = 25;
        this.targetX = width / 2;
        this.targetY = height / 2;
        this.score = 0;
        this.xp = 0;
        this.xpToLevel = 10;
        this.level = 1;
        this.earthHealth = 100;
        this.maxEarthHealth = 100;
        this.gameTime = 0;
        this.waveNumber = 1;
        this.isGameOver = false;
        this.isPaused = false;
        this.combo = 0;
        this.comboTimer = 0;
        this.killStreak = 0;
        this.lastKillStreakAnnounce = 0;
        this.screenShake = 0;
        this.flashIntensity = 0;
        this.showLevelUp = false;
        this.alienSpawnTimer = 0;
        this.bossActive = false;
        this.sessionStardust = 0;
        this.maxSessionStardust = 200;
        this.showTrivia = false;
        this.triviaAnswered = false;
        this.lastTriviaIndex = -1;

        this.reset();
    }

    initStars() {
        this.stars = [];
        for (let i = 0; i < 150; i++) {
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
        this.playerY = this.height / 2;
        this.targetX = this.width / 2;
        this.targetY = this.height / 2;

        // Start with basic laser
        this.weapons = [{
            type: 'laser',
            level: 1,
            cooldown: 10, // Faster fire rate
            currentCooldown: 0,
            damage: 15, // More starting damage
            projectileSpeed: 14, // Faster projectiles
            projectileCount: 2 // Start with 2 bullets
        }];
        this.orbitals = [];

        this.aliens = [];
        this.projectiles = [];
        this.xpOrbs = [];
        this.particles = [];
        this.nextId = 0;

        this.score = 0;
        this.xp = 0;
        this.xpToLevel = 8; // Faster first level up
        this.level = 1;
        this.earthHealth = 150; // More starting health
        this.maxEarthHealth = 150;
        this.gameTime = 0;
        this.waveNumber = 1;
        this.isGameOver = false;
        this.isPaused = false;

        this.combo = 0;
        this.comboTimer = 0;
        this.killStreak = 0;
        this.lastKillStreakAnnounce = 0;

        this.screenShake = 0;
        this.flashIntensity = 0;
        this.showLevelUp = false;
        this.alienSpawnTimer = 0;
        this.bossActive = false;

        this.sessionStardust = 0;
        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
    }

    handleMouseMove(x: number, y: number) {
        if (this.isGameOver || this.showLevelUp || this.showTrivia) return;
        this.targetX = x;
        this.targetY = y;
    }

    selectUpgrade(index: number) {
        if (!this.showLevelUp || index >= this.levelUpChoices.length) return;

        const choice = this.levelUpChoices[index];
        const existingWeapon = this.weapons.find(w => w.type === choice.type as Weapon['type']);

        if (existingWeapon) {
            existingWeapon.level++;
            existingWeapon.damage *= 1.2;
            existingWeapon.projectileCount++;
            existingWeapon.cooldown = Math.max(5, existingWeapon.cooldown - 2);
        } else if (choice.type === 'orbital') {
            this.orbitals.push({ angle: this.orbitals.length * (Math.PI * 2 / 4), speed: 0.03 });
        } else {
            const baseStats: Record<string, Partial<Weapon>> = {
                laser: { cooldown: 15, damage: 10, projectileSpeed: 12 },
                missile: { cooldown: 45, damage: 25, projectileSpeed: 6 },
                plasma: { cooldown: 30, damage: 40, projectileSpeed: 8 },
                lightning: { cooldown: 40, damage: 15, projectileSpeed: 15 },
                pulse: { cooldown: 60, damage: 20, projectileSpeed: 5 },
            };
            const stats = baseStats[choice.type] || baseStats.laser;
            this.weapons.push({
                type: choice.type as Weapon['type'],
                level: 1,
                cooldown: stats.cooldown!,
                currentCooldown: 0,
                damage: stats.damage!,
                projectileSpeed: stats.projectileSpeed!,
                projectileCount: 1
            });
        }

        this.showLevelUp = false;
        this.isPaused = false;
        this.createLevelUpEffect();
    }

    answerTrivia(index: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;
        this.triviaAnswered = true;
        const correct = index === this.currentTrivia.correct;

        if (correct) {
            this.score += 500;
            this.sessionStardust = Math.min(this.maxSessionStardust, this.sessionStardust + 20);
            this.earthHealth = Math.min(this.maxEarthHealth, this.earthHealth + 10);
            this.createLevelUpEffect();
            this.onStardustCollected?.(20);
            soundManager.playLevelUp();
        }

        this.onTriviaResult?.(correct, this.currentTrivia.fact);

        setTimeout(() => {
            this.showTrivia = false;
            this.currentTrivia = null;
            this.triviaAnswered = false;
        }, 2500);
    }

    triggerTrivia() {
        const available = EARTH_TRIVIA.filter((_, i) => i !== this.lastTriviaIndex);
        const trivia = available[Math.floor(Math.random() * available.length)];
        this.currentTrivia = trivia;
        this.showTrivia = true;
        this.lastTriviaIndex = EARTH_TRIVIA.indexOf(trivia);
        this.onTriviaShow?.(trivia);
    }

    spawnAlien() {
        const edge = Math.floor(Math.random() * 4);
        let x: number, y: number;

        switch (edge) {
            case 0: x = Math.random() * this.width; y = -50; break;
            case 1: x = this.width + 50; y = Math.random() * this.height; break;
            case 2: x = Math.random() * this.width; y = this.height + 50; break;
            default: x = -50; y = Math.random() * this.height; break;
        }

        const difficulty = 1 + this.gameTime / 3600;
        const types: Alien['type'][] = ['scout', 'scout', 'scout', 'cruiser', 'bomber'];
        if (this.gameTime > 1800) types.push('elite');
        const type = types[Math.floor(Math.random() * types.length)];

        const stats: Record<Alien['type'], { health: number; speed: number; size: number; value: number }> = {
            scout: { health: 20 * difficulty, speed: 2.5, size: 15, value: 10 },
            cruiser: { health: 50 * difficulty, speed: 1.5, size: 25, value: 25 },
            bomber: { health: 40 * difficulty, speed: 1.8, size: 22, value: 20 },
            elite: { health: 100 * difficulty, speed: 2, size: 30, value: 50 },
            boss: { health: 500 * difficulty, speed: 0.8, size: 60, value: 200 },
        };

        const s = stats[type];
        const angle = Math.atan2(this.height / 2 - y, this.width / 2 - x);

        this.aliens.push({
            id: this.nextId++,
            x, y,
            type,
            health: s.health,
            maxHealth: s.health,
            speed: s.speed,
            size: s.size,
            angle,
            shootTimer: Math.random() * 60,
            value: s.value
        });
    }

    spawnBoss() {
        if (this.bossActive) return;
        this.bossActive = true;

        const difficulty = 1 + this.gameTime / 3600;
        this.aliens.push({
            id: this.nextId++,
            x: this.width / 2,
            y: -80,
            type: 'boss',
            health: 500 * difficulty,
            maxHealth: 500 * difficulty,
            speed: 0.8,
            size: 60,
            angle: Math.PI / 2,
            shootTimer: 0,
            value: 200
        });
    }

    fireWeapons() {
        for (const weapon of this.weapons) {
            weapon.currentCooldown--;
            if (weapon.currentCooldown <= 0) {
                weapon.currentCooldown = weapon.cooldown;
                this.fireWeapon(weapon);
            }
        }
    }

    fireWeapon(weapon: Weapon) {
        const nearestAlien = this.findNearestAlien();
        if (!nearestAlien && weapon.type !== 'pulse') return;

        soundManager.playShoot(); // Play sound when firing

        const count = weapon.projectileCount;
        const spreadAngle = Math.min(count * 0.15, Math.PI / 3);

        for (let i = 0; i < count; i++) {
            let angle: number;
            if (weapon.type === 'pulse') {
                angle = (Math.PI * 2 / count) * i;
            } else if (nearestAlien) {
                const baseAngle = Math.atan2(nearestAlien.y - this.playerY, nearestAlien.x - this.playerX);
                const offset = count > 1 ? (i / (count - 1) - 0.5) * spreadAngle : 0;
                angle = baseAngle + offset;
            } else {
                continue;
            }

            this.projectiles.push({
                id: this.nextId++,
                x: this.playerX,
                y: this.playerY,
                vx: Math.cos(angle) * weapon.projectileSpeed,
                vy: Math.sin(angle) * weapon.projectileSpeed,
                damage: weapon.damage,
                type: weapon.type as Projectile['type'],
                size: weapon.type === 'plasma' ? 8 : weapon.type === 'missile' ? 6 : 4,
                piercing: weapon.type === 'lightning',
                hitsLeft: weapon.type === 'lightning' ? 3 : 1
            });
        }
    }

    findNearestAlien(): Alien | null {
        let nearest: Alien | null = null;
        let minDist = Infinity;
        for (const alien of this.aliens) {
            const dist = Math.hypot(alien.x - this.playerX, alien.y - this.playerY);
            if (dist < minDist) {
                minDist = dist;
                nearest = alien;
            }
        }
        return nearest;
    }

    update(deltaTime: number = 1) {
        if (this.isGameOver || this.showLevelUp || this.showTrivia) return;

        this.gameTime++;

        // Move player towards target smoothly
        const dx = this.targetX - this.playerX;
        const dy = this.targetY - this.playerY;
        const moveLerp = 1 - Math.pow(1 - 0.1, deltaTime);
        this.playerX += dx * moveLerp;
        this.playerY += dy * moveLerp;

        // Keep player in bounds
        this.playerX = Math.max(30, Math.min(this.width - 30, this.playerX));
        this.playerY = Math.max(30, Math.min(this.height - 30, this.playerY));

        // Fire weapons
        this.fireWeapons();

        // Update orbitals
        for (const orbital of this.orbitals) {
            orbital.angle += orbital.speed * deltaTime;
        }

        // Spawn aliens - starts slow, gets faster
        this.alienSpawnTimer += deltaTime;
        const spawnRate = Math.max(40, 120 - this.gameTime / 100); // Slower initially
        if (this.alienSpawnTimer >= spawnRate) {
            this.alienSpawnTimer = 0;
            this.spawnAlien();
        }

        // Boss every 60 seconds
        if (this.gameTime > 0 && this.gameTime % 3600 === 0) {
            this.spawnBoss();
        }

        // Trivia every 45 seconds
        if (this.gameTime > 0 && this.gameTime % 2700 === 0 && !this.showTrivia) {
            this.triggerTrivia();
        }

        // Update aliens
        this.updateAliens(deltaTime);

        // Update projectiles
        this.updateProjectiles(deltaTime);

        // Collect XP orbs
        this.collectXP(deltaTime);

        // Update particles
        this.updateParticles(deltaTime);

        // Combo timer
        if (this.comboTimer > 0) {
            this.comboTimer -= deltaTime;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }

        // Decay effects
        this.screenShake = Math.max(0, this.screenShake - 0.5 * deltaTime);
        this.flashIntensity = Math.max(0, this.flashIntensity - 0.02 * deltaTime);

        // Score over time
        if (this.gameTime % 60 === 0) {
            this.score += 5 * (1 + Math.floor(this.gameTime / 1800));
        }

        // Wave progression
        this.waveNumber = 1 + Math.floor(this.gameTime / 1800);
    }

    updateAliens(deltaTime: number = 1) {
        for (const alien of this.aliens) {
            // Move towards center (Earth)
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const angle = Math.atan2(centerY - alien.y, centerX - alien.x);
            alien.x += Math.cos(angle) * alien.speed * deltaTime;
            alien.y += Math.sin(angle) * alien.speed * deltaTime;
            alien.angle = angle;

            // Alien shooting
            alien.shootTimer -= deltaTime;
            if (alien.shootTimer <= 0 && (alien.type === 'cruiser' || alien.type === 'bomber' || alien.type === 'elite' || alien.type === 'boss')) {
                alien.shootTimer = alien.type === 'boss' ? 30 : 90;
                const shootAngle = Math.atan2(this.playerY - alien.y, this.playerX - alien.x);

                const bulletCount = alien.type === 'boss' ? 5 : 1;
                for (let i = 0; i < bulletCount; i++) {
                    const spread = bulletCount > 1 ? (i - (bulletCount - 1) / 2) * 0.3 : 0;
                    this.projectiles.push({
                        id: this.nextId++,
                        x: alien.x,
                        y: alien.y,
                        vx: Math.cos(shootAngle + spread) * 4,
                        vy: Math.sin(shootAngle + spread) * 4,
                        damage: alien.type === 'boss' ? 15 : 10,
                        type: 'alien',
                        size: 6,
                        piercing: false,
                        hitsLeft: 1
                    });
                }
            }

            // Check if alien reached Earth (center)
            const distToCenter = Math.hypot(alien.x - centerX, alien.y - centerY);
            if (distToCenter < 50) {
                this.earthHealth -= alien.type === 'boss' ? 30 : 10;
                this.screenShake = 15;
                this.createExplosion(alien.x, alien.y, '#ff4444', 10);
                alien.health = 0;
                this.onHealthUpdate?.(this.earthHealth);

                if (this.earthHealth <= 0) {
                    this.earthHealth = 0;
                    this.isGameOver = true;
                    this.onGameOver?.();
                }
            }
        }

        // Remove dead aliens
        this.aliens = this.aliens.filter(a => a.health > 0);
        if (!this.aliens.some(a => a.type === 'boss')) {
            this.bossActive = false;
        }
    }

    updateProjectiles(deltaTime: number = 1) {
        for (const proj of this.projectiles) {
            proj.x += proj.vx * deltaTime;
            proj.y += proj.vy * deltaTime;

            // Missile homing
            if (proj.type === 'missile') {
                const nearest = this.findNearestAlien();
                if (nearest) {
                    const angle = Math.atan2(nearest.y - proj.y, nearest.x - proj.x);
                    const currentAngle = Math.atan2(proj.vy, proj.vx);
                    const diff = angle - currentAngle;
                    const turnSpeed = 0.08;
                    const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed);
                    const speed = Math.hypot(proj.vx, proj.vy);
                    proj.vx = Math.cos(newAngle) * speed;
                    proj.vy = Math.sin(newAngle) * speed;
                }
            }

            // Check collisions
            if (proj.type === 'alien') {
                // Alien projectile hitting player
                const distToPlayer = Math.hypot(proj.x - this.playerX, proj.y - this.playerY);
                if (distToPlayer < this.playerSize + proj.size) {
                    this.earthHealth -= proj.damage;
                    this.screenShake = 5;
                    this.flashIntensity = 0.3;
                    proj.hitsLeft = 0;
                    this.onHealthUpdate?.(this.earthHealth);
                    soundManager.playCrash();

                    if (this.earthHealth <= 0) {
                        this.earthHealth = 0;
                        this.isGameOver = true;
                        this.onGameOver?.();
                    }
                }
            } else {
                // Player projectile hitting aliens
                for (const alien of this.aliens) {
                    const dist = Math.hypot(proj.x - alien.x, proj.y - alien.y);
                    if (dist < alien.size + proj.size) {
                        alien.health -= proj.damage * (1 + this.combo * 0.1);
                        this.createHitSparks(proj.x, proj.y);

                        if (alien.health <= 0) {
                            this.handleAlienDeath(alien);
                        }

                        proj.hitsLeft--;
                        if (proj.hitsLeft <= 0) break;
                    }
                }
            }

            // Check orbital collision
            for (const orbital of this.orbitals) {
                const orbX = this.playerX + Math.cos(orbital.angle) * 50;
                const orbY = this.playerY + Math.sin(orbital.angle) * 50;
                if (proj.type === 'alien') {
                    const dist = Math.hypot(proj.x - orbX, proj.y - orbY);
                    if (dist < 20) {
                        proj.hitsLeft = 0;
                        this.createHitSparks(proj.x, proj.y);
                    }
                }
            }
        }

        // Orbital damage to aliens
        for (const orbital of this.orbitals) {
            const orbX = this.playerX + Math.cos(orbital.angle) * 50;
            const orbY = this.playerY + Math.sin(orbital.angle) * 50;
            for (const alien of this.aliens) {
                const dist = Math.hypot(alien.x - orbX, alien.y - orbY);
                if (dist < alien.size + 15) {
                    alien.health -= 2;
                    if (alien.health <= 0) {
                        this.handleAlienDeath(alien);
                    }
                }
            }
        }

        // Remove off-screen and dead projectiles
        this.projectiles = this.projectiles.filter(p =>
            p.hitsLeft > 0 &&
            p.x > -50 && p.x < this.width + 50 &&
            p.y > -50 && p.y < this.height + 50
        );
    }

    handleAlienDeath(alien: Alien) {
        this.score += alien.value * (1 + this.combo * 0.2);
        this.combo++;
        this.comboTimer = 120;
        this.killStreak++;

        // XP orb
        this.xpOrbs.push({
            x: alien.x,
            y: alien.y,
            value: alien.type === 'boss' ? 20 : alien.type === 'elite' ? 5 : 1,
            magnetized: false
        });

        // Explosion effect
        const explosionSize = alien.type === 'boss' ? 30 : alien.type === 'elite' ? 15 : 8;
        this.createExplosion(alien.x, alien.y, this.getAlienColor(alien.type), explosionSize);
        soundManager.playExplosion();

        if (alien.type === 'boss') {
            this.screenShake = 20;
            this.flashIntensity = 0.5;
            this.sessionStardust = Math.min(this.maxSessionStardust, this.sessionStardust + 30);
            this.onStardustCollected?.(30);
        }

        // Kill streak announcements
        const streakMilestones = [5, 10, 25, 50, 100];
        if (streakMilestones.includes(this.killStreak) && this.killStreak > this.lastKillStreakAnnounce) {
            this.lastKillStreakAnnounce = this.killStreak;
            const names = ['', '', '', '', '', 'KILLING SPREE!', '', '', '', '', 'RAMPAGE!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'UNSTOPPABLE!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'GODLIKE!', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'LEGENDARY!'];
            this.onKillStreak?.(this.killStreak, names[this.killStreak] || `${this.killStreak} KILLS!`);
        }

        this.sessionStardust = Math.min(this.maxSessionStardust, this.sessionStardust + 1);
        this.onScoreUpdate?.(this.score);
    }

    collectXP(deltaTime: number = 1) {
        const magnetRange = 100 + this.level * 10;

        for (const orb of this.xpOrbs) {
            const dist = Math.hypot(orb.x - this.playerX, orb.y - this.playerY);

            if (dist < magnetRange) {
                orb.magnetized = true;
            }

            if (orb.magnetized) {
                const angle = Math.atan2(this.playerY - orb.y, this.playerX - orb.x);
                orb.x += Math.cos(angle) * 8 * deltaTime;
                orb.y += Math.sin(angle) * 8 * deltaTime;
            }

            if (dist < 20) {
                this.xp += orb.value;
                orb.value = 0;
                soundManager.playCollect();

                // Level up check
                if (this.xp >= this.xpToLevel) {
                    this.xp -= this.xpToLevel;
                    this.level++;
                    this.xpToLevel = Math.floor(this.xpToLevel * 1.5);
                    this.showLevelUp = true;
                    this.isPaused = true;

                    // Generate upgrade choices
                    const shuffled = [...WEAPON_UPGRADES].sort(() => Math.random() - 0.5);
                    this.levelUpChoices = shuffled.slice(0, 3);
                    this.onLevelUp?.(this.levelUpChoices);
                }
            }
        }

        this.xpOrbs = this.xpOrbs.filter(o => o.value > 0);
    }

    updateParticles(deltaTime: number = 1) {
        for (const p of this.particles) {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.vy += 0.05 * deltaTime; // gravity
            p.life -= deltaTime;
        }
        this.particles = this.particles.filter(p => p.life > 0);
    }

    createExplosion(x: number, y: number, color: string, count: number) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 3 + Math.random() * 5,
                color,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                type: 'explosion'
            });
        }
    }

    createHitSparks(x: number, y: number) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 2,
                color: '#ffff00',
                life: 15,
                maxLife: 15,
                type: 'spark'
            });
        }
    }

    createLevelUpEffect() {
        for (let i = 0; i < 30; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4,
                color: '#00ffff',
                life: 40,
                maxLife: 40,
                type: 'levelup'
            });
        }
    }

    getAlienColor(type: Alien['type']): string {
        switch (type) {
            case 'scout': return '#44ff44';
            case 'cruiser': return '#ff8844';
            case 'bomber': return '#ff44ff';
            case 'elite': return '#ff4444';
            case 'boss': return '#ff0000';
            default: return '#ffffff';
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Apply screen shake
        ctx.save();
        if (this.screenShake > 0) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake,
                (Math.random() - 0.5) * this.screenShake
            );
        }

        // Background
        this.drawBackground(ctx);

        // Earth at center
        this.drawEarth(ctx);

        // XP Orbs
        this.drawXPOrbs(ctx);

        // Aliens
        this.drawAliens(ctx);

        // Projectiles
        this.drawProjectiles(ctx);

        // Player satellite
        this.drawPlayer(ctx);

        // Particles
        this.drawParticles(ctx);

        // UI
        this.drawUI(ctx);

        // Flash effect
        if (this.flashIntensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashIntensity})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        ctx.restore();
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        // Space gradient
        const gradient = ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width
        );
        gradient.addColorStop(0, '#0a0a20');
        gradient.addColorStop(0.5, '#050510');
        gradient.addColorStop(1, '#000005');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        for (const star of this.stars) {
            const twinkle = 0.5 + 0.5 * Math.sin(this.gameTime * 0.05 + star.x);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawEarth(ctx: CanvasRenderingContext2D) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const radius = 45;

        // Glow
        const glow = ctx.createRadialGradient(cx, cy, radius, cx, cy, radius + 30);
        glow.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
        glow.addColorStop(1, 'rgba(100, 150, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 30, 0, Math.PI * 2);
        ctx.fill();

        // Earth
        const earthGrad = ctx.createRadialGradient(cx - 10, cy - 10, 0, cx, cy, radius);
        earthGrad.addColorStop(0, '#4488ff');
        earthGrad.addColorStop(0.5, '#2266dd');
        earthGrad.addColorStop(1, '#1144aa');
        ctx.fillStyle = earthGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Continents (simplified)
        ctx.fillStyle = '#44aa44';
        ctx.beginPath();
        ctx.ellipse(cx - 15, cy - 10, 12, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy + 5, 10, 15, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Health ring
        const healthPercent = this.earthHealth / this.maxEarthHealth;
        ctx.strokeStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, radius + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * healthPercent);
        ctx.stroke();
    }

    drawPlayer(ctx: CanvasRenderingContext2D) {
        const x = this.playerX;
        const y = this.playerY;

        // Orbitals
        for (const orbital of this.orbitals) {
            const orbX = x + Math.cos(orbital.angle) * 50;
            const orbY = y + Math.sin(orbital.angle) * 50;

            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(orbX, orbY, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(orbX, orbY, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        // Satellite body
        ctx.fillStyle = '#888899';
        ctx.fillRect(x - 8, y - 12, 16, 24);

        // Solar panels
        ctx.fillStyle = '#3366cc';
        ctx.fillRect(x - 30, y - 6, 20, 12);
        ctx.fillRect(x + 10, y - 6, 20, 12);

        // Panel lines
        ctx.strokeStyle = '#224488';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(x - 30 + i * 5, y - 6);
            ctx.lineTo(x - 30 + i * 5, y + 6);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 10 + i * 5, y - 6);
            ctx.lineTo(x + 10 + i * 5, y + 6);
            ctx.stroke();
        }

        // Antenna
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x, y - 22);
        ctx.stroke();
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(x, y - 22, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAliens(ctx: CanvasRenderingContext2D) {
        for (const alien of this.aliens) {
            const color = this.getAlienColor(alien.type);

            // Health bar for bigger aliens
            if (alien.type !== 'scout') {
                const barWidth = alien.size * 2;
                const barHeight = 4;
                const healthPercent = alien.health / alien.maxHealth;

                ctx.fillStyle = '#333333';
                ctx.fillRect(alien.x - barWidth / 2, alien.y - alien.size - 10, barWidth, barHeight);
                ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
                ctx.fillRect(alien.x - barWidth / 2, alien.y - alien.size - 10, barWidth * healthPercent, barHeight);
            }

            // Alien ship
            ctx.save();
            ctx.translate(alien.x, alien.y);
            ctx.rotate(alien.angle + Math.PI / 2);

            if (alien.type === 'boss') {
                // Boss ship - large and menacing
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(0, -alien.size);
                ctx.lineTo(-alien.size * 0.8, alien.size * 0.5);
                ctx.lineTo(-alien.size * 0.3, alien.size * 0.3);
                ctx.lineTo(0, alien.size);
                ctx.lineTo(alien.size * 0.3, alien.size * 0.3);
                ctx.lineTo(alien.size * 0.8, alien.size * 0.5);
                ctx.closePath();
                ctx.fill();

                // Boss details
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(0, 0, 15, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Regular ships - triangular
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(0, -alien.size);
                ctx.lineTo(-alien.size * 0.7, alien.size * 0.5);
                ctx.lineTo(alien.size * 0.7, alien.size * 0.5);
                ctx.closePath();
                ctx.fill();

                // Cockpit
                ctx.fillStyle = '#ffff44';
                ctx.beginPath();
                ctx.arc(0, -alien.size * 0.3, alien.size * 0.25, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    drawProjectiles(ctx: CanvasRenderingContext2D) {
        for (const proj of this.projectiles) {
            ctx.save();
            ctx.translate(proj.x, proj.y);
            ctx.rotate(Math.atan2(proj.vy, proj.vx));

            switch (proj.type) {
                case 'laser':
                    ctx.fillStyle = '#00ffff';
                    ctx.fillRect(-8, -2, 16, 4);
                    break;
                case 'missile':
                    ctx.fillStyle = '#ff8800';
                    ctx.beginPath();
                    ctx.moveTo(8, 0);
                    ctx.lineTo(-6, -4);
                    ctx.lineTo(-6, 4);
                    ctx.closePath();
                    ctx.fill();
                    // Trail
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.moveTo(-6, 0);
                    ctx.lineTo(-12, -2);
                    ctx.lineTo(-12, 2);
                    ctx.closePath();
                    ctx.fill();
                    break;
                case 'plasma':
                    const plasmaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, proj.size);
                    plasmaGrad.addColorStop(0, '#ff00ff');
                    plasmaGrad.addColorStop(0.5, '#ff00aa');
                    plasmaGrad.addColorStop(1, 'rgba(255, 0, 100, 0)');
                    ctx.fillStyle = plasmaGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, proj.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'lightning':
                    ctx.strokeStyle = '#88ffff';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-8, 0);
                    ctx.lineTo(-4, -3);
                    ctx.lineTo(0, 2);
                    ctx.lineTo(4, -2);
                    ctx.lineTo(8, 0);
                    ctx.stroke();
                    break;
                case 'pulse':
                    ctx.fillStyle = 'rgba(0, 255, 200, 0.7)';
                    ctx.beginPath();
                    ctx.arc(0, 0, proj.size, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'alien':
                    ctx.fillStyle = '#ff4444';
                    ctx.beginPath();
                    ctx.arc(0, 0, proj.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffaa00';
                    ctx.beginPath();
                    ctx.arc(0, 0, proj.size * 0.5, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }

            ctx.restore();
        }
    }

    drawXPOrbs(ctx: CanvasRenderingContext2D) {
        for (const orb of this.xpOrbs) {
            const glow = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, 12);
            glow.addColorStop(0, '#00ff88');
            glow.addColorStop(0.5, '#00aa55');
            glow.addColorStop(1, 'rgba(0, 255, 100, 0)');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, 12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#aaffaa';
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawParticles(ctx: CanvasRenderingContext2D) {
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // XP Bar at bottom
        const barWidth = this.width - 100;
        const barX = 50;
        const barY = this.height - 30;

        ctx.fillStyle = '#333355';
        ctx.fillRect(barX, barY, barWidth, 15);

        ctx.fillStyle = '#00ff88';
        ctx.fillRect(barX, barY, barWidth * (this.xp / this.xpToLevel), 15);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`LVL ${this.level}`, barX + barWidth / 2, barY + 12);

        // Combo display
        if (this.combo > 1) {
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(`${this.combo}x COMBO!`, this.width - 20, 80);
        }

        // Wave indicator
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`WAVE ${this.waveNumber}`, 20, this.height - 50);

        // Time survived
        const minutes = Math.floor(this.gameTime / 3600);
        const seconds = Math.floor((this.gameTime % 3600) / 60);
        ctx.fillText(`TIME: ${minutes}:${seconds.toString().padStart(2, '0')}`, 20, this.height - 70);
    }
}
