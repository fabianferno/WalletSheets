"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ArchitectureDialog } from "./ArchitectureDialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface GetStartedDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GetStartedDialog({ isOpen, onOpenChange }: GetStartedDialogProps) {
    const { toast } = useToast();
    const [showArchitecture, setShowArchitecture] = useState(false);

    const copyEmailToClipboard = () => {
        navigator.clipboard.writeText(
            "agents@walletsheets.iam.gserviceaccount.com"
        );
        toast({
            title: "Copied to clipboard",
            description: "Email address has been copied to clipboard",
            duration: 2000,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] min-h-[90vh] max-h-[90vh] overflow-auto">
                <DialogHeader className="bg-green-50 p-6 rounded-md">
                    <DialogTitle className="text-3xl font-bold text-green-600">
                        Get Started with WalletSheets
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        WalletSheet.ai transforms Google Sheets into a powerful crypto command center, solving Web3 onboarding challenges by enabling users to manage their entire Web3 experience—from trading and portfolio tracking to DApp interactions—directly within a familiar spreadsheet interface. By simply sharing a Google Sheet with our agent, users gain access to a fully functional wallet system with WalletConnect support, allowing them to handle all their Web3 activities without needing to learn complex blockchain tools.
                        <button
                            onClick={() => setShowArchitecture(true)}
                            className="block mt-2 text-blue-600 hover:underline text-base"
                        >
                            How it works →
                        </button>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-8 py-6 px-4">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-medium mb-4">Key Features</h3>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="portfolio">
                                <AccordionTrigger className="text-xl font-medium">
                                    Portfolio Management
                                </AccordionTrigger>
                                <AccordionContent className="text-lg space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Real-time balances across multiple blockchains (Ethereum, Arbitrum, etc.)</li>
                                        <li>Track token holdings with USD values and historical performance</li>
                                        <li>Auto-updating charts and visualizations</li>
                                        <li>Toggle between detailed views by chain or token type</li>
                                        <li>Export data for tax reporting</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="transactions">
                                <AccordionTrigger className="text-xl font-medium">
                                    Transaction History & Pending Transactions
                                </AccordionTrigger>
                                <AccordionContent className="text-lg space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Detailed log of all wallet activities (swaps, staking, liquidity)</li>
                                        <li>Real-time updates on pending transactions</li>
                                        <li>Track gas fees and estimated completion times</li>
                                        <li>Filter transactions by date, type, or chain</li>
                                        <li>Success/failure status monitoring</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="dapp">
                                <AccordionTrigger className="text-xl font-medium">
                                    DApp Connectivity
                                </AccordionTrigger>
                                <AccordionContent className="text-lg space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>WalletConnect integration for external DApp connections</li>
                                        <li>QR code or connection link generation</li>
                                        <li>In-sheet transaction approval interface</li>
                                        <li>DApp connection management and history tracking</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="chat">
                                <AccordionTrigger className="text-xl font-medium">
                                    Chat with Wallet
                                </AccordionTrigger>
                                <AccordionContent className="text-lg space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Natural language command processing</li>
                                        <li>Interactive sidebar for wallet interactions</li>
                                        <li>Automated blockchain action execution</li>
                                        <li>Real-time market insights and suggestions</li>
                                        <li>Transaction logging and tracking</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="defi">
                                <AccordionTrigger className="text-xl font-medium">
                                    DeFAi Strategy Management
                                </AccordionTrigger>
                                <AccordionContent className="text-lg space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Automated DeFi activity tracking (yield farming, liquidity, staking)</li>
                                        <li>Real-time APY and rewards monitoring</li>
                                        <li>Strategy optimization suggestions</li>
                                        <li>One-click execution options</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="settings">
                                <AccordionTrigger className="text-xl font-medium">
                                    Custom Settings & Security
                                </AccordionTrigger>
                                <AccordionContent className="text-lg space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Configurable risk factors and gas thresholds</li>
                                        <li>Custom notification preferences</li>
                                        <li>Secure wallet key management via Nillion SecretVault</li>
                                        <li>Automated action scheduling</li>
                                        <li>Privacy settings management</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="visualization">
                                <AccordionTrigger className="text-xl font-medium">
                                    Data Visualization & Market Analysis
                                </AccordionTrigger>
                                <AccordionContent className="text-lg space-y-2">
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Dynamic charts and graphs for portfolio performance</li>
                                        <li>Real-time market data and DeFi protocol stats</li>
                                        <li>Customizable visualization options</li>
                                        <li>Opportunity highlighting and analysis</li>
                                        <li>Custom market analysis via chat interface</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="bg-green-50 p-6 rounded-md">
                        <h3 className="text-2xl font-medium mb-4">How to Begin</h3>
                        <ol className="list-decimal pl-8 space-y-6 text-lg">
                            <li className="pb-4">
                                <span className="font-semibold">
                                    Create a new Google Sheet
                                </span>
                                <p className="mt-1 text-gray-600">
                                    Go to{" "}
                                    <a
                                        href="https://sheets.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        Google Sheets
                                    </a>{" "}
                                    and create a new spreadsheet.
                                </p>
                            </li>

                            <li className="pb-4">
                                <span className="font-semibold">
                                    Add WalletSheets as an editor <span className="text-red-500">(and wait for abt 5 mins for agent setup)</span>
                                </span>
                                <div className="flex items-center gap-3 mt-3 bg-slate-50 p-4 rounded-md border border-slate-200">
                                    <div className="border border-slate-300 rounded-md px-4 py-2 bg-white flex-grow font-mono">
                                        agents@walletsheets.iam.gserviceaccount.com
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={copyEmailToClipboard}
                                        className="h-10 w-10 hover:bg-slate-200"
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="sr-only">Copy email address</span>
                                    </Button>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">
                                    Share your spreadsheet with this email address and give it
                                    editor permissions.
                                </p>
                            </li>

                            <li className="pb-4">
                                <span className="font-semibold">
                                    Your sheet will transform automatically
                                </span>
                                <p className="mt-1 text-gray-600">
                                    Once you&apos;ve added the agent as an editor, your spreadsheet will be transformed into a powerful Web3 command center with all the features listed above.
                                </p>
                            </li>
                        </ol>
                    </div>
                </div>
            </DialogContent>
            <ArchitectureDialog
                isOpen={showArchitecture}
                onOpenChange={setShowArchitecture}
            />
        </Dialog>
    );
} 