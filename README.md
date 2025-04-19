# Schoolie Frontend

A modern school management system frontend built with Angular and DaisyUI.

## Features

- Beautiful and responsive UI with DaisyUI components
- Secure authentication system
- Dashboard with interactive charts
- Student management
- Teacher management
- Workshop management
- API integration ready

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v17 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sirapope-schoolie-frontend.git
cd sirapope-schoolie-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── sidebar/
│   │   ├── home/
│   │   ├── workshop/
│   │   ├── student/
│   │   └── teacher/
│   ├── services/
│   │   └── api.service.ts
│   ├── app.module.ts
│   ├── app-routing.module.ts
│   └── app.component.ts
├── assets/
└── environments/
```

## API Integration

The application is configured to work with a RESTful API. Update the `apiUrl` in `src/app/services/api.service.ts` to match your backend API endpoint.

## Available Scripts

- `npm start` - Start the development server
- `npm run build` - Build the application for production
- `npm run test` - Run unit tests
- `npm run lint` - Run linting

## Technologies Used

- Angular 17
- DaisyUI
- Tailwind CSS
- Chart.js
- RxJS
- TypeScript

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 