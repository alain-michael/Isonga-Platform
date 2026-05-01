import { FC, FormEvent, useState } from "react";
import TopNav from "../components/TopNav";

const Contact: FC = () => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    window.location.href = `mailto:info@makhax.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <TopNav />
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
