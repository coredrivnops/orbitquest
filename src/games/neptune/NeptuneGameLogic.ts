// Neptune Game Logic - "MACH SURFER"
// Horizontal supersonic wind racing through Neptune's atmosphere!
// Unique mechanic: Surf wind currents, break the sound barrier, collect diamonds!

interface WindCurrent {
    x: number;
    y: number;
    width: number;
    height: number;
    direction: number; // 1 = tailwind (speed boost), -1 = headwind (slow)
    strength: number;
    color: string;
}

interface Diamond {
    x: number;
    y: number;
    size: number;
    type: 'normal' | 'blue' | 'rainbow';
    value: number;
    rotation: number;
    sparkle: number;
}

interface IcebergObstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    type: 'small' | 'medium' | 'large' | 'storm';
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

interface Aurora {
    y: number;
    amplitude: number;
    frequency: number;
    phase: number;
    color: string;
    speed: number;
}

interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

const TRIVIA: TriviaQuestion[] = [
    { question: "How fast are Neptune's winds?", answers: ["500 km/h", "1,200 km/h", "2,000 km/h", "3,500 km/h"], correct: 2, fact: "Neptune has the fastest winds in the solar system, reaching up to 2,000 km/h - faster than the speed of sound on Earth!" },
    { question: "Why is Neptune blue?", answers: ["Reflection of oceans", "Methane in atmosphere", "Blue ice on surface", "Nitrogen gas"], correct: 1, fact: "Methane in Neptune's atmosphere absorbs red light and reflects blue light back to space, giving it that stunning azure color." },
    { question: "What rains on Neptune?", answers: ["Water", "Sulfuric acid", "Diamonds", "Methane"], correct: 2, fact: "Scientists believe it literally rains diamonds on Neptune! High pressure converts methane into diamond crystals." },
    { question: "How long is a year on Neptune?", answers: ["84 Earth years", "165 Earth years", "248 Earth years", "365 Earth days"], correct: 1, fact: "Neptune takes 165 Earth years to orbit the Sun once. Since its discovery in 1846, it has completed only ONE full orbit!" },
    { question: "What is special about Triton?", answers: ["It has rings", "It orbits backwards", "It's the largest moon", "It has oceans"], correct: 1, fact: "Triton orbits Neptune in the opposite direction of the planet's rotation - the only large moon in the solar system to do this!" },
    { question: "How was Neptune discovered?", answers: ["By telescope", "By mathematical prediction", "By spacecraft", "By ancient astronomers"], correct: 1, fact: "Neptune was the first planet found through mathematical prediction! Irregularities in Uranus's orbit led to its discovery in 1846." },
    { question: "What type of planet is Neptune?", answers: ["Rocky planet", "Gas giant", "Ice giant", "Dwarf planet"], correct: 2, fact: "Neptune is an 'ice giant' - its interior is made of water, methane, and ammonia ices." },
    { question: "What happened to Neptune's Great Dark Spot?", answers: ["Still there", "It disappeared", "It grew larger", "It turned red"], correct: 1, fact: "Unlike Jupiter's Great Red Spot, Neptune's Great Dark Spot disappeared by 1994 - Neptune's storms are more dynamic!" },
];

export class NeptuneGameLogic {
    width: number;
    height: number;

    // Player probe - surfs horizontally
    playerX: number;
    playerY: number;
    playerVy: number; // Vertical velocity (player controls up/down)
    playerSpeed: number; // Current horizontal speed
    baseSpeed: number;
    maxSpeed: number;

    // Mach mechanics
    machNumber: number; // Current mach level (speed/343)
    isSuperSonic: boolean;
    sonicBoomCooldown: number;

    // Game state
    distance: number;
    score: number;
    stardustCollected: number;
    sessionStardust: number;
    diamondsCollected: number;
    isGameOver: boolean;
    gameTime: number;
    combo: number;
    comboTimer: number;
    maxCombo: number;

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;
    lastTriviaDistance: number;

