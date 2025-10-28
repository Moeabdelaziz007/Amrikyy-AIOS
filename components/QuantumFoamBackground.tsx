import React, { useRef, useEffect } from 'react';

/**
 * The QuantumFoamBackground component renders an animated background effect
 * consisting of small, moving particles that react to mouse movement.
 * It simulates a "quantum foam" or abstract energy field.
 * @returns {JSX.Element} The QuantumFoamBackground component.
 */
const QuantumFoamBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        /**
         * Updates the mouse position relative to the canvas.
         * @param {MouseEvent} event - The mouse event.
         */
        const handleMouseMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current.x = event.clientX - rect.left;
            mouse.current.y = event.clientY - rect.top;
        };
        canvas.addEventListener('mousemove', handleMouseMove);

        /**
         * Represents a single particle in the quantum foam animation.
         */
        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number; color: string;
            /**
             * Creates a new Particle instance.
             * @param {number} x - The initial x-coordinate of the particle.
             * @param {number} y - The initial y-coordinate of the particle.
             */
            constructor(x: number, y: number) {
                this.x = x; this.y = y;
                this.size = Math.random() * 1.5 + 0.5; // Random size between 0.5 and 2
                this.speedX = (Math.random() - 0.5) * 0.5; // Random horizontal speed between -0.25 and 0.25
                this.speedY = (Math.random() - 0.5) * 0.5; // Random vertical speed between -0.25 and 0.25
                this.color = `hsla(${200 + Math.random() * 60}, 100%, 70%, 0.8)`; // Hues from blue to magenta
            }
            /**
             * Updates the particle's position and applies mouse interaction.
             */
            update() {
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1; // Bounce off horizontal edges
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1; // Bounce off vertical edges
                this.x += this.speedX; this.y += this.speedY;

                // Simple repulsion from mouse
                const dx = mouse.current.x - this.x;
                const dy = mouse.current.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) { // If within 100px of mouse
                    this.x -= dx / 20; // Move away from mouse
                    this.y -= dy / 20; // Move away from mouse
                }
            }
            /**
             * Draws the particle on the canvas.
             */
            draw() {
                if(!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let particles: Particle[] = [];
        /**
         * Initializes the array of particles, populating them randomly across the canvas.
         */
        function init() {
            particles = [];
            // Adjust number of particles based on screen size
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        }
        init();

        /**
         * The main animation loop for the particles.
         */
        const animate = () => {
            if(!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            particles.forEach(p => { p.update(); p.draw(); }); // Update and draw each particle
            animationFrameId = requestAnimationFrame(animate); // Request next frame
        };
        animate();

        /**
         * Handles window resizing, re-sizing the canvas and re-initializing particles.
         */
        const handleResize = () => {
             canvas.width = window.innerWidth;
             canvas.height = window.innerHeight;
             init(); // Re-initialize particles for new canvas size
        }
        window.addEventListener('resize', handleResize);

        // Cleanup function for the effect
        return () => {
            cancelAnimationFrame(animationFrameId); // Stop animation
            window.removeEventListener('resize', handleResize);
            if (canvas) {
                canvas.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" aria-hidden="true" />;
};
export default QuantumFoamBackground;