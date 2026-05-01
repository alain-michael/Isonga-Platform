import { useState } from "react";
import type { FC, FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Contact: FC = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:info@makhax.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

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
      <main className="max-w-2xl mx-auto px-4 py-32 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">
          Contact Us
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Have questions? Get in touch with us. We'll get back to you as soon as
          possible.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700"
        >
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              placeholder="How can we help you?"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Message
            </label>
            <textarea
              required
              rows={6}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
              placeholder="Your message..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Send Email
          </button>
        </form>
      </main>
    </div>
  );
};

export default Contact;
