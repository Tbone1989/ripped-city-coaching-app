
import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ClientPortal from './components/ClientPortal';
import { supabase, isSupabaseConfigured, type ClientInsert, type ClientUpdate } from './services/supabaseClient.ts';
import type { Client, SiteContent } from './types.ts';
import type { Session } from '@supabase/supabase-js';
import { Button, Spinner, Card, Input } from './components/ui/common';

const coachEmail = "rippedcityinc@mail.com";
const siteContent: SiteContent = {
  heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop',
  transformationBefore: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
  transformationAfter: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop'
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [isCoach, setIsCoach] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  // F6: tracks whether the client-row lookup for a logged-in non-coach user
  // has finished, so we can tell "still loading" apart from "no portal".
  const [clientLookupDone, setClientLookupDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY') setIsRecovering(true);
        setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    if(session?.user) {
        // Simple logic to determine role. In a real app, this might come from user_metadata.
        setIsCoach(session.user.email === coachEmail);
    } else {
        setIsCoach(false);
    }
  }, [session]);

  const getClients = useCallback(async () => {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (error) {
          console.error("Error fetching clients:", error);
      } else {
          setClients((data || []) as Client[]);      }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setClientLookupDone(true);
      return;
    }
    if (isCoach) {
      getClients();
      setClientLookupDone(true);
    } else {
      // If a client is logged in, you might fetch only their data
      if (session?.user) {
        setClientLookupDone(false);
        // Supabase's query builder returns a PromiseLike (not a real Promise),
        // so wrap it in Promise.resolve() to get .finally().
        Promise.resolve(
          supabase.from('clients').select('*').eq('email', session.user.email).maybeSingle().then(({data}) => {
            if (data) {
              setClients([data as unknown as Client]);
            }
          })
        ).finally(() => {
          setClientLookupDone(true);
        });
      } else {
         setClients([]);
         setClientLookupDone(true);
      }
    }
  }, [isCoach, getClients, session]);


  const handleUpdateClient = useCallback(async (updatedClient: Client) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, ...updateData } = updatedClient;
    const { data, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', updatedClient.id)
      .select()
      .single();

    if (error) {
        console.error('Error updating client:', error);
    } else {
        if(data) {
          setClients(prev => prev.map(c => c.id === data.id ? data as unknown as Client : c));
        }
    }
  }, []);
  
  const handleAddClient = useCallback(async (newClient: Omit<Client, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient]) // insert expects an array
        .select()
        .single();
    
    if(error) {
        console.error("Error adding client:", error);
        alert(`Error: ${error.message}`);
    } else {
        if (data) {
          setClients(prev => [data as unknown as Client, ...prev]);
        }
    }
  }, []);
  
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);
  
  const loggedInClient = !isCoach && session?.user
    ? clients.find(c => c.email === session.user.email) 
    : undefined;

  const renderContent = () => {
    if (!isSupabaseConfigured) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
                <Card className="max-w-md text-center">
                    <i className="fa-solid fa-triangle-exclamation text-4xl text-yellow-400 mb-4"></i>
                    <h1 className="text-2xl font-bold text-white">Backend Not Configured</h1>
                    <p className="mt-2 text-gray-300">
                        This application requires a connection to a Supabase backend, but the necessary environment variables (SUPABASE_URL and SUPABASE_ANON_KEY) are not set.
                    </p>
                    <p className="mt-4 text-sm text-gray-400">
                        In a real-world development setup, you would add these keys to your environment file to connect the frontend to your database. Since they are missing, the app cannot load user data or authenticate.
                    </p>
                </Card>
            </div>
        );
    }
    
    if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
    }
    if (isRecovering) {
      return <SetNewPasswordForm onDone={async () => { setIsRecovering(false); await handleLogout(); }} />;
    }
    if (!session) {
        return <LandingPage siteContent={siteContent} />;
    }
    if (isCoach) {
        return <Dashboard onLogout={handleLogout} clients={clients} onUpdateClient={handleUpdateClient} onAddClient={handleAddClient} />;
    }
    if (loggedInClient) {
        return <ClientPortal client={loggedInClient} onLogout={handleLogout} onUpdateClient={handleUpdateClient} />;
    }
    // Still waiting on the client-row lookup — genuine loading state.
    if (!clientLookupDone) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
                <Spinner />
                <p className="mt-4 text-gray-400">Loading your portal...</p>
                 <Button onClick={handleLogout} variant="secondary" className="mt-6">Logout</Button>
            </div>
        );
    }
    // F6: lookup finished and there is no matching client row — friendly
    // dead-end panel instead of an eternal spinner.
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="max-w-md text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl text-gray-400">
                    <i className="fa-solid fa-user-slash"></i>
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic mb-3">No Portal Found</h2>
                <p className="text-gray-300 mb-2">No coaching portal found for this email yet.</p>
                <p className="text-gray-500 text-sm mb-6">If you just applied, you'll get access once you're onboarded.</p>
                <Button onClick={handleLogout} variant="secondary" className="w-full">Logout</Button>
            </Card>
        </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 font-sans antialiased">
      {renderContent()}
    </div>
  );
}

// Shown when the user lands from a Supabase password-recovery email link.
const SetNewPasswordForm: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (pw1.length < 8) { setError('Use at least 8 characters.'); return; }
    if (pw1 !== pw2) { setError('Passwords do not match.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {done ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-5 text-2xl text-white">
              <i className="fa-solid fa-check"></i>
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic mb-3">Password Updated</h2>
            <p className="text-gray-400 mb-6">You're all set. Log in with your new password.</p>
            <Button onClick={onDone} className="w-full">Back to Login</Button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-black text-center text-white mb-6 uppercase italic">Set New Password</h2>
            <form onSubmit={submit} className="space-y-6">
              <Input label="New Password" type="password" value={pw1} onChange={e => setPw1(e.target.value)} required placeholder="At least 8 characters" />
              <Input label="Confirm Password" type="password" value={pw2} onChange={e => setPw2(e.target.value)} required placeholder="Type it again" />
              <Button type="submit" className="w-full" disabled={saving}>{saving ? <Spinner /> : 'Update Password'}</Button>
            </form>
            {error && <p className="text-red-400 text-sm text-center mt-4 font-bold">{error}</p>}
          </>
        )}
      </Card>
    </div>
  );
};

export default App;
