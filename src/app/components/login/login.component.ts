import { Component, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertService } from '../../services/alert.service';
import { CommonModule } from '@angular/common';
import { AlertComponent } from '../alert/alert.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AlertComponent]
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private animationFrameId: number = 0;
  loginForm: FormGroup;
  private apiUrl = 'http://localhost:3000';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private alertService: AlertService
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Set initial canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    // Handle window resizing
    window.addEventListener('resize', updateCanvasSize);

    const mintColor = "#1DD8B2";
    let particles: Particle[] = [];
    let mouse = { x: null as number | null, y: null as number | null };

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

      constructor() {
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
        ctx.fillStyle = mintColor;
        ctx.shadowColor = mintColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      update(ctx: CanvasRenderingContext2D, globalAngle: number) {
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
        const response = Math.min(0.1, dist / 1000); // ปรับความเร็วตามระยะห่าง

        this.dx += dx * response;
        this.dy += dy * response;

        const maxSpeed = dist > 100 ? 5 : 0.8; // เพิ่มความเร็วสูงสุดเมื่ออยู่ห่างมาก
        const speed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        if (speed > maxSpeed) {
          this.dx = (this.dx / speed) * maxSpeed;
          this.dy = (this.dy / speed) * maxSpeed;
        }

        this.x += this.dx;
        this.y += this.dy;

        // ปรับ friction ตามระยะห่าง
        const friction = dist > 100 ? 0.95 : 0.98;
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
    }

    // Connect particles with lines
    const connectLines = () => {
      this.ctx.lineWidth = 0.3; // ลดความหนาของเส้น
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(particles[i].x, particles[i].y);
            this.ctx.lineTo(particles[j].x, particles[j].y);
            this.ctx.strokeStyle = `rgba(152, 209, 197, ${1 - dist / 100})`;
            this.ctx.stroke();
          }
        }
      }
    };

    // เพิ่มตัวแปรสำหรับการหมุนรวม
    let globalRotation = 0;

    // Animation loop
    const animate = () => {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);

      // อัพเดทมุมการหมุนรวม
      globalRotation += 0.0005;

      particles.forEach(p => p.update(this.ctx, globalRotation));
      connectLines();

      this.animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize particles
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }

    // Mouse movement listener
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Start animation
    animate();

    // Handle window resizing
    window.addEventListener('resize', () => {
      const oldWidth = canvas.width;
      const oldHeight = canvas.height;
      
      updateCanvasSize();

      // ปรับตำแหน่งอนุภาคตามอัตราส่วนของหน้าจอที่เปลี่ยนไป
      const scaleX = canvas.width / oldWidth;
      const scaleY = canvas.height / oldHeight;
      
      particles.forEach(p => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // คำนวณตำแหน่งใหม่ทันที
        p.x = centerX + Math.cos(p.angle) * p.orbitRadius;
        p.y = centerY + Math.sin(p.angle) * p.orbitRadius;
      });
    });
  }

  ngAfterViewInit() {
    // Initialize canvas after view is ready
    setTimeout(() => {
      this.initCanvas();
    }, 100);
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  onLogin(): void {
    if (this.loginForm.valid) {
      const { usernameOrEmail, password, rememberMe } = this.loginForm.value;

      // ส่งแค่ Content-Type header เท่านั้น
      const headers = new HttpHeaders().set('Content-Type', 'application/json');

      this.http.post<any>(
        `${this.apiUrl}/auth/login`, 
        { usernameOrEmail, password },
        { headers }
      ).subscribe({
        next: (response) => {
          this.alertService.showAlert({
            type: 'success',
            message: 'Login successful!'
          });
          
          if (rememberMe) {
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('token', response.access_token);
          } else {
            sessionStorage.setItem('user', JSON.stringify(response.user));
            sessionStorage.setItem('token', response.access_token);
          }

           // ถ้าเป็นการ login ครั้งแรก ให้ไปหน้าเปลี่ยนรหัสผ่าน
           if (response.user.isFirstLogin) {
            this.router.navigate(['/change-password']);
          } else {
            this.router.navigate(['/dashboard']);
          }
          
        },
        error: (error) => {
          let message = 'Login failed';
          if (error.status === 401) {
            message = 'Invalid username or password';
          } else if (error.status === 404) {
            message = 'User not found';
          }
          this.alertService.showAlert({
            type: 'error',
            message
          });
        }
      });
    }
  }
}