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
    const maxDistance = 150;
    let mouse = { x: null as number | null, y: null as number | null };

    class Particle {
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;

      constructor() {
        const maxW = window.innerWidth * 0.9;
        const maxH = window.innerHeight * 0.9;
        this.x = Math.random() * maxW;
        this.y = Math.random() * maxH;
        this.radius = Math.random() * 4 + 2;
        this.dx = (Math.random() - 0.5) * 1;
        this.dy = (Math.random() - 0.5) * 1;
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

      update(ctx: CanvasRenderingContext2D) {
        this.x += this.dx;
        this.y += this.dy;

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) {
          this.dx *= -1;
          this.x = Math.max(0, Math.min(this.x, canvas.width));
        }
        if (this.y < 0 || this.y > canvas.height) {
          this.dy *= -1;
          this.y = Math.max(0, Math.min(this.y, canvas.height));
        }

        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            this.x += dx * 0.01;
            this.y += dy * 0.01;
          }
        }

        this.draw(ctx);
      }
    }

    // Connect particles with lines
    const connectLines = () => {
      this.ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            this.ctx.beginPath();
            this.ctx.moveTo(particles[i].x, particles[i].y);
            this.ctx.lineTo(particles[j].x, particles[j].y);
            this.ctx.strokeStyle = `rgba(152, 209, 197, ${1 - dist / maxDistance})`;
            this.ctx.stroke();
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      this.ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => p.update(this.ctx));
      connectLines();

      this.animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize particles
    for (let i = 0; i < 70; i++) {
      particles.push(new Particle());
    }

    // Mouse movement listener
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    // Start animation
    animate();
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