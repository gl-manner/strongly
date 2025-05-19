// /imports/ui/App.jsx
// This file is no longer needed with the new routing system.
// We've migrated all the routes to /imports/startup/client/routes.jsx
// and updated the main.jsx file to use RouterProvider.
//
// You can safely delete this file or keep it for reference.
//
// If you need to keep using App.jsx for other purposes (like global providers),
// you can refactor it to just render children without Routes:
/*
import React from 'react';

const App = ({ children }) => {
  return (
    <div className="app-container">
      {children}
    </div>
  );
};

export default App;
*/

import React from 'react';
import { ThemeProvider } from '/imports/ui/contexts/ThemeContext';
import { AppProvider } from '/imports/ui/contexts/AppContext';
import { AuthProvider } from '/imports/ui/contexts/AuthContext';
import { NotificationProvider } from '/imports/ui/contexts/NotificationContext';

const App = ({ children }) => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
