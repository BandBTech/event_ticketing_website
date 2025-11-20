# Sharing UI Between Projects - Implementation Guide

## Current Setup Analysis

Your project currently has two UI component locations:
1. **Main UI Components**: `/src/components/ui/`
2. **Shared UI Components**: `/src/event_shared_ui/`

The shared UI folder already contains duplicated components, utilities, and language files, suggesting you're preparing for cross-project sharing.

## Recommended Approaches for Sharing UI

### 1. **NPM Package Approach (Recommended)**
Create a private NPM package for your shared components that can be installed across projects.

#### Setup Steps:

##### Step 1: Create a Separate Package
```bash
# Create a new directory for your shared UI package
mkdir ../event-shared-ui
cd ../event-shared-ui

# Initialize as an NPM package
npm init -y

# Install necessary dependencies
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-slot
```

##### Step 2: Package Structure
```
event-shared-ui/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts              # Main export file
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── useTranslation.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── tokenManager.ts
│   └── styles/
│       └── globals.css
└── dist/                      # Built output
```

##### Step 3: Configure package.json
```json
{
  "name": "@your-org/event-shared-ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --external react",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch --external react",
    "lint": "eslint src",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "@radix-ui/react-slot": "^1.2.3",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

##### Step 4: Create Export Index
```typescript
// src/index.ts
export { Button, buttonVariants } from './components/Button';
export { Input } from './components/Input';
export { Card } from './components/Card';
// ... export all components

export { cn } from './utils/cn';
export { tokenManager } from './utils/tokenManager';
// ... export all utilities
```

##### Step 5: Publish to Private Registry
```bash
# Option A: Using NPM private packages
npm publish --access restricted

# Option B: Using GitHub Packages
# Add to package.json:
"publishConfig": {
  "registry": "https://npm.pkg.github.com/@your-org"
}

# Option C: Using local file system (for testing)
# In your main project:
npm install ../event-shared-ui
```

##### Step 6: Use in Your Projects
```bash
# Install in your projects
npm install @your-org/event-shared-ui

# Or if using local development
npm link ../event-shared-ui
```

```typescript
// In your components
import { Button, Input, cn } from '@your-org/event-shared-ui';
```

---

### 2. **Monorepo with Workspaces**
Use PNPM workspaces (already configured in your project) to manage multiple projects.

#### Setup Steps:

##### Step 1: Create workspace configuration
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

##### Step 2: Restructure your project
```
your-monorepo/
├── pnpm-workspace.yaml
├── package.json
├── apps/
│   ├── event-ticketing-website/
│   │   └── (current project files)
│   └── another-app/
│       └── (another project)
└── packages/
    └── shared-ui/
        ├── package.json
        ├── src/
        └── tsconfig.json
