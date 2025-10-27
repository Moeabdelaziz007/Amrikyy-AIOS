import React, { useRef, useEffect } from 'react';

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

        const handleMouseMove = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current.x = event.clientX - rect.left;
            mouse.current.y = event.clientY - rect.top;
        };
        canvas.addEventListener('mousemove', handleMouseMove);

        class Particle {
            x: number; y: number; size: number; speedX: number; speedY: number; color: string;
            constructor(x: number, y: number) {
                this.x = x; this.y = y;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.color = `hsla(${200 + Math.random() * 60}, 100%, 70%, 0.8)`;
            }
            update() {
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
                this.x += this.speedX; this.y += this.speedY;

                const dx = mouse.current.x - this.x;
                const dy = mouse.current.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) {
                    this.x -= dx / 20;
                    this.y -= dy / 20;
                }
            }
            draw() {
                if(!ctx) return;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        let particles: Particle[] = [];
        function init() {
            particles = [];
            const numberOfParticles = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < numberOfParticles; i++) {
                particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
            }
        }
        init();

        const animate = () => {
            if(!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
             canvas.width = window.innerWidth;
             canvas.height = window.innerHeight;
             init();
        }
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            if (canvas) {
                canvas.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full -z-10" />;
};
export default QuantumFoamBackground;