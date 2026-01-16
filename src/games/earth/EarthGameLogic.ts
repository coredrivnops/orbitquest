// Earth Game Logic - "Orbital Balance"
// Physics-based orbital mechanics simulation
// The player must maintain a stable orbit around Earth

interface Debris {
    angle: number;       // Position around orbit (radians)
    radius: number;      // Distance from Earth center
    size: number;
    speed: number;       // Angular velocity
}

interface Collectible {
    angle: number;
    radius: number;
    type: 'stardust' | 'repair' | 'boost';
    glow: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

export class EarthGameLogic {
    width: number;
    height: number;
    centerX: number;
    centerY: number;

    // Earth parameters
    earthRadius = 120;
    atmosphereRadius = 160;

    // Orbital zones
    minOrbitRadius = 180;  // Too low = burn up
    maxOrbitRadius = 350;  // Too high = drift away
    optimalLow = 220;
    optimalHigh = 300;

    // Player satellite
    playerAngle = 0;           // Position around Earth (radians)
    playerRadius = 250;        // Current orbital altitude
    playerAngularVelocity = 0.02;  // Orbital speed (higher orbit = slower)
    thrustPower = 0;           // Current thrust being applied
    maxThrust = 0.8;

    // Game State
    score = 0;
    stardustCollected = 0;
    fuel = 100;
    maxFuel = 100;
    isGameOver = false;
    gameOverReason = '';

    // Entities
    debris: Debris[] = [];
    collectibles: Collectible[] = [];
    particles: Particle[] = [];

    // Visual
    orbitTrail: { x: number; y: number; alpha: number }[] = [];
    earthRotation = 0;

    // Timing
    frameCount = 0;
    difficulty = 1;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
    }

    reset() {
        this.playerAngle = 0;
        this.playerRadius = 250;
        this.playerAngularVelocity = 0.02;
        this.thrustPower = 0;
        this.score = 0;
        this.stardustCollected = 0;
        this.fuel = 100;
        this.isGameOver = false;
        this.gameOverReason = '';
        this.debris = [];
        this.collectibles = [];
        this.particles = [];
        this.orbitTrail = [];
        this.frameCount = 0;
        this.difficulty = 1;
    }

    handleInput(x: number, y: number, isPressed: boolean) {
        // Thrust when mouse/touch is held down
        if (isPressed && this.fuel > 0) {
            this.thrustPower = Math.min(this.thrustPower + 0.05, this.maxThrust);
        } else {
            this.thrustPower = Math.max(this.thrustPower - 0.1, 0);
        }
    }

    update() {
        if (this.isGameOver) return;

        this.frameCount++;
        this.earthRotation += 0.001;

        // Increase difficulty over time
        if (this.frameCount % 600 === 0) {
            this.difficulty += 0.2;
        }

        // --- ORBITAL PHYSICS ---

        // Gravity pulls satellite toward Earth (decreases radius)
        const gravity = 0.15 / (this.playerRadius / 200); // Stronger gravity at lower altitudes

        // Thrust increases radius
        if (this.thrustPower > 0 && this.fuel > 0) {
            this.playerRadius += this.thrustPower * 0.5;
            this.fuel -= 0.15;

            // Engine particles
            if (this.frameCount % 3 === 0) {
                this.createEngineParticle();
            }
        }

        // Gravity decreases radius
        this.playerRadius -= gravity;

        // Orbital velocity: faster at lower altitudes (Kepler's laws)
        this.playerAngularVelocity = 0.5 / Math.sqrt(this.playerRadius / 100);
        this.playerAngle += this.playerAngularVelocity;

        // Add to orbit trail
        const px = this.centerX + Math.cos(this.playerAngle) * this.playerRadius;
        const py = this.centerY + Math.sin(this.playerAngle) * this.playerRadius;
        this.orbitTrail.push({ x: px, y: py, alpha: 1 });
        if (this.orbitTrail.length > 100) {
            this.orbitTrail.shift();
        }
        this.orbitTrail.forEach(t => t.alpha -= 0.01);

        // --- BOUNDARY CHECKS ---

        // Too low - atmospheric burn
        if (this.playerRadius < this.minOrbitRadius) {
            this.gameOver('Atmospheric Entry - Hull Burned');
            return;
        }

        // Too high - escaped to space
        if (this.playerRadius > this.maxOrbitRadius) {
            this.gameOver('Escaped Orbit - Lost in Space');
            return;
        }

        // --- FUEL REFILL OVER TIME (SOLAR PANELS) ---
        if (this.fuel < this.maxFuel) {
            this.fuel += 0.02; // Slow solar recharge
        }

        // --- SPAWN DEBRIS ---
        if (this.frameCount % Math.floor(90 / this.difficulty) === 0) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.minOrbitRadius + Math.random() * (this.maxOrbitRadius - this.minOrbitRadius);
            this.debris.push({
                angle,
                radius,
                size: 8 + Math.random() * 12,
                speed: (Math.random() - 0.5) * 0.03
            });
        }

