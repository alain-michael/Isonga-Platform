import { FC } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy: FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
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
          </div>
        </div>
      </nav>
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
