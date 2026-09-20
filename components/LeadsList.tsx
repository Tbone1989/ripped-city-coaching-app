import React, { useEffect, useState } from 'react';
import { Button, Card, Spinner } from './ui/common.tsx';
import { supabase, type LeadRow } from '../services/supabaseClient.ts';
import { downloadCsv } from '../services/csvExport.ts';

// Coach-only view of captured lead-magnet emails.
const LeadsList: React.FC = () => {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setError('Backend not configured.');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setLeads((data as LeadRow[]) || []);
      setLoading(false);
    })();
  }, []);

  const exportCsv = () => {
    downloadCsv(
      `ripped-city-leads-${new Date().toISOString().slice(0, 10)}.csv`,
      leads.map((l) => ({
        email: l.email,
        source: l.source || '',
        captured_at: new Date(l.created_at).toLocaleString(),
      }))
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16"><Spinner /></div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Guide Signups ({leads.length})</h3>
        <Button variant="secondary" onClick={exportCsv} disabled={!leads.length}>
          <i className="fa-solid fa-download mr-2"></i>
          Export CSV
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-800">
          <p className="text-red-400 text-sm font-bold">{error}</p>
        </Card>
      )}

      {!error && leads.length === 0 && (
        <Card>
          <p className="text-gray-400 text-center py-8">
            No guide signups yet. When someone grabs the Gut Health Blueprint, their email lands here.
          </p>
        </Card>
      )}

      {leads.length > 0 && (
        <Card className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-800">
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Source</th>
                  <th className="px-5 py-3 font-semibold">Captured</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-800/60 hover:bg-gray-800/40">
                    <td className="px-5 py-3 text-white font-medium">{lead.email}</td>
                    <td className="px-5 py-3 text-gray-400">{lead.source || '—'}</td>
                    <td className="px-5 py-3 text-gray-400">{new Date(lead.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LeadsList;
