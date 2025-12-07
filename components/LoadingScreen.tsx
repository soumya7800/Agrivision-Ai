import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { Activity, ShieldCheck, Wifi, Globe, Hexagon } from 'lucide-react';

// --- 3D Components ---

function ParticleGlobe(props: any) {
    const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));

    useFrame((state, delta) => {
        state.camera.lookAt(0, 0, 0);
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={props.innerRef} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#10b981"
                    size={0.02} // Smaller points for "tech" feel
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

function RotatingGlobe() {
    const meshRef = React.useRef<any>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
        }
    });

    return (
        <ParticleGlobe innerRef={meshRef} />
    );
}


// --- UI Components ---

const TypewriterText = ({ text }: { text: string }) => {
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [loopNum, setLoopNum] = useState(0);
    const [typingSpeed, setTypingSpeed] = useState(150);

    useEffect(() => {
        const handleTyping = () => {
            const fullText = text;

            setDisplayText(current => {
                if (isDeleting) {
                    return fullText.substring(0, current.length - 1);
                } else {
                    return fullText.substring(0, current.length + 1); // Fixed infinite loop logic
                }
            });

            setTypingSpeed(isDeleting ? 50 : 150);

            // Animation logic
            if (!isDeleting && displayText === fullText) {
                setTimeout(() => setIsDeleting(true), 2000); // Pause at end of text
            } else if (isDeleting && displayText === '') {
                setIsDeleting(false);
                setLoopNum(loopNum + 1);
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [displayText, isDeleting, loopNum, typingSpeed, text]); // Added display text to deps to ensure re-render loop

    // Fix for the loop: dependency on displayText is tricky in useEffect with timeouts.
    // Better approach for stable typing loop:

    useEffect(() => {
        let timeout: any;

        if (isDeleting) {
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(prev => prev.slice(0, -1));
                }, 50);
            } else {
                setIsDeleting(false);
                setLoopNum(prev => prev + 1);
            }
        } else {
            if (displayText.length < text.length) {
                timeout = setTimeout(() => {
                    setDisplayText(prev => text.slice(0, prev.length + 1));
                }, 150);
            } else {
                timeout = setTimeout(() => {
                    setIsDeleting(true);
                }, 2000);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, text]); // simplified deps


    return (
        <span className="font-mono text-agri-green text-sm sm:text-base tracking-widest uppercase">
            {displayText}
            <span className="animate-pulse">_</span>
        </span>
    );
};

const HUDItem = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
    <div className="flex items-center gap-3 bg-agri-green/5 border border-agri-green/20 p-2 rounded-sm backdrop-blur-sm">
        <Icon className="w-4 h-4 text-agri-green animate-pulse" />
        <div className="flex flex-col">
            <span className="text-[10px] text-agri-green/60 uppercase tracking-widest leading-none mb-1">{label}</span>
            <span className="text-xs text-white font-mono">{value}</span>
        </div>
    </div>
)

export const LoadingScreen = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 40); // 4 seconds total roughly
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-50 bg-agri-dark flex flex-col items-center justify-center overflow-hidden"
        >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-agri-dark via-transparent to-agri-dark pointer-events-none" />

            {/* 3D Scene */}
            <div className="absolute inset-0 opacity-40">
                <Canvas camera={{ position: [0, 0, 4] }}>
                    <RotatingGlobe />
                </Canvas>
            </div>

            {/* Central HUD */}
            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md p-6">

                {/* Logo/Icon */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="absolute inset-0 bg-agri-green/20 blur-xl rounded-full animate-pulse" />
                    <Hexagon className="w-16 h-16 text-agri-green stroke-1 animate-spin-slow" />
                    <Globe className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </motion.div>

                {/* Typewriter Text - The Main Feature */}
                <div className="h-6 flex items-center justify-center">
                    <TypewriterText text="PLANETARY INTELLIGENCE" />
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-agri-green/10 rounded-full overflow-hidden relative">
                    <motion.div
                        className="h-full bg-agri-green shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between w-full text-[10px] uppercase tracking-widest text-agri-green/60 font-mono">
                    <span>System Initialization</span>
                    <span>{progress}%</span>
                </div>

            </div>

            {/* Floating HUD Elements */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute top-10 left-10 hidden md:flex flex-col gap-2"
            >
                <HUDItem label="Net Status" value="Online" icon={Wifi} />
                <HUDItem label="Security" value="Encrypted" icon={ShieldCheck} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-10 right-10 hidden md:flex flex-col gap-2"
            >
                <HUDItem label="Modules" value="3/3 Active" icon={Activity} />
                <div className="text-[10px] text-agri-green/40 font-mono text-right mt-2">
                    LAT: 45.4215 N<br />
                    LNG: 75.6972 W
                </div>
            </motion.div>

            {/* Scan lines overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%] opacity-20" />

        </motion.div>
    );
};
