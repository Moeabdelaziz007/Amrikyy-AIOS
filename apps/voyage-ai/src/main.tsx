import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@amrikyy/ui';

const TripPlannerApp = () => (
  <div>
    <h2>AI Trip Planner</h2>
    <p>This is where the trip planning functionality will be displayed.</p>
  </div>
);

const App = () => (
  <div style={{ padding: '2rem' }}>
    <h1>VoyageAI</h1>
    <p>Your smart travel companion.</p>
    <hr style={{ margin: '2rem 0' }} />
    <TripPlannerApp />
    <hr style={{ margin: '2rem 0' }} />
    <Button>Shared Button</Button>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