    // Entities
    windCurrents: WindCurrent[];
    diamonds: Diamond[];
    obstacles: IcebergObstacle[];
    particles: Particle[];
    auroras: Aurora[];

    // Visual effects
    screenShake: number;
    speedLines: { x: number; y: number; length: number; speed: number }[];
    backgroundStars: { x: number; y: number; size: number; twinkle: number }[];

    // Spawning
    obstacleTimer: number;
    diamondTimer: number;
    windTimer: number;

    // Session cap
    readonly STARDUST_CAP = 60;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.playerX = 150; // Fixed X position (left side of screen)
        this.playerY = height / 2;
        this.playerVy = 0;
        this.playerSpeed = 300;
        this.baseSpeed = 300;
        this.maxSpeed = 800;

        this.machNumber = 0;
        this.isSuperSonic = false;
        this.sonicBoomCooldown = 0;

        this.distance = 0;
        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.diamondsCollected = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.maxCombo = 1;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaDistance = 0;

        this.windCurrents = [];
        this.diamonds = [];
        this.obstacles = [];
        this.particles = [];
        this.auroras = [];

        this.screenShake = 0;
        this.speedLines = [];
        this.backgroundStars = [];

        this.obstacleTimer = 0;
        this.diamondTimer = 0;
        this.windTimer = 0;

