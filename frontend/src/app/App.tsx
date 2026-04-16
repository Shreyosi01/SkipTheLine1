import React from 'react';
import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeProvider';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </ThemeProvider>
  );
}