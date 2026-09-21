import React, { useState } from 'react';
import type { Client } from '../types.ts';
import { Button, Card, Input, Select } from './ui/common.tsx';
import { type ClientInsert } from '../services/supabaseClient.ts';
import { downloadCsv } from '../services/csvExport.ts';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (clientId: string) => void;
  onAddClient: (client: ClientInsert) => Promise<void>;
  onUpdateClient: (client: Client) => Promise<void>;
  onCreatePortalLogin: (client: Client) => Promise<void>;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient, onAddClient, onUpdateClient, onCreatePortalLogin }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientStatus, setNewClientStatus] = useState<'natural' | 'enhanced'>('natural');
  const [activatingId, setActivatingId] = useState<string | null>(null);

  // F9: flip a prospect to active client status in one action.
  const handleActivate = async (client: Client) => {
    setActivatingId(client.id);
    try {
      await onUpdateClient({ ...client, status: 'active' });
    } finally {
      setActivatingId(null);
    }
  };


  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) return;

    const newClient = {
        name: newClientName,
        email: newClientEmail,
        goal: 'Not Set',
        status: 'prospect' as const,
        paymentStatus: 'unpaid' as const,
        profile: {
            age: '',
            gender: 'male' as const,
            weight: '',
            height: '',
            experience: 'beginner' as const,
            activityLevel: 'sedentary' as const,
            status: newClientStatus,
            notificationPreferences: { email: true, sms: false, inApp: true }
        },
        intakeData: { injuries: '', meds: '', diet: '', workSchedule: '', healthConditions: '', allergies: '' },
        progress: [],
        generatedPlans: { mealPlans: [], workoutPlans: [] },
        payments: [],
        communication: { messages: [] },
        bloodworkHistory: [],
        clientTestimonials: [],
        bloodDonationStatus: { status: 'Unknown' as const, lastChecked: '', notes: '' },
        holisticHealth: { sleepQuality: '', stressLevel: '', energyLevel: '', herbalLog: '' },
    };
    await onAddClient(newClient);
    setNewClientName('');
    setNewClientEmail('');
    setNewClientStatus('natural');
    setShowAddForm(false);
  };

  const exportCsv = () => {
    downloadCsv(
      `ripped-city-clients-${new Date().toISOString().slice(0, 10)}.csv`,
      clients.map(c => ({
        name: c.name,
        email: c.email,
        status: c.status,
        payment_status: (c as any).paymentStatus || '',
        goal: c.goal || '',
        created_at: (c as any).created_at ? new Date((c as any).created_at).toLocaleString() : '',
      }))
    );
  };

    const getClientStatusColor = (status: Client['status']) => {
        switch (status) {
            case 'active': return 'bg-blue-500/20 text-blue-300';
            case 'prospect': return 'bg-purple-500/20 text-purple-300';
            case 'inactive': return 'bg-gray-500/20 text-gray-300';
            default: return 'bg-gray-500/20 text-gray-300';
        }
    };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">All Clients ({clients.length})</h3>
            <div className="flex gap-3">
                <Button variant="secondary" onClick={exportCsv} disabled={!clients.length}>
                    <i className="fa-solid fa-download mr-2"></i>
                    Export CSV
                </Button>
                <Button onClick={() => setShowAddForm(s => !s)}>
                     <i className={`fa-solid ${showAddForm ? 'fa-times' : 'fa-plus'} mr-2`}></i>
                    {showAddForm ? 'Cancel' : 'Add New Prospect'}
                </Button>
            </div>
        </div>

        {showAddForm && (
            <Card className="mb-8">
                <form onSubmit={handleAddClient} className="space-y-4">
                    <h4 className="text-lg font-semibold text-white">New Prospect Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Prospect Name" id="newClientName" value={newClientName} onChange={e => setNewClientName(e.target.value)} required />
                        <Input label="Prospect Email" id="newClientEmail" type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} required />
                        <Select label="Initial Status" id="newClientStatus" value={newClientStatus} onChange={e => setNewClientStatus(e.target.value as 'natural' | 'enhanced')}>
                            <option value="natural">Natural</option>
                            <option value="enhanced">Enhanced</option>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full">Save Prospect</Button>
                </form>
            </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
            <Card key={client.id} className="flex flex-col justify-between hover:border-red-500 transition-colors cursor-pointer" onClick={() => onSelectClient(client.id)}>
                <div>
                    <div className="flex justify-between items-start">
                        <h4 className="text-xl font-bold text-white">{client.name}</h4>
                        <span className={`text-xs font-bold py-1 px-2 rounded-full ${getClientStatusColor(client.status)}`}>
                            {(client.status?.charAt(0).toUpperCase() + client.status?.slice(1)) || 'N/A'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{client.email}</p>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-300"><strong>Goal:</strong> <span className="font-semibold text-red-400">{client.goal}</span></p>
                        <span className={`text-xs font-bold py-1 px-2 rounded-full ${client.profile.status === 'enhanced' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>
                          {(client.profile?.status?.charAt(0).toUpperCase() + client.profile?.status?.slice(1)) || 'N/A'}                        </span>
                    </div>
                </div>
                 <div className="flex gap-2 mt-6">
                    {client.status === 'prospect' && (
                        <Button
                            variant="secondary"
                            className="flex-1 !px-2 text-sm"
                            disabled={activatingId === client.id}
                            onClick={(e) => { e.stopPropagation(); handleActivate(client); }}
                            title="Flip this prospect to active client"
                        >
                            <i className="fa-solid fa-bolt mr-1"></i>
                            {activatingId === client.id ? 'Activating...' : 'Activate'}
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        className="flex-1 !px-2 text-sm"
                        onClick={(e) => { e.stopPropagation(); onCreatePortalLogin(client); }}
                        title="Email them a magic login link for the client portal"
                    >
                        <i className="fa-solid fa-key mr-1"></i>
                        Portal login
                    </Button>
                 </div>
                 <Button variant="secondary" className="w-full mt-2" onClick={(e) => { e.stopPropagation(); onSelectClient(client.id); }}>
                    View Dashboard
                    <i className="fa-solid fa-arrow-right ml-2"></i>
                </Button>
            </Card>
        ))}
        </div>
    </div>
  );
};

export default ClientList;