        this.initializeVisuals();
        this.reset();
    }

    initializeVisuals() {
        // Create speed lines
        for (let i = 0; i < 20; i++) {
            this.speedLines.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                length: 30 + Math.random() * 50,
                speed: 8 + Math.random() * 8
            });
        }

        // Create background stars
        for (let i = 0; i < 50; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 1 + Math.random() * 2,
                twinkle: Math.random() * Math.PI * 2
            });
        }

        // Create auroras
        for (let i = 0; i < 3; i++) {
            this.auroras.push({
                y: 50 + i * 80,
                amplitude: 20 + Math.random() * 30,
                frequency: 0.005 + Math.random() * 0.005,
                phase: Math.random() * Math.PI * 2,
                color: i === 0 ? '#00ffaa' : i === 1 ? '#00aaff' : '#aa00ff',
                speed: 0.02 + Math.random() * 0.02
            });
        }
    }

    reset() {
        this.playerX = 150;
        this.playerY = this.height / 2;
        this.playerVy = 0;
        this.playerSpeed = this.baseSpeed;

        this.machNumber = 0;
        this.isSuperSonic = false;
        this.sonicBoomCooldown = 0;

        this.distance = 0;
        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.diamondsCollected = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.combo = 1;
        this.comboTimer = 0;
        this.maxCombo = 1;

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaDistance = 0;

        this.windCurrents = [];
        this.diamonds = [];
        this.obstacles = [];
        this.particles = [];

        this.obstacleTimer = 0;
        this.diamondTimer = 0;
        this.windTimer = 0;

        this.screenShake = 0;
    }

    handleMouseMove(y: number) {
        if (this.showTrivia || this.isGameOver) return;
        // Player controls vertical position with mouse Y
        const targetY = Math.max(60, Math.min(this.height - 60, y));
        this.playerVy = (targetY - this.playerY) * 0.12;
    }

    answerTrivia(index: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;
        const correct = index === this.currentTrivia.correct;

        if (correct) {
            this.sessionStardust = Math.min(this.STARDUST_CAP, this.sessionStardust + 10);
            this.score += 500;
            this.combo = Math.min(5, this.combo + 1);
            this.createCollectEffect(this.width / 2, this.height / 2, '#00ff88');
        } else {
            this.combo = 1;
        }
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        setTimeout(() => {
            this.showTrivia = false;
            this.currentTrivia = null;
            this.triviaAnswered = false;
        }, 2500);
    }

    update() {
        if (this.isGameOver) return;
        if (this.showTrivia) return;

        this.gameTime++;

        // Speed decay (naturally slows down)
        this.playerSpeed = Math.max(this.baseSpeed * 0.8, this.playerSpeed - 0.5);

        // Update distance based on speed
        const speedFactor = this.playerSpeed / this.baseSpeed;
        this.distance += speedFactor * 2;

        // Calculate Mach number (speed of sound is ~343 m/s, we use game units)
        this.machNumber = this.playerSpeed / 343;
        const wasSuperSonic = this.isSuperSonic;
        this.isSuperSonic = this.machNumber >= 1.0;

        // Sonic boom effect when crossing Mach 1
        if (this.isSuperSonic && !wasSuperSonic && this.sonicBoomCooldown <= 0) {
            this.createSonicBoom();
            this.score += 200 * this.combo;
            this.sonicBoomCooldown = 120;
        }
        this.sonicBoomCooldown = Math.max(0, this.sonicBoomCooldown - 1);

        // Player vertical movement
        this.playerY += this.playerVy;
        this.playerVy *= 0.92; // Friction
        this.playerY = Math.max(60, Math.min(this.height - 60, this.playerY));

        // Score based on speed
        if (this.gameTime % 30 === 0) {
            this.score += Math.floor(this.machNumber * 10) * this.combo;
        }

        // Combo decay
        this.comboTimer++;
        if (this.comboTimer > 180) {
            this.combo = Math.max(1, this.combo - 0.5);
            this.comboTimer = 0;
        }

        // Trivia trigger every 5000 distance
        if (this.distance - this.lastTriviaDistance > 5000) {
            this.triggerTrivia();
            this.lastTriviaDistance = this.distance;
        }

        // Spawn wind currents
        this.windTimer++;
        if (this.windTimer > 90) {
            this.spawnWindCurrent();
            this.windTimer = 0;
        }

        // Spawn diamonds
        this.diamondTimer++;
        if (this.diamondTimer > 45) {
            this.spawnDiamond();
            this.diamondTimer = 0;
        }

        // Spawn obstacles (more as speed increases)
        this.obstacleTimer++;
        const obstacleInterval = Math.max(40, 80 - Math.floor(this.distance / 500));
        if (this.obstacleTimer > obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }

        // Update wind currents
        this.updateWindCurrents();

        // Update diamonds
        this.updateDiamonds();

        // Update obstacles
        this.updateObstacles();

        // Update particles
        this.updateParticles();

        // Update speed lines
        this.updateSpeedLines();

        // Update auroras
        this.auroras.forEach(a => a.phase += a.speed);

        // Screen shake decay
        this.screenShake *= 0.9;
    }

    triggerTrivia() {
        this.showTrivia = true;
        this.triviaAnswered = false;
        this.currentTrivia = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
    }

    spawnWindCurrent() {
        const isTailwind = Math.random() > 0.4; // 60% chance of boost
        this.windCurrents.push({
            x: this.width + 100,
            y: 80 + Math.random() * (this.height - 160),
            width: 200 + Math.random() * 200,
            height: 60 + Math.random() * 40,
            direction: isTailwind ? 1 : -1,
            strength: isTailwind ? 50 + Math.random() * 100 : 30 + Math.random() * 50,
            color: isTailwind ? 'rgba(0, 255, 200, 0.3)' : 'rgba(255, 100, 100, 0.3)'
        });
    }

    spawnDiamond() {
        const roll = Math.random();
        let type: 'normal' | 'blue' | 'rainbow' = 'normal';
        let value = 1;
        let size = 15;

        if (roll > 0.95) {
            type = 'rainbow';
            value = 5;
            size = 25;
        } else if (roll > 0.75) {
            type = 'blue';
            value = 2;
            size = 20;
        }

        this.diamonds.push({
            x: this.width + 50,
            y: 80 + Math.random() * (this.height - 160),
            size,
            type,
            value,
            rotation: 0,
            sparkle: 0
        });
    }

    spawnObstacle() {
        const roll = Math.random();
        let type: 'small' | 'medium' | 'large' | 'storm' = 'small';
        let width = 30;
        let height = 40;

        if (roll > 0.9) {
            type = 'storm';
            width = 80;
            height = 80;
        } else if (roll > 0.7) {
            type = 'large';
            width = 60;
            height = 70;
        } else if (roll > 0.4) {
            type = 'medium';
            width = 45;
            height = 55;
        }

        this.obstacles.push({
            x: this.width + 50,
            y: 60 + Math.random() * (this.height - 120),
            width,
            height,
            rotation: Math.random() * Math.PI * 2,
            type
        });
    }

    updateWindCurrents() {
        const scrollSpeed = this.playerSpeed / 30;

        for (let i = this.windCurrents.length - 1; i >= 0; i--) {
            const wind = this.windCurrents[i];
            wind.x -= scrollSpeed;

            // Check if player is in wind current
            if (this.playerX > wind.x && this.playerX < wind.x + wind.width &&
                this.playerY > wind.y && this.playerY < wind.y + wind.height) {

                if (wind.direction > 0) {
                    // Tailwind - speed boost!
                    this.playerSpeed = Math.min(this.maxSpeed, this.playerSpeed + wind.strength * 0.02);
                    this.createWindParticle(this.playerX - 20, this.playerY, '#00ffcc');
                } else {
                    // Headwind - slow down
                    this.playerSpeed = Math.max(this.baseSpeed * 0.6, this.playerSpeed - wind.strength * 0.03);
                    this.createWindParticle(this.playerX + 30, this.playerY, '#ff6666');
                }
            }

            // Remove off-screen
            if (wind.x + wind.width < 0) {
                this.windCurrents.splice(i, 1);
            }
        }
    }

    updateDiamonds() {
        const scrollSpeed = this.playerSpeed / 30;

        for (let i = this.diamonds.length - 1; i >= 0; i--) {
            const diamond = this.diamonds[i];
            diamond.x -= scrollSpeed;
            diamond.rotation += 0.05;
            diamond.sparkle = Math.sin(this.gameTime * 0.1 + i) * 0.5 + 0.5;

            // Collision with player
            const dx = this.playerX - diamond.x;
            const dy = this.playerY - diamond.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < diamond.size + 35) {
                // Collect diamond!
                this.diamondsCollected++;
                const stardustGain = Math.min(diamond.value, this.STARDUST_CAP - this.sessionStardust);
                this.sessionStardust += stardustGain;
                this.stardustCollected += stardustGain;
                this.score += diamond.value * 50 * this.combo;

                // Speed boost from collection
                this.playerSpeed = Math.min(this.maxSpeed, this.playerSpeed + 20);

                this.combo = Math.min(5, this.combo + 0.2);
                this.comboTimer = 0;
                this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));

                const colors: { [key: string]: string } = {
                    'normal': '#ffffff',
                    'blue': '#00ccff',
                    'rainbow': '#ff00ff'
                };
                this.createCollectEffect(diamond.x, diamond.y, colors[diamond.type]);
                this.diamonds.splice(i, 1);
                continue;
            }

            // Remove off-screen
            if (diamond.x < -50) {
                this.diamonds.splice(i, 1);
                this.combo = Math.max(1, this.combo - 0.3);
            }
        }
    }

    updateObstacles() {
        const scrollSpeed = this.playerSpeed / 30;

        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= scrollSpeed;
            obs.rotation += 0.02;

            // Collision with player
            const dx = this.playerX - obs.x;
            const dy = this.playerY - obs.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const collisionDist = (obs.width + obs.height) / 4 + 25;

            if (dist < collisionDist) {
                this.gameOver();
                return;
            }

            // Dodged bonus (passed player)
            if (obs.x < this.playerX - 50 && obs.x > this.playerX - 60) {
                this.score += 20 * this.combo;
            }

            // Remove off-screen
            if (obs.x < -100) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    updateSpeedLines() {
        const speedFactor = this.playerSpeed / this.baseSpeed;

        this.speedLines.forEach(line => {
            line.x -= line.speed * speedFactor;
            if (line.x < -line.length) {
                line.x = this.width + Math.random() * 50;
                line.y = Math.random() * this.height;
            }
        });

        // Update background stars
        this.backgroundStars.forEach(star => {
            star.x -= speedFactor * 0.5;
            star.twinkle += 0.05;
            if (star.x < 0) {
                star.x = this.width;
                star.y = Math.random() * this.height;
            }
        });
    }

    createWindParticle(x: number, y: number, color: string) {
        if (Math.random() > 0.3) return;
        this.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 4 - 2,
            vy: (Math.random() - 0.5) * 3,
            size: 3 + Math.random() * 4,
            color,
            life: 20,
            maxLife: 20
        });
    }

    createCollectEffect(x: number, y: number, color: string) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                size: 4 + Math.random() * 3,
                color,
                life: 30,
                maxLife: 30
            });
        }
    }

    createSonicBoom() {
        this.screenShake = 15;

        // Create ring of particles
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: Math.cos(angle) * 15,
                vy: Math.sin(angle) * 15,
                size: 6,
                color: '#00ffff',
                life: 25,
                maxLife: 25
            });
        }

        // Create shockwave trail
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.playerX - i * 5,
                y: this.playerY + (Math.random() - 0.5) * 60,
                vx: -8,
                vy: (Math.random() - 0.5) * 4,
                size: 4 + Math.random() * 4,
                color: '#ffffff',
                life: 20,
                maxLife: 20
            });
        }
    }

    gameOver() {
        this.isGameOver = true;
        this.screenShake = 20;

        // Explosion effect
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 10;
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 5 + Math.random() * 8,
                color: Math.random() > 0.5 ? '#00ccff' : '#ffffff',
                life: 50,
                maxLife: 50
            });
        }
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

        // Draw background
        this.drawBackground(ctx);

        // Draw auroras
        this.drawAuroras(ctx);

        // Draw wind currents
        this.windCurrents.forEach(wind => this.drawWindCurrent(ctx, wind));

        // Draw obstacles
        this.obstacles.forEach(obs => this.drawObstacle(ctx, obs));

        // Draw diamonds
        this.diamonds.forEach(d => this.drawDiamond(ctx, d));

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

        // Draw speed lines (when fast)
        if (this.machNumber > 0.5) {
            this.drawSpeedLines(ctx);
        }

        ctx.restore();

        // Draw UI
        this.drawUI(ctx);
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        // Deep blue gradient (Neptune's atmosphere)
        const grad = ctx.createLinearGradient(0, 0, 0, this.height);
        grad.addColorStop(0, '#000520');
        grad.addColorStop(0.3, '#001040');
        grad.addColorStop(0.6, '#002060');
        grad.addColorStop(1, '#003080');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw background stars
        this.backgroundStars.forEach(star => {
            const alpha = 0.3 + Math.sin(star.twinkle) * 0.3;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Atmospheric haze
        const haze = ctx.createRadialGradient(0, this.height / 2, 0, 0, this.height / 2, this.width);
        haze.addColorStop(0, 'rgba(0, 100, 200, 0.15)');
        haze.addColorStop(1, 'rgba(0, 50, 150, 0)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, this.width, this.height);
    }

    drawAuroras(ctx: CanvasRenderingContext2D) {
        this.auroras.forEach(aurora => {
            ctx.strokeStyle = aurora.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();

            for (let x = 0; x < this.width; x += 10) {
                const y = aurora.y + Math.sin(x * aurora.frequency + aurora.phase) * aurora.amplitude;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Glow effect
            ctx.strokeStyle = aurora.color;
            ctx.lineWidth = 8;
            ctx.globalAlpha = 0.1;
            ctx.stroke();
        });
        ctx.globalAlpha = 1;
    }

    drawWindCurrent(ctx: CanvasRenderingContext2D, wind: WindCurrent) {
        // Wind zone background
        const grad = ctx.createLinearGradient(wind.x, 0, wind.x + wind.width, 0);
        if (wind.direction > 0) {
            grad.addColorStop(0, 'rgba(0, 255, 200, 0)');
            grad.addColorStop(0.5, 'rgba(0, 255, 200, 0.25)');
            grad.addColorStop(1, 'rgba(0, 255, 200, 0)');
        } else {
            grad.addColorStop(0, 'rgba(255, 100, 100, 0)');
            grad.addColorStop(0.5, 'rgba(255, 100, 100, 0.2)');
            grad.addColorStop(1, 'rgba(255, 100, 100, 0)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(wind.x, wind.y, wind.width, wind.height);

        // Wind arrows
        const arrowColor = wind.direction > 0 ? '#00ffcc' : '#ff6666';
        ctx.fillStyle = arrowColor;
        ctx.globalAlpha = 0.6;

        for (let x = wind.x + 30; x < wind.x + wind.width - 30; x += 50) {
            const arrowX = x + (this.gameTime * (wind.direction > 0 ? 2 : -2)) % 50;
            if (arrowX > wind.x && arrowX < wind.x + wind.width - 20) {
                ctx.beginPath();
                if (wind.direction > 0) {
                    ctx.moveTo(arrowX, wind.y + wind.height / 2);
                    ctx.lineTo(arrowX - 10, wind.y + wind.height / 2 - 8);
                    ctx.lineTo(arrowX - 10, wind.y + wind.height / 2 + 8);
                } else {
                    ctx.moveTo(arrowX, wind.y + wind.height / 2);
                    ctx.lineTo(arrowX + 10, wind.y + wind.height / 2 - 8);
                    ctx.lineTo(arrowX + 10, wind.y + wind.height / 2 + 8);
                }
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    drawDiamond(ctx: CanvasRenderingContext2D, diamond: Diamond) {
        ctx.save();
        ctx.translate(diamond.x, diamond.y);
        ctx.rotate(diamond.rotation);

        // Glow
        const glowColors: { [key: string]: string } = {
            'normal': 'rgba(255, 255, 255, 0.5)',
            'blue': 'rgba(0, 200, 255, 0.6)',
            'rainbow': 'rgba(255, 0, 255, 0.6)'
        };
        ctx.shadowColor = glowColors[diamond.type];
        ctx.shadowBlur = 15 + diamond.sparkle * 10;

        // Diamond shape
        const colors: { [key: string]: string } = {
            'normal': '#ffffff',
            'blue': '#00ccff',
            'rainbow': '#ff66ff'
        };
        ctx.fillStyle = colors[diamond.type];

        ctx.beginPath();
        ctx.moveTo(0, -diamond.size);
        ctx.lineTo(diamond.size * 0.6, 0);
        ctx.lineTo(0, diamond.size * 0.6);
        ctx.lineTo(-diamond.size * 0.6, 0);
        ctx.closePath();
        ctx.fill();

        // Inner highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.moveTo(0, -diamond.size * 0.5);
        ctx.lineTo(diamond.size * 0.3, 0);
        ctx.lineTo(0, diamond.size * 0.2);
        ctx.lineTo(-diamond.size * 0.3, 0);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawObstacle(ctx: CanvasRenderingContext2D, obs: IcebergObstacle) {
        ctx.save();
        ctx.translate(obs.x, obs.y);
        ctx.rotate(obs.rotation);

        if (obs.type === 'storm') {
            // Storm vortex
            const stormGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, obs.width / 2);
            stormGrad.addColorStop(0, 'rgba(50, 50, 80, 0.9)');
            stormGrad.addColorStop(0.5, 'rgba(30, 30, 60, 0.8)');
            stormGrad.addColorStop(1, 'rgba(20, 20, 40, 0.5)');
            ctx.fillStyle = stormGrad;
            ctx.beginPath();
            ctx.arc(0, 0, obs.width / 2, 0, Math.PI * 2);
            ctx.fill();

            // Lightning
            if (Math.sin(this.gameTime * 0.3) > 0.8) {
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-5, -15);
                ctx.lineTo(5, 0);
                ctx.lineTo(-5, 5);
                ctx.lineTo(5, 20);
                ctx.stroke();
            }
        } else {
            // Ice crystal
            ctx.fillStyle = 'rgba(150, 220, 255, 0.85)';
            ctx.shadowColor = '#a5f3fc';
            ctx.shadowBlur = 10;

            // Irregular crystal shape
            ctx.beginPath();
            const points = 6;
            for (let i = 0; i < points; i++) {
                const angle = (Math.PI * 2 * i) / points;
                const r = (i % 2 === 0 ? obs.width : obs.width * 0.6) / 2;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();

            // Crystal edge
            ctx.strokeStyle = '#e0f7ff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawPlayer(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.playerX, this.playerY);

        // Supersonic glow effect
        if (this.isSuperSonic) {
            const sonicGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 80);
            sonicGlow.addColorStop(0, 'rgba(0, 255, 255, 0.4)');
            sonicGlow.addColorStop(0.5, 'rgba(0, 200, 255, 0.2)');
            sonicGlow.addColorStop(1, 'rgba(0, 150, 255, 0)');
            ctx.fillStyle = sonicGlow;
            ctx.beginPath();
            ctx.arc(0, 0, 80, 0, Math.PI * 2);
            ctx.fill();
        }

        // Engine trail
        const trailLength = 30 + (this.playerSpeed / this.baseSpeed) * 40;
        const trailGrad = ctx.createLinearGradient(-trailLength - 30, 0, -20, 0);
        trailGrad.addColorStop(0, 'rgba(0, 200, 255, 0)');
        trailGrad.addColorStop(0.5, 'rgba(0, 255, 255, 0.6)');
        trailGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.moveTo(-20, -8);
        ctx.lineTo(-trailLength - 30, 0);
        ctx.lineTo(-20, 8);
        ctx.closePath();
        ctx.fill();

        // Main probe body - sleek horizontal design
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;

        // Body gradient
        const bodyGrad = ctx.createLinearGradient(-25, -20, 25, 20);
        bodyGrad.addColorStop(0, '#e0f7ff');
        bodyGrad.addColorStop(0.5, '#a5d8ff');
        bodyGrad.addColorStop(1, '#74c0fc');
        ctx.fillStyle = bodyGrad;

        // Streamlined shape
        ctx.beginPath();
        ctx.moveTo(35, 0); // Nose
        ctx.quadraticCurveTo(25, -20, -15, -18);
        ctx.lineTo(-25, -12);
        ctx.lineTo(-25, 12);
        ctx.lineTo(-15, 18);
        ctx.quadraticCurveTo(25, 20, 35, 0);
        ctx.closePath();
        ctx.fill();

        // Cockpit
        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(15, 0, 12, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cockpit highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(18, -3, 5, 3, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#74c0fc';
        ctx.shadowBlur = 5;

        // Top wing
        ctx.beginPath();
        ctx.moveTo(-5, -15);
        ctx.lineTo(-15, -35);
        ctx.lineTo(-20, -35);
        ctx.lineTo(-20, -18);
        ctx.closePath();
        ctx.fill();

        // Bottom wing
        ctx.beginPath();
        ctx.moveTo(-5, 15);
        ctx.lineTo(-15, 35);
        ctx.lineTo(-20, 35);
        ctx.lineTo(-20, 18);
        ctx.closePath();
        ctx.fill();

        // Speed lines around probe when supersonic
        if (this.isSuperSonic) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const offset = (this.gameTime * 3 + i * 15) % 60;
                ctx.beginPath();
                ctx.moveTo(40 + offset, -25 + i * 10);
                ctx.lineTo(50 + offset, -25 + i * 10);
                ctx.stroke();
            }
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawSpeedLines(ctx: CanvasRenderingContext2D) {
        const alpha = Math.min(0.5, (this.machNumber - 0.5) * 0.8);
        ctx.strokeStyle = `rgba(150, 220, 255, ${alpha})`;
        ctx.lineWidth = 2;

        this.speedLines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line.x + line.length, line.y);
            ctx.lineTo(line.x, line.y);
            ctx.stroke();
        });
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // Mach meter (top center)
        const machX = this.width / 2;
        const machY = 40;

        ctx.textAlign = 'center';
        ctx.font = 'bold 28px Orbitron, sans-serif';

        if (this.isSuperSonic) {
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.fillText(`MACH ${this.machNumber.toFixed(1)} 🔊`, machX, machY);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`MACH ${this.machNumber.toFixed(2)}`, machX, machY);
        }
        ctx.shadowBlur = 0;

        // Speed bar
        const barWidth = 200;
        const barHeight = 10;
        const barX = machX - barWidth / 2;
        const barY = machY + 10;

        ctx.fillStyle = 'rgba(0, 50, 100, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        const speedPercent = Math.min(1, this.playerSpeed / this.maxSpeed);
        const speedGrad = ctx.createLinearGradient(barX, 0, barX + barWidth * speedPercent, 0);
        speedGrad.addColorStop(0, '#00aaff');
        speedGrad.addColorStop(0.5, '#00ffff');
        speedGrad.addColorStop(1, this.isSuperSonic ? '#ffffff' : '#00ffcc');
        ctx.fillStyle = speedGrad;
        ctx.fillRect(barX, barY, barWidth * speedPercent, barHeight);

        // Mach 1 marker
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        const machMarker = barX + (343 / this.maxSpeed) * barWidth;
        ctx.beginPath();
        ctx.moveTo(machMarker, barY - 3);
        ctx.lineTo(machMarker, barY + barHeight + 3);
        ctx.stroke();

        // Distance (top left)
        ctx.textAlign = 'left';
        ctx.font = 'bold 20px Rajdhani, sans-serif';
        ctx.fillStyle = '#00ccff';
        ctx.fillText(`DISTANCE: ${Math.floor(this.distance / 10)}km`, 20, 35);

        // Diamonds collected
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`💎 ${this.diamondsCollected}`, 20, 60);

        // Stardust
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.sessionStardust}`, 20, 85);

        // Combo
        if (this.combo > 1) {
            ctx.fillStyle = '#ff00ff';
            ctx.font = 'bold 22px Rajdhani';
            ctx.fillText(`🔥 x${Math.floor(this.combo)} COMBO`, 20, 115);
        }

        // Score (top right)
        ctx.textAlign = 'right';
        ctx.font = 'bold 24px Orbitron';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.width - 20, 35);

        // Wind speed
        ctx.font = '16px Rajdhani';
        ctx.fillStyle = '#88ccff';
        ctx.fillText(`WIND: ${Math.floor(this.playerSpeed * 6)} km/h`, this.width - 20, 58);

        // Instructions (bottom)
        ctx.textAlign = 'center';
        ctx.font = '14px Rajdhani';
        ctx.fillStyle = 'rgba(150, 200, 255, 0.6)';
        ctx.fillText('Move mouse UP/DOWN to navigate • Ride green wind currents for speed!', this.width / 2, this.height - 15);
    }

    getState() {
        return {
            score: this.score,
            distance: this.distance,
            stardustCollected: this.sessionStardust,
            diamondsCollected: this.diamondsCollected,
            isGameOver: this.isGameOver,
            showTrivia: this.showTrivia,
            currentTrivia: this.currentTrivia,
            triviaAnswered: this.triviaAnswered,
            machNumber: this.machNumber,
            isSuperSonic: this.isSuperSonic,
            combo: Math.floor(this.combo),
            maxCombo: this.maxCombo
        };
    }
}
