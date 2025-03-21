'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Dashboard() {
    const { login, ready, authenticated, user, logout } = usePrivy();
    const [loginAttempted, setLoginAttempted] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (ready && !authenticated && !loginAttempted) {
            setLoginAttempted(true);
            login();
        }
    }, [ready, authenticated, login, loginAttempted]);

    if (!ready || !authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Loading...</h1>
                    <p className="text-gray-600">Please wait while we set up your dashboard.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-green-600">
                        GSAW
                    </Link>

                    <div className="flex items-center gap-4">
                        {user?.wallet?.address && (
                            <div className="bg-gray-100 px-4 py-2 rounded-md">
                                <p className="text-sm text-gray-600">
                                    {user.wallet.address.substring(0, 6)}...
                                    {user.wallet.address.substring(user.wallet.address.length - 4)}
                                </p>
                            </div>
                        )}

                        <Button
                            onClick={() => logout()}
                            variant="outline"
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-8 mb-8 border border-green-100">
                        <h1 className="text-3xl font-bold mb-6 text-gray-800">Welcome to Your Spreadsheet Dashboard!</h1>

                        {user && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Profile</h2>
                                <div className="bg-green-700 p-6 rounded-lg border border-green-100">
                                    {user.email && (
                                        <div className="mb-3">
                                            <span className="font-medium">Email:</span> {user.email.address}
                                        </div>
                                    )}

                                    {user.wallet && (
                                        <div className="mb-3">
                                            <span className="font-medium">Wallet Address:</span>{' '}
                                            {user.wallet.address}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Web3 Spreadsheet</h2>
                            <p className="text-gray-600 mb-4">
                                You're now connected! This dashboard gives you access to spreadsheet-like features
                                powered by blockchain technology.
                            </p>
                            <p className="text-gray-600">
                                Start creating and managing your data with the familiar interface you love.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-md rounded-lg p-6 border border-green-100">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">My Spreadsheets</h3>
                            <p className="text-gray-600 mb-4">
                                Access your existing spreadsheets or create a new one to start organizing your data.
                            </p>
                            <Button variant="primary" className="w-full">
                                Manage Spreadsheets
                            </Button>
                        </div>

                        <div className="bg-white shadow-md rounded-lg p-6 border border-green-100">
                            <h3 className="text-lg font-semibold mb-3 text-gray-800">Data Integrations</h3>
                            <p className="text-gray-600 mb-4">
                                Connect your spreadsheets to blockchain data sources and web3 services.
                            </p>
                            <Button variant="primary" className="w-full">
                                Explore Integrations
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 