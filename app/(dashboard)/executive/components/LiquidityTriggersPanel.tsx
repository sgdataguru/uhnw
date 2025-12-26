/**
 * @file LiquidityTriggersPanel.tsx
 * @description Liquidity event forecast panel for 0-365 day timeline
 */

'use client';

import { useState } from 'react';
import type { LiquidityTrigger, LiquidityTimelineFilter } from '@/types';
import LiquiditySignalCard from './LiquiditySignalCard';

interface LiquidityTriggersPanelProps {
    triggers: LiquidityTrigger[];
    isLoading?: boolean;
}

interface SignalGroup {
    title: string;
    colorScheme: 'red' | 'yellow' | 'green';
    signals: {
        companyName: string;
        companyCode: string;
        mappedClient: string;
        clientCode: string;
        eventDescription: string;
        isImportant?: boolean;
    }[];
}

// Color scheme mapping for signal groups
const COLOR_SCHEME_CLASSES = {
    red: {
        border: 'border-red-200',
        bg: 'bg-red-50',
        text: 'text-red-700',
    },
    yellow: {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
    },
    green: {
        border: 'border-green-200',
        bg: 'bg-green-50',
        text: 'text-green-700',
    },
} as const;

// Grouped liquidity signals data
const LIQUIDITY_SIGNAL_GROUPS: SignalGroup[] = [
    {
        title: 'RED — High Urgency / High Impact (Immediate RM Action)',
        colorScheme: 'red',
        signals: [
            {
                companyName: 'Nectar Lifesciences Ltd',
                companyCode: '#NSE:NECLIFE',
                mappedClient: 'Ramesh Gupta',
                clientCode: '#HC001',
                eventDescription: 'Buyback — Record Date Liquidity',
                isImportant: true,
            },
            {
                companyName: 'VLS Finance Ltd',
                companyCode: '#NSE:VLSFINANCE',
                mappedClient: 'Sanjay Malhotra',
                clientCode: '#HC128',
                eventDescription: 'Buyback — Tender Window Live',
                isImportant: true,
            },
            {
                companyName: 'Covidh Technologies Ltd',
                companyCode: '#NSE:COVIDH',
                mappedClient: 'Ramesh Gupta',
                clientCode: '#HC001',
                eventDescription: 'Open Offer — Tender Window Live',
            },
        ],
    },
    {
        title: 'YELLOW — Medium Urgency / Watch Closely',
        colorScheme: 'yellow',
        signals: [
            {
                companyName: 'Aurobindo Pharma Ltd',
                companyCode: '#NSE:AUROPHARMA',
                mappedClient: 'Megha Iyer',
                clientCode: '#HC084',
                eventDescription: 'Block Deal — Promoter Stake Sale',
            },
            {
                companyName: 'Glenmark Life Sciences',
                companyCode: '#NSE:GLENMARKL',
                mappedClient: 'Rohit Khanna',
                clientCode: '#HC142',
                eventDescription: 'Demergers — Board Resolution Expected',
            },
        ],
    },
    {
        title: 'GREEN — Early Signal / Opportunity Radar',
        colorScheme: 'green',
        signals: [
            {
                companyName: 'CMS Info Systems',
                companyCode: '#NSE:CMSINFO',
                mappedClient: 'Neelam Chopra',
                clientCode: '#HC109',
                eventDescription: 'ESOP Vesting — 6 Month Window',
            },
            {
                companyName: 'L&T Technology Services',
                companyCode: '#NSE:LTTS',
                mappedClient: 'Harish Batra',
                clientCode: '#HC062',
                eventDescription: 'Dividend Signal — Capital Allocation Review',
            },
        ],
    },
];

export default function LiquidityTriggersPanel({ triggers, isLoading }: LiquidityTriggersPanelProps) {
    const [timelineFilter, setTimelineFilter] = useState<LiquidityTimelineFilter>('0-30');

    // Filter triggers by timeline
    const filteredTriggers = triggers.filter(trigger => {
        if (timelineFilter === 'all') return true;

        const days = trigger.daysUntilEvent;
        switch (timelineFilter) {
            case '0-30': return days >= 0 && days <= 30;
            case '31-90': return days >= 31 && days <= 90;
            case '91-180': return days >= 91 && days <= 180;
            case '181-365': return days >= 181 && days <= 365;
            default: return true;
        }
    });

    // Calculate summary stats
    const totalInPlay = filteredTriggers.reduce((sum, t) => sum + t.amount, 0);

    const handleExport = () => {
        // Export to CSV
        const csvData = filteredTriggers.map(t => ({
            Client: t.clientName,
            'Client Code': t.clientCode,
            Event: t.eventType.replace(/_/g, ' ').toUpperCase(),
            Amount: `₹${(t.amount / 10000000).toFixed(2)} Cr`,
            Date: new Date(t.eventDate).toLocaleDateString(),
            'Days Until': t.daysUntilEvent,
            Probability: `${t.probability}%`,
            Source: t.dataSource,
            RM: t.assignedRMName,
            Status: t.status
        }));

        const csv = [
            Object.keys(csvData[0]).join(','),
            ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `liquidity-triggers-${timelineFilter}.csv`;
        a.click();
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                    <div className="space-y-3">
                        <div className="h-20 bg-gray-200 rounded" />
                        <div className="h-20 bg-gray-200 rounded" />
                        <div className="h-20 bg-gray-200 rounded" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-[#1A1A2E] font-[family-name:var(--font-playfair)]">
                            🔥 Liquidity Triggers & Actions
                        </h3>
                        <p className="text-sm text-[#5A6C7D] mt-1">
                            Next 12 months • {filteredTriggers.length} events • ₹{(totalInPlay / 10000000).toFixed(2)} Cr in play
                        </p>
                    </div>

                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-[#E85D54] text-white rounded-lg hover:bg-[#D64D44] transition-colors flex items-center gap-2 text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export Data
                    </button>
                </div>

                {/* Timeline Filters */}
                <div className="flex gap-2">
                    {[
                        { value: '0-30', label: '0-30 days' },
                        { value: '31-90', label: '31-90 days' },
                        { value: '91-180', label: '91-180 days' },
                        { value: '181-365', label: '181-365 days' },
                        { value: 'all', label: 'All' }
                    ].map(filter => (
                        <button
                            key={filter.value}
                            onClick={() => setTimelineFilter(filter.value as LiquidityTimelineFilter)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timelineFilter === filter.value
                                    ? 'bg-[#E85D54] text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Triggers List */}
            <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                {LIQUIDITY_SIGNAL_GROUPS.map((group) => {
                    const colors = COLOR_SCHEME_CLASSES[group.colorScheme];

                    return (
                        <div key={group.title} className={`space-y-3 rounded-lg border ${colors.border} ${colors.bg} p-4`}>
                            <p className={`text-xs font-semibold uppercase tracking-wide ${colors.text}`}>
                                {group.title}
                            </p>
                            <div className="space-y-3">
                                {group.signals.map((signal) => (
                                    <LiquiditySignalCard
                                        key={signal.companyCode}
                                        companyName={signal.companyName}
                                        companyCode={signal.companyCode}
                                        mappedClient={signal.mappedClient}
                                        clientCode={signal.clientCode}
                                        eventDescription={signal.eventDescription}
                                        isImportant={signal.isImportant}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
