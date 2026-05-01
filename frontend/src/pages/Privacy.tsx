import { FC } from "react";
import TopNav from "../components/TopNav";

const Privacy: FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <TopNav />
      <main className="max-w-4xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">
          Privacy Policy
        </h1>
        <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400">
          <p>
            Your privacy is important to us. This Privacy Policy explains how we
            collect, use, and protect your personal data.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">
            1. Data Collection
          </h2>
          <p>
            We collect the information you provide when registering, including
            contact details and platform activity.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Use of Data</h2>
          <p>
            Your data is used solely to facilitate the features of the Isonga
            Platform and will not be sold to third parties.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">
            3. GDPR Compliance
          </h2>
          <p>
            We adhere strictly to data protection guidelines to ensure your
            privacy is respected.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
