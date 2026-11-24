import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  Share2, 
  Check, 
  ArrowRight, 
  Calendar, 
  FileCheck, 
  User, 
  Coins, 
  Hash,
  Cloud,
  ExternalLink 
} from 'lucide-react';
import DocumentReceipt from './DocumentReceipt';
import { formatAmount } from '../utils/generators';

export default function VerificationView({ documentData, onBackToGenerator }) {
  const [copied, setCopied] = useState(false);
  const [pageSize, setPageSize] = useState('A5');

  if (!documentData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-xl text-center border border-rose-100">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Hash className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">تعذر العثور على الوثيقة</h2>
        <p className="text-slate-600 mb-6">
          لم يتم العثور على بيانات هذا الإيصال أو أن الرابط غير مكتمل. يرجى التأكد من مسح الرمز بشكل صحيح.
        </p>
        <button
          onClick={onBackToGenerator}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
        >
          العودة للرئيسية وإنشاء إيصال
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `إيصال دفع حقوق الطابع - ${documentData.firstName} ${documentData.lastName}`,
        text: `إيصال رسمي لدفع حقوق الطابع لنوع وثيقة: ${documentData.documentType}`,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="verification-container space-y-6 max-w-5xl mx-auto py-6 px-4">
      {/* بطاقة التحقق والتوثيق الرسمية */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden print-hide">
        <div className="absolute -left-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-right">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <ShieldCheck className="w-10 h-10 animate-pulse" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-1 border border-emerald-500/30">
                <Check className="w-3.5 h-3.5" />
                تم التحقق من صحة الإيصال الإلكتروني بنجاح
              </div>
              <h1 className="text-xl md:text-2xl font-black">
                إيصال دفع حقوق الطابع - وثيقة رسمية سارية
              </h1>
              <p className="text-emerald-100/80 text-sm mt-1">
                الجمهورية الجزائرية الديمقراطية الشعبية • وزارة المالية • المديرية العامة للضرائب
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            <button
              onClick={handlePrint}
              className="flex-1 md:flex-initial px-5 py-3 bg-white text-emerald-950 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <Printer className="w-4 h-4 text-emerald-700" />
              طباعة الإيصال ({pageSize.startsWith('A4') ? 'A4' : 'A5'})
            </button>
            <button
              onClick={handleShare}
              className="flex-1 md:flex-initial px-5 py-3 bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-700/60 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'تم النسخ!' : 'مشاركة الرابط'}
            </button>
            {documentData.cloudinaryUrl && (
              <a
                href={documentData.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial px-4 py-3 bg-sky-700 hover:bg-sky-800 text-white border border-sky-500/50 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <Cloud className="w-4 h-4 text-sky-200" />
                عرض على Cloudinary ↗
              </a>
            )}
          </div>
        </div>

        {/* بطاقات تلخيص سريعة */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-emerald-800/60 text-xs">
          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-300/80 block mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> المعني بالأمر:
            </span>
            <span className="font-bold text-sm text-white block truncate">
              {documentData.firstName} {documentData.lastName}
            </span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-300/80 block mb-1 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5" /> نوع الوثيقة:
            </span>
            <span className="font-bold text-sm text-white block truncate">
              {documentData.documentType}
            </span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-300/80 block mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> المبلغ المدفوع:
            </span>
            <span className="font-bold text-sm text-white font-mono block">
              {formatAmount(documentData.amount)} دج
            </span>
          </div>

          <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/40">
            <span className="text-emerald-300/80 block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> تاريخ الدفع:
            </span>
            <span className="font-bold text-xs text-white font-mono block truncate">
              {documentData.paymentDate}
            </span>
          </div>
        </div>
      </div>

      {/* شريط اختيار مقاس الورقة وزر العودة */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm print-hide">
        <button
          onClick={onBackToGenerator}
          className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 transition"
        >
          <ArrowRight className="w-4 h-4" />
          الرجوع إلى لوحة إنشاء وثيقة جديدة
        </button>

        {/* أزرار اختيار مقاس الورقة */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">مقاس الورقة:</span>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setPageSize('A5')}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                pageSize === 'A5'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              📄 A5 الأصلي
            </button>
            <button
              type="button"
              onClick={() => setPageSize('A4_DUAL')}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                pageSize === 'A4_DUAL'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="A4 بنسختين مع خط قص"
            >
              📑 A4 نسختين (أصل + مصلحة)
            </button>
            <button
              type="button"
              onClick={() => setPageSize('A4_LANDSCAPE')}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                pageSize === 'A4_LANDSCAPE'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🖼️ A4 أفقي موسع
            </button>
            <button
              type="button"
              onClick={() => setPageSize('A4_PORTRAIT')}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                pageSize === 'A4_PORTRAIT'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              📄 A4 عمودي
            </button>
          </div>
        </div>
      </div>

      {/* عرض الوثيقة الرسمية بهيئتها الأصلية الدقيقة */}
      <div className="document-preview-wrapper bg-slate-200/70 p-4 md:p-8 rounded-3xl border border-slate-300/60 shadow-inner flex justify-center items-center">
        <DocumentReceipt 
          documentData={documentData} 
          verificationUrl={window.location.href} 
          pageSize={pageSize}
        />
      </div>
    </div>
  );
}
