# MicroPad UI

Shared React components and styles for the MicroPad workspace.

## Usage

Components, utilities, and styles are bundled into the consuming Vite application
from the package entry point:

```tsx
import { Button, ThemeProvider } from "micropad-ui"

export function App() {
  return (
    <ThemeProvider>
      <Button>Button</Button>
    </ThemeProvider>
  )
}
```

## Adding components

To add components to the library, run the following command from this directory:

```bash
npx shadcn@latest add button
```

Export new public components from `src/index.ts`.
