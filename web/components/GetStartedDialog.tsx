"use client";

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

interface GetStartedDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GetStartedDialog({ isOpen, onOpenChange }: GetStartedDialogProps) {
    const { toast } = useToast();

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
                        Get Started with Sheets
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                        Follow these simple steps to transform your Google Sheets into a
                        blockchain wallet!
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-3 px-4">
                    <div className="space-y-6">
                        <h3 className="text-2xl font-medium">What is Sheets?</h3>
                        <p className="text-lg">
                            Sheets is a revolutionary platform that allows you to interact
                            with blockchain technology directly through Google Sheets. No
                            coding required, just spreadsheets!
                        </p>

                        <h3 className="text-2xl font-medium mt-8">Key Features</h3>
                        <ul className="list-disc pl-8 text-lg">
                            <li>Send transactions directly from your spreadsheet</li>
                            <li>Monitor wallet activity in real-time</li>
                            <li>Track transaction history</li>
                            <li>Manage multiple wallets in one place</li>
                            <li>Approve or reject transactions with a simple checkbox</li>
                        </ul>

                        <div className="bg-green-50 p-6 rounded-md mt-8">
                            <p className="text-green-800 text-xl">
                                Ready to transform how you interact with blockchain? Your
                                Google Sheet is now your blockchain command center!
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h3 className="text-2xl font-medium">How to Begin</h3>
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
                                    Add this email as an editor
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
                                    {"Turn your orthodox daddy's spreadsheets to use blockchain"}
                                </span>
                                <p className="mt-1 text-gray-600">
                                    {"Once you've added the agent as an editor, your spreadsheet will be transformed into a powerful blockchain interface."}
                                </p>
                            </li>
                        </ol>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 