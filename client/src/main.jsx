/**
 * The main entry point for the React application.
 * This file is responsible for initializing the app and rendering it into the DOM.
 * It sets up the root of the component tree, including:
 * - React's Strict Mode for development checks.
 * - The UserProvider to manage global authentication state.
 * - The BrowserRouter to enable client-side routing.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx'; // The root component with all the routes
import { UserProvider } from './context/UserContext.jsx'; // The global state provider for auth
import './index.css'; // Imports global styles and Tailwind CSS directives

// Get the root element from the HTML where the React app will be mounted.
const rootElement = document.getElementById('root');

// Create a React root for concurrent rendering.
const root = ReactDOM.createRoot(rootElement);

// Render the application.
// The component nesting order is important:
// 1. StrictMode: Catches potential problems in the app during development.
// 2. UserProvider: Makes authentication data available to all components.
// 3. BrowserRouter: Enables routing capabilities for the App component.
// 4. App: The main application component.
root.render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);

