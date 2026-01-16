// Pluto Game Logic - "Planet or Not?" 
// A Tinder/Reigns-style swipe classification game

export interface Card {
    id: string;
    name: string;
    description: string;
    isPlanet: boolean;
    isSpecial?: boolean;
    specialReaction?: string;
    x: number;
    y: number;
    rotation: number;
    targetX: number;
    opacity: number;
    scale: number;
    imageType: 'planet' | 'dwarf' | 'moon' | 'asteroid' | 'comet' | 'star' | 'other';
    color: string;
    funFact: string;
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
    emoji?: string;
}

// All the celestial objects to classify
const CELESTIAL_OBJECTS = [
    // ACTUAL PLANETS
    { id: 'mercury', name: 'Mercury', description: 'Closest to the Sun', isPlanet: true, imageType: 'planet', color: '#b5b5b5', funFact: 'Mercury is the smallest planet and has no moons!' },
    { id: 'venus', name: 'Venus', description: 'Hottest planet', isPlanet: true, imageType: 'planet', color: '#e6c87a', funFact: 'Venus spins backwards compared to other planets!' },
    { id: 'earth', name: 'Earth', description: 'Our home', isPlanet: true, imageType: 'planet', color: '#4a90d9', funFact: 'Earth is the only planet not named after a god!' },
    { id: 'mars', name: 'Mars', description: 'The Red Planet', isPlanet: true, imageType: 'planet', color: '#c1440e', funFact: 'Mars has the tallest volcano in the solar system - Olympus Mons!' },
    { id: 'jupiter', name: 'Jupiter', description: 'Largest planet', isPlanet: true, imageType: 'planet', color: '#d4a574', funFact: 'Jupiter has 95 known moons!' },
    { id: 'saturn', name: 'Saturn', description: 'Ringed beauty', isPlanet: true, imageType: 'planet', color: '#f4d59e', funFact: 'Saturn could float in water if there was a bathtub big enough!' },
    { id: 'uranus', name: 'Uranus', description: 'Sideways spinner', isPlanet: true, imageType: 'planet', color: '#a5d4e8', funFact: 'Uranus rotates on its side at 98 degrees!' },
    { id: 'neptune', name: 'Neptune', description: 'Windiest world', isPlanet: true, imageType: 'planet', color: '#4b70dd', funFact: 'Neptune has winds up to 2,100 km/h!' },

    // DWARF PLANETS (NOT planets!)
    { id: 'pluto', name: 'Pluto', description: 'The controversial one', isPlanet: false, isSpecial: true, imageType: 'dwarf', color: '#c4a882', funFact: 'Pluto was a "planet" for 76 years before being reclassified in 2006!', specialReaction: 'HEY! I used to be a planet! This is discrimination!' },
    { id: 'ceres', name: 'Ceres', description: 'Largest in asteroid belt', isPlanet: false, imageType: 'dwarf', color: '#9a9a9a', funFact: 'Ceres was discovered in 1801 and was also once called a planet!' },
    { id: 'eris', name: 'Eris', description: 'Bigger than Pluto', isPlanet: false, imageType: 'dwarf', color: '#f0ebe0', funFact: 'Eris caused the great planet debate - it\'s actually bigger than Pluto!' },
    { id: 'makemake', name: 'Makemake', description: 'Kuiper Belt dwarf', isPlanet: false, imageType: 'dwarf', color: '#d4a574', funFact: 'Makemake is named after a Rapa Nui god of fertility!' },
    { id: 'haumea', name: 'Haumea', description: 'Egg-shaped world', isPlanet: false, imageType: 'dwarf', color: '#e0e0e0', funFact: 'Haumea spins so fast it\'s shaped like an egg!' },

    // MOONS (NOT planets!)
    { id: 'moon', name: 'The Moon', description: 'Earth\'s companion', isPlanet: false, imageType: 'moon', color: '#c4c4c4', funFact: 'The Moon is slowly drifting away from Earth at 3.8cm per year!' },
    { id: 'titan', name: 'Titan', description: 'Saturn\'s largest moon', isPlanet: false, imageType: 'moon', color: '#d4a060', funFact: 'Titan has lakes of liquid methane and a thick atmosphere!' },
    { id: 'europa', name: 'Europa', description: 'Jupiter\'s icy moon', isPlanet: false, imageType: 'moon', color: '#e8e0d0', funFact: 'Europa likely has a liquid water ocean under its ice!' },
    { id: 'ganymede', name: 'Ganymede', description: 'Largest moon', isPlanet: false, imageType: 'moon', color: '#b0a090', funFact: 'Ganymede is bigger than Mercury!' },
    { id: 'charon', name: 'Charon', description: 'Pluto\'s big moon', isPlanet: false, imageType: 'moon', color: '#9a9090', funFact: 'Charon is half the size of Pluto - they orbit each other!' },

    // ASTEROIDS & COMETS (NOT planets!)
    { id: 'halley', name: 'Halley\'s Comet', description: 'Famous visitor', isPlanet: false, imageType: 'comet', color: '#88ccff', funFact: 'Halley\'s Comet visits Earth every 75-79 years!' },
    { id: 'vesta', name: 'Vesta', description: 'Giant asteroid', isPlanet: false, imageType: 'asteroid', color: '#8a8a8a', funFact: 'Vesta is so bright you can see it with the naked eye!' },
    { id: 'bennu', name: 'Bennu', description: 'Near-Earth asteroid', isPlanet: false, imageType: 'asteroid', color: '#666666', funFact: 'NASA collected samples from Bennu in 2023!' },

    // STARS (NOT planets!)
    { id: 'sun', name: 'The Sun', description: 'Our star', isPlanet: false, imageType: 'star', color: '#ffdd44', funFact: 'The Sun contains 99.86% of all mass in our solar system!' },
    { id: 'proxima', name: 'Proxima Centauri', description: 'Nearest star', isPlanet: false, imageType: 'star', color: '#ff6644', funFact: 'Proxima Centauri is 4.24 light-years away!' },

    // TRICK QUESTIONS
    { id: 'iss', name: 'Int\'l Space Station', description: 'Human-made satellite', isPlanet: false, imageType: 'other', color: '#cccccc', funFact: 'The ISS orbits Earth 16 times per day!' },
    { id: 'blackhole', name: 'Black Hole', description: 'Space-time eater', isPlanet: false, imageType: 'other', color: '#111111', funFact: 'Black holes can warp space and time!' },
];

