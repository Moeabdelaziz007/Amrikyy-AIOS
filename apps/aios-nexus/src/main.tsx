import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@amrikyy/ui';

const AgentsDashboardApp = () => (
  <div>
    <h2>Agents Dashboard</h2>
    <p>This is where the agents dashboard will be displayed.</p>
  </div>
);

const App = () => (
  <div style={{ padding: '2rem' }}>
    <h1>AIOS Nexus</h1>
    <p>The ultimate control center for the AIOS.</p>
    <hr style={{ margin: '2rem 0' }} />
    <AgentsDashboardApp />
    <hr style={{ margin: '2rem 0' }} />
    <Button>Shared Button</Button>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
