import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  ChevronRight,
  Building2,
  TrendingUp,
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
} from "lucide-react";

type Language = "en" | "rw" | "fr";

const translations = {
  en: {
    welcome: "Welcome to Isonga",
    subtitle: "SME Assessment & Investor Matching Platform",
    description:
      "Empowering Rwandan businesses to access investment opportunities through comprehensive assessments and intelligent matching.",
    signIn: "Sign In",
    register: "Register Your Business",
    learnMore: "Learn More",
    features: {
      title: "Why Choose Isonga?",
      assessment: {
        title: "Comprehensive Assessment",
        desc: "Get a detailed evaluation of your business readiness for investment",
      },
      matching: {
        title: "Smart Investor Matching",
        desc: "Connect with investors who align with your business goals",
      },
      support: {
        title: "Continuous Support",
        desc: "Access resources and guidance throughout your growth journey",
      },
      secure: {
        title: "Secure & Confidential",
        desc: "Your business data is protected with enterprise-grade security",
      },
    },
    stats: {
      businesses: "Businesses Assessed",
      investors: "Active Investors",
      matched: "Successful Matches",
      raised: "Funding Raised",
    },
    cta: {
      title: "Ready to Grow Your Business?",
      subtitle:
        "Join hundreds of Rwandan SMEs accessing investment opportunities",
      button: "Get Started Today",
    },
  },
  rw: {
    welcome: "Murakaza neza kuri Isonga",
    subtitle: "Urubuga rwo Gusuzuma Ubucuruzi no Guhuza n'Abashoramari",
    description:
      "Dufasha ubucuruzi bw'Abanyarwanda kubona amahirwe yo gushora imari binyuze mu isuzuma rinoze no guhuza mu buryo bwiza.",
    signIn: "Injira",
    register: "Andikisha Ubucuruzi Bwawe",
    learnMore: "Menya Byinshi",
    features: {
      title: "Kuki Wahitamo Isonga?",
      assessment: {
        title: "Isuzuma Ryuzuye",
        desc: "Bona isuzuma rirambuye ry'ubwitegure bw'ubucuruzi bwawe",
      },
      matching: {
        title: "Guhuza Abashoramari mu Buryo Bwiza",
        desc: "Hura n'abashoramari bahuje n'intego z'ubucuruzi bwawe",
      },
      support: {
        title: "Ubufasha Buhoraho",
        desc: "Bona ibikoresho n'ubuyobozi mu rugendo rwawe rwo gukura",
      },
      secure: {
        title: "Byizewe kandi Byihishwa",
        desc: "Amakuru y'ubucuruzi bwawe arindwa n'umutekano ukomeye",
      },
    },
    stats: {
      businesses: "Ibicuruzi Byasuzumwe",
      investors: "Abashoramari Bakora",
      matched: "Guhuza Kwagenze Neza",
      raised: "Imari Yabonetse",
    },
    cta: {
      title: "Witeguye Gukuza Ubucuruzi Bwawe?",
      subtitle:
        "Ifatanye n'amagana y'ibicuruzi by'Abanyarwanda bibona amahirwe yo gushora",
      button: "Tangira Uyu Munsi",
    },
  },
  fr: {
    welcome: "Bienvenue sur Isonga",
    subtitle:
      "Plateforme d'Évaluation des PME et Mise en Relation avec les Investisseurs",
    description:
      "Permettre aux entreprises rwandaises d'accéder aux opportunités d'investissement grâce à des évaluations complètes et un matching intelligent.",
    signIn: "Se Connecter",
    register: "Enregistrer Votre Entreprise",
    learnMore: "En Savoir Plus",
    features: {
      title: "Pourquoi Choisir Isonga?",
      assessment: {
        title: "Évaluation Complète",
        desc: "Obtenez une évaluation détaillée de la préparation de votre entreprise",
      },
      matching: {
        title: "Matching Intelligent",
        desc: "Connectez-vous avec des investisseurs alignés avec vos objectifs",
      },
      support: {
        title: "Support Continu",
        desc: "Accédez aux ressources et conseils tout au long de votre parcours",
      },
      secure: {
        title: "Sécurisé & Confidentiel",
        desc: "Vos données sont protégées avec une sécurité de niveau entreprise",
      },
    },
    stats: {
      businesses: "Entreprises Évaluées",
      investors: "Investisseurs Actifs",
      matched: "Matches Réussis",
      raised: "Fonds Levés",
    },
    cta: {
      title: "Prêt à Développer Votre Entreprise?",
      subtitle:
        "Rejoignez des centaines de PME rwandaises accédant aux opportunités d'investissement",
      button: "Commencer Aujourd'hui",
    },
  },
};

const Welcome: React.FC = () => {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
  ];

  const stats = [
    { value: "500+", label: t.stats.businesses },
    { value: "50+", label: t.stats.investors },
    { value: "100+", label: t.stats.matched },
    { value: "₿2B+", label: t.stats.raised },
  ];

  const features = [
    { icon: TrendingUp, ...t.features.assessment },
    { icon: Users, ...t.features.matching },
    { icon: Building2, ...t.features.support },
    { icon: Shield, ...t.features.secure },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Isonga
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <Globe className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {languages.find((l) => l.code === language)?.flag}{" "}
                    {languages.find((l) => l.code === language)?.name}
                  </span>
                </button>
                <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                        language === lang.code
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      {lang.name}
                      {language === lang.code && (
                        <CheckCircle2 className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth Buttons */}
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {t.signIn}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                  {t.register}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              {t.welcome}
            </h1>
            <p className="text-xl sm:text-2xl text-blue-600 dark:text-blue-400 font-medium mb-4">
              {t.subtitle}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
              {t.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                {t.register}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {t.signIn}
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            {t.features.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t.cta.title}
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              {t.cta.subtitle}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
            >
              {t.cta.button}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Isonga Platform
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Isonga. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
