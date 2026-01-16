// Neptune Game Logic - "Deep Dive"
// ENDLESS wind tunnel runner with TRIVIA system
// Unique mechanic: Supersonic wind speed zones

interface Obstacle {
    x: number;
    y: number;
    radius: number;
    speed: number;
    rotation: number;
    type: 'ice' | 'storm';
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
}

interface Stardust {
    x: number;
    y: number;
    radius: number;
    speed: number;
    glow: number;
    value: number;
    type: 'normal' | 'bonus' | 'mega';
}

interface WindZone {
    y: number;
    direction: number; // -1 left, 1 right
    strength: number;
}

interface TriviaQuestion {
    question: string;
    answers: string[];
    correct: number;
    fact: string;
}

export class NeptuneGameLogic {
    width: number;
    height: number;

    // Player
    playerX: number;
    playerY: number;
    playerWidth = 40;
    playerHeight = 60;
    targetX: number;
    targetY: number;

    // Game State
    score = 0;
    stardustCollected = 0;
    isGameOver = false;
    isPaused = false;
    speed = 4;
    baseSpeed = 4;
    maxSpeed = 18;

    // Level/Distance
    distance = 0;
    level = 1;
    nextLevelDistance = 1000;

    // Trivia
    showTrivia = false;
    currentTrivia: TriviaQuestion | null = null;
    triviaAnswered = false;
    triviaCorrect = false;
    triviaIndex = 0;

    // Entities
    obstacles: Obstacle[] = [];
    particles: Particle[] = [];
    stardust: Stardust[] = [];
    windZones: WindZone[] = [];

    // Tunnel visuals
    tunnelLines: { y: number; width: number }[] = [];
    windStreaks: { x: number; y: number; length: number }[] = [];

    // Timing
    frameCount = 0;
    combo = 1;
    maxCombo = 1;
    lastCollectTime = 0;

    // Session cap
    readonly STARDUST_CAP = 60;

    // Trivia questions about Neptune
    triviaQuestions: TriviaQuestion[] = [
        {
            question: "How fast are Neptune's winds?",
            answers: ["500 km/h", "1,200 km/h", "2,000 km/h", "3,500 km/h"],
            correct: 2,
            fact: "Neptune has the fastest winds in the solar system, reaching up to 2,000 km/h - faster than the speed of sound on Earth!"
        },
        {
            question: "Why is Neptune blue?",
            answers: ["Reflection of oceans", "Methane in atmosphere", "Blue ice on surface", "Nitrogen gas"],
            correct: 1,
            fact: "Methane in Neptune's atmosphere absorbs red light and reflects blue light back to space, giving it that stunning azure color."
        },
        {
            question: "How long is a year on Neptune?",
            answers: ["84 Earth years", "165 Earth years", "248 Earth years", "365 Earth days"],
            correct: 1,
            fact: "Neptune takes 165 Earth years to orbit the Sun once. Since its discovery in 1846, it has completed only ONE full orbit!"
        },
        {
            question: "What happened to Neptune's Great Dark Spot?",
            answers: ["It's still there", "It disappeared", "It merged with another storm", "It turned red"],
            correct: 1,
            fact: "Unlike Jupiter's Great Red Spot, Neptune's Great Dark Spot (discovered 1989) disappeared by 1994. Neptune's storms are more dynamic!"
        },
        {
            question: "What is special about Neptune's moon Triton?",
            answers: ["It has rings", "It orbits backwards", "It's the largest moon", "It has oceans"],
            correct: 1,
            fact: "Triton orbits Neptune in the opposite direction of the planet's rotation - it's the only large moon in the solar system to do this!"
        },
        {
            question: "How was Neptune discovered?",
            answers: ["By telescope observation", "By mathematical prediction", "By spacecraft", "By ancient astronomers"],
            correct: 1,
            fact: "Neptune was the first planet found through mathematical prediction! Irregularities in Uranus's orbit led mathematicians to predict its existence in 1846."
        },
        {
            question: "What type of planet is Neptune?",
            answers: ["Rocky planet", "Gas giant", "Ice giant", "Dwarf planet"],
            correct: 2,
            fact: "Neptune is an 'ice giant' - its interior is made of water, methane, and ammonia ices, unlike the hydrogen/helium gas giants Jupiter and Saturn."
        },
        {
            question: "How many known moons does Neptune have?",
            answers: ["2", "8", "16", "27"],
            correct: 2,
            fact: "Neptune has 16 known moons! The largest is Triton, which is believed to be a captured Kuiper Belt object."
        }
    ];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.playerX = width / 2;
        this.playerY = height - 100;
        this.targetX = this.playerX;
        this.targetY = this.playerY;

