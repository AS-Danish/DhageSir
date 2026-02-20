export default function PrivacyPolicy() {
    return (
        <div className="bg-gray-900 min-h-screen pt-32 pb-20 text-gray-300">
            <div className="container mx-auto px-4 max-w-4xl">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-8">
                    Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Policy</span>
                </h1>
                <div className="space-y-8 text-lg leading-relaxed bg-gray-800/50 p-8 md:p-12 rounded-2xl border border-gray-700/50 shadow-xl">
                    <p className="text-gray-400 text-base font-medium">Effective Date: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            1. Information We Collect
                        </h2>
                        <p className="text-gray-300">
                            We may collect personal information such as your name, email address, phone number, and any other details you provide when you fill out forms on our website, interact with our platform, or contact us regarding courses and consultations.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            2. How We Use Your Information
                        </h2>
                        <p className="text-gray-300">
                            Your information is used to provide, maintain, and improve our services. We use it to communicate with you efficiently, schedule consultations, process inquiries, and send periodic updates regarding defense exam preparation tips and upcoming events.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            3. Data Sharing and Security
                        </h2>
                        <p className="text-gray-300 mb-4">
                            Mentors Forum respects your privacy. We do not sell your personal information. We may share information with trusted third-party service providers who assist us in operating our website and conducting our business, provided they agree to keep this information confidential.
                        </p>
                        <p className="text-gray-300">
                            We implement reasonable administrative, technical, and physical security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            4. Your Rights
                        </h2>
                        <p className="text-gray-300">
                            Depending on your regional regulations, you may have the right to request access to the personal data we hold about you, to correct any inaccuracies, or to request the deletion of your personal data. To exercise any of these rights, please reach out to us using the contact details provided below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                            5. Contact Us
                        </h2>
                        <p className="text-gray-300">
                            If you have any questions, concerns, or inquiries regarding this Privacy Policy or our data practices, please contact us at:
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
