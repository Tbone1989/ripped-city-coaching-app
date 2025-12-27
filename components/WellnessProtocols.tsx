import React, { useState, useMemo } from 'react';
import { protocols } from '../data/protocolsData.ts';
import type { Protocol, ProtocolDetailSection } from '../types.ts';
import { Card, Input } from './ui/common.tsx';

const ProtocolDetail: React.FC<{ protocol: Protocol }> = ({ protocol }) => (
    <Card className="h-full">
        <div className="prose prose-invert max-w-none text-gray-300">
            <h3 className="text-2xl font-bold text-red-400">{protocol.name}</h3>
            <p className="italic text-gray-400">{protocol.description}</p>
            <hr className="border-gray-700 my-4"/>
            
            {protocol.details.map((section: ProtocolDetailSection, index: number) => {
                if (section.isWarning) {
                    return (
                        <div key={index} className="mt-4 p-4 bg-yellow-900/50 border border-yellow-700 text-yellow-200 rounded-lg">
                            <h4 className="!mt-0 !mb-2 text-yellow-200 font-bold">{section.title}</h4>
                            {Array.isArray(section.content) ? (
                                <ul className="!my-0 text-yellow-300 list-disc list-inside space-y-1">
                                    {section.content.map((item, i) => <li key={i}>{item}</li>)}
                                </ul>
                            ) : (
                                <p className="!my-0 text-yellow-300 whitespace-pre-wrap">{section.content}</p>
                            )}
                        </div>
                    );
                }
                return (
                    <div key={index} className="pt-2">
                        <h4 className="text-gray-200 font-semibold">{section.title}</h4>
                        {Array.isArray(section.content) ? (
                            <ul className="list-disc list-inside text-gray-300 space-y-1">
                                {section.content.map((item, i) => <li key={i}>{item}</li>)}
                            </ul>
                        ) : (
                            <p className="whitespace-pre-wrap text-gray-300">{section.content as string}</p>
                        )}
                    </div>
                );
            })}
        </div>
    </Card>
);

const WelcomeMessage = () => (
    <Card className="h-full flex flex-col justify-center items-center text-center">
        <i className="fa-solid fa-book-medical text-5xl text-red-500 mb-4"></i>
        <h3 className="text-2xl font-bold text-white">Welcome to the Protocol Library</h3>
        <p className="text-gray-400 mt-2">Select a protocol from the list on the left to view its detailed information.</p>
    </Card>
);

const WellnessProtocols = () => {
    const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProtocols = useMemo(() => {
        if (!searchTerm) return protocols;
        return protocols.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm]);

    const groupedProtocols = useMemo(() => {
        return filteredProtocols.reduce((acc, protocol) => {
            const category = protocol.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(protocol);
            return acc;
        }, {} as Record<string, Protocol[]>);
    }, [filteredProtocols]);

    const selectedProtocol = protocols.find(p => p.id === selectedProtocolId);
    
    // Define the order of categories
    const categoryOrder: Protocol['category'][] = [
      'Overviews',
      'Safety Notes',
      'Testosterone Bases',
      'Mass Builders',
      'Strength & Power Builders',
      'Cutting & Hardening Compounds',
      'Specialty Compounds',
      'SARMs',
      'Peptides & Growth Factors',
      'Fat Burners & Cutting Aids',
      'Herbal & Natural Support',
      'Cycle Support & AIs',
      'Post Cycle Therapy (PCT)',
      'Insulin & Growth Factors'
    ];


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[85vh]">
            <div className="md:col-span-1 overflow-y-auto pr-2">
                <Input 
                    label="Search Protocols..."
                    id="protocolSearch"
                    placeholder="e.g., Testosterone"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-6 sticky top-0 bg-gray-900/50 backdrop-blur-sm z-10 py-2"
                />
                <div className="space-y-6">
                    {categoryOrder.map(category => (
                        groupedProtocols[category] && (
                            <div key={category}>
                                <h3 className="text-lg font-semibold text-red-400 mb-2 border-b border-gray-700 pb-1">{category}</h3>
                                <ul className="space-y-1">
                                    {groupedProtocols[category].map(protocol => (
                                        <li key={protocol.id}>
                                            <button 
                                                onClick={() => setSelectedProtocolId(protocol.id)}
                                                className={`w-full text-left p-2 rounded-md transition-colors ${selectedProtocolId === protocol.id ? 'bg-red-600/80 text-white' : 'hover:bg-gray-700/50 text-gray-300'}`}
                                            >
                                                {protocol.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )
                    ))}
                </div>
            </div>
            <div className="md:col-span-2 overflow-y-auto">
                {selectedProtocol ? <ProtocolDetail protocol={selectedProtocol} /> : <WelcomeMessage />}
            </div>
        </div>
    );
};

export default WellnessProtocols;