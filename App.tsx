
import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ClientPortal from './components/ClientPortal';
import { supabase, isSupabaseConfigured, type ClientInsert, type ClientUpdate } from './services/supabaseClient.ts';
import type { Client, SiteContent } from './types.ts';
import type { Session } from '@supabase/supabase-js';
import { Button, Spinner, Card } from './components/ui/common';

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

  useEffect(() => {
    if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  useEffect(() => {
    if(session?.user) {
        // Simple logic to determine role. In a real app, this might come from user_metadata.
        39
          'tbone1989@gmail.com'
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
          setClients(data as unknown as Client[]);
      }
  }, []);

  useEffect(() => {
    if (isCoach) {
      getClients();
    } else {
      // If a client is logged in, you might fetch only their data
      if (session?.user) {
        supabase.from('clients').select('*').eq('email', session.user.email).maybeSingle().then(({data}) => {
          if (data) {
            setClients([data as unknown as Client]);
          }
        });
      } else {
         setClients([]);
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
    if (!session) {
        return <LandingPage siteContent={siteContent} />;
    }
    if (isCoach) {
        return <Dashboard onLogout={handleLogout} clients={clients} onUpdateClient={handleUpdateClient} onAddClient={handleAddClient} />;
    }
    if (loggedInClient) {
        return <ClientPortal client={loggedInClient} onLogout={handleLogout} onUpdateClient={handleUpdateClient} />;
    }
    // Fallback while client data might be loading or if not found
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <Spinner />
            <p className="mt-4 text-gray-400">Loading your portal...</p>
             <Button onClick={handleLogout} variant="secondary" className="mt-6">Logout</Button>
        </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 font-sans antialiased">
      {renderContent()}
    </div>
  );
}

export default App;