export class PlutoGameLogic {
    width: number;
    height: number;
    centerX: number;
    centerY: number;

    // Cards
    currentCard: Card | null;
    nextCards: Card[];
    usedCardIds: Set<string>;

    // Swipe state
    isDragging: boolean;
    dragStartX: number;
    dragStartY: number;
    cardStartX: number;

    // Game state
    score: number;
    stardustCollected: number;
    credibility: number; // Health
    streak: number;
    maxStreak: number;
    isGameOver: boolean;
    cardsAnswered: number;
    correctAnswers: number;

    // Animation
    particles: Particle[];
    showingResult: boolean;
    resultText: string;
    resultColor: string;
    resultTimer: number;
    showFunFact: boolean;
    currentFunFact: string;

    // Background
    backgroundStars: { x: number; y: number; size: number; twinkle: number }[];
    pulsePhase: number;

    // Session
    sessionStardust: number;
    maxSessionStardust: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.maxSessionStardust = 60;

        this.currentCard = null;
        this.nextCards = [];
        this.usedCardIds = new Set();
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.cardStartX = 0;
        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.credibility = 100;
        this.streak = 0;
        this.maxStreak = 0;
        this.isGameOver = false;
        this.cardsAnswered = 0;
        this.correctAnswers = 0;
        this.particles = [];
        this.showingResult = false;
        this.resultText = '';
        this.resultColor = '';
        this.resultTimer = 0;
        this.showFunFact = false;
        this.currentFunFact = '';
        this.backgroundStars = [];
        this.pulsePhase = 0;

