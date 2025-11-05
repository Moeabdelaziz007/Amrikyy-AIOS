import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@amrikyy/ui';

const CreatorPipelineApp = () => (
  <div>
    <h2>Creator Pipeline</h2>
    <p>This is where the creator pipeline will be displayed.</p>
  </div>
);

const App = () => (
  <div style={{ padding: '2rem' }}>
    <h1>OmniCreate Studio</h1>
    <p>The all-in-one platform for generating, editing, and publishing creative content.</p>
    <hr style={{ margin: '2rem 0' }} />
    <CreatorPipelineApp />
    <hr style={{ margin: '2rem 0' }} />
    <Button>Shared Button</Button>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
