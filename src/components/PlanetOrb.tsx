// Realistic Planet Rendering Component
// Each planet has unique visual characteristics

interface PlanetOrbProps {
    planetId: string;
    size: number;
    className?: string;
    animated?: boolean;
}

export function PlanetOrb({ planetId, size, className = '', animated = true }: PlanetOrbProps) {
    const animClass = animated ? 'animate-float' : '';

    // Planet-specific rendering
    switch (planetId) {
        case 'pluto':
            // Icy dwarf planet with heart-shaped Tombaugh Regio
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 35% 35%, #e8dcc8, #a89070 50%, #6a5040 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(168, 139, 250, 0.4), inset 0 0 ${size / 6}px rgba(255,255,255,0.1)`
                        }}
                    />
                    {/* Tombaugh Regio - the famous heart! */}
                    <div
                        className="absolute"
                        style={{
                            width: size * 0.35,
                            height: size * 0.3,
                            top: '30%',
                            left: '35%',
                            background: 'rgba(255, 250, 240, 0.6)',
                            borderRadius: '50% 50% 50% 50%',
                            transform: 'rotate(-15deg)',
                            clipPath: 'polygon(50% 100%, 0% 35%, 25% 0%, 50% 20%, 75% 0%, 100% 35%)'
                        }}
                    />
                    {/* Darker regions */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.2,
                            height: size * 0.15,
                            top: '60%',
                            left: '20%',
                            background: 'rgba(80, 60, 40, 0.4)'
                        }}
                    />
                    <div className="absolute rounded-full bg-white/20" style={{ width: size * 0.15, height: size * 0.1, top: '15%', left: '20%', filter: 'blur(1px)' }} />
                </div>
            );

        case 'moon':
            // Earth's Moon - gray with maria and craters
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 35% 35%, #d0d0d0, #a0a0a0 50%, #606060 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(200, 200, 200, 0.4), inset 0 0 ${size / 6}px rgba(255,255,255,0.15)`
                        }}
                    />
                    {/* Mare (dark patches) */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.25,
                            height: size * 0.2,
                            top: '25%',
                            left: '20%',
                            background: 'rgba(80, 80, 90, 0.5)',
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.2,
                            height: size * 0.25,
                            top: '35%',
                            left: '55%',
                            background: 'rgba(70, 70, 80, 0.4)',
                        }}
                    />
                    {/* Craters */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.12,
                            height: size * 0.12,
                            top: '60%',
                            left: '30%',
                            background: 'radial-gradient(circle, rgba(90, 90, 90, 0.6) 30%, transparent 70%)',
                            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.4)'
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.08,
                            height: size * 0.08,
                            top: '20%',
                            left: '65%',
                            background: 'radial-gradient(circle, rgba(100, 100, 100, 0.5) 30%, transparent 70%)'
                        }}
                    />
                    <div className="absolute rounded-full bg-white/25" style={{ width: size * 0.2, height: size * 0.12, top: '10%', left: '25%', filter: 'blur(2px)' }} />
                </div>
            );

        case 'neptune':
            // Deep blue with stormy bands and Great Dark Spot
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `
                                radial-gradient(circle at 30% 30%, #4a90d0, #1a4a78 50%, #0a2a48 100%)
                            `,
                            boxShadow: `0 0 ${size / 3}px rgba(59, 130, 246, 0.5), inset 0 0 ${size / 6}px rgba(255,255,255,0.1)`
                        }}
                    />
                    {/* Atmospheric bands */}
                    <div
                        className="absolute rounded-full overflow-hidden"
                        style={{ inset: size * 0.08, opacity: 0.4 }}
                    >
                        <div className="absolute w-full" style={{ height: '15%', top: '25%', background: 'linear-gradient(90deg, transparent, rgba(100, 150, 255, 0.5), transparent)' }} />
                        <div className="absolute w-full" style={{ height: '20%', top: '55%', background: 'linear-gradient(90deg, transparent, rgba(60, 100, 180, 0.4), transparent)' }} />
                    </div>
                    {/* Great Dark Spot */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.25,
                            height: size * 0.15,
                            top: '45%',
                            left: '30%',
                            background: 'rgba(10, 30, 60, 0.6)',
                            transform: 'rotate(-10deg)'
                        }}
                    />
                    {/* Highlight */}
                    <div className="absolute rounded-full bg-white/20" style={{ width: size * 0.2, height: size * 0.12, top: '15%', left: '20%', filter: 'blur(2px)' }} />
                </div>
            );

        case 'uranus':
            // Pale cyan/green with tilted appearance and subtle bands
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 35% 35%, #7dd3d9, #3aa5a8 50%, #1a6a6b 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(6, 182, 212, 0.5), inset 0 0 ${size / 6}px rgba(255,255,255,0.15)`
                        }}
                    />
                    {/* Faint rings (tilted) */}
                    <div
                        className="absolute"
                        style={{
                            width: size * 1.4,
                            height: size * 0.15,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotate(98deg)',
                            border: '2px solid rgba(200, 255, 255, 0.3)',
                            borderRadius: '50%',
                        }}
                    />
                    {/* Polar cap (represents extreme tilt) */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.35,
                            height: size * 0.35,
                            top: '5%',
                            left: '32%',
                            background: 'radial-gradient(circle, rgba(180, 255, 255, 0.4), transparent 70%)'
                        }}
                    />
                    <div className="absolute rounded-full bg-white/25" style={{ width: size * 0.15, height: size * 0.1, top: '18%', left: '25%', filter: 'blur(1px)' }} />
                </div>
            );

        case 'saturn':
            // Golden/tan with prominent rings
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size * 1.6, height: size, marginLeft: -size * 0.3, marginRight: -size * 0.3 }}>
                    {/* Ring system (behind planet) */}
                    <div
                        className="absolute"
                        style={{
                            width: size * 1.5,
                            height: size * 0.4,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotateX(70deg)',
                            background: `linear-gradient(
                                90deg, 
                                transparent 5%,
                                rgba(210, 180, 140, 0.3) 10%,
                                rgba(180, 150, 100, 0.5) 20%,
                                transparent 25%,
                                rgba(200, 170, 120, 0.4) 30%,
                                rgba(220, 190, 140, 0.6) 45%,
                                rgba(190, 160, 110, 0.5) 55%,
                                transparent 60%,
                                rgba(210, 180, 130, 0.4) 70%,
                                rgba(180, 150, 100, 0.3) 85%,
                                transparent 95%
                            )`,
                            borderRadius: '50%',
                            zIndex: 0,
                        }}
                    />
                    {/* Planet body */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.85,
                            height: size * 0.85,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            background: `radial-gradient(circle at 30% 30%, #e8d4a8, #c9a86c 50%, #8b7355 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(234, 179, 8, 0.5), inset 0 0 ${size / 6}px rgba(255,255,255,0.1)`,
                            zIndex: 1,
                        }}
                    />
                    {/* Bands on Saturn */}
                    <div
                        className="absolute rounded-full overflow-hidden"
                        style={{
                            width: size * 0.75,
                            height: size * 0.75,
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2,
                            opacity: 0.4,
                        }}
                    >
                        <div className="absolute w-full" style={{ height: '8%', top: '30%', background: 'linear-gradient(90deg, transparent, rgba(139, 115, 85, 0.6), transparent)' }} />
                        <div className="absolute w-full" style={{ height: '12%', top: '60%', background: 'linear-gradient(90deg, transparent, rgba(169, 140, 90, 0.5), transparent)' }} />
                    </div>
                    {/* Ring system (front, over planet) */}
                    <div
                        className="absolute"
                        style={{
                            width: size * 1.5,
                            height: size * 0.2,
                            top: '60%',
                            left: '50%',
                            transform: 'translate(-50%, -50%) rotateX(70deg)',
                            background: `linear-gradient(
                                90deg, 
                                transparent 0%,
                                rgba(210, 180, 140, 0.4) 15%,
                                rgba(220, 190, 140, 0.6) 35%,
                                transparent 50%
                            )`,
                            borderRadius: '50%',
                            zIndex: 3,
                        }}
                    />
                    <div
                        className="absolute rounded-full bg-white/20"
                        style={{ width: size * 0.12, height: size * 0.08, top: '25%', left: '35%', filter: 'blur(1px)', zIndex: 4 }}
                    />
                </div>
            );

        case 'jupiter':
            // Orange/tan with prominent bands and Great Red Spot
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 30% 30%, #e8c090, #c99050 50%, #8b5a20 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(249, 115, 22, 0.5), inset 0 0 ${size / 6}px rgba(255,255,255,0.1)`
                        }}
                    />
                    {/* Jupiter's bands */}
                    <div
                        className="absolute rounded-full overflow-hidden"
                        style={{ inset: size * 0.05, opacity: 0.6 }}
                    >
                        <div className="absolute w-full" style={{ height: '12%', top: '15%', background: 'linear-gradient(90deg, transparent, rgba(180, 100, 50, 0.7), transparent)' }} />
                        <div className="absolute w-full" style={{ height: '8%', top: '32%', background: 'linear-gradient(90deg, transparent, rgba(230, 180, 130, 0.6), transparent)' }} />
                        <div className="absolute w-full" style={{ height: '15%', top: '50%', background: 'linear-gradient(90deg, transparent, rgba(160, 80, 40, 0.7), transparent)' }} />
                        <div className="absolute w-full" style={{ height: '10%', top: '70%', background: 'linear-gradient(90deg, transparent, rgba(200, 140, 80, 0.6), transparent)' }} />
                    </div>
                    {/* Great Red Spot */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.2,
                            height: size * 0.12,
                            top: '55%',
                            left: '60%',
                            background: 'radial-gradient(ellipse, #cc4444 30%, #993333 100%)',
                            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
                        }}
                    />
                    <div className="absolute rounded-full bg-white/25" style={{ width: size * 0.18, height: size * 0.1, top: '12%', left: '22%', filter: 'blur(2px)' }} />
                </div>
            );

        case 'mars':
            // Red/orange with polar ice caps and surface features
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 35% 35%, #e07050, #b84030 50%, #701810 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(220, 38, 38, 0.5), inset 0 0 ${size / 6}px rgba(255,255,255,0.1)`
                        }}
                    />
                    {/* Surface features (Valles Marineris hint) */}
                    <div
                        className="absolute"
                        style={{
                            width: size * 0.5,
                            height: size * 0.08,
                            top: '45%',
                            left: '25%',
                            background: 'rgba(80, 20, 10, 0.5)',
                            borderRadius: size * 0.04,
                            transform: 'rotate(-5deg)'
                        }}
                    />
                    {/* North polar ice cap */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.35,
                            height: size * 0.2,
                            top: '2%',
                            left: '32%',
                            background: 'radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.8), transparent 70%)'
                        }}
                    />
                    {/* South polar cap */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.25,
                            height: size * 0.15,
                            bottom: '5%',
                            left: '38%',
                            background: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.6), transparent 70%)'
                        }}
                    />
                    <div className="absolute rounded-full bg-white/20" style={{ width: size * 0.15, height: size * 0.1, top: '18%', left: '22%', filter: 'blur(1px)' }} />
                </div>
            );

        case 'earth':
            // Blue with green/brown continents and white clouds
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    {/* Ocean base */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 35% 35%, #4a90d9, #2563eb 50%, #1e40af 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(37, 99, 235, 0.6), inset 0 0 ${size / 6}px rgba(255,255,255,0.15)`
                        }}
                    />
                    {/* Continents */}
                    <div
                        className="absolute rounded-full overflow-hidden"
                        style={{ inset: size * 0.08 }}
                    >
                        {/* Americas */}
                        <div className="absolute" style={{ width: '25%', height: '45%', top: '20%', left: '15%', background: 'rgba(34, 139, 34, 0.7)', borderRadius: '40% 60% 50% 40%' }} />
                        {/* Europe/Africa */}
                        <div className="absolute" style={{ width: '20%', height: '50%', top: '18%', left: '45%', background: 'rgba(139, 119, 42, 0.6)', borderRadius: '30% 50% 60% 40%' }} />
                        {/* Asia */}
                        <div className="absolute" style={{ width: '30%', height: '35%', top: '15%', left: '58%', background: 'rgba(34, 139, 34, 0.6)', borderRadius: '50% 40% 30% 60%' }} />
                    </div>
                    {/* Clouds */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.4,
                            height: size * 0.15,
                            top: '25%',
                            left: '10%',
                            background: 'rgba(255, 255, 255, 0.5)',
                            filter: 'blur(3px)'
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.35,
                            height: size * 0.12,
                            top: '60%',
                            left: '40%',
                            background: 'rgba(255, 255, 255, 0.4)',
                            filter: 'blur(2px)'
                        }}
                    />
                    <div className="absolute rounded-full bg-white/30" style={{ width: size * 0.18, height: size * 0.1, top: '12%', left: '20%', filter: 'blur(2px)' }} />
                </div>
            );

        case 'venus':
            // Yellowish with thick cloud cover
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 30% 30%, #f5d98a, #d4a850 50%, #8b6914 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(245, 158, 11, 0.5), inset 0 0 ${size / 6}px rgba(255,255,255,0.1)`
                        }}
                    />
                    {/* Thick cloud bands */}
                    <div
                        className="absolute rounded-full overflow-hidden"
                        style={{ inset: size * 0.05, opacity: 0.5 }}
                    >
                        <div className="absolute w-full" style={{ height: '20%', top: '20%', background: 'linear-gradient(90deg, transparent, rgba(255, 230, 150, 0.6), transparent)' }} />
                        <div className="absolute w-full" style={{ height: '25%', top: '50%', background: 'linear-gradient(90deg, transparent, rgba(230, 200, 100, 0.5), transparent)' }} />
                    </div>
                    {/* Featureless look (no surface visible) */}
                    <div
                        className="absolute inset-1 rounded-full"
                        style={{
                            background: 'radial-gradient(circle at 40% 40%, transparent, rgba(180, 140, 50, 0.2))'
                        }}
                    />
                    <div className="absolute rounded-full bg-white/20" style={{ width: size * 0.2, height: size * 0.12, top: '15%', left: '22%', filter: 'blur(2px)' }} />
                </div>
            );

        case 'mercury':
            // Gray and cratered like the Moon
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 35% 35%, #b0a090, #808080 50%, #404040 100%)`,
                            boxShadow: `0 0 ${size / 3}px rgba(156, 163, 175, 0.4), inset 0 0 ${size / 6}px rgba(255,255,255,0.1)`
                        }}
                    />
                    {/* Craters */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.15,
                            height: size * 0.15,
                            top: '35%',
                            left: '25%',
                            background: 'radial-gradient(circle, rgba(60, 60, 60, 0.6) 40%, transparent 70%)',
                            boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.5)'
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.1,
                            height: size * 0.1,
                            top: '55%',
                            left: '55%',
                            background: 'radial-gradient(circle, rgba(50, 50, 50, 0.5) 40%, transparent 70%)',
                            boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.4)'
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            width: size * 0.08,
                            height: size * 0.08,
                            top: '25%',
                            left: '60%',
                            background: 'radial-gradient(circle, rgba(70, 70, 70, 0.5) 40%, transparent 70%)'
                        }}
                    />
                    <div className="absolute rounded-full bg-white/15" style={{ width: size * 0.18, height: size * 0.1, top: '15%', left: '25%', filter: 'blur(1px)' }} />
                </div>
            );

        default:
            // Fallback generic planet
            return (
                <div className={`relative ${animClass} ${className}`} style={{ width: size, height: size }}>
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `radial-gradient(circle at 30% 30%, #888, #555 50%, #333 100%)`,
                            boxShadow: `0 0 ${size / 4}px rgba(128, 128, 128, 0.4)`
                        }}
                    />
                </div>
            );
    }
}
