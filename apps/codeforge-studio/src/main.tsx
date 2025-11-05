import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@amrikyy/ui';

const ApiDocsApp = () => (
  <div>
    <h2>API Documentation</h2>
    <p>This is where the API documentation will be displayed.</p>
  </div>
);

const App = () => (
  <div style={{ padding: '2rem' }}>
    <h1>CodeForge Studio</h1>
    <p>The integrated development environment for the AIOS.</p>
    <hr style={{ margin: '2rem 0' }} />
    <ApiDocsApp />
    <hr style={{ margin: '2rem 0' }} />
    <Button>Shared Button</Button>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
