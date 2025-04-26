import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

class Particle {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  angle: number;
  orbitRadius: number;
  orbitSpeed: number;
  baseAngle: number;
  color: string;

  constructor(color: string) {
    this.color = color;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    this.baseAngle = Math.random() * Math.PI * 2;
    this.angle = this.baseAngle;
    this.orbitRadius = Math.random() * 100 + 200;
    this.orbitSpeed = (Math.random() * 0.0002 + 0.0001) * (Math.random() < 0.5 ? 1 : -1);
    
    this.x = centerX + Math.cos(this.angle) * this.orbitRadius;
    this.y = centerY + Math.sin(this.angle) * this.orbitRadius;
    
    this.radius = Math.random() * 2 + 1;
    this.dx = Math.cos(this.angle) * 0.1;
    this.dy = Math.sin(this.angle) * 0.1;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  update(ctx: CanvasRenderingContext2D, globalAngle: number, mouse: { x: number | null, y: number | null }) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // อัพเดทมุมการหมุนส่วนตัว
    this.angle = this.baseAngle + globalAngle;

    // คำนวณตำแหน่งเป้าหมายบนวงโคจร
    const targetX = centerX + Math.cos(this.angle) * this.orbitRadius;
    const targetY = centerY + Math.sin(this.angle) * this.orbitRadius;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    
    // เพิ่มความเร็วในการตอบสนองเมื่อห่างจากตำแหน่งเป้าหมายมาก
    const dist = Math.sqrt(dx * dx + dy * dy);
    const response = Math.min(0.2, dist / 500); // เพิ่มความเร็วในการตอบสนอง

    this.dx += dx * response;
    this.dy += dy * response;

    const maxSpeed = dist > 100 ? 8 : 1.2; // เพิ่มความเร็วสูงสุด
    const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    if (speed > maxSpeed) {
      this.dx = (this.dx / speed) * maxSpeed;
      this.dy = (this.dy / speed) * maxSpeed;
    }

    this.x += this.dx;
    this.y += this.dy;

    // ปรับ friction ตามระยะห่าง
    const friction = dist > 100 ? 0.92 : 0.96; // ลด friction เพื่อให้เคลื่อนที่เร็วขึ้น
    this.dx *= friction;
    this.dy *= friction;

    // Mouse interaction
    if (mouse.x !== null && mouse.y !== null) {
      const mdx = mouse.x - this.x;
      const mdy = mouse.y - this.y;
      const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);

      if (mouseDist < 100) {
        this.dx -= mdx * 0.01;
        this.dy -= mdy * 0.01;
      }
    }

    this.draw(ctx);
  }

  // เพิ่ม method สำหรับปรับตำแหน่งเมื่อหน้าจอถูก resize
  adjustPosition(oldWidth: number, oldHeight: number) {
    const scaleX = window.innerWidth / oldWidth;
    const scaleY = window.innerHeight / oldHeight;
    
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // คำนวณตำแหน่งใหม่ทันที
    this.x = centerX + Math.cos(this.angle) * this.orbitRadius;
    this.y = centerY + Math.sin(this.angle) * this.orbitRadius;
  }
}

@Component({
  selector: 'app-particles',
  templateUrl: './particles.component.html',
  styleUrls: ['./particles.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ParticlesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() color: string = "var(--primary-color)"; // ใช้ CSS variable
  @Input() particleCount: number = 100;
  @Input() connectionDistance: number = 100;
  
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  private particles: Particle[] = [];
  private globalAngle: number = 0;
  private mouse = { x: null as number | null, y: null as number | null };
  private oldWidth: number = window.innerWidth;
  private oldHeight: number = window.innerHeight;

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    const updateCanvasSize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      // ปรับตำแหน่งของทุก particle ก่อนเปลี่ยนขนาด canvas
      this.particles.forEach(particle => {
        particle.adjustPosition(this.oldWidth, this.oldHeight);
      });

      canvas.width = newWidth;
      canvas.height = newHeight;

      this.oldWidth = newWidth;
      this.oldHeight = newHeight;
    };
    updateCanvasSize();

    window.addEventListener('resize', updateCanvasSize);
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  private connectLines() {
    this.ctx.lineWidth = 0.3;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(152, 209, 197, ${1 - dist / this.connectionDistance})`;
          this.ctx.stroke();
        }
      }
    }
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    this.globalAngle += 0.0005;
    
    this.particles.forEach(particle => {
      particle.update(this.ctx, this.globalAngle, this.mouse);
    });
    
    this.connectLines();
  }

  ngAfterViewInit() {
    this.initCanvas();
    this.particles = Array.from({ length: this.particleCount }, () => new Particle(this.color));
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', () => {});
    window.removeEventListener('mousemove', () => {});
  }
} 