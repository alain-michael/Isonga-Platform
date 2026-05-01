import type { FC } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy: FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-10 text-sm">
            Effective Date: May 1, 2026 &nbsp;·&nbsp; Isonga Platform by Sook Ltd
          </p>

          <div className="space-y-10 text-neutral-700 dark:text-neutral-300 leading-relaxed">
            <section>
              <p>
                Isonga Platform ("we", "us", or "our"), operated by Sook Ltd and incorporated under the
                laws of Rwanda, is committed to protecting and respecting your privacy. This Privacy Policy
                explains how we collect, use, store, and share personal information when you use our
                platform at <span className="text-primary-600 dark:text-primary-400">isonga.rw</span> and
                related services (collectively, the "Platform").
              </p>
              <p className="mt-4">
                By creating an account or using the Platform, you confirm that you have read and understood
                this Privacy Policy. If you do not agree with any part of this policy, please do not use
                our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                1. Who We Are
              </h2>
              <p>
                Sook Ltd is the data controller responsible for your personal information collected through
                the Isonga Platform. We are registered in Rwanda and operate in accordance with Rwanda's
                Law No. 058/2021 of 13/10/2021 Relating to the Protection of Personal Data and Privacy
                (the "Rwanda Data Protection Law") and, where applicable, the EU General Data Protection
                Regulation (GDPR).
              </p>
              <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600">
                <p className="font-semibold text-neutral-900 dark:text-white mb-1">Contact Details</p>
                <p>Email: <a href="mailto:privacy@isonga.rw" className="text-primary-600 dark:text-primary-400 hover:underline">privacy@isonga.rw</a></p>
                <p>Address: Kigali, Rwanda</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                2. Information We Collect
              </h2>
              <p className="mb-4">We collect the following categories of personal data:</p>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2.1 Account &amp; Identity Information
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Full name, email address, and phone number</li>
                    <li>Username and password (stored encrypted)</li>
                    <li>User type (Enterprise or Investor)</li>
                    <li>Date of account creation and last login</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2.2 Business Information (Enterprise Users)
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Business name, registration number, and legal status</li>
                    <li>Industry sector, business description, and years of operation</li>
                    <li>Financial information including revenue, funding targets, and investment amounts</li>
                    <li>Business documents uploaded to the platform (e.g., registration certificates, financial statements)</li>
                    <li>Assessment responses and readiness scores</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2.3 Investor Information
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Investment preferences and criteria (minimum/maximum investment ranges)</li>
                    <li>Portfolio interests and committed investment amounts</li>
                    <li>Organisation name and contact details</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2.4 Usage &amp; Technical Data
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>IP address, browser type, and device information</li>
                    <li>Pages visited, features used, and time spent on the Platform</li>
                    <li>Log data, error reports, and diagnostic information</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    2.5 Communications
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Messages sent between users through the Platform's messaging system</li>
                    <li>Support requests and correspondence with our team</li>
                    <li>Notification preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                3. How We Use Your Information
              </h2>
              <p className="mb-4">We use your personal data for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-medium">Account Management:</span> Creating and managing your account, authenticating you, and providing customer support.</li>
                <li><span className="font-medium">Matching &amp; Investment Facilitation:</span> Matching enterprises with suitable investors based on criteria and preferences, facilitating investment expressions of interest.</li>
                <li><span className="font-medium">Business Assessments:</span> Delivering readiness assessments, scoring your responses, and generating recommendations to improve your investment readiness.</li>
                <li><span className="font-medium">Platform Communications:</span> Sending you notifications about matches, campaign updates, messages from other users, and important platform announcements.</li>
                <li><span className="font-medium">Payments:</span> Processing subscription payments and maintaining billing records in accordance with our payment provider's terms.</li>
                <li><span className="font-medium">Safety &amp; Fraud Prevention:</span> Detecting and preventing fraudulent activity, enforcing our Terms of Service, and ensuring platform security.</li>
                <li><span className="font-medium">Improvement &amp; Analytics:</span> Analysing usage patterns to improve Platform features, fix bugs, and develop new services.</li>
                <li><span className="font-medium">Legal Compliance:</span> Complying with applicable laws, regulations, and lawful requests from governmental authorities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                4. Legal Basis for Processing
              </h2>
              <p className="mb-4">
                We process your personal data on the following legal bases under the Rwanda Data Protection
                Law and, where applicable, the GDPR:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-medium">Contract Performance:</span> Processing necessary to provide you with the services you signed up for.</li>
                <li><span className="font-medium">Consent:</span> Where you have given explicit consent (e.g., marketing communications). You may withdraw consent at any time.</li>
                <li><span className="font-medium">Legitimate Interests:</span> Where processing is necessary for our legitimate business interests (e.g., fraud prevention, security), provided these interests are not overridden by your rights.</li>
                <li><span className="font-medium">Legal Obligation:</span> Where we are required by law to process your data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                5. How We Share Your Information
              </h2>
              <p className="mb-4">
                We do not sell your personal data. We may share information in the following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-medium">Between Users:</span> Enterprise profile information and campaign details are visible to matched investors, and vice versa, as required for the core matching service. You control what business information you disclose.</li>
                <li><span className="font-medium">Service Providers:</span> We engage trusted third-party providers (e.g., cloud hosting, payment processing, email delivery) who process data on our behalf under strict confidentiality agreements.</li>
                <li><span className="font-medium">Payment Processors:</span> Payment details are processed directly by our payment provider (Stripe) and are not stored on our servers.</li>
                <li><span className="font-medium">Legal Requirements:</span> We may disclose data when required by law, court order, or to protect the rights, property, or safety of Sook Ltd, our users, or the public.</li>
                <li><span className="font-medium">Business Transfers:</span> In the event of a merger, acquisition, or asset sale, your data may be transferred. We will notify you of any such change and your rights.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                6. Data Retention
              </h2>
              <p className="mb-4">
                We retain your personal data for as long as your account is active or as necessary to
                provide our services. Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Account data is retained for the duration of your account and deleted within 90 days of a verified account deletion request.</li>
                <li>Financial records and transaction logs may be retained for up to 7 years to comply with Rwandan tax and accounting regulations.</li>
                <li>Communications and messages are retained for 3 years from the date of the last message.</li>
                <li>Anonymised and aggregated data may be retained indefinitely for analytical purposes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                7. Your Rights
              </h2>
              <p className="mb-4">
                Under the Rwanda Data Protection Law and GDPR (where applicable), you have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><span className="font-medium">Right of Access:</span> You may request a copy of the personal data we hold about you.</li>
                <li><span className="font-medium">Right to Rectification:</span> You may request that we correct inaccurate or incomplete data.</li>
                <li><span className="font-medium">Right to Erasure:</span> You may request deletion of your data, subject to legal retention obligations.</li>
                <li><span className="font-medium">Right to Restriction:</span> You may ask us to restrict processing of your data in certain circumstances.</li>
                <li><span className="font-medium">Right to Data Portability:</span> You may request your data in a structured, machine-readable format.</li>
                <li><span className="font-medium">Right to Object:</span> You may object to processing based on legitimate interests or for direct marketing.</li>
                <li><span className="font-medium">Right to Withdraw Consent:</span> Where processing is based on consent, you may withdraw it at any time without affecting prior processing.</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:privacy@isonga.rw" className="text-primary-600 dark:text-primary-400 hover:underline">
                  privacy@isonga.rw
                </a>
                . We will respond within 30 days. You may also lodge a complaint with the Rwanda Utilities
                Regulatory Authority (RURA), which oversees data protection in Rwanda.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                8. Data Security
              </h2>
              <p className="mb-4">
                We implement appropriate technical and organisational security measures to protect your
                personal data, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Encryption of data in transit using TLS/HTTPS</li>
                <li>Passwords stored using industry-standard hashing algorithms (never in plaintext)</li>
                <li>Access controls limiting who within our organisation can access personal data</li>
                <li>Regular security reviews and vulnerability assessments</li>
                <li>JWT-based authentication with token expiry</li>
              </ul>
              <p className="mt-4">
                While we take security seriously, no method of electronic transmission or storage is 100%
                secure. In the event of a data breach that poses a risk to your rights, we will notify you
                and the relevant authorities as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                9. Cookies &amp; Tracking Technologies
              </h2>
              <p>
                The Platform uses browser local storage (not traditional cookies) to maintain your
                authenticated session (storing your JWT access token). We do not currently use
                third-party tracking cookies or advertising trackers. We may use anonymised analytics
                tools in the future and will update this policy accordingly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                10. International Data Transfers
              </h2>
              <p>
                Our servers and infrastructure are primarily located within or operated via providers with
                data centres accessible from Rwanda. Where data is transferred outside Rwanda, we ensure
                appropriate safeguards are in place (such as standard contractual clauses or adequacy
                decisions) in compliance with the Rwanda Data Protection Law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                11. Children's Privacy
              </h2>
              <p>
                The Isonga Platform is intended for use by businesses and investment professionals. We do
                not knowingly collect personal data from anyone under the age of 18. If you believe we have
                inadvertently collected data from a minor, please contact us immediately at{" "}
                <a href="mailto:privacy@isonga.rw" className="text-primary-600 dark:text-primary-400 hover:underline">
                  privacy@isonga.rw
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                12. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. When we make material changes, we
                will notify you via email or a prominent notice on the Platform before the changes take
                effect. The "Last updated" date at the top of this page reflects the most recent revision.
                Continued use of the Platform after changes are posted constitutes your acceptance of the
                updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                13. Contact Us
              </h2>
              <p className="mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data
                practices, please contact our Data Protection Officer:
              </p>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl border border-neutral-200 dark:border-neutral-600">
                <p><span className="font-semibold text-neutral-900 dark:text-white">Sook Ltd — Data Protection</span></p>
                <p>Email: <a href="mailto:privacy@isonga.rw" className="text-primary-600 dark:text-primary-400 hover:underline">privacy@isonga.rw</a></p>
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

export default Privacy;
