// Mercury Game Logic - "SUN CHASER"
// Race around Mercury staying in the shadow zone - outrun the deadly sunrise!

export interface ShadowZone {
    startAngle: number;
    endAngle: number;
}

export interface Crater {
    angle: number;
    size: number;
    hasItem: boolean;
    itemType: 'stardust' | 'shield' | 'speed' | null;
    collected: boolean;
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
    { question: "What is Mercury's orbital period?", answers: ["88 days", "365 days", "687 days", "29 years"], correct: 0, fact: "Mercury orbits the Sun in just 88 Earth days - the fastest of all planets!" },
    { question: "What is Mercury's surface temperature range?", answers: ["-50°C to 50°C", "-180°C to 430°C", "0°C to 100°C", "-100°C to 200°C"], correct: 1, fact: "Mercury has extreme temperatures: -180°C in shadow to 430°C in sunlight - the largest range of any planet!" },
    { question: "Does Mercury have any moons?", answers: ["1 moon", "2 moons", "No moons", "3 moons"], correct: 2, fact: "Mercury has no moons! It's too small and too close to the Sun to hold onto a moon." },
    { question: "How big is Mercury compared to Earth's Moon?", answers: ["Much larger", "About the same size", "Slightly smaller", "Half the size"], correct: 1, fact: "Mercury is only slightly larger than Earth's Moon - it's the smallest planet in our solar system!" },
    { question: "What is Mercury's core made of?", answers: ["Rock", "Gas", "Iron", "Ice"], correct: 2, fact: "Mercury has a massive iron core that makes up about 85% of the planet's radius - huge for its size!" },
    { question: "Why doesn't Mercury have an atmosphere?", answers: ["Too hot", "No gravity", "Solar wind strips it away", "It was never formed"], correct: 2, fact: "The Sun's solar wind constantly blasts Mercury's thin atmosphere away into space!" },
];

export class MercuryGameLogic {
    width: number;
    height: number;
    centerX: number;
    centerY: number;

    // Mercury
    mercuryRadius: number;

    // Player (rover on surface)
    playerAngle: number;
    playerSpeed: number;
    baseSpeed: number;
    boostedSpeed: number;
    isBoosting: boolean;

    // Sun and shadow
    sunAngle: number;
    sunSpeed: number;
    baseSunSpeed: number;
    shadowWidth: number; // in radians

    // Heat system
    heat: number;
    maxHeat: number;
    heatRate: number;
    coolRate: number;

    // Shield
    shieldPower: number;
    maxShield: number;
    shieldActive: boolean;

    // Craters (collectibles and obstacles)
    craters: Crater[];
    nextCraterSpawn: number;

    // Game state
    score: number;
    stardustCollected: number;
    distance: number;
    timeAlive: number;
    isGameOver: boolean;
    gameTime: number;
    level: number;

    // Particles
    particles: Particle[];

    // Trivia
    showTrivia: boolean;
    currentTrivia: TriviaQuestion | null;
    triviaAnswered: boolean;
    lastTriviaScore: number;

    // Visual
    starField: { x: number; y: number; size: number; twinkle: number }[];

    // Session
    sessionStardust: number;
    maxSessionStardust: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.mercuryRadius = 180;
        this.maxSessionStardust = 100;

        // SIMPLIFIED: Slower speeds for easier gameplay
        this.baseSpeed = 0.012;  // Slower base speed
        this.boostedSpeed = 0.022;  // Slower boost
        this.baseSunSpeed = 0.006;  // Sun chases slower
        this.shadowWidth = Math.PI * 0.75; // 135 degrees - BIGGER safe zone!
        this.maxHeat = 100;
        this.maxShield = 100;

        // Initialize
        this.playerAngle = Math.PI; // Start in shadow (opposite sun)
        this.playerSpeed = this.baseSpeed;
        this.isBoosting = false;

        this.sunAngle = 0;
        this.sunSpeed = this.baseSunSpeed;

        this.heat = 0;
        this.heatRate = 1.0;  // Slower heating
        this.coolRate = 3;    // Faster cooling
        this.shieldPower = 80; // Start with more shield
        this.shieldActive = false;

