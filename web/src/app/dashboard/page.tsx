'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
    const { login, ready, authenticated, user, logout } = usePrivy();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (ready && !authenticated) {
            login();
        }
    }, [ready, authenticated, login]);

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
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        MyApp
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

                        <button
                            onClick={() => logout()}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow-md rounded-lg p-8 mb-8">
                        <h1 className="text-3xl font-bold mb-6">Welcome to Your Dashboard!</h1>

                        {user && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
                                <div className="bg-gray-50 p-6 rounded-lg">
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
                            <h2 className="text-xl font-semibold mb-4">Your Web3 Journey</h2>
                            <p className="text-gray-600 mb-4">
                                You're now connected with Privy! This dashboard is your gateway to interacting
                                with decentralized applications and managing your digital assets.
                            </p>
                            <p className="text-gray-600">
                                Explore the features below to get started with your Web3 journey.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3">Your Wallet</h3>
                            <p className="text-gray-600 mb-4">
                                View your balances, transaction history, and manage your assets.
                            </p>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Manage Wallet
                            </button>
                        </div>

                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3">Explore DApps</h3>
                            <p className="text-gray-600 mb-4">
                                Discover and interact with decentralized applications.
                            </p>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Browse DApps
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
} 