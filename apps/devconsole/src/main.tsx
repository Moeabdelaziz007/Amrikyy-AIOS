import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@amrikyy/ui';

const App = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Dev Console</h1>
    <p>This is the pilot application for the Dev Tools domain.</p>
    <Button onClick={() => alert('Hello from @amrikyy/ui!')}>
      Shared Button
    </Button>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
