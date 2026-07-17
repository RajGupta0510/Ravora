import React from 'react';
import ReactDOM from 'react-dom/client';
import { Agentation } from 'agentation';

const mountAgentation = () => {
  // Only run in development mode
  if (import.meta.env.DEV) {
    const id = 'agentation-root';
    if (document.getElementById(id)) return;

    const container = document.createElement('div');
    container.id = id;
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <Agentation />
      </React.StrictMode>
    );
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAgentation);
} else {
  mountAgentation();
}
