# Amrikyy AI OS - Quick Start Guide for Developers

**Created by: Mohamed Hossameldin Abdelaziz**

This is a quick reference guide to get you up and running with Amrikyy AI OS development.

---

## ⚡ Quick Setup (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Moeabdelaziz007/Amrikyy-AIOS.git
cd Amrikyy-AIOS

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your Google Gemini API key

# 4. Start development server
npm run dev

# 5. Open browser to http://localhost:5173
```

---

## 🔑 Getting Your API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Paste in `.env.local` as `VITE_API_KEY=your_key_here`

---

## 📁 Project Structure Quick Reference

```
Amrikyy-AIOS/
├── components/
│   ├── apps/           # 50+ application components
│   ├── widgets/        # Dashboard widgets
│   ├── Dock.tsx        # Bottom dock
│   └── Window.tsx      # Window manager
├── contexts/           # React Context providers
├── data/              # Static data (agents, skills, etc.)
├── services/          # API integrations (Gemini, etc.)
├── utils/             # Utility functions
├── App.tsx            # Main application
├── types.ts           # TypeScript definitions
└── i18n.ts            # Internationalization
```

---

## 🎨 Creating a New App

1. **Create the component file**:
   ```bash
   # Create file: components/apps/MyNewApp.tsx
   ```

2. **Use this template**:
   ```typescript
   import React from 'react';
   
   const MyNewApp: React.FC = () => {
     return (
       <div className="h-full w-full flex flex-col bg-bg-tertiary text-text-primary p-6 overflow-y-auto">
         <h1 className="text-2xl font-bold mb-4">My New App</h1>
         {/* Your content here */}
       </div>
     );
   };
   
   export default MyNewApp;
   ```

3. **Register in types.ts**:
   ```typescript
   export enum AppID {
     // ... existing apps
     myNewApp = 'myNewApp',
   }
   ```

4. **Add to App.tsx**:
   ```typescript
   const appComponents: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
     // ... existing apps
     [AppID.myNewApp]: lazy(() => import('./components/apps/MyNewApp.tsx')),
   };
   ```

5. **Add to i18n.ts**:
   ```typescript
   'app_titles.myNewApp': 'My New App',
   ```

---

## 🤖 Using Gemini AI

### Generate Text

```typescript
import { generateText } from './services/geminiService';

const response = await generateText(
  'Gemini 2.0 Flash',
  'Your prompt here'
);
```

### Generate Image

```typescript
import { generateImage } from './services/geminiService';

const imageUrl = await generateImage(
  'A futuristic city at sunset',
  { aspectRatio: '16:9' }
);
```

### Multi-turn Conversation

```typescript
import { startConversation } from './services/geminiAdvancedService';

const chat = await startConversation([
  { role: 'user', parts: [{ text: 'Hello!' }] }
]);
```

---

## 🎨 Styling Guidelines

### Use Tailwind CSS Classes

```typescript
// ✅ Good
<div className="flex flex-col gap-4 p-6 bg-bg-tertiary rounded-lg">

// ❌ Avoid inline styles
<div style={{display: 'flex', padding: '24px'}}>
```

### Common Color Classes

- Background: `bg-bg-primary`, `bg-bg-secondary`, `bg-bg-tertiary`
- Text: `text-text-primary`, `text-text-secondary`
- Accents: `text-primary-purple`, `text-primary-cyan`, `text-primary-pink`
- Borders: `border-white/10`, `border-white/20`

### Spacing Scale

- `gap-1` = 4px
- `gap-2` = 8px
- `gap-4` = 16px
- `gap-6` = 24px
- `gap-8` = 32px

---

## 🧪 Testing Your Code

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Check test coverage
npm run test:coverage
```

### Writing a Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyNewApp from './MyNewApp';

describe('MyNewApp', () => {
  it('renders the app title', () => {
    render(<MyNewApp />);
    expect(screen.getByText('My New App')).toBeInTheDocument();
  });
});
```

---

## 🔍 Debugging Tips

### Check Browser Console

1. Open DevTools (F12)
2. Look for errors in Console tab
3. Check Network tab for API calls
4. Use React DevTools extension

### Common Issues

**API Key Not Working?**
- Restart dev server after changing `.env.local`
- Make sure it's `VITE_API_KEY` (not just `API_KEY`)
- Check API key is valid at Google AI Studio

**Build Errors?**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear cache: `rm -rf dist .vite`

**TypeScript Errors?**
- Make sure types are imported: `import { AppID } from './types'`
- Check for missing properties in interfaces

---

## 🚀 Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests |

---

## 📚 Key Files to Know

| File | Purpose |
|------|---------|
| `App.tsx` | Main application logic, window management |
| `types.ts` | All TypeScript interfaces and types |
| `i18n.ts` | Translations (English/Arabic) |
| `data/agents.ts` | AI agent definitions |
| `data/skills.ts` | Available AI skills |
| `services/geminiService.ts` | Gemini API integration |

---

## 🎯 Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make changes and test**
   ```bash
   npm run dev
   npm test
   npm run lint
   ```

3. **Commit with clear message**
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/my-new-feature
   ```

---

## 🤝 Getting Help

- 📖 Read the full [README.md](README.md)
- 📝 Check [KOMABI_FRONTEND_TASKS.md](KOMABI_FRONTEND_TASKS.md) for pending tasks
- 🐛 Report bugs in [GitHub Issues](https://github.com/Moeabdelaziz007/Amrikyy-AIOS/issues)
- 💬 Ask questions in [Discussions](https://github.com/Moeabdelaziz007/Amrikyy-AIOS/discussions)

---

## ⚡ Pro Tips

1. **Use Code Snippets**: Install React/TypeScript extensions in your editor
2. **Hot Reload**: Vite auto-refreshes when you save files
3. **Component Reuse**: Check existing apps before creating new components
4. **TypeScript**: Let it guide you - follow the type errors
5. **Git Commits**: Use conventional commits (feat:, fix:, docs:, etc.)

---

## 🎨 Design System Quick Reference

### Buttons

```typescript
// Primary Button
<button className="px-4 py-2 bg-primary-purple text-white rounded-lg hover:bg-purple-600 transition-colors">
  Click Me
</button>

// Secondary Button
<button className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
  Cancel
</button>
```

### Cards

```typescript
<div className="bg-bg-secondary rounded-lg border border-white/10 p-6">
  <h3 className="text-lg font-bold mb-2">Card Title</h3>
  <p className="text-text-secondary">Card content</p>
</div>
```

### Inputs

```typescript
<input 
  type="text"
  className="w-full px-4 py-2 bg-bg-tertiary border border-white/20 rounded-lg text-text-primary focus:border-primary-purple focus:outline-none"
  placeholder="Enter text..."
/>
```

---

## 🔥 Must-Know Shortcuts

- **Cmd/Ctrl + K**: Open command palette (when implemented)
- **Cmd/Ctrl + Space**: Voice assistant
- **F12**: Open DevTools
- **Cmd/Ctrl + Shift + C**: Inspect element

---

**Happy Coding! 🚀**

*Created by Mohamed Hossameldin Abdelaziz*  
*For questions: GitHub @Moeabdelaziz007*
