/**
 * @file LiquiditySignalCard.tsx
 * @description Reusable card component for displaying liquidity signals
 */

interface LiquiditySignalCardProps {
    companyName: string;
    companyCode: string;
    mappedClient: string;
    clientCode: string;
    eventDescription: string;
    isImportant?: boolean;
}

export default function LiquiditySignalCard({
    companyName,
    companyCode,
    mappedClient,
    clientCode,
    eventDescription,
    isImportant = false,
}: LiquiditySignalCardProps) {
    return (
        <div className="border border-gray-200 rounded-lg p-5 hover:border-[#E85D54] transition-colors cursor-pointer">
            <div className="space-y-2">
                <h4 className="font-semibold text-[#1A1A2E]">
                    {companyName} <span className="text-gray-500 text-sm">({companyCode})</span>
                </h4>
                <p className="text-sm text-[#5A6C7D]">
                    Mapped UHNW: {mappedClient} ({clientCode})
                </p>
                <p className="text-sm text-[#5A6C7D]">
                    {eventDescription}
                    {isImportant && (
                        <span className="font-semibold text-[#E85D54]"> | IMPORTANT SIGNAL</span>
                    )}
                </p>
            </div>
        </div>
    );
}
