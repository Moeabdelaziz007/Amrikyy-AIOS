import React, { useState, useEffect } from 'react';
import { generateDocsSummary } from '../../services/geminiAdvancedService.ts';
import { useLanguage } from '../../contexts/LanguageContext.tsx';
import { SearchIcon, SparklesIcon, GlobeIcon } from '../Icons.tsx';

interface DocApp {
    id: string;
    name: Record<string, string>;
    description: Record<string, string>;
    how_to_use?: Record<string, string>;
}

export default function DocsViewerApp() {
  const { language, setLanguage } = useLanguage();
  const [docs, setDocs] = useState<DocApp[]>([]);
  const [query, setQuery] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/docs/amrikyy-os-docs.json")
      .then((res) => res.json())
      .then((data) => {
        const apps = data.documentation.apps || [];
        setDocs(apps);
      });
  }, []);

  const filtered = docs.filter((app) => {
    const name = app.name?.[language] || "";
    const desc = app.description?.[language] || "";
    return (
      name.toLowerCase().includes(query.toLowerCase()) ||
      desc.toLowerCase().includes(query.toLowerCase())
    );
  });

  async function generateAISummary() {
    if (!query) return;
    setIsLoading(true);
    setAiSummary("");
    try {
      const text = await generateDocsSummary(query, language);
      setAiSummary(text);
    } catch (error: any) {
      console.error("AI Error:", error);
      setAiSummary(language === "ar" ? "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي." : "AI request failed.");
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="h-full w-full bg-gradient-to-br from-bg-tertiary via-bg-secondary to-bg-tertiary text-white p-6 overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div
          className="flex items-center justify-between mb-10 border-b border-neutral-800 pb-4 animate-fade-in"
        >
          <h1 className="text-4xl font-extrabold text-lime-400 tracking-tight flex items-center gap-2">
            Amrikyy OS Docs <SparklesIcon className="text-lime-400 animate-pulse" />
          </h1>
          <div className="flex items-center gap-2">
            <GlobeIcon className="text-lime-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
              className="bg-bg-primary border border-border-color text-white rounded-xl px-4 py-2 hover:border-lime-400 transition"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div >

        {/* Search + AI */}
        <div className="relative mb-10 flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={language === "ar" ? "🔍 ابحث أو اطلب من الذكاء الاصطناعي..." : "🔍 Search or ask AI..."}
              className="w-full bg-bg-primary border border-border-color rounded-xl pl-12 pr-4 py-3 text-white focus:border-lime-400 focus:outline-none shadow-md"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateAISummary()}
            />
          </div>
          <button
            onClick={generateAISummary}
            disabled={isLoading}
            className="px-5 py-3 rounded-xl bg-lime-400 text-black font-bold hover:opacity-90 transition disabled:opacity-50"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
                language === "ar" ? "ذكاء" : "AI"
            )}
          </button>
        </div>

        {/* AI Summary */}
        {aiSummary && (
          <div
            className="bg-bg-primary border border-lime-400/40 rounded-2xl p-6 mb-10 text-gray-200 shadow-inner animate-fade-in"
          >
            <h3 className="text-lime-400 font-semibold mb-2 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5"/> {language === "ar" ? " تحليل الذكاء الاصطناعي:" : " AI Insight:"}
            </h3>
            <p className="leading-relaxed whitespace-pre-line">{aiSummary}</p>
          </div >
        )}

        {/* Docs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.length === 0 && !isLoading ? (
            <p className="text-center text-gray-500 col-span-full">
              {language === "ar" ? "لم يتم العثور على نتائج." : "No results found."}
            </p>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                className="bg-bg-primary border border-border-color rounded-2xl p-6 shadow-lg backdrop-blur-md transition-all duration-300 hover:border-lime-400 hover:scale-105"
              >
                <h2 className="text-2xl font-semibold text-lime-400 mb-3">
                  {app.name?.[language] || "—"}
                </h2>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                  {app.description?.[language] || (language === "ar" ? "لا يوجد وصف متاح." : "No description available.")}
                </p>
                {app.how_to_use?.[language] && (
                  <details className="text-sm text-gray-400 cursor-pointer border-t border-border-color pt-2">
                    <summary className="hover:text-lime-400 font-medium">
                      {language === "ar" ? "🧭 كيفية الاستخدام" : "🧭 How to Use"}
                    </summary>
                    <p className="mt-3 leading-relaxed">{app.how_to_use[language]}</p>
                  </details>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}