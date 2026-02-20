'use client';

import { useState, useRef, useEffect } from 'react';
import { Planet } from '@/lib/gameTypes';

// Quick facts for each planet
const planetFacts: Record<string, string[]> = {
    pluto: [
        "Pluto was reclassified as a 'dwarf planet' in 2006",
        "A day on Pluto is 6.4 Earth days long",
        "Pluto has 5 known moons, with Charon being the largest",
        "Pluto is smaller than Earth's Moon",
    ],
    neptune: [
        "Neptune has the strongest winds in the solar system - up to 2,100 km/h!",
        "A year on Neptune equals 165 Earth years",
        "Neptune was the first planet discovered through mathematical predictions",
        "Neptune's moon Triton orbits backwards!",
    ],
    uranus: [
        "Uranus rotates on its side with a 98° tilt!",
        "A day on Uranus is only 17 hours long",
        "Uranus has 27 known moons, named after Shakespeare characters",
        "One Uranian year equals 84 Earth years",
    ],
    saturn: [
        "Saturn's rings are made mostly of ice and rock",
        "Saturn could float in water - it's less dense than water!",
        "Saturn has 146 known moons",
        "The rings span up to 282,000 km but are only 10m thick!",
    ],
    jupiter: [
        "Jupiter is so large that 1,300 Earths could fit inside",
        "The Great Red Spot is a storm raging for 400+ years",
        "Jupiter has 95 known moons",
        "A day on Jupiter is only 10 hours long!",
    ],
    mars: [
        "Mars has the largest volcano in the solar system - Olympus Mons",
        "A day on Mars is 24 hours and 37 minutes",
        "Mars has two small moons: Phobos and Deimos",
        "Mars' red color comes from iron oxide (rust)!",
    ],
    moon: [
        "The Moon is slowly drifting away from Earth - 3.8cm per year",
        "The same side of the Moon always faces Earth",
        "Footprints left by astronauts will remain for millions of years",
        "The Moon causes tides on Earth through gravity",
    ],
    earth: [
        "Earth is the only planet not named after a god",
        "Earth's core is as hot as the Sun's surface!",
        "70% of Earth's surface is covered in water",
        "Earth travels through space at 107,000 km/h",
    ],
    venus: [
        "Venus is hotter than Mercury despite being further from the Sun",
        "A day on Venus is longer than its year!",
        "Venus rotates backwards compared to other planets",
        "Venus' thick atmosphere traps heat - a runaway greenhouse effect",
    ],
    mercury: [
        "Mercury is the smallest planet in our solar system",
        "Temperatures range from -180°C to 430°C",
        "Mercury has no moons and no rings",
        "A year on Mercury is only 88 Earth days",
    ],
};

interface PlanetTooltipProps {
    planet: Planet;
    children: React.ReactNode;
    className?: string;
}

export default function PlanetTooltip({ planet, children, className = '' }: PlanetTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [randomFact, setRandomFact] = useState('');
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const facts = planetFacts[planet.id] || [];

    const showTooltip = () => {
        if (facts.length > 0) {
            setRandomFact(facts[Math.floor(Math.random() * facts.length)]);
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => setIsVisible(true), 300);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div
            className={`relative ${className}`}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}

            {isVisible && randomFact && (
                <div
                    ref={tooltipRef}
                    className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 pointer-events-none animate-fade-in-up"
                    style={{ animationDuration: '200ms' }}
                >
                    <div className="bg-space-tertiary/95 backdrop-blur-md border border-neon-cyan/40 rounded-xl p-4 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                        {/* Planet name */}
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: planet.color }}
                            />
                            <span className="font-heading text-sm text-neon-cyan">
                                {planet.name}
                            </span>
                        </div>

                        {/* Fact */}
                        <p className="text-text-secondary text-xs leading-relaxed">
                            💡 {randomFact}
                        </p>

                        {/* Arrow */}
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-space-tertiary/95 border-r border-b border-neon-cyan/40 rotate-45" />
                    </div>
                </div>
            )}
        </div>
    );
}

const allFacts = [
    "If you could stand on Neptune, the winds would blow you away at 2,000 km/h — faster than the speed of sound on Earth!",
    "One day on Venus is longer than one year on Venus. It takes 243 Earth days to rotate, but only 225 Earth days to orbit the Sun!",
    "Saturn is so light it could float in water — if you had a bathtub big enough!",
    "The footprints left by Apollo astronauts on the Moon will remain there for at least 100 million years.",
    "Jupiter's Great Red Spot is a storm that's been raging for over 400 years and is bigger than Earth!",
    "Olympus Mons on Mars is nearly three times the height of Mount Everest!",
    "Uranus rotates on its side, so it essentially rolls around the Sun like a ball!",
    "Mercury experiences extreme temperature swings from -180°C at night to 430°C during the day.",
    "Earth is the only planet in our solar system with liquid water on its surface.",
    "Pluto's largest moon, Charon, is so big that Pluto and Charon orbit each other!",
    "The Sun contains 99.86% of all the mass in the solar system!",
    "Light from the Sun takes about 8 minutes to reach Earth.",
    "There are more stars in the universe than grains of sand on all of Earth's beaches.",
    "A year on Neptune is 165 Earth years. Neptune has only completed one orbit since its discovery in 1846!",
    "Venus is the hottest planet at 465°C, even though Mercury is closer to the Sun.",
];

// Rotating fun facts component for the bottom of the page
export function RotatingFunFacts() {

    const [currentFact, setCurrentFact] = useState(allFacts[0]);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentFact(allFacts[Math.floor(Math.random() * allFacts.length)]);
                setIsAnimating(false);
            }, 300);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-center py-6 border-t border-white/5">
            <p className="text-text-dim text-xs uppercase tracking-widest mb-2">
                ✨ DID YOU KNOW?
            </p>
            <p
                className={`text-text-secondary text-sm italic max-w-2xl mx-auto px-4 transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                    }`}
            >
                &quot;{currentFact}&quot;
            </p>
        </div>
    );
}
