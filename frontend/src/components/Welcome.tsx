import React, { useState, useEffect } from "react";
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
  Target,
  BarChart3,
  Lightbulb,
  Handshake,
  Award,
  FileText,
  Clock,
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
    howItWorks: {
      title: "How It Works",
      subtitle: "Your journey to investment in three simple steps",
      step1: {
        title: "Complete Your Assessment",
        desc: "Fill out a comprehensive questionnaire about your business operations, financials, and growth plans",
      },
      step2: {
        title: "Receive Your Score & Insights",
        desc: "Get AI-powered analysis of your strengths, weaknesses, and actionable recommendations",
      },
      step3: {
        title: "Connect with Investors",
        desc: "Get matched with investors looking for businesses like yours and start conversations",
      },
    },
    benefits: {
      title: "Benefits for Your Business",
      subtitle: "Unlock growth opportunities with Isonga",
      visibility: {
        title: "Increased Visibility",
        desc: "Showcase your business to a network of active investors seeking opportunities in Rwanda",
      },
      insights: {
        title: "Actionable Insights",
        desc: "Receive detailed analysis and recommendations to improve your investment readiness",
      },
      network: {
        title: "Access to Network",
        desc: "Join a community of ambitious entrepreneurs and experienced investors",
      },
      funding: {
        title: "Faster Funding",
        desc: "Streamline the investment process with standardized assessments and intelligent matching",
      },
    },
    testimonials: {
      title: "Success Stories",
      subtitle: "Hear from businesses that have grown with Isonga",
    },
    forInvestors: {
      title: "For Investors",
      subtitle:
        "Discover vetted investment opportunities in Rwanda's growing market",
      feature1: {
        title: "Pre-Screened Opportunities",
        desc: "Access businesses that have completed comprehensive assessments",
      },
      feature2: {
        title: "Detailed Analytics",
        desc: "Review business scores, financials, and growth potential at a glance",
      },
      feature3: {
        title: "Smart Matching",
        desc: "Find businesses that match your investment criteria and sector preferences",
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
    howItWorks: {
      title: "Imikorere",
      subtitle:
        "Urugendo rwawe rwo kubona ishoramari mu ntambwe eshatu zoroshye",
      step1: {
        title: "Uzuza Isuzuma",
        desc: "Uzuza ibibazo byuzuye bijyanye n'ibikorwa by'ubucuruzi, imari, n'imigambi yo gukura",
      },
      step2: {
        title: "Bona Amanota n'Ubushakashatsi",
        desc: "Bona isesengura rifite AI ry'imbaraga zawe, intege nke, n'ibyifuzo bikorwa",
      },
      step3: {
        title: "Hura n'Abashoramari",
        desc: "Huzwa n'abashoramari bashaka ubucuruzi nk'ubwawe utangire ibiganiro",
      },
    },
    benefits: {
      title: "Inyungu ku Bucuruzi Bwawe",
      subtitle: "Fungura amahirwe yo gukura hamwe na Isonga",
      visibility: {
        title: "Kugaragara Byinshi",
        desc: "Erekana ubucuruzi bwawe ku isano y'abashoramari bakora bashaka amahirwe mu Rwanda",
      },
      insights: {
        title: "Ubushakashatsi Bukorwa",
        desc: "Bona isesengura ryimbitse n'ibyifuzo byo kunoza ubwitegure bw'ishoramari",
      },
      network: {
        title: "Kubona Urusobe",
        desc: "Injira mu muryango w'abacuruzi bafite intego n'abashoramari babizi",
      },
      funding: {
        title: "Inkunga Yihuse",
        desc: "Oroshya inzira y'ishoramari hamwe n'isuzuma risanzwe no guhuza ubwenge",
      },
    },
    testimonials: {
      title: "Inkuru zo Gutsinda",
      subtitle: "Umva ubucuruzi bwakuze hamwe na Isonga",
    },
    forInvestors: {
      title: "Ku bashoramari",
      subtitle:
        "Vumbura amahirwe y'ishoramari yemejwe mu isoko ry'u Rwanda rikura",
      feature1: {
        title: "Amahirwe Yasuzumwe Mbere",
        desc: "Bona ubucuruzi bwuzuye isuzuma ryimbitse",
      },
      feature2: {
        title: "Isesengura Ryimbitse",
        desc: "Subiramo amanota y'ubucuruzi, imari, n'amahirwe yo gukura mu buryo bworoshye",
      },
      feature3: {
        title: "Guhuza Ubwenge",
        desc: "Shakisha ubucuruzi buhuje n'ibipimo byawe by'ishoramari n'amasoko wakunda",
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
    howItWorks: {
      title: "Comment Ça Marche",
      subtitle: "Votre parcours vers l'investissement en trois étapes simples",
      step1: {
        title: "Complétez Votre Évaluation",
        desc: "Remplissez un questionnaire complet sur vos opérations, finances et plans de croissance",
      },
      step2: {
        title: "Recevez Votre Score & Analyses",
        desc: "Obtenez une analyse IA de vos forces, faiblesses et recommandations actionnables",
      },
      step3: {
        title: "Connectez-vous aux Investisseurs",
        desc: "Soyez mis en relation avec des investisseurs recherchant des entreprises comme la vôtre",
      },
    },
    benefits: {
      title: "Avantages pour Votre Entreprise",
      subtitle: "Débloquez des opportunités de croissance avec Isonga",
      visibility: {
        title: "Visibilité Accrue",
        desc: "Présentez votre entreprise à un réseau d'investisseurs actifs au Rwanda",
      },
      insights: {
        title: "Analyses Actionnables",
        desc: "Recevez des analyses détaillées pour améliorer votre préparation à l'investissement",
      },
      network: {
        title: "Accès au Réseau",
        desc: "Rejoignez une communauté d'entrepreneurs ambitieux et d'investisseurs expérimentés",
      },
      funding: {
        title: "Financement Plus Rapide",
        desc: "Rationalisez le processus d'investissement avec des évaluations standardisées",
      },
    },
    testimonials: {
      title: "Histoires de Succès",
      subtitle: "Découvrez les entreprises qui ont grandi avec Isonga",
    },
    forInvestors: {
      title: "Pour les Investisseurs",
      subtitle:
        "Découvrez des opportunités d'investissement vérifiées sur le marché rwandais",
      feature1: {
        title: "Opportunités Pré-Vérifiées",
        desc: "Accédez aux entreprises ayant complété des évaluations complètes",
      },
      feature2: {
        title: "Analyses Détaillées",
        desc: "Consultez les scores, finances et potentiel de croissance en un coup d'œil",
      },
      feature3: {
        title: "Matching Intelligent",
        desc: "Trouvez des entreprises correspondant à vos critères et préférences sectorielles",
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
  const [scrolled, setScrolled] = useState(false);
  const t = translations[language];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const howItWorksSteps = [
    { icon: FileText, number: "01", ...t.howItWorks.step1 },
    { icon: BarChart3, number: "02", ...t.howItWorks.step2 },
    { icon: Handshake, number: "03", ...t.howItWorks.step3 },
  ];

  const benefits = [
    { icon: Target, ...t.benefits.visibility },
    { icon: Lightbulb, ...t.benefits.insights },
    { icon: Users, ...t.benefits.network },
    { icon: Clock, ...t.benefits.funding },
  ];

  const investorFeatures = [
    { icon: CheckCircle2, ...t.forInvestors.feature1 },
    { icon: BarChart3, ...t.forInvestors.feature2 },
    { icon: Target, ...t.forInvestors.feature3 },
  ];

  const testimonials = [
    {
      name: "Marie Uwimana",
      business: "Kigali Fresh Foods",
      sector: "Agriculture",
      quote:
        language === "en"
          ? "Isonga helped us secure $150K in funding. The assessment showed us exactly what investors were looking for."
          : language === "rw"
          ? "Isonga yadufashije kubona $150K. Isuzuma ryatweretse neza ibyo abashoramari bari gushaka."
          : "Isonga nous a aidés à obtenir 150K$. L'évaluation nous a montré exactement ce que les investisseurs recherchaient.",
      amount: "$150K",
    },
    {
      name: "Jean Baptiste Nkusi",
      business: "Tech Solutions Rwanda",
      sector: "Technology",
      quote:
        language === "en"
          ? "The AI-powered insights were game-changing. We improved our readiness score from 45% to 78% in 6 months."
          : language === "rw"
          ? "Ubushakashatsi bwa AI bwahinduye imikino. Twongereye amanota kuva 45% kugeza 78% mu mezi 6."
          : "Les analyses IA ont tout changé. Nous avons amélioré notre score de 45% à 78% en 6 mois.",
      amount: "$250K",
    },
    {
      name: "Grace Mukamana",
      business: "EcoWear Rwanda",
      sector: "Fashion",
      quote:
        language === "en"
          ? "Being matched with the right investors saved us months of networking. Highly recommend to any SME."
          : language === "rw"
          ? "Guhuza n'abashoramari bakwiye byatujije amezi menshi yo gushaka. Ndabisubiriza ubucuruzi bwose."
          : "Être mis en relation avec les bons investisseurs nous a fait gagner des mois. Je recommande vivement.",
      amount: "$75K",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg"
            : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg"
        } border-b border-gray-200 dark:border-gray-700`}
      >
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
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-white/10 backdrop-blur-md border border-white/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8 shadow-sm">
                <Award className="w-4 h-4" />
                <span>Empowering Rwanda's Business Ecosystem</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
                {language === "en" ? (
                  <>
                    Grow Your Business with{" "}
                    <span className="text-gradient">Isonga</span>
                  </>
                ) : (
                  t.welcome
                )}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl leading-relaxed">
                {t.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="btn-primary group text-lg px-8 py-4"
                >
                  {t.register}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-lg"
                >
                  {t.signIn}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>

              {/* Stats Row */}
              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-gray-200/50 dark:border-gray-700/50 pt-8">
                {stats.slice(0, 3).map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative z-10 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Mockup Content */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                      K
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded opacity-60"></div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium">
                    Investment Ready
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                        85%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Readiness Score
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center mb-3">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-24 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-3">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      3 New Investor Matches
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Based on your latest assessment
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-yellow-400/20 backdrop-blur-md rounded-2xl rotate-12 animate-bounce duration-[3000ms]"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400/20 backdrop-blur-md rounded-full animate-pulse duration-[4000ms]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.features.title}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/5"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-100 dark:border-gray-700">
                      <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50 relative overflow-hidden">
        {/* Connecting line background */}
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent -translate-y-12"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.howItWorks.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.howItWorks.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {howItWorksSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={index}
                  className="relative bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 text-center group hover:shadow-2xl transition-all duration-300"
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white dark:ring-gray-900 z-20">
                    {step.number}
                  </div>
                  <div className="mt-8 mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                {t.benefits.title}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-10">
                {t.benefits.subtitle}
              </p>
              <div className="space-y-8">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={index} className="flex gap-6 group">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                          <Icon className="w-7 h-7 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl transform rotate-3 opacity-10"></div>
              <div className="relative bg-gray-50 dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-2xl">
                {/* Abstract Dashboard UI */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-white dark:bg-gray-700 rounded-xl shadow-sm"></div>
                    <div className="h-24 bg-white dark:bg-gray-700 rounded-xl shadow-sm"></div>
                    <div className="h-24 bg-white dark:bg-gray-700 rounded-xl shadow-sm"></div>
                  </div>
                  <div className="h-48 bg-white dark:bg-gray-700 rounded-xl shadow-sm"></div>
                  <div className="space-y-3">
                    <div className="h-12 bg-white dark:bg-gray-700 rounded-xl shadow-sm"></div>
                    <div className="h-12 bg-white dark:bg-gray-700 rounded-xl shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t.testimonials.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t.testimonials.subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700 relative"
              >
                <div className="absolute -top-4 right-8 text-6xl text-blue-100 dark:text-blue-900 font-serif leading-none">
                  "
                </div>
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-8 italic leading-relaxed relative z-10">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.business}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-bold">
                    {testimonial.amount}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Investors Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-900 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/30 text-blue-300 rounded-full text-sm font-medium mb-6">
              <Handshake className="w-4 h-4" />
              <span>{t.forInvestors.title}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Find Your Next <span className="text-gradient">Unicorn</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {t.forInvestors.subtitle}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {investorFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-16">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {language === "en"
                ? "Join as Investor"
                : language === "rw"
                ? "Injira Nk'Umushoramari"
                : "Rejoindre en tant qu'Investisseur"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden p-12 sm:p-16 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t.cta.title}
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                {t.cta.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  {t.cta.button}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
                >
                  {t.signIn}
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  Isonga Platform
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                {language === "en"
                  ? "Empowering Rwandan businesses to access investment opportunities through comprehensive assessments and intelligent matching."
                  : language === "rw"
                  ? "Dufasha ubucuruzi bw'Abanyarwanda kubona amahirwe yo gushora imari binyuze mu isuzuma rinoze no guhuza mu buryo bwiza."
                  : "Permettre aux entreprises rwandaises d'accéder aux opportunités d'investissement grâce à des évaluations complètes."}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {language === "en"
                  ? "Platform"
                  : language === "rw"
                  ? "Urubuga"
                  : "Plateforme"}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/register"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t.register}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {t.signIn}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {language === "en"
                  ? "Contact"
                  : language === "rw"
                  ? "Twandikire"
                  : "Contact"}
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li>Kigali, Rwanda</li>
                <li>info@isonga.rw</li>
                <li>+250 788 000 000</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Isonga Platform. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <a
                href="#"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {language === "en"
                  ? "Privacy"
                  : language === "rw"
                  ? "Ibanga"
                  : "Confidentialité"}
              </a>
              <a
                href="#"
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {language === "en"
                  ? "Terms"
                  : language === "rw"
                  ? "Amategeko"
                  : "Conditions"}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
