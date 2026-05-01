import { FC } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms: FC = () => {
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
          Terms of Service
        </h1>
        <div className="prose dark:prose-invert max-w-none text-neutral-600 dark:text-neutral-400">
          <p>
            Welcome to the Isonga Platform. By accessing or using our services,
            you agree to be bound by these Terms of Service.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">
            1. Acceptance of Terms
          </h2>
          <p>
            By registering for an account, you confirm that you accept these
            terms.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">
            2. User Responsibilities
          </h2>
          <p>
            Users are expected to provide accurate information and engage in
            respectful conduct on the platform.
          </p>
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Data Privacy</h2>
          <p>
            We process your personal data in accordance with our Privacy Policy.
            Please ensure you also read our Privacy Policy.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Terms;
