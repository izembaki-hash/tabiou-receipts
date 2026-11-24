import React from 'react';
import { FileText, Database, History, PlusCircle, CheckCircle2, Cloud } from 'lucide-react';

export default function Navbar({ 
  onNewReceipt, 
  onOpenHistory, 
  onOpenFirebase, 
  onOpenCloudinary,
  receiptsCount = 0,
  isFirebaseActive = false,
  isCloudinaryConfigured = true
}) {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-sm print-hide">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* الشعار والعنوان */}
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={onNewReceipt}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/15 shrink-0">
              {/* شعار مصغر أنيق */}
              <svg viewBox="0 0 100 105" className="w-8 h-8 fill-white">
                <path d="M8.5 67.5 C10 92.5, 42 100, 51 99.8 C64 99.5, 92 90, 93 66.5 C90 85.5, 65 94, 51 94.2 C38 94.4, 13.5 86.5, 8.5 67.5 Z"/>
                <path d="M43.2 7.2 C45.2 9.2, 44.8 14.5, 41.2 19.5 C35.5 27.5, 31.8 35.5, 33.2 43.2 C34.4 49.6, 40.5 53.5, 51.5 54.4 L56.8 54.8 C53.8 56.2, 45.2 56.2, 38.6 53.6 C32.0 50.8, 29.5 44.8, 30.2 36.8 C30.9 28.4, 35.8 20.4, 40.2 14.0 L38.0 13.0 L41.8 9.2 Z"/>
                <circle cx="49.8" cy="51.2" r="2.1"/>
                <path d="M59.2 21.8 C55.4 18.6, 51.2 22.8, 50.4 27.6 C50.0 29.8, 52.8 31.4, 55.6 31.0 C58.4 30.6, 61.2 28.2, 62.0 26.8 C60.2 28.0, 56.8 28.2, 55.0 27.2 C53.8 26.5, 54.4 23.6, 56.6 23.0 C58.0 22.6, 59.0 23.4, 59.2 21.8 Z"/>
                <path d="M55.2 29.8 C51.6 34.4, 49.4 41.5, 51.4 47.4 C53.6 53.6, 61.8 54.2, 67.6 47.2 C70.4 43.8, 72.2 39.8, 72.8 36.4 C70.8 40.8, 67.4 45.6, 63.2 47.6 C58.6 49.8, 54.6 48.2, 53.6 43.8 C52.8 39.8, 54.6 34.2, 57.6 30.6 Z"/>
              </svg>
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">
                الجمهورية الجزائرية الديمقراطية الشعبية • وزارة المالية
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-800 leading-tight">
                بوابة إيصالات دفع حقوق الطابع (DGI)
              </h1>
            </div>
          </div>

          {/* أزرار التحكم والتنقل */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onNewReceipt}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition shadow-sm shadow-emerald-700/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">إنشاء إيصال</span>
            </button>

            <button
              onClick={onOpenHistory}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition"
              title="سجل الإيصالات"
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">الأرشيف</span>
              {receiptsCount > 0 && (
                <span className="bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {receiptsCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenCloudinary}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100 flex items-center gap-1.5 transition"
              title="إعدادات Cloudinary (DOLA06)"
            >
              <Cloud className="w-4 h-4 text-sky-600" />
              <span className="hidden lg:inline">Cloudinary</span>
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            </button>

            <button
              onClick={onOpenFirebase}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border flex items-center gap-1.5 transition ${
                isFirebaseActive 
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title="إعدادات قاعدة بيانات Firebase"
            >
              <Database className="w-4 h-4 text-amber-600" />
              <span className="hidden lg:inline">Firebase</span>
              <span className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
