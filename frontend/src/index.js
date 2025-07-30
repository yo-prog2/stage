import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';

import './assets/css/App.css';
import App from './App';
import { msalConfig } from './authConfig'; // You will create this file
import { NotificationProvider } from "./contexts/NotificationContext";

const msalInstance = new PublicClientApplication(msalConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <MsalProvider instance={msalInstance}>
      <NotificationProvider>
      <App />
      </NotificationProvider>
    </MsalProvider>
  </BrowserRouter>,
);
