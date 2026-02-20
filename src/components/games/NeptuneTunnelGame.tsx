'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { loadProgress, saveProgress } from '@/lib/localStorage';

interface GameState {
    isPlaying: boolean;
    gameOver: boolean;
    score: number;
    stardust: number;
    speed: number;
}

export default function NeptuneTunnelGame() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [gameState, setGameState] = useState<GameState>({
        isPlaying: false,
        gameOver: false,
        score: 0,
        stardust: 0,
        speed: 1.0
    });

    const stateRef = useRef(gameState);
    useEffect(() => { stateRef.current = gameState; }, [gameState]);

    // THREE Objects Refs
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const playerGroupRef = useRef<THREE.Group | null>(null);
    const bulletsRef = useRef<THREE.Mesh[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enemiesRef = useRef<any[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const particlesRef = useRef<any[]>([]);
    const tunnelRingsRef = useRef<THREE.Mesh[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Setup ---
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x000020, 0.02);
        sceneRef.current = scene;

        // CAMERA FIX: Move back to see the whole tunnel radius
        const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 20); // Further back
        camera.lookAt(0, 0, -50);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lighting
        const ambient = new THREE.AmbientLight(0x222222);
        scene.add(ambient);
        const sun = new THREE.PointLight(0xffffff, 2, 50);
        sun.position.set(0, 10, 10);
        scene.add(sun);

        // --- Player Setup ---
        const playerGroup = new THREE.Group();
        scene.add(playerGroup);
        playerGroupRef.current = playerGroup;

        // Ship Model
        // Radius reduced to 5 to fit well within FOV
        const shipGeo = new THREE.ConeGeometry(0.8, 2, 8);
        const shipMat = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            emissive: 0x0088ff,
            emissiveIntensity: 1,
            roughness: 0.2
        });
        const ship = new THREE.Mesh(shipGeo, shipMat);
        ship.position.y = -5; // Radius 5
        ship.rotation.x = Math.PI;
        playerGroup.add(ship);

        const engineLight = new THREE.PointLight(0x00ffff, 2, 10);
        engineLight.position.y = -4.5;
        playerGroup.add(engineLight);

        // --- Tunnel Visuals ---
        const ringGeo = new THREE.TorusGeometry(5, 0.2, 8, 32); // Matches player radius
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x4444ff, transparent: true, opacity: 0.3 });

        for (let i = 0; i < 20; i++) {
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.z = -i * 10;
            scene.add(ring);
            tunnelRingsRef.current.push(ring);
        }

        // --- Input (Pointer Lock) ---
        const onMouseMove = (e: MouseEvent) => {
            if (document.pointerLockElement === containerRef.current) {
                // Use movementX for infinite rotation
                if (playerGroupRef.current) {
                    // Sensitivity factor
                    playerGroupRef.current.rotation.z -= e.movementX * 0.005;
                }
            }
        };

        const onClick = () => {
            if (!stateRef.current.isPlaying && !stateRef.current.gameOver) {
                // Lock pointer on start
                containerRef.current?.requestPointerLock();
            } else if (stateRef.current.isPlaying) {
                shoot();
            }
        };

        document.addEventListener('mousemove', onMouseMove);
        if (containerRef.current) {
            containerRef.current.addEventListener('click', onClick);
        }

        // --- Mechanics ---
        const shoot = () => {
            if (!playerGroupRef.current) return;

            const bulletGeo = new THREE.SphereGeometry(0.3);
            const bulletMat = new THREE.MeshBasicMaterial({ color: 0xff00ff });
            const bullet = new THREE.Mesh(bulletGeo, bulletMat);

            // Calc world position of ship
            const shipPos = new THREE.Vector3();
            ship.getWorldPosition(shipPos);
            bullet.position.copy(shipPos);

            scene.add(bullet);
            bulletsRef.current.push(bullet);
        };

        const createExplosion = (pos: THREE.Vector3, color: number) => {
            for (let i = 0; i < 8; i++) {
                const geo = new THREE.BoxGeometry(0.3, 0.3, 0.3);
                const mat = new THREE.MeshBasicMaterial({ color: color });
                const p = new THREE.Mesh(geo, mat);
                p.position.copy(pos);
                scene.add(p);
                particlesRef.current.push({
                    mesh: p,
                    vel: new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)),
                    life: 1.0
                });
            }
        };

        const handleGameOver = () => {
            document.exitPointerLock();
            const state = stateRef.current;
            const earnedStardust = Math.floor(state.score / 10);

            // Save progress
            const progress = loadProgress();
            progress.stardust += earnedStardust;
            if (!progress.highScores['neptune'] || state.score > progress.highScores['neptune']) {
                progress.highScores['neptune'] = state.score;
            }
            saveProgress(progress);

            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('stardust-earned', {
                detail: { amount: earnedStardust }
            }));

            setGameState(prev => ({
                ...prev,
                isPlaying: false,
                gameOver: true,
                stardust: earnedStardust
            }));
        };

        // --- Game Loop ---
        let frameId: number;
        const animate = () => {
            frameId = requestAnimationFrame(animate);
            const state = stateRef.current;

            if (state.gameOver) return;

            if (state.isPlaying) {
                const speed = state.speed;

                // Move Tunnel
                tunnelRingsRef.current.forEach(r => {
                    r.position.z += speed;
                    if (r.position.z > 10) r.position.z -= 200;
                    r.rotation.z += 0.01;
                });

                // Bullets
                for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
                    const b = bulletsRef.current[i];
                    b.position.z -= 2.0;
                    if (b.position.z < -100) {
                        scene.remove(b);
                        bulletsRef.current.splice(i, 1);
                    }
                }

                // Spawning
                if (Math.random() < 0.03) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 5; // Match tunnel

                    const geo = new THREE.TetrahedronGeometry(1.2);
                    const mat = new THREE.MeshStandardMaterial({ color: 0xaaddff, roughness: 0.1 });
                    const mesh = new THREE.Mesh(geo, mat);

                    mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, -100);
                    mesh.rotation.z = angle;

                    scene.add(mesh);
                    enemiesRef.current.push({ mesh, type: 'ice', angle });
                }

                // Enemy Logic
                for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
                    const e = enemiesRef.current[i];
                    e.mesh.position.z += speed;
                    e.mesh.rotation.x += 0.1;

                    // Bullet Collision
                    let destroyed = false;
                    for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
                        const b = bulletsRef.current[j];
                        if (b.position.distanceTo(e.mesh.position) < 2.5) {
                            createExplosion(e.mesh.position, 0xaaddff);
                            scene.remove(e.mesh);
                            scene.remove(b);
                            enemiesRef.current.splice(i, 1);
                            bulletsRef.current.splice(j, 1);
                            setGameState(prev => ({ ...prev, score: prev.score + 50 }));
                            destroyed = true;
                            break;
                        }
                    }
                    if (destroyed) continue;

                    // Player Collision
                    if (e.mesh.position.z > -2 && e.mesh.position.z < 2) {
                        const shipPos = new THREE.Vector3();
                        // We need to check distance to the actual ship mesh inside rotation group
                        // But simpler: check angular difference if Z matches
                        // Or just world distance

                        // We need access to the child 'ship' mesh inside group
                        const shipObject = playerGroupRef.current?.children[0];
                        if (shipObject) {
                            shipObject.getWorldPosition(shipPos);
                            if (shipPos.distanceTo(e.mesh.position) < 2.0) {
                                handleGameOver();
                            }
                        }
                    }

                    if (e.mesh.position.z > 10) {
                        scene.remove(e.mesh);
                        enemiesRef.current.splice(i, 1);
                        setGameState(prev => ({ ...prev, score: prev.score + 10 }));
                    }
                }

                // Particles
                for (let i = particlesRef.current.length - 1; i >= 0; i--) {
                    const p = particlesRef.current[i];
                    p.mesh.position.add(p.vel);
                    p.life -= 0.05;
                    p.mesh.scale.setScalar(p.life);
                    if (p.life <= 0) {
                        scene.remove(p.mesh);
                        particlesRef.current.splice(i, 1);
                    }
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        const currentContainer = containerRef.current;
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(frameId);
            if (currentContainer && rendererRef.current) {
                currentContainer.removeChild(rendererRef.current.domElement);
            }
            renderer.dispose();
            // Unlock pointer if component unmounts
            document.exitPointerLock();
        };
    }, []);

    const startGame = () => {
        containerRef.current?.requestPointerLock();
        setGameState({
            isPlaying: true,
            gameOver: false,
            score: 0,
            stardust: 0,
            speed: 1.2
        });
        // Clear entities
        enemiesRef.current.forEach(e => sceneRef.current?.remove(e.mesh));
        enemiesRef.current = [];
        bulletsRef.current.forEach(b => sceneRef.current?.remove(b));
        bulletsRef.current = [];
        particlesRef.current.forEach(p => sceneRef.current?.remove(p.mesh));
        particlesRef.current = [];
    };

    return (
        <div className="relative w-full h-full min-h-[600px] overflow-hidden bg-black rounded-xl border border-neon-cyan/20 cursor-none group">
            <div ref={containerRef} className="absolute inset-0" />

            {/* Reticle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-neon-cyan opacity-50 pointer-events-none z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full pointer-events-none z-10" />

            <div className="absolute top-4 left-4 z-10 text-white font-ui pointer-events-none">
                <p className="text-xl">SCORE: {Math.floor(gameState.score)}</p>
                <p className="text-yellow-400">STARDUST: {gameState.stardust}</p>
            </div>

            {!gameState.isPlaying && !gameState.gameOver && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm cursor-auto">
                    <h2 className="font-heading text-5xl text-neon-cyan mb-2 glow-text">STORM SURFER</h2>
                    <p className="text-text-secondary mb-8 text-center max-w-md">
                        Click to START and LOCK MOUSE.<br />
                        Move Mouse Left/Right to Rotate.<br />
                        Click to Shoot.
                    </p>
                    <button onClick={startGame} className="btn-neon px-8 py-4 text-xl">ENGAGE SYSTEMS</button>
                </div>
            )}

            {gameState.gameOver && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur-sm cursor-auto">
                    <h2 className="font-heading text-5xl text-white mb-2">CRITICAL FAILURE</h2>
                    <button onClick={startGame} className="px-8 py-3 bg-white text-black font-bold rounded hover:scale-105 transition-transform">RETRY</button>
                    <button onClick={() => { document.exitPointerLock(); window.history.back(); }} className="mt-4 text-sm text-gray-300 hover:text-white underline">Abort Mission</button>
                </div>
            )}
        </div>
    );
}
