import Image from "next/image";
import Link from "next/link";
import LandingLayout from "@/components/LandingLayout";

export default function Home() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Seamless Web3 Experience with Privy Integration
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect your wallet, manage your assets, and interact with dApps effortlessly.
              Your gateway to the decentralized web starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 text-center"
              >
                Get Started
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 border border-gray-300 font-medium rounded-md hover:bg-gray-50 text-center"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-12">
            <Image
              src="/hero-image.svg"
              alt="Web3 Wallet Illustration"
              width={500}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Wallet Integration</h3>
              <p className="text-gray-600 text-center">
                Connect your existing wallet or create a new one with full security. Your keys, your crypto.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Multi-Chain Support</h3>
              <p className="text-gray-600 text-center">
                Access Ethereum, Polygon, and other popular networks from a single interface.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Easy Transactions</h3>
              <p className="text-gray-600 text-center">
                Send, receive, and trade crypto with minimal fees and maximum convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to dive into Web3?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already enjoying the benefits of decentralized applications.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100"
          >
            Connect Wallet
          </Link>
        </div>
      </section>
    </LandingLayout>
  );
}
