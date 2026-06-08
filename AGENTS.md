# IChing64 - AI Coding Agent Guide

## Project Overview

IChing64 (易经六十四卦学习平台) is a React-based web application for learning the 64 hexagrams of I Ching (Book of Changes), a classic Chinese text. The application provides comprehensive data for all 64 hexagrams including their texts, interpretations, line statements, and relationships.

**Live URL**: https://www.iching64.fun/

**Version**: 2.0.0 (Updated: 2026-03-17)

## Technology Stack

| Category | Technology |
|----------|------------|
| Frontend Framework | React 19 + TypeScript 5.9 |
| Build Tool | Vite 7.2.4 |
| Styling | Tailwind CSS 3.4.19 |
| UI Components | shadcn/ui (new-york style) |
| Routing | React Router 7 |
| Icons | Lucide React |
| State Management | React Hooks (useState, useEffect) |
| Form Validation | Zod + React Hook Form |
| Theme Management | next-themes |

## Project Structure

```
src/
├── components/           # React components
│   ├── FeedbackButton.tsx    # Feedback submission button
│   ├── GuaCard.tsx          # Hexagram card component with animations
│   ├── GuaDetail.tsx        # Hexagram detail page
│   ├── MarkdownRenderer.tsx # Markdown content renderer (for AI responses)
│   ├── ThemeToggle.tsx      # Light/dark theme toggle
│   └── ui/                  # shadcn/ui component library (50+ components)
├── data/
│   └── guaxiang.ts      # Complete 64 hexagrams data + types + helper functions
├── hooks/               # Custom React hooks
│   ├── useTheme.ts      # Theme management (light/dark)
│   ├── useScrollPosition.ts  # Scroll position persistence
│   ├── use-mobile.ts    # Mobile device detection
│   └── useVisitCounter.ts    # Visit counting
├── lib/
│   ├── ai-divination-api.ts  # AI divination API client
│   ├── feedback-api.ts       # Feedback API client
│   └── utils.ts              # Utility functions (cn helper)
├── pages/
│   ├── Divination.tsx         # Number divination page (数字起卦)
│   ├── FeedbackAdmin.tsx      # Feedback management admin page
│   ├── GuaList.tsx            # Hexagram grid/list page (六十四卦)
│   ├── GuaTransformer.tsx     # Interactive hexagram transformation (变卦推演)
│   └── QuestionDivination.tsx # Question-based divination (问事解卦) - NEW!
├── App.tsx              # Main app component with routing
├── App.css              # App-specific styles
├── index.css            # Global styles + theme variables
└── main.tsx             # Application entry point

Server (Backend):
server/
├── api.cjs              # Express API server entry point
├── divination-ai.cjs    # OpenAI integration for AI divination
└── feedback-store.cjs   # Feedback storage handler

Configuration files:
├── .env.example         # Environment variables template
├── vite.config.ts       # Vite configuration with plugins + API proxy
├── tailwind.config.js   # Tailwind CSS theme configuration
├── tsconfig.app.json    # TypeScript app configuration
├── eslint.config.js     # ESLint configuration
├── components.json      # shadcn/ui configuration
└── package.json         # Dependencies and scripts
```

## Build and Development Commands

```bash
# Install dependencies
npm install

# Start development server with backend (http://localhost:5173 + API on :3001)
npm run dev

# Start only frontend dev server
npm run dev:client

# Start only backend API server
npm run server

# Build for production (outputs to dist/)
npm run build

# Preview production build locally
npm run preview

# Run ESLint
npm run lint
```

### Development Server Details
- **Frontend**: Vite dev server on `http://localhost:5173`
- **Backend API**: Express server on `http://localhost:3001`
- **API Proxy**: Vite proxies `/api/*` requests to backend during development
- **Concurrently**: `npm run dev` starts both servers simultaneously

## Key Data Structures

### Hexagram (Gua) Interface