        // --- SPAWN COLLECTIBLES ---
        if (this.frameCount % 150 === 0) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.optimalLow + Math.random() * (this.optimalHigh - this.optimalLow);
            const types: ('stardust' | 'repair' | 'boost')[] = ['stardust', 'stardust', 'stardust', 'boost'];
            this.collectibles.push({
                angle,
                radius,
                type: types[Math.floor(Math.random() * types.length)],
                glow: 0
            });
        }

        // --- UPDATE DEBRIS ---
        for (let i = this.debris.length - 1; i >= 0; i--) {
            const d = this.debris[i];
            d.angle += d.speed;

            // Collision check
            const dx = Math.cos(d.angle) * d.radius - Math.cos(this.playerAngle) * this.playerRadius;
            const dy = Math.sin(d.angle) * d.radius - Math.sin(this.playerAngle) * this.playerRadius;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < d.size + 15) {
                this.gameOver('Collision with Space Debris');
                return;
            }
        }

        // --- UPDATE COLLECTIBLES ---
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const c = this.collectibles[i];
            c.glow = (Math.sin(this.frameCount * 0.1) + 1) * 0.5;

            // Collection check
            const dx = Math.cos(c.angle) * c.radius - Math.cos(this.playerAngle) * this.playerRadius;
            const dy = Math.sin(c.angle) * c.radius - Math.sin(this.playerAngle) * this.playerRadius;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 30) {
                if (c.type === 'stardust') {
                    this.stardustCollected += 10;
                    this.score += 100;
                } else if (c.type === 'boost') {
                    this.fuel = Math.min(this.fuel + 30, this.maxFuel);
                    this.score += 50;
                }

                // Collect effect
                const cx = this.centerX + Math.cos(c.angle) * c.radius;
                const cy = this.centerY + Math.sin(c.angle) * c.radius;
                this.createExplosion(cx, cy, c.type === 'stardust' ? '#ffd700' : '#00ff00');

                this.collectibles.splice(i, 1);
            }
        }

        // --- UPDATE PARTICLES ---
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // --- SCORE ---
        // Bonus for staying in optimal zone
        if (this.playerRadius > this.optimalLow && this.playerRadius < this.optimalHigh) {
            this.score += 2;
        } else {
            this.score += 1;
        }
    }

    createEngineParticle() {
        const px = this.centerX + Math.cos(this.playerAngle) * this.playerRadius;
        const py = this.centerY + Math.sin(this.playerAngle) * this.playerRadius;
        const ejectAngle = this.playerAngle + Math.PI + (Math.random() - 0.5) * 0.5;

        this.particles.push({
            x: px,
            y: py,
            vx: Math.cos(ejectAngle) * 3,
            vy: Math.sin(ejectAngle) * 3,
            life: 1,
            color: '#00f0ff'
        });
    }

    createExplosion(x: number, y: number, color: string) {
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 1,
                color
            });
        }
    }

    gameOver(reason: string) {
        this.isGameOver = true;
        this.gameOverReason = reason;

        // Explosion at player
        const px = this.centerX + Math.cos(this.playerAngle) * this.playerRadius;
        const py = this.centerY + Math.sin(this.playerAngle) * this.playerRadius;
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 1,
                color: '#ff4444'
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Background - space
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = 0; i < 50; i++) {
            const x = (i * 137.5) % this.width;
            const y = (i * 89.3) % this.height;
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // --- ORBITAL ZONES ---

        // Danger zone (too low)
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.2)';
        ctx.lineWidth = this.minOrbitRadius - this.atmosphereRadius;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, (this.atmosphereRadius + this.minOrbitRadius) / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Optimal zone
        ctx.strokeStyle = 'rgba(0, 255, 100, 0.1)';
        ctx.lineWidth = this.optimalHigh - this.optimalLow;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, (this.optimalLow + this.optimalHigh) / 2, 0, Math.PI * 2);
        ctx.stroke();

        // Danger zone (too high)
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.1)';
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.maxOrbitRadius, 0, Math.PI * 2);
        ctx.stroke();

        // --- ORBIT TRAIL ---
        this.orbitTrail.forEach(t => {
            ctx.globalAlpha = Math.max(0, t.alpha);
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // --- EARTH ---
        ctx.save();
        ctx.translate(this.centerX, this.centerY);

        // Atmosphere glow
        const atmosphereGradient = ctx.createRadialGradient(0, 0, this.earthRadius, 0, 0, this.atmosphereRadius);
        atmosphereGradient.addColorStop(0, 'rgba(100, 180, 255, 0.3)');
        atmosphereGradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
        ctx.fillStyle = atmosphereGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.atmosphereRadius, 0, Math.PI * 2);
        ctx.fill();

        // Earth body
        const earthGradient = ctx.createRadialGradient(-30, -30, 0, 0, 0, this.earthRadius);
        earthGradient.addColorStop(0, '#4a9eff');
        earthGradient.addColorStop(0.5, '#2563eb');
        earthGradient.addColorStop(1, '#1e40af');
        ctx.fillStyle = earthGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.earthRadius, 0, Math.PI * 2);
        ctx.fill();

        // Continents (simplified)
        ctx.save();
        ctx.rotate(this.earthRotation);
        ctx.fillStyle = '#22c55e';
        // Africa-ish
        ctx.beginPath();
        ctx.ellipse(20, 0, 25, 40, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Americas-ish
        ctx.beginPath();
        ctx.ellipse(-60, -20, 15, 50, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // City lights on dark side
        ctx.fillStyle = 'rgba(255, 200, 100, 0.5)';
        for (let i = 0; i < 10; i++) {
            const a = (i * 0.7) + this.earthRotation;
            const r = 60 + (i % 4) * 20;
            const x = Math.cos(a) * r * 0.8;
            const y = Math.sin(a) * r * 0.6;
            if (x > 30) { // Only on "dark" side
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();

        // --- DEBRIS ---
        ctx.fillStyle = '#888888';
        this.debris.forEach(d => {
            const x = this.centerX + Math.cos(d.angle) * d.radius;
            const y = this.centerY + Math.sin(d.angle) * d.radius;

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(d.angle * 3);

            // Irregular shape
            ctx.beginPath();
            ctx.moveTo(-d.size * 0.5, -d.size * 0.3);
            ctx.lineTo(d.size * 0.5, -d.size * 0.5);
            ctx.lineTo(d.size * 0.3, d.size * 0.5);
            ctx.lineTo(-d.size * 0.4, d.size * 0.3);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        });

        // --- COLLECTIBLES ---
        this.collectibles.forEach(c => {
            const x = this.centerX + Math.cos(c.angle) * c.radius;
            const y = this.centerY + Math.sin(c.angle) * c.radius;

            ctx.save();
            ctx.translate(x, y);

            if (c.type === 'stardust') {
                // Gold glow
                const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 20 + c.glow * 10);
                glow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
                glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
                ctx.fillStyle = glow;
                ctx.fillRect(-30, -30, 60, 60);

                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(0, 0, 8, 0, Math.PI * 2);
                ctx.fill();
            } else if (c.type === 'boost') {
                // Green fuel
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(-6, -10, 12, 20);
                ctx.fillStyle = '#00aa00';
                ctx.fillRect(-4, -8, 8, 16);
            }

            ctx.restore();
        });

        // --- PARTICLES ---
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4 * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // --- PLAYER SATELLITE ---
        if (!this.isGameOver) {
            const px = this.centerX + Math.cos(this.playerAngle) * this.playerRadius;
            const py = this.centerY + Math.sin(this.playerAngle) * this.playerRadius;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(this.playerAngle + Math.PI / 2);

            // Engine glow (when thrusting)
            if (this.thrustPower > 0) {
                const engineGlow = ctx.createRadialGradient(0, 15, 0, 0, 15, 20);
                engineGlow.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
                engineGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
                ctx.fillStyle = engineGlow;
                ctx.fillRect(-15, 5, 30, 30);
            }

            // Satellite body
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-8, -12, 16, 24);

            // Solar panels
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(-25, -6, 15, 12); // Left panel
            ctx.fillRect(10, -6, 15, 12);  // Right panel

            // Antenna
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -12);
            ctx.lineTo(0, -20);
            ctx.stroke();
            ctx.fillStyle = '#ff0000';
            ctx.beginPath();
            ctx.arc(0, -20, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // --- HUD ---

        // Fuel gauge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(20, 20, 150, 20);
        ctx.fillStyle = this.fuel > 20 ? '#00ff00' : '#ff4444';
        ctx.fillRect(22, 22, (this.fuel / this.maxFuel) * 146, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Rajdhani, sans-serif';
        ctx.fillText('FUEL', 25, 35);

        // Altitude indicator
        const altPercent = (this.playerRadius - this.minOrbitRadius) / (this.maxOrbitRadius - this.minOrbitRadius);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.width - 40, 50, 20, 200);

        // Safe zone marker
        const safeTop = 50 + (1 - (this.optimalHigh - this.minOrbitRadius) / (this.maxOrbitRadius - this.minOrbitRadius)) * 200;
        const safeBottom = 50 + (1 - (this.optimalLow - this.minOrbitRadius) / (this.maxOrbitRadius - this.minOrbitRadius)) * 200;
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(this.width - 38, safeTop, 16, safeBottom - safeTop);

        // Current altitude
        const altY = 50 + (1 - altPercent) * 200;
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(this.width - 45, altY - 5, 30, 10);

        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Rajdhani, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ALT', this.width - 30, 40);

        // Score
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 24px Rajdhani, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, 20, 70);

        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, 20, 100);

        // Instructions
        if (this.frameCount < 300) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '16px Rajdhani, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('HOLD CLICK/TAP to boost altitude', this.centerX, this.height - 30);
        }

        // Game Over
        if (this.isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 48px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('MISSION FAILED', this.centerX, this.centerY - 60);

            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Rajdhani, sans-serif';
            ctx.fillText(this.gameOverReason, this.centerX, this.centerY);

            ctx.fillStyle = '#00f0ff';
            ctx.fillText(`Final Score: ${this.score.toLocaleString()}`, this.centerX, this.centerY + 50);

            ctx.fillStyle = '#ffd700';
            ctx.fillText(`Stardust Earned: ${this.stardustCollected}`, this.centerX, this.centerY + 90);
        }
    }
}
