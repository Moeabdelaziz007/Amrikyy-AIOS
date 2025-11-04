import React, { useRef, useEffect } from 'react';
import { WeatherCondition } from '../types.ts';

/**
 * Props for the AnimatedBackground component.
 */
interface AnimatedBackgroundProps {
    /** The current weather condition, which may influence background animations (e.g., rain). */
    weatherCondition?: WeatherCondition | null;
}

/**
 * The AnimatedBackground component renders dynamic background effects based on mouse movement and weather conditions.
 * It uses two canvas elements: one for particle animation and one for rain effects.
 * @param {AnimatedBackgroundProps} props - The component props.
 * @returns {JSX.Element} The animated background component.
 */
const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ weatherCondition }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rainCanvasRef = useRef<HTMLCanvasElement>(null); // New canvas for rain
    const mouse = useRef({ x: 0, y: 0 });

    // Base particle animation effect
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        /**
         * Resizes the canvas to match the window dimensions.
         */
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        /**
         * Updates the mouse position.
         * @param {MouseEvent} event - The mouse event.
         */
        const handleMouseMove = (event: MouseEvent) => {
            mouse.current.x = event.clientX;
            mouse.current.y = event.clientY;
        };
        window.addEventListener('mousemove', handleMouseMove);

        /**
         * Represents a single particle in the background animation.
         */
        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;

            /**
             * Creates an instance of Particle.
             */
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
            }

            /**
             * Updates the particle's position.
             */
            update() {
                if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
                if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
                this.x += this.speedX;
                this.y += this.speedY;
            }

            /**
             * Draws the particle on the canvas.
             */
            draw() {
                if(!ctx) return;
                ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let particlesArray: Particle[] = [];
        const numberOfParticles = 100;

        /**
         * Initializes the array of particles.
         */
        function init() {
            particlesArray = [];
            for (let i = 0; i < numberOfParticles; i++) {
                particlesArray.push(new Particle());
            }
        }
        init();
        
        /**
         * Draws lines connecting nearby particles.
         */
        function connect() {
            if(!ctx) return;
            let opacityValue = 1;
            for (let a = 0; a < particlesArray.length; a++) {
                for (let b = a; b < particlesArray.length; b++) {
                    const distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                                 ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

                    if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                        opacityValue = 1 - (distance / 20000);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${opacityValue})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                        ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        /**
         * The main animation loop for particles.
         */
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
                particlesArray[i].draw();
            }
            connect();
            animationFrameId = requestAnimationFrame(animate);
        };
        
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Rain effect based on weather condition
    useEffect(() => {
        const rainCanvas = rainCanvasRef.current;
        if (!rainCanvas) return;
        const rainCtx = rainCanvas.getContext('2d');
        if (!rainCtx) return;

        let rainAnimationFrameId: number;
        let rainDrops: RainDrop[] = [];

        /**
         * Resizes the rain canvas and re-initializes rain drops.
         */
        const resizeRainCanvas = () => {
            rainCanvas.width = window.innerWidth;
            rainCanvas.height = window.innerHeight;
            rainDrops = []; // Clear drops on resize
            if (weatherCondition === 'Rainy' || weatherCondition === 'Stormy') {
                for (let i = 0; i < 150; i++) { // More drops for stormy
                    rainDrops.push(new RainDrop());
                }
            }
        };

        window.addEventListener('resize', resizeRainCanvas);
        resizeRainCanvas();

        /**
         * Represents a single raindrop in the rain animation.
         */
        class RainDrop {
            x: number;
            y: number;
            length: number;
            speed: number;
            opacity: number;

            /**
             * Creates an instance of RainDrop.
             */
            constructor() {
                this.x = Math.random() * rainCanvas.width;
                this.y = Math.random() * rainCanvas.height;
                this.length = Math.random() * 20 + 10;
                this.speed = Math.random() * 5 + 3;
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            /**
             * Updates the raindrop's position, looping it when it goes off-screen.
             */
            update() {
                this.y += this.speed;
                this.x += this.speed * 0.2; // Slight diagonal for realism
                if (this.y > rainCanvas.height) {
                    this.y = -this.length;
                    this.x = Math.random() * rainCanvas.width;
                }
            }

            /**
             * Draws the raindrop on the canvas.
             */
            draw() {
                if(!rainCtx) return;
                rainCtx.strokeStyle = `rgba(100, 180, 255, ${this.opacity})`; // Bluish rain color
                rainCtx.lineWidth = 1;
                rainCtx.beginPath();
                rainCtx.moveTo(this.x, this.y);
                rainCtx.lineTo(this.x - this.length * 0.2, this.y + this.length);
                rainCtx.stroke();
            }
        }
        
        /**
         * The main animation loop for rain.
         */
        const animateRain = () => {
            rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
            if (weatherCondition === 'Rainy' || weatherCondition === 'Stormy') {
                rainDrops.forEach(drop => {
                    drop.update();
                    drop.draw();
                });
            }
            rainAnimationFrameId = requestAnimationFrame(animateRain);
        };

        animateRain();

        return () => {
            window.removeEventListener('resize', resizeRainCanvas);
            cancelAnimationFrame(rainAnimationFrameId);
        };
    }, [weatherCondition]);


    return (
        <>
            <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" aria-hidden="true" />
            {(weatherCondition === 'Rainy' || weatherCondition === 'Stormy') && (
                <canvas ref={rainCanvasRef} className="fixed top-0 left-0 w-full h-full -z-10 opacity-70" aria-hidden="true" />
            )}
        </>
    );
};

export default AnimatedBackground;