```typescript
interface Gua {
  id: number;                    // Hexagram number (1-64)
  name: string;                  // Full name (e.g., "乾为天")
  chineseName: string;           // Chinese character name
  pronunciation: string;         // Pinyin pronunciation
  guaci: string;                 // Hexagram statement
  tuanZhuan: string;             // Tuan Commentary
  daXiangZhuan: string;          // Great Image Commentary
  yaos: Yao[];                   // Six line statements
  shangGua: string;              // Upper trigram
  xiaGua: string;                // Lower trigram
  duiGua: number;                // Opposite hexagram ID
  zongGua: number;               // Reverse hexagram ID
  huGua: number;                 // Nuclear hexagram ID
  guaBian: number[];             // Related changing hexagrams
  shiWei: { zhong: boolean; description: string };  // Position analysis
  symbol: string;                // Unicode symbols
  meaning: string;               // Meaning description
  wuxing: string;                // Five elements attribute
}

interface Yao {
  position: number;              // Line position (1-6)
  yinYang: 'yin' | 'yang';       // Yin or Yang line
  text: string;                  // Line statement
  xiangZhuan?: string;           // Small Image Commentary
}
```

### Eight Trigrams (八卦)

```typescript
const baGua: Record<string, {
  name: string;      // Trigram name
  symbol: string;    // Unicode symbol
  nature: string;    // Natural phenomenon
  wuxing: string;    // Five elements
  position: string;  // Direction
}>
```

## Theme System

The application supports two themes:

### Light Mode (Amber Theme)
- Background: Gradient warm tones (amber-50, orange-50, yellow-50)
- Header: Amber gradient (amber-900 via red-900 to amber-900)
- Text: Amber-900 for primary, amber-700 for secondary
- Accent: Amber-500/amber-600