        this.initializeStars();
        this.reset();
    }

    initializeStars() {
        for (let i = 0; i < 150; i++) {
            this.backgroundStars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
            });
        }
    }

    reset() {
        this.usedCardIds = new Set();
        this.nextCards = this.shuffleCards();
        this.currentCard = null;
        this.dealNextCard();

        this.score = 0;
        this.stardustCollected = 0;
        this.sessionStardust = 0;
        this.credibility = 100;
        this.streak = 0;
        this.maxStreak = 0;
        this.isGameOver = false;
        this.cardsAnswered = 0;
        this.correctAnswers = 0;
        this.particles = [];
        this.showingResult = false;
        this.showFunFact = false;
    }

    shuffleCards(): Card[] {
        const shuffled = [...CELESTIAL_OBJECTS]
            .sort(() => Math.random() - 0.5)
            .map(obj => ({
                ...obj,
                x: this.centerX,
                y: this.centerY - 50,
                rotation: 0,
                targetX: this.centerX,
                opacity: 1,
                scale: 1,
            })) as Card[];
        return shuffled;
    }

    dealNextCard() {
        if (this.nextCards.length === 0) {
            // Reshuffle if we run out
            this.nextCards = this.shuffleCards();
        }

        this.currentCard = this.nextCards.shift()!;
        if (this.currentCard) {
            this.currentCard.x = this.centerX;
            this.currentCard.y = this.centerY - 50;
            this.currentCard.rotation = 0;
            this.currentCard.opacity = 1;
            this.currentCard.scale = 0.5;
        }
    }

    handleMouseDown(x: number, y: number) {
        if (this.showingResult || !this.currentCard || this.isGameOver) return;

        // Check if clicking on card
        const cardWidth = 280;
        const cardHeight = 380;
        const cardLeft = this.currentCard.x - cardWidth / 2;
        const cardTop = this.currentCard.y - cardHeight / 2;

        if (x >= cardLeft && x <= cardLeft + cardWidth &&
            y >= cardTop && y <= cardTop + cardHeight) {
            this.isDragging = true;
            this.dragStartX = x;
            this.dragStartY = y;
            this.cardStartX = this.currentCard.x;
        }
    }

    handleMouseMove(x: number, y: number) {
        if (!this.isDragging || !this.currentCard) return;

        const deltaX = x - this.dragStartX;
        this.currentCard.x = this.cardStartX + deltaX;

        // Rotate based on drag distance
        this.currentCard.rotation = deltaX * 0.0015;

        // Calculate target position for visual feedback
        this.currentCard.targetX = x;
    }

    handleMouseUp() {
        if (!this.isDragging || !this.currentCard) return;

        const deltaX = this.currentCard.x - this.centerX;
        const threshold = 100;

        if (Math.abs(deltaX) > threshold) {
            // Swipe registered!
            const swipedRight = deltaX > 0; // Right = PLANET
            this.processAnswer(swipedRight);
        } else {
            // Reset card position
            this.currentCard.x = this.centerX;
            this.currentCard.rotation = 0;
        }

        this.isDragging = false;
    }

    processAnswer(answeredPlanet: boolean) {
        if (!this.currentCard) return;

        const isCorrect = answeredPlanet === this.currentCard.isPlanet;
        const isPluto = this.currentCard.isSpecial && this.currentCard.id === 'pluto';

        this.cardsAnswered++;

        // Animate card flying off
        const flyDirection = answeredPlanet ? 1 : -1;
        this.currentCard.targetX = this.centerX + flyDirection * 600;

        if (isPluto) {
            // SPECIAL PLUTO HANDLING - it's always a trick!
            this.showResult('😤 "I USED TO BE A PLANET!"', '#ff69b4');
            this.createPlutoReaction();
            // Give partial credit for Pluto - it's complicated!
            this.score += 50;
            this.streak++;
            const stars = 2;
            if (this.sessionStardust < this.maxSessionStardust) {
                this.stardustCollected += stars;
                this.sessionStardust += stars;
            }
            this.currentFunFact = this.currentCard.specialReaction || this.currentCard.funFact;
        } else if (isCorrect) {
            this.correctAnswers++;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);

            // Score based on streak
            const streakBonus = Math.min(this.streak, 10);
            this.score += 100 * streakBonus;

            // Stardust
            const stars = 1 + Math.floor(this.streak / 3);
            if (this.sessionStardust < this.maxSessionStardust) {
                const earned = Math.min(stars, this.maxSessionStardust - this.sessionStardust);
                this.stardustCollected += earned;
                this.sessionStardust += earned;
            }

            this.showResult(this.streak > 1 ? `✓ CORRECT! x${this.streak} STREAK` : '✓ CORRECT!', '#00ff88');
            this.createCelebration(answeredPlanet);
            this.currentFunFact = this.currentCard.funFact;
        } else {
            this.streak = 0;
            this.credibility -= 15;

            const correctAnswer = this.currentCard.isPlanet ? 'IS a planet!' : 'is NOT a planet!';
            this.showResult(`✗ WRONG! ${this.currentCard.name} ${correctAnswer}`, '#ff4444');
            this.createFailure();
            this.currentFunFact = this.currentCard.funFact;

            if (this.credibility <= 0) {
                this.isGameOver = true;
            }
        }

        this.showFunFact = true;
    }

    showResult(text: string, color: string) {
        this.showingResult = true;
        this.resultText = text;
        this.resultColor = color;
        this.resultTimer = 90; // 1.5 seconds at 60fps
    }

    createCelebration(swipedRight: boolean) {
        const emojis = ['⭐', '✨', '🌟', '💫'];
        const startX = swipedRight ? this.width * 0.75 : this.width * 0.25;

        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: startX + (Math.random() - 0.5) * 100,
                y: this.centerY + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 8,
                vy: -Math.random() * 6 - 2,
                size: 20 + Math.random() * 20,
                color: '#ffd700',
                life: 60,
                maxLife: 60,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
            });
        }
    }

    createPlutoReaction() {
        const emojis = ['💔', '😤', '😢', '🥺', '❤️'];
        for (let i = 0; i < 25; i++) {
            this.particles.push({
                x: this.centerX + (Math.random() - 0.5) * 200,
                y: this.centerY + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 6,
                vy: -Math.random() * 4 - 1,
                size: 25 + Math.random() * 20,
                color: '#ff69b4',
                life: 80,
                maxLife: 80,
                emoji: emojis[Math.floor(Math.random() * emojis.length)],
            });
        }
    }

    createFailure() {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.centerX + (Math.random() - 0.5) * 100,
                y: this.centerY + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 5,
                vy: Math.random() * 3 + 1,
                size: 15 + Math.random() * 10,
                color: '#ff4444',
                life: 40,
                maxLife: 40,
                emoji: '❌',
            });
        }
    }

    update() {
        if (this.isGameOver) return;

        this.pulsePhase += 0.02;

        // Update current card animation
        if (this.currentCard) {
            // Scale animation (card appearing)
            this.currentCard.scale += (1 - this.currentCard.scale) * 0.15;

            // If showing result, animate card off screen
            if (this.showingResult && this.currentCard.targetX !== this.centerX) {
                this.currentCard.x += (this.currentCard.targetX - this.currentCard.x) * 0.2;
                this.currentCard.opacity -= 0.05;
            }
        }

        // Update result timer
        if (this.showingResult) {
            this.resultTimer--;
            if (this.resultTimer <= 0) {
                this.showingResult = false;
                this.showFunFact = false;
                this.dealNextCard();
            }
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15; // Gravity
            p.life--;
            return p.life > 0;
        });
    }

    draw(ctx: CanvasRenderingContext2D) {
        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        bgGrad.addColorStop(0, '#0a0014');
        bgGrad.addColorStop(0.5, '#150528');
        bgGrad.addColorStop(1, '#0d001a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Stars
        this.backgroundStars.forEach(star => {
            const twinkle = Math.sin(star.twinkle + this.pulsePhase) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Swipe zones (left = NOT PLANET, right = PLANET)
        this.drawSwipeZones(ctx);

        // Draw card
        if (this.currentCard && (!this.showingResult || this.currentCard.opacity > 0.1)) {
            this.drawCard(ctx, this.currentCard);
        }

        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life / p.maxLife;
            if (p.emoji) {
                ctx.font = `${p.size}px Arial`;
                ctx.textAlign = 'center';
                ctx.fillText(p.emoji, p.x, p.y);
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.globalAlpha = 1;

        // Result text
        if (this.showingResult) {
            this.drawResult(ctx);
        }

        // UI
        this.drawUI(ctx);
    }

    drawSwipeZones(ctx: CanvasRenderingContext2D) {
        // Left zone - NOT A PLANET
        const leftAlpha = this.currentCard ? Math.max(0, (this.centerX - this.currentCard.x) / 200) * 0.6 : 0;
        if (leftAlpha > 0) {
            ctx.fillStyle = `rgba(255, 68, 68, ${leftAlpha})`;
            ctx.fillRect(0, 0, this.width / 3, this.height);
        }

        // Right zone - PLANET
        const rightAlpha = this.currentCard ? Math.max(0, (this.currentCard.x - this.centerX) / 200) * 0.6 : 0;
        if (rightAlpha > 0) {
            ctx.fillStyle = `rgba(0, 255, 136, ${rightAlpha})`;
            ctx.fillRect(this.width * 2 / 3, 0, this.width / 3, this.height);
        }

        // Zone labels
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';

        // Left label
        ctx.fillStyle = `rgba(255, 100, 100, ${0.3 + leftAlpha})`;
        ctx.fillText('❌ NOT A', 100, this.height / 2 - 20);
        ctx.fillText('PLANET', 100, this.height / 2 + 20);

        // Right label
        ctx.fillStyle = `rgba(100, 255, 136, ${0.3 + rightAlpha})`;
        ctx.fillText('✓ IS A', this.width - 100, this.height / 2 - 20);
        ctx.fillText('PLANET', this.width - 100, this.height / 2 + 20);

        // Arrows
        ctx.font = '40px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillText('←', 100, this.height / 2 + 80);
        ctx.fillText('→', this.width - 100, this.height / 2 + 80);
    }

    drawCard(ctx: CanvasRenderingContext2D, card: Card) {
        ctx.save();
        ctx.translate(card.x, card.y);
        ctx.rotate(card.rotation);
        ctx.scale(card.scale, card.scale);
        ctx.globalAlpha = card.opacity;

        const w = 280;
        const h = 380;

        // Card shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(-w / 2 + 10, -h / 2 + 10, w, h);

        // Card background
        const cardGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        cardGrad.addColorStop(0, '#2a1a3a');
        cardGrad.addColorStop(1, '#1a0a2a');
        ctx.fillStyle = cardGrad;
        ctx.fillRect(-w / 2, -h / 2, w, h);

        // Card border
        ctx.strokeStyle = card.isSpecial ? '#ff69b4' : '#a78bfa';
        ctx.lineWidth = 3;
        ctx.strokeRect(-w / 2, -h / 2, w, h);

        // Celestial object visualization
        const orbRadius = 70;
        const orbY = -60;

        // Glow
        const glow = ctx.createRadialGradient(0, orbY, 0, 0, orbY, orbRadius * 1.5);
        glow.addColorStop(0, card.color + '80');
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, orbY, orbRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Object itself
        const objGrad = ctx.createRadialGradient(-orbRadius * 0.3, orbY - orbRadius * 0.3, 0, 0, orbY, orbRadius);
        objGrad.addColorStop(0, this.lightenColor(card.color));
        objGrad.addColorStop(1, this.darkenColor(card.color));
        ctx.fillStyle = objGrad;
        ctx.beginPath();
        ctx.arc(0, orbY, orbRadius, 0, Math.PI * 2);
        ctx.fill();

        // Special indicator for Pluto
        if (card.isSpecial) {
            ctx.fillStyle = '#ff69b4';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', orbRadius * 0.3, orbY + orbRadius * 0.2);
        }

        // Type badge
        ctx.fillStyle = this.getTypeBadgeColor(card.imageType);
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.imageType.toUpperCase(), 0, orbY + orbRadius + 25);

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(card.name, 0, 80);

        // Description
        ctx.fillStyle = '#a78bfa';
        ctx.font = '18px Arial';
        ctx.fillText(card.description, 0, 115);

        // Question prompt
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 20px Arial';
        ctx.fillText('Is this a PLANET?', 0, 160);

        ctx.restore();
    }

    drawResult(ctx: CanvasRenderingContext2D) {
        // Dim background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Result text
        ctx.fillStyle = this.resultColor;
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.resultText, this.centerX, this.height / 2 - 50);

        // Fun fact
        if (this.showFunFact && this.currentFunFact) {
            ctx.fillStyle = '#fff';
            ctx.font = '18px Arial';

            // Word wrap the fun fact
            const words = this.currentFunFact.split(' ');
            let line = '';
            let y = this.height / 2 + 20;
            const maxWidth = 500;

            for (const word of words) {
                const testLine = line + word + ' ';
                if (ctx.measureText(testLine).width > maxWidth && line) {
                    ctx.fillText(line.trim(), this.centerX, y);
                    line = word + ' ';
                    y += 25;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line.trim(), this.centerX, y);
        }
    }

    drawUI(ctx: CanvasRenderingContext2D) {
        // Credibility bar (top)
        const barWidth = 300;
        const barHeight = 20;
        const barX = (this.width - barWidth) / 2;
        const barY = 20;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Fill
        const credGrad = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        credGrad.addColorStop(0, '#ff69b4');
        credGrad.addColorStop(1, '#a78bfa');
        ctx.fillStyle = credGrad;
        ctx.fillRect(barX, barY, barWidth * (this.credibility / 100), barHeight);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`CREDIBILITY: ${Math.round(this.credibility)}%`, this.centerX, barY + 15);

        // Score (top left)
        ctx.textAlign = 'left';
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`⭐ ${this.stardustCollected}`, 20, 40);

        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.fillText(`Score: ${this.score.toLocaleString()}`, 20, 65);

        // Streak (top right)
        ctx.textAlign = 'right';
        if (this.streak > 1) {
            ctx.fillStyle = '#00ff88';
            ctx.font = 'bold 20px Arial';
            ctx.fillText(`🔥 ${this.streak} STREAK`, this.width - 20, 40);
        }

        ctx.fillStyle = '#a78bfa';
        ctx.font = '14px Arial';
        ctx.fillText(`${this.correctAnswers}/${this.cardsAnswered} correct`, this.width - 20, 65);

        // Instructions (bottom)
        if (this.cardsAnswered < 3 && !this.showingResult) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '16px Arial';
            ctx.fillText('Drag the card LEFT or RIGHT to classify!', this.centerX, this.height - 30);
        }
    }

    getTypeBadgeColor(type: string): string {
        const colors: Record<string, string> = {
            planet: '#00ff88',
            dwarf: '#ff69b4',
            moon: '#88ccff',
            asteroid: '#888888',
            comet: '#ffcc00',
            star: '#ffdd44',
            other: '#aaaaaa',
        };
        return colors[type] || '#ffffff';
    }

    lightenColor(hex: string): string {
        const r = Math.min(255, parseInt(hex.slice(1, 3), 16) * 1.3);
        const g = Math.min(255, parseInt(hex.slice(3, 5), 16) * 1.3);
        const b = Math.min(255, parseInt(hex.slice(5, 7), 16) * 1.3);
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }

    darkenColor(hex: string): string {
        const r = parseInt(hex.slice(1, 3), 16) * 0.6;
        const g = parseInt(hex.slice(3, 5), 16) * 0.6;
        const b = parseInt(hex.slice(5, 7), 16) * 0.6;
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
}
