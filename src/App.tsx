import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Explore from './components/Explore';
import SplitBills from './components/SplitBills';
import Planner from './components/Planner';
import SafetySOS from './components/SafetySOS';
import Profile from './components/Profile';

export default function App() {
  const [activeTab, setActiveTab] = useState('explore');

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

  return (
    <AuthProvider>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </AuthProvider>
  );
}
