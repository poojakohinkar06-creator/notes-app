import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ToastProvider } from '../components/Toast';
import '../styles/global.css';
import '../styles/components.css';
import '../styles/modal.css';
import '../styles/toast.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
