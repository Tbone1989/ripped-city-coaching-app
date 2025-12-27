import React, { useState, useMemo } from 'react';
import type { Client } from '../types.ts';
import { generateDailyBriefing, isGeminiConfigured } from '../services/geminiService.ts';
import { Button, Card, Spinner } from './ui/common.tsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


const DailyBriefing: React.FC<{ clients: Client[] }> = ({ clients }) => {
    const [briefings, setBriefings] = useState<Record<string, { content: string, status: 'done' } | { error: string, status: 'error' }>>({});
    const [isLoading, setIsLoading] = useState(false);
    
    const activeClients = useMemo(() => clients.filter(c => c.status === 'active'), [clients]);

    const handleGenerateBriefing = async () => {
        setIsLoading(true);
        setBriefings({});

        const results = await Promise.allSettled(
            activeClients.map(client => 
                generateDailyBriefing(client).then(content => ({
                    clientId: client.id,
                    content
                }))
            )
        );

        const newBriefings: typeof briefings = {};
        results.forEach((result, index) => {
            const clientId = activeClients[index].id;
            if (result.status === 'fulfilled') {
                newBriefings[clientId] = { content: result.value.content, status: 'done' };
            } else {
                const errorMessage = (result.reason as Error).message || 'An unknown error occurred.';
                newBriefings[clientId] = { error: errorMessage, status: 'error' };
            }
        });
        
        setBriefings(newBriefings);
        setIsLoading(false);
    };
    
    if (!isGeminiConfigured) {
        return (
            <Card className="text-center">
                 <i className="fa-solid fa-triangle-exclamation text-4xl text-yellow-400 mb-4"></i>
                <h3 className="text-xl font-bold text-white">AI Features Disabled</h3>
                <p className="text-gray-400 mt-2">
                    The Gemini API key is not configured. Please set the <code>API_KEY</code> environment variable to enable this feature.
                </p>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Generate Today's Briefing</h3>
                        <p className="text-gray-400 mt-1">
                            Click the button to get an AI-powered summary for each of your active clients ({activeClients.length}).
                        </p>
                    </div>
                    <Button onClick={handleGenerateBriefing} disabled={isLoading || activeClients.length === 0} className="w-full md:w-auto">
                        {isLoading ? <Spinner /> : <><i className="fa-solid fa-wand-magic-sparkles mr-2"></i>Generate Briefing</>}
                    </Button>
                </div>
            </Card>

            {isLoading && (
                 <Card className="text-center py-12">
                    <Spinner />
                    <p className="mt-4 text-gray-300">Generating briefings for {activeClients.length} clients... this may take a moment.</p>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.keys(briefings).length > 0 && activeClients.map(client => {
                    const briefing = briefings[client.id];
                    if (!briefing) return null;

                    return (
                        <Card key={client.id} className="bg-gray-800/60 border-l-4 border-red-500">
                             <h4 className="text-xl font-bold text-white mb-4">{client.name}</h4>
                            {briefing.status === 'done' ? (
                                <div className="prose prose-invert max-w-none text-gray-300 prose-headings:text-red-400 prose-strong:text-white prose-p:my-2 prose-ul:my-2">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {briefing.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <div className="text-red-400">
                                    <p className="font-bold">Failed to generate briefing.</p>
                                    <p className="text-sm italic">{briefing.error}</p>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyBriefing;