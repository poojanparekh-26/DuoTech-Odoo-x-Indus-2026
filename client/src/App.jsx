// C:/Users/pruthilpatel/Desktop/odoo hacathon/client/src/App.jsx
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { Toast } from './components/ui/Toast';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toast />
    </>
  );
}

export default App;
