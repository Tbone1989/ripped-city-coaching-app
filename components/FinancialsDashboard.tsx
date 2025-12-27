import React, { useState, useMemo } from 'react';
import type { Client, Payment } from '../types.ts';
import { Card } from './ui/common.tsx';

const FinancialsDashboard: React.FC<{ clients: Client[] }> = ({ clients }) => {

    const allPayments = useMemo(() => {
        return clients.flatMap(client => 
            client.payments.map(p => ({ ...p, clientName: client.name }))
        );
    }, [clients]);

    const financialSummary = useMemo(() => {
        const totalRevenue = allPayments
            .filter(p => p.status === 'Paid')
            .reduce((sum, p) => sum + p.amount, 0);
        
        const pendingAmount = allPayments
            .filter(p => p.status === 'Pending')
            .reduce((sum, p) => sum + p.amount, 0);

        const overdueAmount = allPayments
            .filter(p => p.status === 'Overdue')
            .reduce((sum, p) => sum + p.amount, 0);

        return { totalRevenue, pendingAmount, overdueAmount };
    }, [allPayments]);

    const getStatusColor = (status: Payment['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-500/20 text-green-300';
            case 'Pending': return 'bg-blue-500/20 text-blue-300';
            case 'Overdue': return 'bg-yellow-500/20 text-yellow-300';
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <h4 className="text-gray-400 text-sm font-medium">Total Revenue (Paid)</h4>
                    <p className="text-3xl font-bold text-white mt-2">${financialSummary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </Card>
                 <Card>
                    <h4 className="text-gray-400 text-sm font-medium">Pending Payments</h4>
                    <p className="text-3xl font-bold text-white mt-2">${financialSummary.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </Card>
                 <Card>
                    <h4 className="text-gray-400 text-sm font-medium">Overdue Amount</h4>
                    <p className="text-3xl font-bold text-yellow-400 mt-2">${financialSummary.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                </Card>
            </div>

            <Card>
                <h3 className="text-xl font-semibold text-white mb-4">All Transactions</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700 text-gray-400 text-sm">
                                <th className="py-3 px-4 font-semibold">Client</th>
                                <th className="py-3 px-4 font-semibold">Service</th>
                                <th className="py-3 px-4 font-semibold">Amount</th>
                                <th className="py-3 px-4 font-semibold">Due Date</th>
                                <th className="py-3 px-4 font-semibold text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {allPayments.sort((a,b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).map(p => (
                                <tr key={p.id} className="hover:bg-gray-800/50">
                                    <td className="py-3 px-4 text-white">{p.clientName}</td>
                                    <td className="py-3 px-4 text-gray-300">{p.service}</td>
                                    <td className="py-3 px-4 text-gray-300">${p.amount.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-gray-300">{new Date(p.dueDate).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className={`text-xs font-bold py-1 px-3 rounded-full ${getStatusColor(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default FinancialsDashboard;