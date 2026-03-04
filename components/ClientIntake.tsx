import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.ts';
import type { ClientInsert } from '../services/supabaseClient.ts';
import { Card, Button, Spinner } from './ui/common.tsx';

interface ClientApplication {
  id: number;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  goals: string;
  experience: string;
  status: string;
}

interface ClientIntakeProps {
  onAddClient: (client: ClientInsert) => Promise<void>;
}

const ClientIntake: React.FC<ClientIntakeProps> = ({ onAddClient }) => {
  const [applications, setApplications] = useState<ClientApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [onboardingId, setOnboardingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchApplications = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Supabase is not configured.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    const { data, error } = await (supabase as any)
      .from('client_applications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      setErrorMessage(`Error fetching applications: ${error.message}`);
    } else {
      setApplications(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOnboard = async (app: ClientApplication) => {
    setOnboardingId(app.id);
    setErrorMessage('');
    const newClient: ClientInsert = {
      name: app.name,
      email: app.email,
      goal: app.goals || '',
      status: 'prospect' as const,
      paymentStatus: 'unpaid' as const,
      profile: {
        age: '',
        gender: 'male' as const,
        weight: '',
        height: '',
        experience: (app.experience as any) || 'beginner',
        activityLevel: 'sedentary' as const,
        status: 'natural' as const,
        notificationPreferences: { email: true, sms: false, inApp: true }
      },
      intakeData: {
        injuries: '',
        meds: '',
        diet: '',
        workSchedule: '',
        healthConditions: '',
        allergies: '',
        phone: app.phone || '',
      },
      progress: [],
      generatedPlans: { mealPlans: [], workoutPlans: [] },
      payments: [],
      communication: { messages: [] },
      bloodworkHistory: [],
      clientTestimonials: [],
      bloodDonationStatus: { status: 'Unknown' as const, lastChecked: '', notes: '' },
      holisticHealth: { sleepQuality: '', stressLevel: '', energyLevel: '', herbalLog: '' },
    };

    try {
      await onAddClient(newClient);
      // Mark application as onboarded in Supabase
      if (supabase) {
        await (supabase as any)
          .from('client_applications')
          .update({ status: 'onboarded' })
          .eq('id', app.id);
      }
      setApplications(prev => prev.filter(a => a.id !== app.id));
      setSuccessMessage(`${app.name} has been successfully onboarded as a client!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(`Failed to onboard ${app.name}: ${err.message}`);
    } finally {
      setOnboardingId(null);
    }
  };

  const handleDismiss = async (app: ClientApplication) => {
    if (!supabase) return;
    await (supabase as any)
      .from('client_applications')
      .update({ status: 'dismissed' })
      .eq('id', app.id);
    setApplications(prev => prev.filter(a => a.id !== app.id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">New Client Applications</h3>
            <p className="text-gray-400 text-sm">
              Real prospect submissions from your coaching website — pulled live from your Supabase database.
            </p>
          </div>
          <Button onClick={fetchApplications} disabled={isLoading}>
            {isLoading ? <Spinner /> : <><i className="fa-solid fa-sync mr-2"></i>Refresh</>}
          </Button>
        </div>

        {successMessage && (
          <div className="mt-4 p-3 bg-green-900/40 border border-green-600 rounded-lg text-green-300 text-sm font-semibold">
            <i className="fa-solid fa-circle-check mr-2"></i>{successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mt-4 p-3 bg-red-900/40 border border-red-600 rounded-lg text-red-300 text-sm">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>{errorMessage}
          </div>
        )}
      </Card>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : applications.length === 0 ? (
        <Card className="text-center py-12">
          <i className="fa-solid fa-inbox text-4xl text-gray-600 mb-4"></i>
          <h4 className="text-lg font-semibold text-gray-300">No Pending Applications</h4>
          <p className="text-gray-500 text-sm mt-2">
            When prospects fill out the intake form on your coaching website, their submissions will appear here in real time.
          </p>
        </Card>
      ) : (
        <Card>
          <h3 className="text-xl font-semibold text-white mb-4">
            Pending Applications ({applications.length})
          </h3>
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="bg-gray-900/40 border border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-white">{app.name}</h4>
                    <p className="text-sm text-gray-400">{app.email}</p>
                    {app.phone && (
                      <p className="text-sm text-gray-400">
                        <i className="fa-solid fa-phone mr-1"></i>{app.phone}
                      </p>
                    )}
                    {app.goals && (
                      <p className="text-sm text-gray-300 mt-2">
                        <strong className="text-gray-200">Goal:</strong> {app.goals}
                      </p>
                    )}
                    {app.experience && (
                      <p className="text-sm text-gray-400">
                        <strong className="text-gray-300">Experience:</strong> {app.experience}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted: {new Date(app.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      onClick={() => handleDismiss(app)}
                      className="text-sm py-2 px-3"
                    >
                      <i className="fa-solid fa-xmark mr-1"></i>Dismiss
                    </Button>
                    <Button
                      onClick={() => handleOnboard(app)}
                      disabled={onboardingId === app.id}
                      className="text-sm py-2 px-3"
                    >
                      {onboardingId === app.id
                        ? <Spinner />
                        : <><i className="fa-solid fa-user-plus mr-2"></i>Onboard Client</>
                      }
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Info Box */}
      <Card className="bg-blue-900/20 border-blue-800 text-blue-200 text-sm">
        <p className="font-bold mb-2 flex items-center">
          <i className="fa-solid fa-circle-info mr-2"></i>How This Works
        </p>
        <p>
          When a prospect fills out the intake form on your public coaching website, their information is saved directly to the <code className="bg-blue-900/40 px-1 rounded">client_applications</code> table in your Supabase database. This page fetches those real submissions live. Click <strong>Onboard Client</strong> to convert a prospect into a full client record, or <strong>Dismiss</strong> to archive the application.
        </p>
      </Card>
    </div>
  );
};

export default ClientIntake;