### Dark Mode (墨黑金韵 - Ink Black Gold)
- Background: Ink black (#0a0a0a)
- Card: Dark gray-black (#171717)
- Accent: Gold (#d4af37)
- Text: Off-white with gold highlights
- Borders: Gold shimmer effect

### Five Elements Colors
- 金 (Metal): #FFD700 (Gold)
- 木 (Wood): #228B22 (Forest Green)
- 水 (Water): #1E90FF (Dodger Blue)
- 火 (Fire): #FF4500 (Orange Red)
- 土 (Earth): #8B4513 (Saddle Brown)

### Theme Implementation

Theme is managed via `useTheme` hook in `src/hooks/useTheme.ts`:
- Persists to localStorage (key: `iching64-theme`)
- Detects system preference on first visit
- Applies `dark` class to document.documentElement

## Styling Conventions

### Tailwind CSS Usage

1. **Class Ordering**: Follow logical grouping
   - Layout (position, display, flex/grid)
   - Spacing (margin, padding)
   - Sizing (width, height)
   - Typography (font, text)
   - Colors (bg, text, border)
   - Effects (shadow, opacity)
   - Transitions

2. **Dark Mode**: Use `dark:` prefix for dark mode styles
   ```tsx
   className="bg-white dark:bg-neutral-800 text-amber-900 dark:text-yellow-100"
   ```

3. **Custom CSS Variables**: Defined in `src/index.css`
   - Standard shadcn/ui variables (--background, --foreground, etc.)
   - Custom IChing variables (--iching-bg, --iching-accent, etc.)

### Animation Classes

- `.card-stagger` - Staggered card animation
- `.ripple` - Click ripple effect
- `.yao-animate` - Line drawing animation
- `.detail-animate-in` - Detail page slide-up fade
- `.theme-toggle-icon` - Theme toggle rotation

## Routing

Uses `HashRouter` from react-router-dom:
- `/` - Question-based divination (问事解卦) - **NEW DEFAULT PAGE**
- `/hexagrams` - Hexagram grid/list page (六十四卦)
- `/divination` - Number divination page (数字起卦)
- `/question` - Question-based divination (same as `/`)
- `/transformer` - Interactive hexagram transformation (变卦推演)
- `/admin/feedback` - Feedback management admin page

## Key Features Implementation

### 1. Hexagram Grid Display
- Responsive grid: 2 cols (mobile) → 8 cols (desktop)
- Staggered entrance animation (20ms delay per card)
- Hover effects with scale and shadow
- Click ripple effect

### 2. Search Functionality
- Searches by: name, chineseName, pronunciation
- Real-time filtering as user types
- Case-insensitive for pinyin

### 3. Number Divination (数字起卦)
- Input: 3 three-digit numbers
- Calculation:
  - First number % 8 → Lower trigram (下卦)
  - Second number % 8 → Upper trigram (上卦)
  - Third number % 6 → Moving line (动爻)
- Displays calculation process and results
- Highlights moving line in result

### 4. Scroll Position Memory
- Implemented in `useScrollPosition` hook
- Saves scroll position before navigation
- Restores position when returning
- Uses unique keys for different views

### 5. Traditional Patterns
- Cloud pattern background (祥云纹样)
- Diamond pattern overlay
- Animated floating effect (60s loop)
- Different opacity for light/dark modes

### 6. Question-based Divination (问事解卦) - **NEW FEATURE**
- 8 predefined question scenarios (career, relationship, health, wealth, study, travel, legal, lost items)
- Three-step process: Select scenario → Number divination → Interpretation
- Comprehensive analysis including:
  - **Ti-Yong Relationship (体用关系)**: Body vs. Function hexagram analysis
  - **Wu Xing (Five Elements)**: Mutual generation and restriction analysis with 5 levels (great/good/neutral/bad/terrible)
  - **Nuclear Hexagram (互卦)**: Development process analysis
  - **Transformed Hexagram (变卦)**: Final outcome analysis
  - **Response Period (应期)**: Timing prediction based on hexagram relationships
  - **Scene-specific Interpretation**: Tailored advice for each question scenario
  - **Hexagram Symbolism (卦象直读)**: Direct symbolic interpretation using Plum Blossom Numerology
- AI-powered interpretation with OpenAI integration (optional)
- Multi-turn chat dialogue for follow-up questions
- Mobile-responsive design with step indicators

### 7. Interactive Hexagram Transformation (变卦推演)
- Click any line (yao) to toggle between Yin and Yang
- Real-time hexagram identification as lines change
- Visual display of upper and lower trigrams
- Displays complete hexagram details on transformation
- Random hexagram generation
- One-click reset to Qian hexagram (☰☰)
- Smooth animations for line changes
- Hexagram detail navigation

### 8. AI Divination System (AI 解卦)
- OpenAI GPT-4 integration for intelligent interpretation
- Structured prompt engineering for consistent results
- Context-aware responses based on:
  - Selected question scenario
  - User's specific question
  - Complete hexagram data (main, nuclear, transformed)
  - Ti-Yong and Wu Xing relationships
  - Current timing (month/season)
- Multi-turn conversational follow-up
- Markdown rendering for formatted AI responses
- Graceful degradation when API is unavailable
- Health check endpoint for service status

### 9. Feedback System
- User feedback submission
- Admin panel for feedback management
- Persistent storage in JSON format
- RESTful API for feedback operations

## Development Guidelines

### Code Style

1. **TypeScript**: Strict mode enabled
   - No unused locals/parameters
   - Explicit return types preferred
   - Interface definitions for data structures

2. **Imports**: Use path aliases
   ```typescript
   import { Button } from '@/components/ui/button';
   import { useTheme } from '@/hooks/useTheme';
   ```

3. **Components**: Functional components with explicit props interfaces
   ```typescript
   interface ComponentProps {
     prop1: string;
     prop2?: number;
   }
   
   export default function Component({ prop1, prop2 }: ComponentProps) {
     // Implementation
   }
   ```

4. **Hooks**: Custom hooks in `src/hooks/`
   - Prefix with `use`
   - Include JSDoc comments
   - Handle cleanup in useEffect

### shadcn/ui Components

Components are located in `src/components/ui/`. To add new components:
```bash
npx shadcn add <component-name>
```

Available components: accordion, alert, avatar, badge, button, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle, tooltip

### File Naming
- Components: PascalCase (e.g., `GuaCard.tsx`)
- Hooks: camelCase with use prefix (e.g., `useTheme.ts`)
- Utils: camelCase (e.g., `utils.ts`)
- Styles: kebab-case (e.g., `index.css`)

## Testing Strategy

Currently, the project does not have automated tests set up. For testing:

1. **Manual Testing Checklist**:
   - Hexagram grid displays all 64 cards
   - Search filters correctly
   - Card click shows detail view
   - Theme toggle works and persists
   - Divination calculation is accurate
   - Mobile responsive layout
   - Scroll position memory works

2. **Browser Support**:
   - Chrome / Edge (recommended)
   - Firefox
   - Safari
   - Mobile browsers

## Deployment

### Build Output
- Static files generated in `dist/` directory
- Configured for deployment to `https://www.iching64.fun/`
- Base URL set to `/` in vite.config.ts

### Server Configuration
- Development server runs on `0.0.0.0:5173`
- Allowed hosts: `.iching64.fun`, `localhost`, `127.0.0.1`
- CORS enabled for API endpoints

### Vite Plugins (Development Only)
- `kimi-plugin-inspect-react` - React component inspection
- `visitCounterPlugin` - Visit counting middleware

## Dependencies to Note

### Production Dependencies
- `@radix-ui/*` - Headless UI primitives (40+ packages)
- `class-variance-authority` - Component variant management
- `tailwind-merge` + `clsx` - Class name utilities
- `lucide-react` - Icon library
- `react-router-dom` - Client-side routing
- `react-markdown` + `remark-gfm` - Markdown rendering for AI responses
- `zod` - Schema validation
- `recharts` - Charting library (if needed)

### Development Dependencies
- `typescript-eslint` - TypeScript linting
- `eslint-plugin-react-hooks` - Hooks rules
- `eslint-plugin-react-refresh` - Fast refresh support
- `tailwindcss-animate` - Animation utilities
- `concurrently` - Run multiple commands concurrently
- `cors` - CORS middleware for Express
- `dotenv` - Environment variable management
- `express` - Backend API server
- `openai` - OpenAI API client

## Security Considerations

1. **XSS Prevention**: React's built-in escaping for JSX
2. **No Sensitive Data**: Application is client-side only
3. **localStorage**: Only stores theme preference
4. **External Links**: All internal (HashRouter)

## Performance Notes

1. **Code Splitting**: Implemented by Vite automatically
2. **Lazy Loading**: Not currently implemented but recommended for future features
3. **Animation Performance**: Use CSS transforms and opacity
4. **Image Optimization**: No external images (SVG patterns only)

## Common Tasks

### Adding a New Hexagram Field

1. Update `Gua` interface in `src/data/guaxiang.ts`
2. Add data to all 64 hexagram objects
3. Update components that display the field
4. Update type exports if needed

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link in header
4. Update scroll position keys if needed

### Adding a New shadcn/ui Component

1. Run `npx shadcn add <component>`
2. Import from `@/components/ui/<component>`
3. Use in your components

### Modifying Theme Colors

1. Update CSS variables in `src/index.css` (both :root and .dark)
2. Update Tailwind config if adding new color tokens
3. Update component classNames accordingly

## Troubleshooting

### Common Issues

1. **Theme not persisting**: Check localStorage access and `THEME_STORAGE_KEY`
2. **Animations not working**: Check CSS animation classes and browser support
3. **Search not filtering**: Verify data structure matches search logic
4. **Build errors**: Check TypeScript strict mode violations

### Debug Features

- Visit counter endpoint: `/api/visit-count` (dev only)
- Vite plugin inspect: Available in dev mode

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Router Documentation](https://reactrouter.com/)
- [I Ching Reference](https://www.iching64.fun/)

---

*Last Updated: 2026-03-17*
*Project Language: Chinese (Simplified)*
*Main Documentation: README.md*
