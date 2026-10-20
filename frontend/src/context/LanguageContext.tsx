import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'si' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.insights': 'Smart Insights',
    'nav.forecasts': 'Demand Forecasts',
    'nav.events': 'Weather & Events',
    'nav.recommendations': 'Order Recommendations',
    'nav.alerts': 'Expiry & Salvage',
    'nav.donations': 'Surplus Donations',
    'nav.sustainability': 'Sustainability',
    'nav.outlets': 'Outlets & Branches',
    'nav.suppliers': 'Supplier Network',
    'nav.recipes': 'Recipe BOM Explosion',
    'nav.quick_log': 'Quick Waste Log',
    'nav.margins': 'Profit & Margins',
    'nav.goals': 'Waste Targets',
    'nav.reports': 'Waste Reports',
    'nav.upload': 'Data Upload',
    'nav.settings': 'Settings',

    // KPIs
    'kpi.waste_pct': 'Food Waste %',
    'kpi.waste_cost': 'Cost of Waste',
    'kpi.accuracy': 'Forecast Accuracy',
    'kpi.savings': 'Estimated Cost Savings',
    'kpi.expiring': 'Items Expiring Soon',
    'kpi.co2': 'Estimated CO2 Avoided',

    // Actions
    'action.load_sample': 'Load Sample Data',
    'action.download_pdf': 'Download Audit PDF',
    'action.log_waste': 'Log Waste',
    'action.apply': 'Apply Recommendation',
    'action.dismiss': 'Dismiss',
    'action.tour': 'Start Demo Pitch Tour',
  },
  si: {
    // Nav
    'nav.dashboard': 'ප්‍රධාන පුවරුව (Dashboard)',
    'nav.insights': 'ස්මාර්ට් විදසුන් (Insights)',
    'nav.forecasts': 'ඉල්ලුම අනාවැකි (Forecasts)',
    'nav.events': 'කාලගුණය සහ උත්සව (Events)',
    'nav.recommendations': 'ඇණවුම් නිර්දේශ (Orders)',
    'nav.alerts': 'කල් ඉකුත්වීම් (Alerts)',
    'nav.donations': 'ආහාර පරිත්‍යාග (Donations)',
    'nav.sustainability': 'තිරසාරභාවය (Sustainability)',
    'nav.outlets': 'ශාඛා කළමනාකරණය (Outlets)',
    'nav.suppliers': 'සැපයුම්කරුවන් (Suppliers)',
    'nav.recipes': 'වට්ටෝරු සහ අමුද්‍රව්‍ය (Recipes)',
    'nav.quick_log': 'ඉක්මන් අපතේ සටහන (Quick Log)',
    'nav.margins': 'ලාභ සහ ආන්තික (Margins)',
    'nav.goals': 'අපතේ යාම් ඉලක්ක (Goals)',
    'nav.reports': 'වාර්තා සහ විගණන (Reports)',
    'nav.upload': 'දත්ත උඩුගත කිරීම (Upload)',
    'nav.settings': 'සැකසුම් (Settings)',

    // KPIs
    'kpi.waste_pct': 'ආහාර නාස්ති ප්‍රතිශතය',
    'kpi.waste_cost': 'නාස්ති වූ මුළු පිරිවැය',
    'kpi.accuracy': 'අනාවැකි නිවැරදිතාවය',
    'kpi.savings': 'ඇස්තමේන්තුගත ඉතිරිය',
    'kpi.expiring': 'කල් ඉකුත්වන ද්‍රව්‍ය',
    'kpi.co2': 'වළක්වාගත් කාබන් විමෝචනය',

    // Actions
    'action.load_sample': 'නියැදි දත්ත පූරණය',
    'action.download_pdf': 'PDF විගණනය බාගන්න',
    'action.log_waste': 'අපතේ යාම් සටහන් කරන්න',
    'action.apply': 'නිර්දේශය ක්‍රියාත්මක කරන්න',
    'action.dismiss': 'ඉවත් කරන්න',
    'action.tour': 'ප්‍රදර්ශන චාරිකාව අරඹන්න',
  },
  ta: {
    // Nav
    'nav.dashboard': 'முகப்பு பலகை (Dashboard)',
    'nav.insights': 'நுண்ணறிவுகள் (Insights)',
    'nav.forecasts': 'தேவை முன்னறிவிப்பு (Forecasts)',
    'nav.events': 'வானிலை & நிகழ்வுகள் (Events)',
    'nav.recommendations': 'கொள்முதல் பரிந்துரை (Orders)',
    'nav.alerts': 'காலாவதி எச்சரிக்கைகள் (Alerts)',
    'nav.donations': 'உணவு நன்கொடை (Donations)',
    'nav.sustainability': 'நிலையான தன்மை (Sustainability)',
    'nav.outlets': 'கிளைகள் (Outlets)',
    'nav.suppliers': 'விற்பனையாளர்கள் (Suppliers)',
    'nav.recipes': 'சமையல் குறிப்புகள் (Recipes)',
    'nav.quick_log': 'விரைவு விரய பதிவு (Quick Log)',
    'nav.margins': 'இலாப விகிதங்கள் (Margins)',
    'nav.goals': 'விரய இலக்குகள் (Goals)',
    'nav.reports': 'விரய அறிக்கைகள் (Reports)',
    'nav.upload': 'தரவு பதிவேற்றம் (Upload)',
    'nav.settings': 'அமைப்புகள் (Settings)',

    // KPIs
    'kpi.waste_pct': 'உணவு விரய வீதம்',
    'kpi.waste_cost': 'விரயமான மொத்த செலவு',
    'kpi.accuracy': 'முன்னறிவிப்பு துல்லியம்',
    'kpi.savings': 'மதிப்பிடப்பட்ட சேமிப்பு',
    'kpi.expiring': 'விரைவில் காலாவதியாகும் பொருட்கள்',
    'kpi.co2': 'தவிர்க்கப்பட்ட CO2 உமிழ்வு',

    // Actions
    'action.load_sample': 'மாதிரி தரவை ஏற்றுக',
    'action.download_pdf': 'PDF அறிக்கையை பதிவிறக்குக',
    'action.log_waste': 'விரயத்தை பதிவு செய்க',
    'action.apply': 'பரிந்துரையை செயல்படுத்து',
    'action.dismiss': 'நிராகரி',
    'action.tour': 'விளக்க உரை சுற்றுப்பயணம்',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('foodsense_lang') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('foodsense_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
