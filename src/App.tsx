import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Explore from './components/Explore';
import SplitBills from './components/SplitBills';
import Planner from './components/Planner';
import SafetySOS from './components/SafetySOS';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [hasEntered, setHasEntered] = useState(false);

  // Check if user has already entered in this session
  useEffect(() => {
    const entered = sessionStorage.getItem('ghoomo_entered');
    if (entered) {
      setHasEntered(true);
    }
  }, []);

  const handleEnter = () => {
    setHasEntered(true);
    sessionStorage.setItem('ghoomo_entered', 'true');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'explore': return <Explore />;
      case 'split': return <SplitBills />;
      case 'planner': return <Planner />;
      case 'sos': return <SafetySOS />;
      case 'profile': return <Profile />;
      default: return <Explore />;
    }
  };

  if (!hasEntered) {
    return (
      <AuthProvider>
        <LandingPage onStart={handleEnter} />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </AuthProvider>
  );
}