        this.craters = [];
        this.nextCraterSpawn = 0;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.distance = 0;
        this.timeAlive = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.level = 1;

        this.particles = [];

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaScore = 0;

        this.starField = [];

        this.initializeStars();
        this.initializeCraters();
        this.reset();
    }

    initializeStars() {
        for (let i = 0; i < 100; i++) {
            this.starField.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
            });
        }
    }

    initializeCraters() {
        // Create initial craters around Mercury
        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const hasItem = Math.random() > 0.4;
            const itemTypes: ('stardust' | 'shield' | 'speed')[] = ['stardust', 'stardust', 'shield', 'speed'];

            this.craters.push({
                angle,
                size: 15 + Math.random() * 20,
                hasItem,
                itemType: hasItem ? itemTypes[Math.floor(Math.random() * itemTypes.length)] : null,
                collected: false,
            });
        }
    }

    reset() {
        this.playerAngle = Math.PI;
        this.playerSpeed = this.baseSpeed;
        this.isBoosting = false;

        this.sunAngle = 0;
        this.sunSpeed = this.baseSunSpeed;
        this.shadowWidth = Math.PI * 0.75; // Reset bigger shadow

        this.heat = 0;
        this.shieldPower = 80;  // Start with more shield!
        this.shieldActive = false;

        this.craters = [];
        this.initializeCraters();
        this.nextCraterSpawn = 200;

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.distance = 0;
        this.timeAlive = 0;
        this.isGameOver = false;
        this.gameTime = 0;
        this.level = 1;

        this.particles = [];

        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.lastTriviaScore = 0;
    }

    handleInput(action: 'boost-start' | 'boost-stop' | 'shield-start' | 'shield-stop') {
        if (this.showTrivia || this.isGameOver) return;

        // SIMPLIFIED: Just one control - SPACE to boost!
        // Shield activates automatically when in sunlight and you have power
        if (action === 'boost-start') {
            this.isBoosting = true;
            this.playerSpeed = this.boostedSpeed;
        } else if (action === 'boost-stop') {
            this.isBoosting = false;
            this.playerSpeed = this.baseSpeed;
        }
        // Shield is now automatic - no manual control needed!
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
            this.shieldPower = Math.min(this.maxShield, this.shieldPower + 30);
            this.heat = Math.max(0, this.heat - 30);
            this.createCelebration();
        }

        setTimeout(() => {
            this.showTrivia = false;
            this.currentTrivia = null;
            this.triviaAnswered = false;
        }, 2500);
    }

    createCelebration() {
        const x = this.centerX + Math.cos(this.playerAngle) * (this.mercuryRadius + 30);
        const y = this.centerY + Math.sin(this.playerAngle) * (this.mercuryRadius + 30);

        for (let i = 0; i < 25; i++) {
            const angle = (Math.PI * 2 * i) / 25;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * (3 + Math.random() * 3),
                vy: Math.sin(angle) * (3 + Math.random() * 3),
                size: 4 + Math.random() * 4,
                color: ['#ffd700', '#00ff88', '#ff69b4'][Math.floor(Math.random() * 3)],
                life: 40,
                maxLife: 40,
            });
        }
    }

    isInShadow(): boolean {
        // Calculate if player is in shadow zone
        let angleDiff = this.playerAngle - (this.sunAngle + Math.PI);
        // Normalize to -PI to PI
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        return Math.abs(angleDiff) < this.shadowWidth / 2;
    }

    update() {
        if (this.showTrivia || this.isGameOver) return;

        this.gameTime++;
        this.timeAlive++;
        this.distance += this.playerSpeed * 100;

        // Level up - sun gets faster
        if (this.gameTime % 600 === 0) {
            this.level++;
            this.sunSpeed += 0.001;
            this.shadowWidth = Math.max(Math.PI * 0.3, this.shadowWidth - 0.05); // Shadow shrinks
        }

        // Player always moves forward (clockwise)
        this.playerAngle += this.playerSpeed;
        if (this.playerAngle > Math.PI * 2) this.playerAngle -= Math.PI * 2;

        // Sun also moves (chasing player)
        this.sunAngle += this.sunSpeed;
        if (this.sunAngle > Math.PI * 2) this.sunAngle -= Math.PI * 2;

        // Heat management
        const inShadow = this.isInShadow();

        if (inShadow) {
            // Cooling in shadow - recharge shield too!
            this.heat = Math.max(0, this.heat - this.coolRate);
            this.shieldPower = Math.min(this.maxShield, this.shieldPower + 0.3); // Recharge shield in shadow
            this.shieldActive = false;
        } else {
            // Heating in sunlight - AUTO-ACTIVATE SHIELD when available!
            if (this.shieldPower > 0) {
                this.shieldActive = true;
                this.shieldPower -= 0.4;
                this.heat += this.heatRate * 0.25; // Shield protects a lot!
            } else {
                this.shieldActive = false;
                this.heat += this.heatRate;
            }
        }

        // Game over if overheated
        if (this.heat >= this.maxHeat) {
            this.isGameOver = true;
            this.createDeathEffect();
        }

        // Create heat particles when hot
        if (!inShadow && Math.random() < 0.3) {
            const x = this.centerX + Math.cos(this.playerAngle) * (this.mercuryRadius + 30);
            const y = this.centerY + Math.sin(this.playerAngle) * (this.mercuryRadius + 30);
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 3 - 1,
                size: 3 + Math.random() * 3,
                color: this.heat > 70 ? '#ff4444' : '#ff8800',
                life: 20,
                maxLife: 20,
            });
        }

        // Check crater collisions / collectibles
        this.craters.forEach(crater => {
            const angleDiff = Math.abs(this.playerAngle - crater.angle);
            const normalizedDiff = Math.min(angleDiff, Math.PI * 2 - angleDiff);

            if (normalizedDiff < 0.15 && crater.hasItem && !crater.collected) {
                crater.collected = true;

                if (crater.itemType === 'stardust') {
                    if (this.sessionStardust < this.maxSessionStardust) {
                        this.stardustCollected++;
                        this.sessionStardust++;
                    }
                    this.score += 50;
                } else if (crater.itemType === 'shield') {
                    this.shieldPower = Math.min(this.maxShield, this.shieldPower + 25);
                    this.score += 100;
                } else if (crater.itemType === 'speed') {
                    // Temporary speed boost effect
                    this.playerSpeed = this.boostedSpeed * 1.5;
                    setTimeout(() => {
                        this.playerSpeed = this.isBoosting ? this.boostedSpeed : this.baseSpeed;
                    }, 2000);
                    this.score += 75;
                }

                this.createCollectEffect(crater);
            }
        });

        // Spawn new craters
        this.nextCraterSpawn--;
        if (this.nextCraterSpawn <= 0) {
            this.spawnCrater();
            this.nextCraterSpawn = 100 + Math.random() * 100;
        }

        // Score increases over time
        if (this.gameTime % 20 === 0) {
            this.score += 10 * this.level;
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            return p.life > 0;
        });

        // Trivia trigger
        if (this.score >= this.lastTriviaScore + 2000 && !this.showTrivia) {
            this.triggerTrivia();
            this.lastTriviaScore = this.score;
        }
    }

    spawnCrater() {
        // Spawn ahead of player
        const spawnAngle = this.playerAngle + Math.PI * 0.5 + Math.random() * Math.PI;
        const hasItem = Math.random() > 0.3;
        const itemTypes: ('stardust' | 'shield' | 'speed')[] = ['stardust', 'stardust', 'stardust', 'shield', 'speed'];

        this.craters.push({
            angle: spawnAngle % (Math.PI * 2),
            size: 15 + Math.random() * 20,
            hasItem,
            itemType: hasItem ? itemTypes[Math.floor(Math.random() * itemTypes.length)] : null,
            collected: false,
        });

        // Remove old craters
        if (this.craters.length > 20) {
            this.craters.shift();
        }
    }

    triggerTrivia() {
        this.currentTrivia = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
        this.showTrivia = true;
        this.triviaAnswered = false;
    }

    createCollectEffect(crater: Crater) {
        const x = this.centerX + Math.cos(crater.angle) * this.mercuryRadius;
        const y = this.centerY + Math.sin(crater.angle) * this.mercuryRadius;
        const color = crater.itemType === 'stardust' ? '#ffd700' :
            crater.itemType === 'shield' ? '#a855f7' : '#00ff88';

        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 4,
                color,
                life: 25,
                maxLife: 25,
            });
        }
    }

    createDeathEffect() {
        const x = this.centerX + Math.cos(this.playerAngle) * (this.mercuryRadius + 30);
        const y = this.centerY + Math.sin(this.playerAngle) * (this.mercuryRadius + 30);

        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 4 + Math.random() * 5,
                color: Math.random() > 0.5 ? '#ff4444' : '#ff8800',
                life: 50,
                maxLife: 50,
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Background
        this.drawBackground(ctx);

        // Sun glow
        this.drawSun(ctx);

        // Mercury
        this.drawMercury(ctx);

        // Shadow zone visualization
        this.drawShadowZone(ctx);

        // Craters with items
        this.craters.forEach(crater => {
            if (crater.hasItem && !crater.collected) {
                this.drawCraterItem(ctx, crater);
            }
        });

        // Player
        if (!this.isGameOver) {
            this.drawPlayer(ctx);
        }

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // UI
        this.drawUI(ctx);
    }

    drawBackground(ctx: CanvasRenderingContext2D) {
        // Space gradient
        const grad = ctx.createRadialGradient(
            this.centerX - 300, this.centerY - 200, 0,
            this.centerX, this.centerY, this.width
        );
        grad.addColorStop(0, '#4a3728');
        grad.addColorStop(0.3, '#1a1a2e');
        grad.addColorStop(1, '#000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        this.starField.forEach(star => {
            const twinkle = Math.sin(star.twinkle + this.gameTime * 0.02) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    drawSun(ctx: CanvasRenderingContext2D) {
        const sunX = this.centerX + Math.cos(this.sunAngle) * 500;
        const sunY = this.centerY + Math.sin(this.sunAngle) * 500;

        // Glow
        const glowGrad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 400);
        glowGrad.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
        glowGrad.addColorStop(0.2, 'rgba(255, 150, 0, 0.4)');
        glowGrad.addColorStop(0.5, 'rgba(255, 100, 0, 0.1)');
        glowGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Sun body
        ctx.fillStyle = '#ffd93d';
        ctx.shadowColor = '#ffd93d';
        ctx.shadowBlur = 50;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    drawMercury(ctx: CanvasRenderingContext2D) {
        // Mercury body
        const mercuryGrad = ctx.createRadialGradient(
            this.centerX - 30, this.centerY - 30, 0,
            this.centerX, this.centerY, this.mercuryRadius
        );
        mercuryGrad.addColorStop(0, '#9ca3af');
        mercuryGrad.addColorStop(0.7, '#6b7280');
        mercuryGrad.addColorStop(1, '#374151');

        ctx.fillStyle = mercuryGrad;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.mercuryRadius, 0, Math.PI * 2);
        ctx.fill();

        // Craters (decorative)
        ctx.fillStyle = '#4b5563';
        for (let i = 0; i < 15; i++) {
            const angle = (i / 15) * Math.PI * 2 + 0.5;
            const dist = this.mercuryRadius * 0.5 + (i % 3) * 20;
            const cx = this.centerX + Math.cos(angle) * dist;
            const cy = this.centerY + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(cx, cy, 8 + (i % 4) * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawShadowZone(ctx: CanvasRenderingContext2D) {
        const shadowStartAngle = this.sunAngle + Math.PI - this.shadowWidth / 2;
        const shadowEndAngle = this.sunAngle + Math.PI + this.shadowWidth / 2;

        // Shadow arc on Mercury
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.moveTo(this.centerX, this.centerY);
        ctx.arc(this.centerX, this.centerY, this.mercuryRadius + 50, shadowStartAngle, shadowEndAngle);
        ctx.closePath();
        ctx.fill();

        // Safe zone indicator
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.mercuryRadius + 30, shadowStartAngle, shadowEndAngle);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = '#00ff88';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        const midAngle = this.sunAngle + Math.PI;
        const labelX = this.centerX + Math.cos(midAngle) * (this.mercuryRadius + 70);
        const labelY = this.centerY + Math.sin(midAngle) * (this.mercuryRadius + 70);
        ctx.fillText('SAFE ZONE', labelX, labelY);
    }

    drawPlayer(ctx: CanvasRenderingContext2D) {
        const x = this.centerX + Math.cos(this.playerAngle) * (this.mercuryRadius + 25);
        const y = this.centerY + Math.sin(this.playerAngle) * (this.mercuryRadius + 25);

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.playerAngle + Math.PI / 2);

        // Glow based on heat
        const heatLevel = this.heat / this.maxHeat;
        if (heatLevel > 0.3) {
            ctx.shadowColor = `rgba(255, ${Math.floor(150 - heatLevel * 150)}, 0, 1)`;
            ctx.shadowBlur = 15 + heatLevel * 15;
        }

        // Shield effect
        if (this.shieldActive && this.shieldPower > 0) {
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, 25, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Rover body
        ctx.fillStyle = '#e5e7eb';
        ctx.fillRect(-12, -8, 24, 16);

        // Wheels
        ctx.fillStyle = '#374151';
        ctx.beginPath();
        ctx.arc(-10, 10, 5, 0, Math.PI * 2);
        ctx.arc(10, 10, 5, 0, Math.PI * 2);
        ctx.fill();

        // Solar panel
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(-18, -12, 36, 4);

        // Antenna
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(0, -20);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(0, -20, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawCraterItem(ctx: CanvasRenderingContext2D, crater: Crater) {
        const x = this.centerX + Math.cos(crater.angle) * this.mercuryRadius;
        const y = this.centerY + Math.sin(crater.angle) * this.mercuryRadius;

        const pulse = Math.sin(this.gameTime * 0.1) * 0.2 + 1;

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(pulse, pulse);

        ctx.shadowBlur = 15;

        if (crater.itemType === 'stardust') {
            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
                const r = i % 2 === 0 ? 10 : 5;
                if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
        } else if (crater.itemType === 'shield') {
            ctx.fillStyle = '#a855f7';
            ctx.shadowColor = '#a855f7';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('🛡️', 0, 7);
        } else if (crater.itemType === 'speed') {
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚡', 0, 7);
        }

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // Heat gauge (top center)
        const heatBarWidth = 300;
        const heatBarHeight = 25;
        const heatX = (this.width - heatBarWidth) / 2;
        const heatY = 25;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(heatX, heatY, heatBarWidth, heatBarHeight);

        const heatGrad = ctx.createLinearGradient(heatX, heatY, heatX + heatBarWidth, heatY);
        heatGrad.addColorStop(0, '#22c55e');
        heatGrad.addColorStop(0.5, '#f59e0b');
        heatGrad.addColorStop(1, '#dc2626');
        ctx.fillStyle = heatGrad;
        ctx.fillRect(heatX, heatY, heatBarWidth * (this.heat / this.maxHeat), heatBarHeight);

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(heatX, heatY, heatBarWidth, heatBarHeight);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`🔥 HEAT: ${Math.floor(this.heat)}%`, this.width / 2, heatY + 18);

        // Status: In shadow or danger
        const inShadow = this.isInShadow();
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = inShadow ? '#00ff88' : '#ff4444';
        ctx.fillText(inShadow ? '✓ IN SHADOW - COOLING' : '⚠️ IN SUNLIGHT - HEATING!', this.width / 2, heatY + 50);

        // Score (top left)
        ctx.textAlign = 'left';
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Score: ${this.score.toLocaleString()}`, 20, 40);

        ctx.font = '16px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, 20, 65);

        // Level
        ctx.fillStyle = '#ff8800';
        ctx.fillText(`Level ${this.level}`, 20, 90);

        // Shield (top right)
        ctx.textAlign = 'right';
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = this.shieldPower > 20 ? '#a855f7' : '#ff4444';
        ctx.fillText(`🛡️ Shield: ${Math.floor(this.shieldPower)}%`, this.width - 20, 40);

        // Time alive
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`Time: ${Math.floor(this.timeAlive / 60)}s`, this.width - 20, 65);

        // Controls hint
        if (this.gameTime < 240 && !this.isGameOver) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '14px Arial';
            ctx.fillText('HOLD SPACE to boost faster! • Shield protects you automatically • Stay in shadow to cool down!', this.width / 2, this.height - 20);
        }
    }
}
