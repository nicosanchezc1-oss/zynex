import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  window.setTimeout(() => {
    window.__ZYNEX_BOOTED__ = true;
    const fallback = document.getElementById('boot-fallback');
    if (fallback) fallback.remove();
  }, 0);
} catch (error) {
  // Keep this visible in Android WebView instead of failing to a black screen.
  const fallback = document.getElementById('boot-fallback');
  if (fallback) {
    fallback.textContent = error instanceof Error ? error.message : 'Zynex failed to start.';
  }
  throw error;
}
