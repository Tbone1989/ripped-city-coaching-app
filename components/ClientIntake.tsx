import React, { useState } from 'react';
import type { Client } from '../types.ts';
import { Button, Card, Input, Spinner } from './ui/common.tsx';
import { type ClientInsert } from '../services/supabaseClient.ts';

// Mock data simulating what a Google Form might provide
const mockSubmissionsData = [
  {
    name: 'Brenda Miller',
    email: 'brenda.m@example.com',
    goal: 'Lose 20 pounds for my wedding',
    experience: 'beginner' as const,
    phone: '555-0101',
  },
  {
    name: 'Carlos Santos',
    email: 'carlos.s@example.com',
    goal: 'Gain 10 pounds of muscle',
    experience: 'intermediate' as const,
    phone: '555-0102',
  },
  {
    name: 'Jessica Chen',
    email: 'jess.chen@example.com',
    goal: 'Run a half-marathon',
    experience: 'intermediate' as const,
    phone: '555-0103',
  },
];

interface ClientIntakeProps {
  onAddClient: (client: ClientInsert) => Promise<void>;
}

const ClientIntake: React.FC<ClientIntakeProps> = ({ onAddClient }) => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gFormUrl, setGFormUrl] = useState('');

  const handleSync = () => {
    // Simulate API call
    setIsLoading(true);
    setSubmissions([]);
    setTimeout(() => {
      setSubmissions(mockSubmissionsData);
      setIsLoading(false);
    }, 1500);
  };

  const handleOnboard = async (submission: any, index: number) => {
    // Create a new client object based on the submission
    const newClient: ClientInsert = {
        name: submission.name,
        email: submission.email,
        goal: submission.goal,
        status: 'prospect' as const,
        paymentStatus: 'unpaid' as const,
        profile: {
            age: '',
            gender: 'male' as const, // Default, can be updated by client
            weight: '',
            height: '',
            experience: submission.experience,
            activityLevel: 'sedentary' as const,
            status: 'natural' as const,
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

    // Remove the onboarded submission from the list
    setSubmissions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
        <Card>
            <h3 className="text-xl font-semibold text-white mb-2">Connect Your Intake Form</h3>
            <p className="text-gray-400 mb-4">Paste the link to your Google Form below and sync to pull in new client submissions.</p>
            <div className="flex gap-4 items-end">
                <div className="flex-grow">
                    <Input 
                        label="Google Form URL"
                        id="gform-url"
                        value={gFormUrl}
                        onChange={(e) => setGFormUrl(e.target.value)}
                        placeholder="https://docs.google.com/forms/d/e/..."
                    />
                </div>
                <Button onClick={handleSync} disabled={isLoading}>
                    {isLoading ? <Spinner /> : <><i className="fa-solid fa-sync mr-2"></i>Sync Submissions</>}
                </Button>
            </div>
             <Card className="mt-6 bg-blue-900/30 border-blue-700 text-blue-200 text-sm">
                <p className="font-bold mb-2 flex items-center"><i className="fa-solid fa-server mr-2"></i>How This Works in a Real App</p>
                <p>
                    For security, this is a simulation. A real integration would use a backend service like **Supabase Edge Functions**. That backend function would securely connect to the Google API, listen for new form submissions, and add them to your database. That same function could also automatically:
                </p>
                 <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Add the new client data to a Google Sheet.</li>
                    <li>Send you and the client an email notification.</li>
                    <li>Create an event in your Google Calendar for a follow-up call.</li>
                </ul>
             </Card>
        </Card>

        {submissions.length > 0 && (
            <Card>
                <h3 className="text-xl font-semibold text-white mb-4">New Submissions ({submissions.length})</h3>
                <div className="space-y-4">
                    {submissions.map((sub, index) => (
                        <Card key={sub.email} className="bg-gray-900/40 flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-lg text-white">{sub.name}</h4>
                                <p className="text-sm text-gray-400">{sub.email}</p>
                                <p className="text-sm text-gray-300 mt-2"><strong>Goal:</strong> {sub.goal}</p>
                            </div>
                            <Button onClick={() => handleOnboard(sub, index)}>
                                <i className="fa-solid fa-user-plus mr-2"></i>
                                Onboard Client
                            </Button>
                        </Card>
                    ))}
                </div>
            </Card>
        )}

    </div>
  );
};

export default ClientIntake;