import type { FC } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms: FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link
              to="/"
              className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              Last updated: May 1, 2026
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 shadow-sm p-8 sm:p-12">
          <h1 className="text-4xl font-bold mb-2 text-neutral-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-10 text-sm">
            Effective Date: May 1, 2026 &nbsp;·&nbsp; Isonga Platform by Sook Ltd
          </p>

          <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <section>
              <p>
                Welcome to the Isonga Platform ("Platform"), operated by Sook Ltd, a company incorporated
                under the laws of Rwanda. These Terms of Service ("Terms") govern your access to and use
                of the Platform, including all features, services, and content available at{" "}
                <span className="text-primary-600 dark:text-primary-400">isonga.rw</span> and associated
                applications.
              </p>
              <p className="mt-4">
                Please read these Terms carefully before creating an account or using the Platform. By
                registering or continuing to use the Platform, you confirm that you have read, understood,
                and agree to be bound by these Terms and our{" "}
                <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                  Privacy Policy
                </Link>
                . If you do not agree, you must not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                1. About the Platform
              </h2>
              <p className="mb-4">
                The Isonga Platform is a business investment readiness and matchmaking service designed to
                connect Rwandan SMEs and enterprises ("Enterprise Users") with investors and funding
                partners ("Investor Users"). Core services include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Business readiness assessment tools and scoring</li>
                <li>Investor-enterprise matching based on investment criteria</li>
                <li>Funding campaign creation and management</li>
                <li>Secure messaging between matched parties</li>
                <li>Document management and profile building</li>
                <li>Subscription-based access tiers</li>
              </ul>
              <p className="mt-4">
                The Platform facilitates introductions and expressions of interest. We do not provide
                financial advice, investment recommendations, or guarantees of funding. Any investment
                decisions are made independently between enterprises and investors.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                2. Eligibility
              </h2>
              <p className="mb-4">To use the Platform, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Be at least 18 years of age</li>
                <li>Have the legal capacity to enter into binding contracts under Rwandan law</li>
                <li>If registering as a business entity, be duly authorised to act on behalf of that entity</li>
                <li>Not have had a previous account terminated for breach of these Terms</li>
                <li>Comply with all applicable laws and regulations in your jurisdiction</li>
              </ul>
              <p className="mt-4">
                By accepting these Terms, you represent and warrant that you meet all eligibility
                requirements. Sook Ltd reserves the right to verify eligibility and to suspend or terminate
                accounts that do not meet these requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                3. Account Registration &amp; Security
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>You must provide accurate, current, and complete information during registration and keep your account details up to date.</li>
                <li>You are responsible for maintaining the confidentiality of your password and for all activities that occur under your account.</li>
                <li>You must notify us immediately at <a href="mailto:support@isonga.rw" className="text-primary-600 dark:text-primary-400 hover:underline">support@isonga.rw</a> if you suspect unauthorised access to your account.</li>
                <li>You may not share your login credentials with any third party or create accounts on behalf of others without authorisation.</li>
                <li>Each individual or business entity is permitted one active account unless expressly agreed otherwise with Sook Ltd.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                4. Subscriptions &amp; Payments
              </h2>
              <p className="mb-4">
                Certain features of the Platform are available only to subscribers. By subscribing:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>You agree to pay the subscription fees applicable to your chosen plan, denominated in Rwandan Francs (RWF) unless otherwise stated.</li>
                <li>Subscription fees are non-refundable except where required by applicable law or explicitly stated at the time of purchase.</li>
                <li>We reserve the right to change subscription pricing with at least 30 days' written notice to existing subscribers.</li>
                <li>Failure to pay subscription fees may result in suspension or downgrade of your account.</li>
                <li>Payments are processed by our third-party payment provider (Stripe). Your payment details are never stored on our servers.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                5. Enterprise User Obligations
              </h2>
              <p className="mb-4">As an Enterprise User, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Provide accurate and truthful information about your business, including financial data, registration details, and business descriptions.</li>
                <li>Upload only documents and materials that you have the right to share, and that do not infringe third-party intellectual property rights.</li>
                <li>Complete assessments honestly and to the best of your ability; manipulating assessment responses to artificially inflate scores is prohibited.</li>
                <li>Disclose any material information to investors that may be relevant to their investment decision.</li>
                <li>Not make misleading or fraudulent representations to investors or other Platform users.</li>
                <li>Promptly update your profile and campaign information if material circumstances change.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                6. Investor User Obligations
              </h2>
              <p className="mb-4">As an Investor User, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Provide accurate information about your investment capacity, preferences, and criteria.</li>
                <li>Engage with enterprises in good faith and not use the Platform to gather competitive intelligence or for purposes other than genuine investment consideration.</li>
                <li>Maintain confidentiality of any non-public business information shared by enterprises through the Platform.</li>
                <li>Not commit to investments or make pledges that you have no genuine intention or capacity to fulfil.</li>
                <li>Acknowledge that the Platform facilitates introductions only; final investment decisions and due diligence remain solely your responsibility.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                7. Prohibited Activities
              </h2>
              <p className="mb-4">You must not use the Platform to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Post false, misleading, or fraudulent information</li>
                <li>Impersonate any person or entity</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Engage in money laundering, fraud, or any other illegal financial activity</li>
                <li>Upload malware, viruses, or any harmful code</li>
                <li>Attempt to gain unauthorised access to other accounts or our systems</li>
                <li>Scrape, crawl, or extract data from the Platform without our express written consent</li>
                <li>Use the Platform to spam or send unsolicited communications</li>
                <li>Violate any applicable law or regulation, including the Rwanda Anti-Money Laundering Law</li>
                <li>Circumvent any security measures, subscription restrictions, or access controls</li>
              </ul>
              <p className="mt-4">
                Violation of these prohibitions may result in immediate account termination and may expose
                you to civil or criminal liability.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                8. Platform Content &amp; Intellectual Property
              </h2>
              <p className="mb-4">
                All content on the Platform that is not contributed by users — including but not limited
                to software, design, text, graphics, logos, assessment frameworks, and algorithms — is the
                exclusive intellectual property of Sook Ltd and is protected under Rwandan and international
                intellectual property law.
              </p>
              <p className="mb-4">
                By uploading content to the Platform, you grant Sook Ltd a non-exclusive, royalty-free,
                worldwide licence to use, store, display, and process that content solely for the purpose
                of providing and improving our services. You retain ownership of your content.
              </p>
              <p>
                You must not reproduce, distribute, modify, or create derivative works of any Platform
                content without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                9. No Financial Advice
              </h2>
              <p>
                Nothing on the Platform constitutes financial, investment, legal, or tax advice. The
                Platform provides tools to facilitate introductions between businesses and investors;
                it does not recommend specific investments or guarantee any outcomes. All users should
                seek independent professional advice before making investment decisions. Sook Ltd accepts
                no responsibility for investment losses or disputes arising from transactions facilitated
                through the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                10. Disclaimers &amp; Limitation of Liability
              </h2>
              <p className="mb-4">
                The Platform is provided "as is" and "as available" without warranties of any kind, express
                or implied. To the fullest extent permitted by law, Sook Ltd disclaims all warranties
                including merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p className="mb-4">
                Sook Ltd shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Inaccuracies in user-submitted content or assessment results</li>
                <li>Any investment losses arising from use of the Platform</li>
                <li>Service interruptions or technical failures beyond our reasonable control</li>
              </ul>
              <p className="mt-4">
                Our total aggregate liability to you for any claim arising out of these Terms shall not
                exceed the amount paid by you to Sook Ltd in the 12 months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                11. Indemnification
              </h2>
              <p>
                You agree to indemnify, defend, and hold harmless Sook Ltd, its directors, employees,
                agents, and partners from and against any claims, damages, losses, costs, and expenses
                (including reasonable legal fees) arising from: (a) your use of the Platform; (b) your
                violation of these Terms; (c) any content you submit; or (d) your violation of any
                third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                12. Account Suspension &amp; Termination
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>You may close your account at any time by contacting us at <a href="mailto:support@isonga.rw" className="text-primary-600 dark:text-primary-400 hover:underline">support@isonga.rw</a>.</li>
                <li>We may suspend or terminate your account without notice if you breach these Terms, engage in fraudulent activity, or if required by law.</li>
                <li>Upon termination, your right to use the Platform ceases immediately. Provisions of these Terms that by their nature should survive termination will do so, including intellectual property, disclaimers, and limitation of liability.</li>
                <li>Data deletion following account closure is handled in accordance with our Privacy Policy.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                13. Modifications to the Platform &amp; Terms
              </h2>
              <p>
                Sook Ltd reserves the right to modify, suspend, or discontinue any part of the Platform
                at any time with reasonable notice. We may update these Terms from time to time. Material
                changes will be communicated via email or an in-platform notice at least 14 days before
                they take effect. Continued use of the Platform after the effective date constitutes
                acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                14. Governing Law &amp; Dispute Resolution
              </h2>
              <p className="mb-4">
                These Terms are governed by and construed in accordance with the laws of the Republic of
                Rwanda. Any dispute arising from or relating to these Terms or your use of the Platform
                shall be resolved as follows:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-medium">Negotiation:</span> Parties shall first attempt to resolve disputes amicably through good-faith negotiation within 30 days of written notice.</li>
                <li><span className="font-medium">Mediation:</span> If negotiation fails, disputes may be referred to mediation under the auspices of the Rwanda Arbitration Centre.</li>
                <li><span className="font-medium">Litigation:</span> If mediation is unsuccessful, disputes shall be submitted to the exclusive jurisdiction of the courts of Kigali, Rwanda.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                15. General Provisions
              </h2>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-medium">Entire Agreement:</span> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Sook Ltd regarding the Platform.</li>
                <li><span className="font-medium">Severability:</span> If any provision is found unenforceable, the remaining provisions will continue in full force.</li>
                <li><span className="font-medium">Waiver:</span> Failure to enforce any right under these Terms does not constitute a waiver of that right.</li>
                <li><span className="font-medium">Assignment:</span> You may not assign your rights or obligations under these Terms without our prior written consent. We may assign our rights in connection with a merger or acquisition.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                16. Contact Us
              </h2>
              <p className="mb-4">
                For questions about these Terms, please contact:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600">
                <p><span className="font-semibold text-neutral-900 dark:text-white">Sook Ltd — Legal</span></p>
                <p>Email: <a href="mailto:legal@isonga.rw" className="text-primary-600 dark:text-primary-400 hover:underline">legal@isonga.rw</a></p>
                <p>Address: Kigali, Rwanda</p>
                <p className="mt-2">
                  Or use our{" "}
                  <Link to="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">
                    Contact Form
                  </Link>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
