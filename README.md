# LeetCode Clone

A modern, feature-rich LeetCode clone built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Modern UI/UX**: Clean, responsive design with dark/light theme support
- **Authentication**: Secure login/register with JWT tokens
- **Problem Management**: Browse, search, and filter coding problems
- **Code Editor**: Built-in code editor with syntax highlighting
- **Real-time Submissions**: Submit and track your solutions
- **Performance Optimized**: Lazy loading, virtualization, and caching
- **Accessibility**: WCAG compliant with keyboard navigation
- **Testing**: Comprehensive test coverage with Vitest and React Testing Library

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **State Management**: TanStack Query, React Context
- **Routing**: React Router v6
- **UI Components**: shadcn/ui, Radix UI
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest, React Testing Library
- **Build Tool**: Vite
- **Code Quality**: ESLint, Prettier

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── __tests__/      # Component tests
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── contexts/           # React contexts
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── lib/                # Utility functions
├── test/               # Test utilities
└── assets/             # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd leetcode-clone
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🌐 Deployment on Vercel

### Deploy to Vercel

1. **Push your code to GitHub**:
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

4. **Set Environment Variables** (if needed):
   - In Vercel project settings → Environment Variables
   - Add any required environment variables (e.g., `VITE_API_BASE_URL`)

5. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app
   - Your app will be available at `https://your-project.vercel.app`

### Vercel Configuration

The project includes a `vercel.json` file that configures:
- Build settings for Vite
- Routing rules for SPA (Single Page Application)
- All routes redirect to `index.html` for client-side routing

### Custom Domain

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Component Structure
- **Atomic Design**: Components are organized by complexity and reusability
- **Composition over Inheritance**: Using React composition patterns
- **Memoization**: React.memo and useMemo for performance optimization

### State Management
- **Server State**: TanStack Query for API data caching and synchronization
- **Client State**: React Context for global application state
- **Form State**: React Hook Form for form management

### API Layer
- **Centralized Service**: All API calls through service layer
- **Type Safety**: Full TypeScript coverage for API responses
- **Error Handling**: Comprehensive error handling with user feedback

## 🎨 Theming

The application supports:
- Light/Dark/System themes
- CSS custom properties for consistent theming
- Tailwind CSS for utility-first styling

## ♿ Accessibility

- **WCAG 2.1 AA Compliant**
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Color Contrast**: High contrast ratios

## 🧪 Testing

### Test Structure
- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API service and hook tests
- **E2E Tests**: Critical user flow tests

### Running Tests
```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Performance Optimizations

- **Code Splitting**: Lazy loading of routes and components
- **Virtualization**: Virtual scrolling for large lists
- **Image Optimization**: Lazy loading and responsive images
- **Caching**: Intelligent caching with TanStack Query
- **Bundle Analysis**: Regular bundle size monitoring

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENABLE_PREMIUM_FEATURES=false
VITE_ENABLE_SOCIAL_LOGIN=false
```

### API Configuration

The application expects a REST API with the following endpoints:

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /problems` - List problems with pagination and filtering
- `GET /problems/:id` - Get problem details
- `POST /problems/submit` - Submit solution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Ensure accessibility compliance
- Follow the established component patterns
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [LeetCode](https://leetcode.com/) for inspiration
- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first CSS
- [React](https://reactjs.org/) for the amazing framework

## 📞 Support

For support, email support@leetcode-clone.com or create an issue on GitHub.

