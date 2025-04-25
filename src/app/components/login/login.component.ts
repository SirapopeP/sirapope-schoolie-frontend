import { Component } from '@angular/core';
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
export class LoginComponent {
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

  ngAfterViewInit(): void {
    const canvasEl = document.getElementById('canvas') as HTMLCanvasElement; // Cast as HTMLCanvasElement
    if (canvasEl) {
      const canvas = canvasEl;
      const ctx = canvas.getContext('2d');
      if (!ctx) return; // Make sure ctx is not null

      const mintColor = "#1DD8B2";
      ctx.fillStyle = mintColor;

      let prevWidth = window.innerWidth;
      let prevHeight = window.innerHeight;

      // Handle window resizing
      window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        // Update particle positions when the window is resized
        particles.forEach(p => {
          p.x = (p.x / prevWidth) * newWidth;
          p.y = (p.y / prevHeight) * newHeight;
        });

        // Update canvas size
        canvas.width = newWidth;
        canvas.height = newHeight;

        prevWidth = newWidth;
        prevHeight = newHeight;
      });

      let particles: Particle[] = []; // Declare particles array
      let mouse = { x: null as number | null, y: null as number | null }; // Mouse position

      class Particle {
        x: number;
        y: number;
        radius: number;
        dx: number;
        dy: number;
        isAnchor: boolean;

        constructor(isAnchor = false) {
          this.isAnchor = isAnchor;
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;

          if (isAnchor) {
            // จุดแม่อยู่ตรงกลางและมองไม่เห็น
            this.x = centerX;
            this.y = centerY;
            this.radius = 0;
            this.dx = 0;
            this.dy = 0;
          } else {
            // กระจายอนุภาครอบจุดกลาง
            const angle = Math.random() * Math.PI * 2;
            const minDistance = 80; // เพิ่มระยะขั้นต่ำ
            const maxDistance = 350; // เพิ่มระยะการกระจายตัว
            const distance = minDistance + Math.random() * (maxDistance - minDistance);
            
            this.x = centerX + Math.cos(angle) * distance;
            this.y = centerY + Math.sin(angle) * distance;
            
            // เพิ่มขนาดอนุภาค
            this.radius = Math.random() * 2.5 + 1;
            
            this.dx = (Math.random() - 0.5) * 0.8;
            this.dy = (Math.random() - 0.5) * 0.8;
          }
        }

        draw() {
          if (!this.isAnchor) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = mintColor;
            ctx.shadowColor = mintColor;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        update() {
          if (!this.isAnchor) {
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const dx = this.x - centerX;
            const dy = this.y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // ลดแรงดึงให้อ่อนลง
            if (dist > 250) {
              this.dx -= dx * 0.0008;
              this.dy -= dy * 0.0008;
            }

            // ลดความเร็วการหมุนลง
            const rotationSpeed = 0.00004;
            const rotationForceX = -dy * rotationSpeed;
            const rotationForceY = dx * rotationSpeed;
            this.dx += rotationForceX;
            this.dy += rotationForceY;

            // จำกัดความเร็วสูงสุด
            const maxSpeed = 0.15;
            const currentSpeed = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
            if (currentSpeed > maxSpeed) {
              this.dx = (this.dx / currentSpeed) * maxSpeed;
              this.dy = (this.dy / currentSpeed) * maxSpeed;
            }

            this.x += this.dx;
            this.y += this.dy;

            // ชนขอบให้สะท้อนกลับ
            if (this.x < 0 || this.x > canvas.width) {
              this.dx *= -1;
            }
            if (this.y < 0 || this.y > canvas.height) {
              this.dy *= -1;
            }
          }

          this.draw();
        }
      }

      // สร้างจุดแม่ตรงกลาง
      particles.push(new Particle(true));

      // สร้างอนุภาคจำนวนมาก
      for (let i = 0; i < 180; i++) {
        particles.push(new Particle(false));
      }

      // ปรับระยะการเชื่อมเส้น
      const maxDistance = 150;

      // Connect particles with lines
      function connectLines() {
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDistance) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(152, 209, 197, ${1 - dist / maxDistance})`;
              ctx.stroke();
            }
          }
        }
      }

      // Particle repulsion logic
      function handleRepulsion() {
        for (let i = 0; i < particles.length; i++) {
          const thisParticle = particles[i];
          for (let j = 0; j < particles.length; j++) {
            if (i === j) continue;

            const other = particles[j];
            const dx = thisParticle.x - other.x;
            const dy = thisParticle.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < thisParticle.radius + other.radius + 10) {
              // Simple repulsion force
              const force = 1 / dist;
              thisParticle.x += dx * force * 0.05;
              thisParticle.y += dy * force * 0.05;
            }
          }
        }
      }

      // Animation loop
      function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => p.update());
        connectLines();
        handleRepulsion();

        requestAnimationFrame(animate);
      }

      animate();

      // Listen for mouse movement
      window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });
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