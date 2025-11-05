import React from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '@amrikyy/ui';

const SearchApp = () => (
  <div>
    <h2>Universal Search</h2>
    <p>This is where the universal search functionality will be displayed.</p>
  </div>
);

const App = () => (
  <div style={{ padding: '2rem' }}>
    <h1>CognitoVault</h1>
    <p>Your intelligent knowledge management system.</p>
    <hr style={{ margin: '2rem 0' }} />
    <SearchApp />
    <hr style={{ margin: '2rem 0' }} />
    <Button>Shared Button</Button>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
