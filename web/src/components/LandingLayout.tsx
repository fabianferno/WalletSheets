import React from 'react';
import Link from 'next/link';

type LandingLayoutProps = {
    children: React.ReactNode;
};

export default function LandingLayout({ children }: LandingLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold text-blue-600">
                        MyApp
                    </Link>
                    <nav className="space-x-6">
                        <Link href="/" className="text-gray-600 hover:text-blue-600">
                            Home
                        </Link>
                        <Link href="/about" className="text-gray-600 hover:text-blue-600">
                            About
                        </Link>
                        <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Launch App
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="flex-grow">
                {children}
            </main>

            <footer className="bg-gray-100">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between">
                        <div className="mb-4 md:mb-0">
                            <h3 className="text-lg font-bold mb-2">MyApp</h3>
                            <p className="text-gray-600">Web3 made simple.</p>
                        </div>
                        <div className="flex space-x-8">
                            <div>
                                <h4 className="font-medium mb-2">Resources</h4>
                                <ul className="space-y-1">
                                    <li><Link href="/docs" className="text-gray-600 hover:text-blue-600">Documentation</Link></li>
                                    <li><Link href="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Company</h4>
                                <ul className="space-y-1">
                                    <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About</Link></li>
                                    <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-4 border-t border-gray-200 text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} MyApp. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
} 