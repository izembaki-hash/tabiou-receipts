import React, { useState } from 'react';
import { X, Search, Trash2, ExternalLink, Printer, FileText, Calendar, Coins } from 'lucide-react';
import { formatAmount } from '../utils/generators';

export default function HistoryModal({ isOpen, onClose, receipts, onSelectReceipt, onDeleteReceipt }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredReceipts = (receipts || []).filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.firstName || '').toLowerCase().includes(term) ||
      (r.lastName || '').toLowerCase().includes(term) ||
      (r.documentType || '').toLowerCase().includes(term) ||
      (r.receiptNumber || '').toLowerCase().includes(term) ||
      (r.nin || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
        {/* الرأس */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">أرشيف الإيصالات الصادرة ({receipts?.length || 0})</h3>
              <p className="text-xs text-slate-500">سجل الإيصالات التي تم إنشاؤها للرجوع إليها أو فحصها أو إعادة طباعتها</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* شريط البحث */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="البحث بالاسم، اللقب، نوع الوثيقة، أو رقم الإيصال..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:border-emerald-500 outline-none"
          />
        </div>

        {/* قائمة الإيصالات */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredReceipts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              لا توجد إيصالات محفوظة مطابقة للبحث
            </div>
          ) : (
            filteredReceipts.map((rec) => (
              <div 
                key={rec.id || rec.receiptNumber}
                className="p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-200 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">
                      {rec.firstName} {rec.lastName}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                      {rec.documentType}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                    <span>رقم الإيصال: {rec.receiptNumber}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-sans">
                      <Coins className="w-3.5 h-3.5 text-emerald-600" />
                      {formatAmount(rec.amount)} دج
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-sans">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {rec.paymentDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onSelectReceipt(rec);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    معاينة وفحص
                  </button>
                  <button
                    onClick={() => onDeleteReceipt(rec.id, rec.firestoreId)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
