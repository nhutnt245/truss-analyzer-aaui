// Runs the reference conversion on its own: `npm run sample:reference`. Not part of the converted page: copy `src/` (the screen, its test and the logic), never this file.
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { AuiIdentityProvider, IconographyProvider } from '@/vendor/atomic-aui';
import { AppFrame } from '@/recipes/layout';
import { ToastHost } from '@/recipes/shared/ToastHost';
import { loadIconKit } from '@/app/icon-kit';
import { useTheme } from '@/app/theme';
import { WorkOrders } from './src/screens/WorkOrders/WorkOrders';
import '@/styles/app.scss';

loadIconKit();

function Reference() {
  const [theme, toggleTheme] = useTheme();
  return (
    <AuiIdentityProvider brand="atomic" theme={theme} typeface="engineering" typography="body" className="app-root">
      <IconographyProvider family="classic" layer="duotone" weight="regular">
        <ToastHost>
          <AppFrame appName="Maintenance desk" theme={theme} onToggleTheme={toggleTheme}>
            <WorkOrders />
          </AppFrame>
        </ToastHost>
      </IconographyProvider>
    </AuiIdentityProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Reference />
  </StrictMode>,
);
