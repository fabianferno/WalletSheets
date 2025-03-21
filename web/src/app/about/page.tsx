import Image from "next/image";
import LandingLayout from "@/components/LandingLayout";

export default function About() {
    return (
        <LandingLayout>
            {/* About Hero Section */}
            <section className="bg-gradient-to-b from-blue-50 to-white py-20">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
                        We're building the future of Web3 interaction, making blockchain technology accessible to everyone.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0">
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-gray-600 mb-4">
                                Our mission is to bridge the gap between traditional web experiences and the decentralized future.
                                We believe that everyone should have easy access to Web3 technology without the complexity that often
                                comes with it.
                            </p>
                            <p className="text-gray-600">
                                By integrating Privy's wallet solution, we provide a seamless experience for both crypto
                                newcomers and experienced users alike. We're committed to security, usability, and innovation
                                in everything we build.
                            </p>
                        </div>
                        <div className="md:w-1/2">
                            <div className="rounded-lg overflow-hidden shadow-xl">
                                <Image
                                    src="/mission-image.jpg"
                                    alt="Our mission visualization"
                                    width={600}
                                    height={400}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Our Team</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Team Member 1 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                                <Image
                                    src="/team-member1.jpg"
                                    alt="Team Member"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">Jane Smith</h3>
                            <p className="text-blue-600 mb-3">Founder & CEO</p>
                            <p className="text-gray-600">
                                Blockchain enthusiast with 8+ years of experience in decentralized technologies.
                            </p>
                        </div>

                        {/* Team Member 2 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                                <Image
                                    src="/team-member2.jpg"
                                    alt="Team Member"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">John Doe</h3>
                            <p className="text-blue-600 mb-3">CTO</p>
                            <p className="text-gray-600">
                                Full-stack developer specializing in Web3 technologies and smart contracts.
                            </p>
                        </div>

                        {/* Team Member 3 */}
                        <div className="bg-white p-6 rounded-lg shadow-md text-center">
                            <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                                <Image
                                    src="/team-member3.jpg"
                                    alt="Team Member"
                                    width={128}
                                    height={128}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <h3 className="text-xl font-semibold mb-1">Sarah Johnson</h3>
                            <p className="text-blue-600 mb-3">Head of Product</p>
                            <p className="text-gray-600">
                                UX/UI specialist focused on creating intuitive blockchain interfaces.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
} 