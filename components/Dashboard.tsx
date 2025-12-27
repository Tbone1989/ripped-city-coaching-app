

import React, { useState } from 'react';
import { Tool, type Client } from '../types.ts';
import { Button } from './ui/common.tsx';
import { DailyBriefingIcon, UsersIcon, ProtocolIcon, FinancialsIcon, SettingsIcon, IntakeIcon } from './ui/Icons.tsx';
import ClientList from './ClientList.tsx';
import ClientDetail from './ClientDetail.tsx';
import DailyBriefing from './DailyBriefing.tsx';
import WellnessProtocols from './WellnessProtocols.tsx';
import FinancialsDashboard from './FinancialsDashboard.tsx';
import Settings from './Settings.tsx';
import ClientIntake from './ClientIntake.tsx';
import { type ClientInsert } from '../services/supabaseClient.ts';

interface DashboardProps {
  onLogout: () => void;
  clients: Client[];
  onUpdateClient: (client: Client) => Promise<void>;
  onAddClient: (client: ClientInsert) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, clients, onUpdateClient, onAddClient }) => {
  const [activeView, setActiveView] = useState<Tool>(Tool.DailyBriefing);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
  };
  
  const handleBackToList = () => {
    setSelectedClientId(null);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  const handleLoginAsClient = async (client: Client) => {
      alert(`This feature is for development demonstration.\n\nTo view as this client, please log out and then log back in using their credentials:\nEmail: ${client.email}\n(You can set/reset their password in your Supabase dashboard under Authentication > Users.)`);
  };

  const renderContent = () => {
    if (selectedClientId && selectedClient) {
      return <ClientDetail client={selectedClient} onBack={handleBackToList} onUpdateClient={onUpdateClient} onLoginAsClient={() => handleLoginAsClient(selectedClient)} />;
    }

    switch (activeView) {
      case Tool.DailyBriefing:
        return <DailyBriefing clients={clients} />;
      case Tool.Clients:
        return <ClientList clients={clients} onSelectClient={handleSelectClient} onAddClient={onAddClient} />;
      case Tool.Intake:
        return <ClientIntake onAddClient={onAddClient} />;
      case Tool.Protocols:
        return <WellnessProtocols />;
      case Tool.Financials:
        return <FinancialsDashboard clients={clients} />;
      case Tool.Settings:
        return <Settings />;
      default:
        return <DailyBriefing clients={clients} />;
    }
  };
  
  const getHeaderText = () => {
      if(selectedClientId && selectedClient) {
          return selectedClient.name;
      }
      return activeView;
  }
  
  const getHeaderDescription = () => {
      if(selectedClientId && selectedClient) {
          return `Managing client profile, plans, and communication.`;
      }
      switch(activeView) {
        case Tool.DailyBriefing:
            return `Your AI-powered assistant coach. Get a quick summary of client progress and actionable insights.`;
        case Tool.Clients:
            return `Your central hub for client management. All data is now live from your Supabase database.`;
        case Tool.Intake:
            return `Onboard new prospects by syncing submissions from your client intake form.`;
        case Tool.Protocols:
            return `A comprehensive library of wellness and performance protocols.`;
        case Tool.Financials:
            return `Track and manage all client payments and invoices.`;
        case Tool.Settings:
            return `Configure third-party integrations like Stripe and Google Sheets.`;
        default:
            return `Welcome to your dashboard.`;
      }
  }


  const tools = [
    { name: Tool.DailyBriefing, icon: <DailyBriefingIcon /> },
    { name: Tool.Clients, icon: <UsersIcon /> },
    { name: Tool.Intake, icon: <IntakeIcon /> },
    { name: Tool.Financials, icon: <FinancialsIcon /> },
    { name: Tool.Protocols, icon: <ProtocolIcon /> },
    { name: Tool.Settings, icon: <SettingsIcon /> },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-20 md:w-64 bg-gray-900/80 backdrop-blur-sm p-4 md:p-6 flex flex-col justify-between border-r border-gray-800">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-10 hidden md:block">
            Ripped City <span className="text-red-500">Dash</span>
          </h1>
          <nav className="space-y-2">
            {tools.map(tool => (
              <button
                key={tool.name}
                onClick={() => {
                  setActiveView(tool.name);
                  setSelectedClientId(null); // Return to list view when changing main tool
                }}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeView === tool.name && !selectedClientId ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
              >
                <span className="text-lg">{tool.icon}</span>
                <span className="ml-4 font-semibold hidden md:block">{tool.name}</span>
              </button>
            ))}
          </nav>
        </div>
        <Button onClick={onLogout} variant="secondary" className="w-full">
          <i className="fa-solid fa-power-off mr-0 md:mr-2"></i>
          <span className="hidden md:inline">Logout</span>
        </Button>
      </aside>
      <main className="flex-1 p-6 md:p-10 bg-gray-900/50">
        <h2 className="text-3xl font-bold text-white mb-2">{getHeaderText()}</h2>
        <p className="text-gray-400 mb-8">
            {getHeaderDescription()}
        </p>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;