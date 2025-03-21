import Image from "next/image";
import Link from "next/link";
import LandingLayout from "@/components/LandingLayout";
import { Button, Card } from "@/components/ui";

export default function Home() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-green-50 to-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-gray-800">
              Spreadsheet-Like Experience with Web3 Integration
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              A clean, familiar interface combined with powerful blockchain features.
              Connect your wallet and experience the future of decentralized applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="lg" href="/dashboard">
                Get Started
              </Button>
              <Button variant="outline" size="lg" href="/about">
                Learn More
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-12">
            <div className="bg-white p-6 rounded-lg shadow-sheets border border-green-100">
              <div className="grid grid-cols-4 gap-1 mb-4">
                <div className="h-10 bg-green-50 rounded border border-green-100 flex items-center justify-center text-green-600 font-medium">A</div>
                <div className="h-10 bg-green-50 rounded border border-green-100 flex items-center justify-center text-green-600 font-medium">B</div>
                <div className="h-10 bg-green-50 rounded border border-green-100 flex items-center justify-center text-green-600 font-medium">C</div>
                <div className="h-10 bg-green-50 rounded border border-green-100 flex items-center justify-center text-green-600 font-medium">D</div>
              </div>
              <div className="grid grid-cols-4 gap-1">
                <div className="h-10 bg-white rounded border border-green-100 flex items-center justify-center">1</div>
                <div className="h-10 bg-white rounded border border-green-100 flex items-center justify-center">Data</div>
                <div className="h-10 bg-white rounded border border-green-100 flex items-center justify-center">0.01 ETH</div>
                <div className="h-10 bg-white rounded border border-green-100 flex items-center justify-center">
                  <span className="inline-block w-4 h-4 bg-green-400 rounded-full"></span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 mt-1">
                <div className="h-10 bg-white rounded border border-green-100 flex items-center justify-center">2</div>
                <div className="h-10 bg-white rounded border border-green-100 flex items-center justify-center">Info</div>
                <div className="h-10 bg-white rounded border border-green-100 flex items-center justify-center">0.05 ETH</div>
                <div className="h-10 bg-white rounded border border-green-100 flex items-center justify-center">
                  <span className="inline-block w-4 h-4 bg-green-400 rounded-full"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-800">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <Card bordered elevated>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Secure Wallet Integration</h3>
                <p className="text-gray-600">
                  Connect your existing wallet or create a new one with full security. Your keys, your crypto.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card bordered elevated>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Familiar Spreadsheet Interface</h3>
                <p className="text-gray-600">
                  Work with your data in a familiar Google Sheets-like interface with powerful Web3 features.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card bordered elevated>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Decentralized Data Storage</h3>
                <p className="text-gray-600">
                  Store your data securely on the blockchain with full control over your information.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying our Google Sheets-like interface with Web3 features.
          </p>
          <Button
            variant="secondary"
            size="lg"
            className="bg-white text-green-600 hover:bg-gray-100"
            href="/dashboard"
          >
            Connect Wallet
          </Button>
        </div>
      </section>
    </LandingLayout>
  );
}
