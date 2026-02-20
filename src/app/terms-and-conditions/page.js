export default function TermsAndConditions() {
    return (
        <div className="bg-gray-900 min-h-screen pt-32 pb-20 text-gray-300">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-8">
                    Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Conditions</span>
                </h1>
                <div className="space-y-8 text-lg leading-relaxed bg-gray-800/50 p-8 md:p-12 rounded-2xl border border-gray-700/50 shadow-xl">
                    <p className="text-gray-400 text-base font-medium">Effective Date: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-gray-300">
                            By accessing and using the Mentors Forum website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of our website immediately.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            2. Use of the Website
                        </h2>
                        <p className="text-gray-300">
                            You agree to use this website only for lawful educational and informational purposes. You must not use our site in any way that breaches any applicable local, national, or international law or regulation, or in any way that causes harm to the platform or other users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            3. Intellectual Property
                        </h2>
                        <p className="text-gray-300">
                            All content included on this site, such as text, graphics, logos, images, audio clips, video materials, and software, is the property of Mentors Forum or its content suppliers. It is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our explicit, direct permission.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            4. Disclaimer of Warranties
                        </h2>
                        <p className="text-gray-300">
                            The information, including study materials, videos, and articles provided on our website, is for general educational purposes. While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind regarding the completeness, accuracy, or suitability of the content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            5. Limitation of Liability
                        </h2>
                        <p className="text-gray-300">
                            Mentors Forum will not be liable for any damages of any kind arising from the use of this site or from any information, content, or services included on or otherwise made available to you through this site, including, but not limited to direct, indirect, incidental, punitive, and consequential damages.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            6. Changes to Terms
                        </h2>
                        <p className="text-gray-300">
                            We reserve the right to modify or replace these Terms and Conditions at our sole discretion. Any changes will be effective immediately upon posting to the website. Your continued use of the site after any changes signifies your acceptance of the new terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            7. Contact Information
                        </h2>
                        <p className="text-gray-300">
                            If you have any questions regarding these Terms and Conditions, please contact us at:
                        </p>
                        <div className="mt-4 p-4 bg-gray-900 rounded-xl border border-gray-700/50 inline-block">
                            <span className="text-orange-400 font-medium">Email: </span>
                            <a href="mailto:drsatishdhage@gmail.com" className="text-white hover:text-orange-400 transition-colors">drsatishdhage@gmail.com</a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
