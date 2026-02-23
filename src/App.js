import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import SplashScreen from './components/SplashScreen';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientView from './components/ClientView';
import NotFound from './components/NotFound';

import { AuthProvider } from './context/AuthContext';
import { RevisionsProvider } from './context/RevisionsContext';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <AuthProvider>
      <RevisionsProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="cliente/:clientId" element={<ClientView />} />
            <Route path="pieza/:pieceId" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </RevisionsProvider>
    </AuthProvider>
  );
}

export default App;
