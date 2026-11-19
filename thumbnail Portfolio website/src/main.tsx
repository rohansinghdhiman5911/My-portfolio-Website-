import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { RealtimeProvider } from './context/RealtimeContext.tsx';
import { BrandingProvider } from './context/BrandingContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RealtimeProvider>
        <BrandingProvider>
          <App />
        </BrandingProvider>
      </RealtimeProvider>
    </ErrorBoundary>
  </StrictMode>,
);

