# Triangle Loading Spinner Component

A stylish triangular loading spinner component for Angular applications.

## Features

- Fullscreen or inline display
- Customizable colors
- Global state management through a service
- Animated triangle design
- Easy to implement in any component

## Usage

### Basic Implementation

1. **Import the component in your module or standalone component:**

```typescript
import { LoadingSpinnerComponent } from './components/shared/loading-spinner/loading-spinner.component';

@Component({
  // ...
  imports: [LoadingSpinnerComponent]
})
```

2. **Add the component to your template:**

```html
<app-loading-spinner 
  [isFullscreen]="true" 
  [isVisible]="isLoading"
  [spinnerColor]="#00ffc3"
  [backdropColor]="rgba(13, 13, 13, 0.8)">
</app-loading-spinner>
```

### Using the Loading Service

The LoadingService provides global control over the loading state:

1. **Import the service:**

```typescript
import { LoadingService } from './services/loading.service';

constructor(private loadingService: LoadingService) {}
```

2. **Show/hide the spinner:**

```typescript
// Show the spinner
this.loadingService.show();

// Hide the spinner
this.loadingService.hide();
```

3. **Wrap async operations with the loading spinner:**

```typescript
// Method 1: Using the withLoading helper
const result = await this.loadingService.withLoading(
  this.dataService.fetchData()
);

// Method 2: Manual control
try {
  this.loadingService.show();
  const data = await this.someAsyncOperation();
  // Do something with data
} finally {
  this.loadingService.hide();
}
```

## Component Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| isFullscreen | boolean | false | Whether to display the spinner fullscreen |
| isVisible | boolean | true | Whether the spinner is visible |
| spinnerColor | string | #00ffc3 | Color of the spinner |
| backdropColor | string | rgba(13, 13, 13, 0.8) | Color of the backdrop |

## Examples

### Login Form

```typescript
onLogin(): void {
  if (this.loginForm.valid) {
    this.loadingService.show();
    
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.loadingService.hide();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loadingService.hide();
        this.alertService.showError('Login failed');
      }
    });
  }
}
```

### Data Loading

```typescript
ngOnInit(): void {
  this.loadingService.show();
  this.dataService.getData().subscribe({
    next: (data) => {
      this.data = data;
      this.loadingService.hide();
    },
    error: (error) => {
      this.loadingService.hide();
      console.error('Error loading data', error);
    }
  });
}
``` 