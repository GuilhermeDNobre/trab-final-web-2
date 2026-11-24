import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { theme } from './theme.ts';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <StrictMode>
      <CssBaseline />
      <App />
    </StrictMode>
  </ThemeProvider>,
)
