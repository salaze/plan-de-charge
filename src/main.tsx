
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Si vous voulez que votre application fonctionne hors ligne et se charge plus rapidement, 
// vous pouvez changer unregister() en register().
serviceWorkerRegistration.register();
