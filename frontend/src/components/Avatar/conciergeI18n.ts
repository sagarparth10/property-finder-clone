export const CONCIERGE_LANGS = [
  { code: 'en', label: 'EN', speech: 'en-US' },
  { code: 'ar', label: 'AR', speech: 'ar-AE' },
  { code: 'fr', label: 'FR', speech: 'fr-FR' },
  { code: 'hi', label: 'HI', speech: 'hi-IN' },
] as const;

export type ConciergeLang = (typeof CONCIERGE_LANGS)[number]['code'];

export type ConciergeCopy = {
  title: string;
  tagline: string;
  heading: string;
  subtitle: string;
  prompts: [string, string, string, string];
  placeholder: string;
  openFullChat: string;
  ready: string;
  listening: string;
  voiceOn: string;
  askAria: string;
  sendAria: string;
  greeting: string;
  panelSubtitle: string;
  thinking: string;
  chatPlaceholder: string;
  errorContact: string;
};

export const CONCIERGE_COPY: Record<ConciergeLang, ConciergeCopy> = {
  en: {
    title: 'AI Concierge',
    tagline: 'Ask anything about your next property journey.',
    heading: 'Where should we start?',
    subtitle:
      'Ask about listings, neighborhoods, financing, or legal steps — or pick a prompt below.',
    prompts: [
      '2-bed in Dubai Marina under AED 180k',
      'Steps to buy an off-plan villa',
      'Downtown vs Business Bay ROI',
      'Mortgage options with 20% down',
    ],
    placeholder: 'Ask about your next move…',
    openFullChat: 'Open full concierge chat',
    ready: 'Ready',
    listening: 'Listening…',
    voiceOn: 'Voice on',
    askAria: 'Ask the AI concierge',
    sendAria: 'Send question',
    greeting:
      "Hi there! I'm the Property Nexus AI concierge. Ask me about neighborhoods, investment yields, or how to collaborate with agents and lawyers.",
    panelSubtitle: 'Ask about listings, neighborhoods, and financing',
    thinking: 'Thinking...',
    chatPlaceholder: 'Ask about listings, financing, or legal workflows...',
    errorContact: 'Unable to contact the AI engine. Please try again in a moment.',
  },
  ar: {
    title: 'المساعد الذكي',
    tagline: 'اسأل أي شيء عن رحلة عقارك القادمة.',
    heading: 'من أين نبدأ؟',
    subtitle: 'اسأل عن العقارات أو الأحياء أو التمويل أو الخطوات القانونية — أو اختر سؤالاً أدناه.',
    prompts: [
      'غرفتين في دبي مارينا بأقل من ١٨٠ ألف درهم',
      'خطوات شراء فيلا على الخارطة',
      'عائد داون تاون مقابل بيزنس باي',
      'خيارات الرهن مع دفعة ٢٠٪',
    ],
    placeholder: 'اسأل عن خطوتك التالية…',
    openFullChat: 'فتح محادثة المساعد الكاملة',
    ready: 'جاهز',
    listening: 'يستمع…',
    voiceOn: 'الصوت مفعّل',
    askAria: 'اسأل المساعد الذكي',
    sendAria: 'إرسال السؤال',
    greeting:
      'مرحباً! أنا مساعد Property Nexus الذكي. اسألني عن الأحياء أو عوائد الاستثمار أو التعاون مع الوكلاء والمحامين.',
    panelSubtitle: 'اسأل عن العقارات والأحياء والتمويل',
    thinking: 'جارٍ التفكير...',
    chatPlaceholder: 'اسأل عن العقارات أو التمويل أو الإجراءات القانونية...',
    errorContact: 'تعذر الاتصال بمحرك الذكاء الاصطناعي. حاول مرة أخرى بعد لحظات.',
  },
  fr: {
    title: 'Concierge IA',
    tagline: 'Posez vos questions sur votre prochain parcours immobilier.',
    heading: 'Par où commencer ?',
    subtitle:
      'Parlez d’annonces, de quartiers, de financement ou d’étapes juridiques — ou choisissez une suggestion.',
    prompts: [
      '2 chambres à Dubai Marina sous 180k AED',
      'Étapes pour acheter une villa sur plan',
      'ROI Downtown vs Business Bay',
      'Options de prêt avec 20 % d’apport',
    ],
    placeholder: 'Posez votre prochaine question…',
    openFullChat: 'Ouvrir le chat concierge complet',
    ready: 'Prêt',
    listening: 'Écoute…',
    voiceOn: 'Voix active',
    askAria: 'Demander au concierge IA',
    sendAria: 'Envoyer la question',
    greeting:
      'Bonjour ! Je suis le concierge IA Property Nexus. Parlez-moi de quartiers, de rendements ou de collaboration avec agents et avocats.',
    panelSubtitle: 'Annonces, quartiers et financement',
    thinking: 'Réflexion...',
    chatPlaceholder: 'Parlez d’annonces, de financement ou de démarches juridiques...',
    errorContact: 'Impossible de contacter le moteur IA. Réessayez dans un instant.',
  },
  hi: {
    title: 'एआई कंसीयर्ज',
    tagline: 'अपनी अगली प्रॉपर्टी यात्रा के बारे में कुछ भी पूछें।',
    heading: 'कहाँ से शुरू करें?',
    subtitle:
      'लिस्टिंग, इलाके, फाइनेंसिंग या कानूनी कदम पूछें — या नीचे से एक प्रॉम्प्ट चुनें।',
    prompts: [
      'दुबई मरीना में 2-बेड, AED 180k से कम',
      'ऑफ-प्लान विला खरीदने के कदम',
      'डाउनटाउन बनाम बिज़नेस बे ROI',
      '20% डाउन के साथ मॉर्गेज विकल्प',
    ],
    placeholder: 'अपना अगला सवाल पूछें…',
    openFullChat: 'पूरी कंसीयर्ज चैट खोलें',
    ready: 'तैयार',
    listening: 'सुन रहा है…',
    voiceOn: 'वॉइस चालू',
    askAria: 'एआई कंसीयर्ज से पूछें',
    sendAria: 'सवाल भेजें',
    greeting:
      'नमस्ते! मैं Property Nexus एआई कंसीयर्ज हूँ। इलाके, निवेश रिटर्न, या एजेंट/वकील सहयोग के बारे में पूछें।',
    panelSubtitle: 'लिस्टिंग, इलाके और फाइनेंसिंग के बारे में पूछें',
    thinking: 'सोच रहा हूँ...',
    chatPlaceholder: 'लिस्टिंग, फाइनेंसिंग या कानूनी प्रक्रिया पूछें...',
    errorContact: 'एआई से संपर्क नहीं हो पाया। थोड़ी देर बाद फिर कोशिश करें।',
  },
};

export function isConciergeLang(value: string | null | undefined): value is ConciergeLang {
  return value === 'en' || value === 'ar' || value === 'fr' || value === 'hi';
}

export function getConciergeCopy(lang: ConciergeLang): ConciergeCopy {
  return CONCIERGE_COPY[lang];
}

export function getSpeechLang(lang: ConciergeLang): string {
  return CONCIERGE_LANGS.find((item) => item.code === lang)?.speech ?? 'en-US';
}