        // Initialize tunnel lines
        for (let i = 0; i < 20; i++) {
            this.tunnelLines.push({
                y: i * 50,
                width: 50 + Math.random() * 100
            });
        }

        // Initialize wind streaks
        for (let i = 0; i < 8; i++) {
            this.windStreaks.push({
                x: 100 + Math.random() * (this.width - 200),
                y: Math.random() * this.height,
                length: 30 + Math.random() * 50
            });
        }
    }

    reset() {
        this.playerX = this.width / 2;
        this.playerY = this.height - 100;
        this.targetX = this.playerX;
        this.targetY = this.playerY;
        this.score = 0;
        this.stardustCollected = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.speed = this.baseSpeed;
        this.distance = 0;
        this.level = 1;
        this.nextLevelDistance = 1000;
        this.obstacles = [];
        this.particles = [];
        this.stardust = [];
        this.windZones = [];
        this.frameCount = 0;
        this.combo = 1;
        this.maxCombo = 1;
        this.lastCollectTime = 0;
        this.showTrivia = false;
        this.currentTrivia = null;
        this.triviaAnswered = false;
        this.triviaIndex = 0;
    }

    handleInput(x: number, y: number) {
        if (!this.showTrivia) {
            this.targetX = x;
            this.targetY = Math.min(y, this.height - 50);
        }
    }

    answerTrivia(answerIndex: number) {
        if (!this.currentTrivia || this.triviaAnswered) return;

        this.triviaAnswered = true;
        this.triviaCorrect = answerIndex === this.currentTrivia.correct;

        if (this.triviaCorrect) {
            this.stardustCollected = Math.min(this.STARDUST_CAP, this.stardustCollected + 8);
            this.score += 300;
            this.combo = Math.min(3, this.combo + 1);
        } else {
            this.combo = 1;
        }
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        // Continue after showing result
        setTimeout(() => {
            this.showTrivia = false;
            this.isPaused = false;
            this.triviaAnswered = false;
            this.currentTrivia = null;
        }, 2500);
    }

    triggerTrivia() {
        this.isPaused = true;
        this.showTrivia = true;
        this.triviaAnswered = false;
        this.triviaCorrect = false;
        this.currentTrivia = this.triviaQuestions[this.triviaIndex % this.triviaQuestions.length];
        this.triviaIndex++;
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        this.frameCount++;
        this.distance += this.speed;

        // Level progression
        if (this.distance >= this.nextLevelDistance) {
            this.level++;
            this.nextLevelDistance += 1500 + this.level * 500;
            this.speed = Math.min(this.maxSpeed, this.baseSpeed + this.level * 0.8);

            // Trigger trivia every 2 levels
            if (this.level % 2 === 0) {
                this.triggerTrivia();
                return;
            }
        }

        // Player movement (smooth follow)
        this.playerX += (this.targetX - this.playerX) * 0.15;
        this.playerY += (this.targetY - this.playerY) * 0.1;

        // Apply wind zone effects
        for (const zone of this.windZones) {
            if (Math.abs(this.playerY - zone.y) < 50) {
                this.playerX += zone.direction * zone.strength * 0.5;
            }
        }

        // Clamp to bounds
        this.playerX = Math.max(50, Math.min(this.width - 50, this.playerX));
        this.playerY = Math.max(80, Math.min(this.height - 50, this.playerY));

        // Update tunnel lines
        this.tunnelLines.forEach(line => {
            line.y += this.speed * 0.5;
            if (line.y > this.height) {
                line.y = -50;
                line.width = 50 + Math.random() * 100;
            }
        });

        // Update wind streaks
        this.windStreaks.forEach(streak => {
            streak.y += this.speed * 1.5;
            if (streak.y > this.height + 50) {
                streak.y = -50;
                streak.x = 100 + Math.random() * (this.width - 200);
                streak.length = 30 + Math.random() * 50;
            }
        });

        // Spawn obstacles (Ice Crystals and Storm Clouds)
        if (this.frameCount % Math.max(15, 35 - this.level * 2) === 0) {
            const margin = 80;
            const type = Math.random() > 0.7 ? 'storm' : 'ice';
            this.obstacles.push({
                x: margin + Math.random() * (this.width - margin * 2),
                y: -50,
                radius: type === 'storm' ? 35 + Math.random() * 20 : 18 + Math.random() * 18,
                speed: this.speed + Math.random() * 2,
                rotation: Math.random() * Math.PI * 2,
                type
            });
        }

        // Spawn wind zones
        if (this.frameCount % 200 === 0 && this.level > 1) {
            this.windZones.push({
                y: -30,
                direction: Math.random() > 0.5 ? 1 : -1,
                strength: 2 + Math.random() * 3
            });
        }

        // Spawn stardust (less frequently, lower values)
        if (this.frameCount % Math.max(40, 70 - this.level * 3) === 0) {
            const margin = 100;
            const roll = Math.random();
            let type: 'normal' | 'bonus' | 'mega' = 'normal';
            let value = 2; // REDUCED from 5

            if (roll > 0.95) { // Rarer mega
                type = 'mega';
                value = 10; // REDUCED from 30
            } else if (roll > 0.8) {
                type = 'bonus';
                value = 4; // REDUCED from 12
            }

            this.stardust.push({
                x: margin + Math.random() * (this.width - margin * 2),
                y: -30,
                radius: type === 'mega' ? 18 : type === 'bonus' ? 14 : 12,
                speed: this.speed,
                glow: 0,
                value,
                type
            });
        }

        // Update wind zones
        for (let i = this.windZones.length - 1; i >= 0; i--) {
            this.windZones[i].y += this.speed;
            if (this.windZones[i].y > this.height + 100) {
                this.windZones.splice(i, 1);
            }
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.y += obs.speed;
            obs.rotation += 0.05;

            // Collision check
            const dx = this.playerX - obs.x;
            const dy = this.playerY - obs.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < obs.radius + 22) {
                this.gameOver();
                return;
            }

            // Remove if off screen
            if (obs.y > this.height + 50) {
                this.obstacles.splice(i, 1);
                this.score += 10 * this.combo;
            }
        }

        // Update stardust
        for (let i = this.stardust.length - 1; i >= 0; i--) {
            const star = this.stardust[i];
            star.y += star.speed;
            star.glow = (Math.sin(this.frameCount * 0.1) + 1) * 0.5;

            // Collect check
            const dx = this.playerX - star.x;
            const dy = this.playerY - star.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < star.radius + 30) {
                // Apply session cap
                const valueToAdd = Math.min(star.value, this.STARDUST_CAP - this.stardustCollected);
                if (valueToAdd > 0) {
                    this.stardustCollected += valueToAdd;
                }
                this.score += star.value * 10 * Math.floor(this.combo);

                // Combo timer (capped at x3)
                if (Date.now() - this.lastCollectTime < 1500) {
                    this.combo = Math.min(3, this.combo + 0.15);
                } else {
                    this.combo = Math.max(1, this.combo - 0.3);
                }
                this.lastCollectTime = Date.now();
                this.maxCombo = Math.max(this.maxCombo, Math.floor(this.combo));

                const color = star.type === 'mega' ? '#ff00ff' : star.type === 'bonus' ? '#00ffff' : '#ffd700';
                this.createExplosion(star.x, star.y, color);
                this.stardust.splice(i, 1);
                continue;
            }

            if (star.y > this.height + 30) {
                this.stardust.splice(i, 1);
                this.combo = Math.max(1, this.combo - 0.2);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life -= 0.02;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Distance bonus every 1000 units (reduced from 500)
        if (Math.floor(this.distance / 1000) > Math.floor((this.distance - this.speed) / 1000)) {
            this.score += 50 * this.level;
            // Respect session cap
            if (this.stardustCollected < this.STARDUST_CAP) {
                this.stardustCollected = Math.min(this.STARDUST_CAP, this.stardustCollected + 1);
            }
        }
    }

    createExplosion(x: number, y: number, color: string) {
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * 4,
                vy: Math.sin(angle) * 4 - 2,
                life: 1,
                color
            });
        }
    }

    gameOver() {
        this.isGameOver = true;

        // Final distance bonus
        this.stardustCollected += Math.floor(this.distance / 100);

        // Explosion
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: this.playerX,
                y: this.playerY,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 1,
                color: '#00f0ff'
            });
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Background gradient (Deep blue)
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#000015');
        gradient.addColorStop(0.5, '#000030');
        gradient.addColorStop(1, '#000050');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Tunnel walls (parallax lines)
        ctx.strokeStyle = 'rgba(0, 100, 200, 0.25)';
        ctx.lineWidth = 2;
        this.tunnelLines.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(25 - line.width * 0.1, line.y);
            ctx.lineTo(25 + line.width * 0.2, line.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.width - 25 - line.width * 0.2, line.y);
            ctx.lineTo(this.width - 25 + line.width * 0.1, line.y);
            ctx.stroke();
        });

        // Wind streaks
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.15)';
        ctx.lineWidth = 2;
        this.windStreaks.forEach(streak => {
            ctx.beginPath();
            ctx.moveTo(streak.x, streak.y);
            ctx.lineTo(streak.x, streak.y + streak.length);
            ctx.stroke();
        });

        // Wind zones
        for (const zone of this.windZones) {
            ctx.fillStyle = zone.direction > 0 ? 'rgba(100, 200, 255, 0.1)' : 'rgba(255, 100, 100, 0.1)';
            ctx.fillRect(0, zone.y - 30, this.width, 60);

            // Wind arrows
            ctx.fillStyle = zone.direction > 0 ? 'rgba(100, 200, 255, 0.4)' : 'rgba(255, 100, 100, 0.4)';
            for (let x = 100; x < this.width - 100; x += 80) {
                ctx.beginPath();
                if (zone.direction > 0) {
                    ctx.moveTo(x, zone.y);
                    ctx.lineTo(x + 20, zone.y - 8);
                    ctx.lineTo(x + 20, zone.y + 8);
                } else {
                    ctx.moveTo(x + 20, zone.y);
                    ctx.lineTo(x, zone.y - 8);
                    ctx.lineTo(x, zone.y + 8);
                }
                ctx.fill();
            }
        }

        // Draw obstacles
        this.obstacles.forEach(obs => {
            ctx.save();
            ctx.translate(obs.x, obs.y);
            ctx.rotate(obs.rotation);

            if (obs.type === 'ice') {
                // Ice Crystal
                ctx.fillStyle = 'rgba(150, 220, 255, 0.85)';
                ctx.beginPath();
                const sides = 6;
                for (let i = 0; i < sides; i++) {
                    const angle = (i / sides) * Math.PI * 2;
                    const r = obs.radius * (i % 2 === 0 ? 1 : 0.6);
                    const px = Math.cos(angle) * r;
                    const py = Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();

                ctx.shadowColor = '#a5f3fc';
                ctx.shadowBlur = 12;
                ctx.strokeStyle = '#a5f3fc';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                // Storm cloud
                ctx.fillStyle = 'rgba(50, 50, 80, 0.9)';
                ctx.beginPath();
                ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
                ctx.fill();

                // Lightning effect
                if (this.frameCount % 20 < 3) {
                    ctx.strokeStyle = '#ffff00';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(0, -obs.radius * 0.3);
                    ctx.lineTo(-5, 5);
                    ctx.lineTo(5, 0);
                    ctx.lineTo(0, obs.radius * 0.5);
                    ctx.stroke();
                }
            }

            ctx.restore();
        });

        // Draw stardust
        this.stardust.forEach(star => {
            ctx.save();
            ctx.translate(star.x, star.y);

            let color = '#ffd700';
            let glowColor = 'rgba(255, 215, 0, 0.7)';
            if (star.type === 'bonus') {
                color = '#00ffff';
                glowColor = 'rgba(0, 255, 255, 0.7)';
            }
            if (star.type === 'mega') {
                color = '#ff00ff';
                glowColor = 'rgba(255, 0, 255, 0.7)';
            }

            const glowSize = star.radius + star.glow * 12;
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            glowGradient.addColorStop(0, glowColor);
            glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);

            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, star.radius * 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Value label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px Rajdhani';
            ctx.textAlign = 'center';
            ctx.fillText(`+${star.value}`, 0, star.radius + 14);

            ctx.restore();
        });

        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5 * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw player (Probe Ship)
        if (!this.isGameOver) {
            ctx.save();
            ctx.translate(this.playerX, this.playerY);

            // Engine glow
            const engineGlow = ctx.createRadialGradient(0, 25, 0, 0, 25, 45);
            engineGlow.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
            engineGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
            ctx.fillStyle = engineGlow;
            ctx.fillRect(-25, 15, 50, 45);

            // Ship body
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(0, -35);
            ctx.lineTo(22, 28);
            ctx.lineTo(0, 18);
            ctx.lineTo(-22, 28);
            ctx.closePath();
            ctx.fill();

            // Cockpit
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.ellipse(0, -8, 9, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // HUD
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 22px Rajdhani, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`LEVEL ${this.level}`, 20, 35);
        ctx.fillText(`DEPTH: ${Math.floor(this.distance / 10)}km`, 20, 60);

        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, 20, 85);

        if (Math.floor(this.combo) > 1) {
            ctx.fillStyle = '#ff00ff';
            ctx.fillText(`🔥 x${Math.floor(this.combo)} COMBO`, 20, 110);
        }

        ctx.textAlign = 'right';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Rajdhani';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.width - 20, 35);

        ctx.fillStyle = '#888';
        ctx.font = '16px Rajdhani';
        ctx.fillText(`WIND: ${Math.floor(this.speed * 250)} km/h`, this.width - 20, 58);

        // TRIVIA OVERLAY
        if (this.showTrivia && this.currentTrivia) {
            ctx.fillStyle = 'rgba(0, 0, 50, 0.95)';
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 28px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🧠 NEPTUNE TRIVIA', this.width / 2, 100);

            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Rajdhani, sans-serif';
            ctx.fillText(this.currentTrivia.question, this.width / 2, 160);

            if (!this.triviaAnswered) {
                ctx.fillStyle = '#ffd700';
                ctx.font = '18px Rajdhani';
                ctx.fillText('Click the correct answer for +25⭐ bonus!', this.width / 2, 200);
            }

            // Draw this for React to handle clicks
            // We'll store button positions for the page to use
        }

        // Game Over
        if (this.isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 30, 0.92)';
            ctx.fillRect(0, 0, this.width, this.height);

            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 48px Orbitron, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('HULL BREACH', this.width / 2, this.height / 2 - 80);

            ctx.fillStyle = '#ffffff';
            ctx.font = '26px Rajdhani, sans-serif';
            ctx.fillText(`Reached Level ${this.level} - Depth: ${Math.floor(this.distance / 10)}km`, this.width / 2, this.height / 2 - 25);

            ctx.fillStyle = '#00f0ff';
            ctx.font = 'bold 36px Rajdhani';
            ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, this.width / 2, this.height / 2 + 25);

            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 28px Rajdhani';
            ctx.fillText(`⭐ +${this.stardustCollected} STARDUST`, this.width / 2, this.height / 2 + 70);

            if (this.maxCombo > 1) {
                ctx.fillStyle = '#ff00ff';
                ctx.font = '20px Rajdhani';
                ctx.fillText(`Max Combo: x${this.maxCombo}`, this.width / 2, this.height / 2 + 110);
            }
        }
    }
}
