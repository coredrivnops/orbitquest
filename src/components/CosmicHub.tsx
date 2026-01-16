'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PLANETS } from '@/lib/gameTypes';
import { useRouter } from 'next/navigation';
import { loadProgress } from '@/lib/localStorage';

export default function CosmicHub() {
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const targetCameraPos = useRef(new THREE.Vector3(-30, 0, 15)); // Target position

    // State for navigation
    const [focusedIndex, setFocusedIndex] = useState(0);

    // Update target when focus changes
    useEffect(() => {
        // Zoom closer (z=8) for focused planet
        const targetX = -30 + (focusedIndex * 15); // Spread planets out more (15 units)
        targetCameraPos.current.set(targetX, 0, 8);
    }, [focusedIndex]);

    // Initialize focus based on progress
    useEffect(() => {
        const progress = loadProgress();
        const lastUnlockedId = progress.unlockedPlanets[progress.unlockedPlanets.length - 1];
        const index = PLANETS.findIndex(p => p.id === lastUnlockedId);
        if (index >= 0) {
            setFocusedIndex(index);
        }
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x050510, 0.005); // Darker, denser fog for depth

        const progress = loadProgress();

        // Initial Camera Setup
        const startX = -30 + (focusedIndex * 15);
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000); // 50 FOV for cinematic look
        camera.position.set(startX, 0, 20);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        containerRef.current.appendChild(renderer.domElement);

        // --- Lights ---
        const ambientLight = new THREE.AmbientLight(0x111111); // Very dim ambient
        scene.add(ambientLight);

        // Main Sun Light (Directional for dramatic shadows)
        const sunLight = new THREE.DirectionalLight(0xffffff, 2);
        sunLight.position.set(50, 20, 30);
        scene.add(sunLight);

        // Rim Light (Blue-ish for space feel)
        const rimLight = new THREE.SpotLight(0x00f0ff, 5);
        rimLight.position.set(-50, 0, 10);
        rimLight.lookAt(0, 0, 0);
        scene.add(rimLight);

        // --- Starfield (High quality) ---
        const starGeo = new THREE.BufferGeometry();
        const starCount = 3000;
        const starPos = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount * 3; i += 3) {
            starPos[i] = (Math.random() - 0.5) * 400;
            starPos[i + 1] = (Math.random() - 0.5) * 400;
            starPos[i + 2] = (Math.random() - 0.5) * 200 - 50; // Push back

            // Random bluish colors
            const col = new THREE.Color().setHSL(0.6, 0.8, Math.random());
            starColors[i] = col.r;
            starColors[i + 1] = col.g;
            starColors[i + 2] = col.b;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        const starMat = new THREE.PointsMaterial({ size: 0.15, vertexColors: true, transparent: true, opacity: 0.8 });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- Planets ---
        const planetMeshes: THREE.Mesh[] = [];
        const orbitGroups: THREE.Group[] = []; // Groups for rotation

        PLANETS.forEach((planet, index) => {
            const xPos = -30 + (index * 15); // Spread: 15 units
            const isUnlocked = progress.unlockedPlanets.includes(planet.id);

            const planetGroup = new THREE.Group();
            planetGroup.position.set(xPos, 0, 0);
            scene.add(planetGroup);

            // 1. Planet Sphere (High Poly)
            // Scale logic: Gas giants bigger
            let radius = 2.5;
            if (['jupiter', 'saturn'].includes(planet.id)) radius = 4.5;
            else if (['uranus', 'neptune'].includes(planet.id)) radius = 3.5;
            else if (['mercury', 'mars'].includes(planet.id)) radius = 1.8;

            const geometry = new THREE.SphereGeometry(radius, 64, 64);

            // Material: Procedural Noise/Color approximation for now
            const material = new THREE.MeshStandardMaterial({
                color: planet.color,
                roughness: 0.7,
                metalness: 0.2,
                emissive: planet.glowColor,
                emissiveIntensity: isUnlocked ? 0.1 : 0.05,
            });

            // Locked state: Wireframe overlay
            if (!isUnlocked) {
                material.wireframe = true;
                material.emissiveIntensity = 0;
                material.color.setHex(0x333333);
            }

            const mesh = new THREE.Mesh(geometry, material);
            planetGroup.add(mesh);
            planetMeshes.push(mesh);

            // 2. Atmosphere Glow (if unlocked)
            if (isUnlocked) {
                const atmoGeo = new THREE.SphereGeometry(radius * 1.2, 32, 32);
                const atmoMat = new THREE.MeshBasicMaterial({
                    color: planet.glowColor,
                    transparent: true,
                    opacity: 0.15,
                    side: THREE.BackSide, // Inverted sphere for glow effect
                    blending: THREE.AdditiveBlending,
                });
                const atmo = new THREE.Mesh(atmoGeo, atmoMat);
                planetGroup.add(atmo);
            }

            // 3. Rings (Saturn/Uranus)
            if (planet.id === 'saturn' && isUnlocked) {
                const ringGeo = new THREE.RingGeometry(5.5, 8.5, 64);
                const ringMat = new THREE.MeshStandardMaterial({
                    color: 0xcfb53b,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.8,
                });
                const rings = new THREE.Mesh(ringGeo, ringMat);
                rings.rotation.x = Math.PI / 2.5;
                planetGroup.add(rings);
            }
            if (planet.id === 'uranus' && isUnlocked) {
                const ringGeo = new THREE.RingGeometry(4.5, 5, 64);
                const ringMat = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.4,
                });
                const rings = new THREE.Mesh(ringGeo, ringMat);
                rings.rotation.x = Math.PI / 1.5; // Vertical tilt
                planetGroup.add(rings);
            }

            orbitGroups.push(planetGroup);
        });

        // --- Animation Loop ---
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);

            // Rotate planets
            orbitGroups.forEach((group, i) => {
                // Self rotation
                group.children[0].rotation.y += 0.002 + (i * 0.0005);
                // Slight wobble
                group.rotation.z = Math.sin(Date.now() * 0.0005 + i) * 0.1;
            });

            // Move stars slowly
            stars.rotation.y -= 0.0002;

            // Cinematic Camera Move
            // Lerp current position to target position
            if (cameraRef.current) {
                cameraRef.current.position.lerp(targetCameraPos.current, 0.05); // Smooth 5% interpolation

                // Slight mouse parallax offset could be added here

                // Look slightly ahead of camera to keep framing nice
                cameraRef.current.lookAt(cameraRef.current.position.x, 0, 0);
            }

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []); // Run once

    return (
        <div className="relative w-full h-screen bg-space-deep overflow-hidden">
            <div ref={containerRef} className="absolute inset-0 z-0" />

            {/* UI Overlay */}
            <div className="absolute top-12 left-0 w-full text-center pointer-events-none z-10">
                <h1 className="font-heading text-4xl lg:text-5xl text-neon-cyan glow-text mb-2 tracking-widest uppercase">
                    The Journey Home
                </h1>
                <div className="flex justify-center items-center gap-4">
                    <span className="h-px w-24 bg-gradient-to-r from-transparent to-neon-purple"></span>
                    <p className="text-text-secondary font-ui tracking-widest text-sm">MISSION: SOL-01</p>
                    <span className="h-px w-24 bg-gradient-to-l from-transparent to-neon-purple"></span>
                </div>
            </div>

            {/* Navigation Controls (Side Arrows) */}
            <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-12 pointer-events-none z-20">
                <button
                    onClick={() => setFocusedIndex(Math.max(0, focusedIndex - 1))}
                    disabled={focusedIndex === 0}
                    className={`pointer-events-auto p-4 transition-all duration-300 transform hover:scale-110 ${focusedIndex === 0 ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div className="w-12 h-12 rounded-full border border-neon-cyan/50 flex items-center justify-center bg-black/50 backdrop-blur hover:bg-neon-cyan/20">
                        <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </div>
                </button>

                <button
                    onClick={() => setFocusedIndex(Math.min(PLANETS.length - 1, focusedIndex + 1))}
                    disabled={focusedIndex === PLANETS.length - 1}
                    className={`pointer-events-auto p-4 transition-all duration-300 transform hover:scale-110 ${focusedIndex === PLANETS.length - 1 ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div className="w-12 h-12 rounded-full border border-neon-cyan/50 flex items-center justify-center bg-black/50 backdrop-blur hover:bg-neon-cyan/20">
                        <svg className="w-6 h-6 text-neon-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                </button>
            </div>

            {/* Planet Info & Action (Bottom) */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 pointer-events-none z-30">
                <div className="relative">
                    {/* Glass Panel */}
                    <div className="absolute inset-0 bg-space-deep/90 backdrop-blur-xl rounded-t-3xl border-t border-x border-neon-cyan/30 clip-path-polygon"></div>

                    <div className="relative p-8 text-center">
                        <h2 className="font-heading text-4xl text-white uppercase tracking-widest mb-2 drop-shadow-lg">
                            {PLANETS[focusedIndex].name}
                        </h2>
                        <div className="flex justify-center gap-4 mb-4 text-xs font-ui text-neon-purple tracking-widest uppercase">
                            <span>Type: {['jupiter', 'saturn', 'uranus', 'neptune'].includes(PLANETS[focusedIndex].id) ? 'Gas Giant' : 'Terrestrial'}</span>
                            <span>•</span>
                            <span>{PLANETS[focusedIndex].difficulty} Difficulty</span>
                        </div>

                        <p className="text-text-secondary text-base mb-8 leading-relaxed font-light">
                            {PLANETS[focusedIndex].description}
                        </p>

                        {loadProgress().unlockedPlanets.includes(PLANETS[focusedIndex].id) ? (
                            <button
                                onClick={() => {
                                    if (PLANETS[focusedIndex].id === 'earth') router.push('/games/earth');
                                    else if (PLANETS[focusedIndex].id === 'neptune') router.push('/games/neptune');
                                    else alert('System ready. Launching sequence... (Game coming soon)');
                                }}
                                className="pointer-events-auto btn-neon w-full py-4 text-xl glow-cyan tracking-widest font-bold group relative overflow-hidden"
                            >
                                <span className="relative z-10">INITIATE LANDING</span>
                                <div className="absolute inset-0 bg-neon-cyan/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                            </button>
                        ) : (
                            <div className="flex flex-col gap-3 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                                <div className="text-red-400 font-heading text-xl uppercase tracking-widest flex items-center justify-center gap-3">
                                    <span className="animate-pulse">🔒</span> ACCESS DENIED
                                </div>
                                <div className="text-text-secondary text-sm font-ui">
                                    REQUIRED FUEL: <span className="text-neon-cyan font-bold">{PLANETS[focusedIndex].stardustCost.toLocaleString()} STARDUST</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