```

##### Step 3: Configure shared-ui package.json
```json
{
  "name": "@workspace/shared-ui",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
```

##### Step 4: Use in apps
```json
// In apps/event-ticketing-website/package.json
{
  "dependencies": {
    "@workspace/shared-ui": "workspace:*"
  }
}
```

---

### 3. **Git Submodules**
Use Git submodules to share code while maintaining separate repositories.

```bash
# Add shared UI as a submodule
git submodule add https://github.com/your-org/event-shared-ui.git src/event_shared_ui

# Update submodule
git submodule update --remote --merge
```

---

### 4. **Component Library with Storybook**
Build a full component library with documentation.

#### Setup Steps:

##### Step 1: Initialize Storybook
```bash
cd ../event-shared-ui
npx storybook@latest init
```

##### Step 2: Create stories for components
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};
```

---

## Migration Strategy for Your Current Setup

### Phase 1: Consolidate Components
1. Review duplicates between `/src/components/ui/` and `/src/event_shared_ui/sharedUi/`
2. Identify truly shared components vs. app-specific ones
3. Standardize component APIs and props

### Phase 2: Extract Shared Components
```bash
# Create a temporary extraction script
mkdir -p ../event-shared-ui/src/components

# Copy shared components
cp src/event_shared_ui/sharedUi/*.tsx ../event-shared-ui/src/components/
cp src/event_shared_ui/utils/*.ts ../event-shared-ui/src/utils/
cp src/event_shared_ui/language/*.json ../event-shared-ui/src/language/
```

### Phase 3: Update Import Paths
```typescript
// Before
import { Button } from '@/components/ui/button';
import { Button } from '@/event_shared_ui/sharedUi/button';

// After
import { Button } from '@your-org/event-shared-ui';
```

### Phase 4: Handle Tailwind Configuration
Create a shared Tailwind preset:

```javascript
// packages/shared-ui/tailwind.preset.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        // ... shared color scheme
      },
    },
  },
  plugins: [],
};

// In your apps' tailwind.config.js
module.exports = {
  presets: [require('@your-org/event-shared-ui/tailwind.preset')],
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@your-org/event-shared-ui/**/*.{js,ts,jsx,tsx}',
  ],
};
```

---

## Best Practices

### 1. **Version Management**
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Document breaking changes in CHANGELOG.md
- Use release tags for stable versions

### 2. **Type Safety**
- Export TypeScript types alongside components
- Use strict TypeScript configuration
- Provide proper type definitions

### 3. **Styling Considerations**
```typescript
// Use CSS variables for theming
export const Button = ({ className, ...props }) => {
  return (
    <button
      className={cn(
        "bg-[var(--primary)] text-[var(--primary-foreground)]",
        className
      )}
      {...props}
    />
  );
};
```

### 4. **Documentation**
- Create README for each component
- Include usage examples
- Document props with JSDoc comments

### 5. **Testing**
```json
// Add to shared-ui package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

---

## Quick Start Commands

### Option 1: NPM Package (Recommended)
```bash
# Create and setup shared UI package
mkdir ../event-shared-ui && cd ../event-shared-ui
npm init -y
npm install react class-variance-authority clsx tailwind-merge
npm install -D typescript tsup @types/react

# Copy your shared components
cp -r /Volumes/Acasis2TB/b&b-projects/event_ticketing_website/src/event_shared_ui/* ./src/

# Build the package
npm run build

# Link locally for testing
npm link

# In your main project
cd /Volumes/Acasis2TB/b&b-projects/event_ticketing_website
npm link event-shared-ui
```

### Option 2: PNPM Workspace (If staying in monorepo)
```bash
# Create workspace structure
mkdir -p packages/shared-ui
mv src/event_shared_ui/* packages/shared-ui/src/

# Update pnpm-workspace.yaml
echo "packages:
  - 'packages/*'
  - '.'" > pnpm-workspace.yaml

# Install workspace dependency
pnpm add @workspace/shared-ui --workspace
```

---

## Troubleshooting

### Common Issues and Solutions

1. **Module Resolution Issues**
   - Ensure `tsconfig.json` paths are correctly configured
   - Check that package.json exports field is properly set

2. **Styling Not Applied**
   - Verify Tailwind content paths include shared UI
   - Ensure CSS variables are defined in consuming apps

3. **Version Conflicts**
   - Use peerDependencies for React and other framework deps
   - Keep shared UI dependencies minimal

4. **Build Errors**
   - Exclude node_modules from TypeScript compilation
   - Use appropriate external flags in build tools

---

## Recommended Next Steps

1. **Start with NPM Package approach** - It's the most flexible and standard
2. **Begin with a few core components** (Button, Input, Card)
3. **Gradually migrate** other components as needed
4. **Set up CI/CD** for automated testing and publishing
5. **Create a demo app** to showcase all shared components

## Example Implementation

I can help you set up any of these approaches. The NPM package method would work like this:

1. Extract your current `event_shared_ui` folder
2. Convert it to a standalone package
3. Publish to a private registry (GitHub Packages, NPM, or local)
4. Import in all your projects

Would you like me to help you implement one of these approaches?
