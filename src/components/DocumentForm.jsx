import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  CreditCard, 
  Coins, 
  Sparkles, 
  Shuffle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Hash, 
  CheckCircle2 
} from 'lucide-react';
import { 
  DOCUMENT_PRESETS, 
  POPULAR_AMOUNTS, 
  generateRandomNIN, 
  generateReceiptNumber, 
  generateTransactionNumber, 
  generateOrderNumber, 
  generateAuthNumber, 
  formatCurrentDateTime 
} from '../utils/generators';

export default function DocumentForm({ initialData, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || 'سالم',
    lastName: initialData?.lastName || 'كران',
    documentType: initialData?.documentType || 'جواز السفر',
    amount: initialData?.amount || 6000,
    nin: initialData?.nin || generateRandomNIN(),
    receiptNumber: initialData?.receiptNumber || generateReceiptNumber(),
    transactionNumber: initialData?.transactionNumber || generateTransactionNumber(),
    orderNumber: initialData?.orderNumber || generateOrderNumber(),
    authNumber: initialData?.authNumber || generateAuthNumber(),
    paymentDate: initialData?.paymentDate || formatCurrentDateTime()
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCustomDocType, setIsCustomDocType] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDocumentTypePreset = (preset) => {
    if (preset.value === 'custom') {
      setIsCustomDocType(true);
      return;
    }
    setIsCustomDocType(false);
    setFormData((prev) => ({
      ...prev,
      documentType: preset.value,
      amount: preset.price || prev.amount
    }));
  };

  const handleRandomizeAll = () => {
    setFormData((prev) => ({
      ...prev,
      nin: generateRandomNIN(),
      receiptNumber: generateReceiptNumber(),
      transactionNumber: generateTransactionNumber(),
      orderNumber: generateOrderNumber(),
      authNumber: generateAuthNumber(),
      paymentDate: formatCurrentDateTime()
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.documentType.trim()) {
      alert('يرجى ملء جميع الحقول الأساسية: الإسم، اللقب، ونوع الوثيقة.');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            بيانات الإيصال والمستفيد
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            أدخل المعلومات المطلوبة لإنشاء إيصال دفع حقوق الطابع مع رمز التحقق QR
          </p>
        </div>
        <button
          type="button"
          onClick={handleRandomizeAll}
          className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors font-medium"
          title="توليد أرقام ومعرفات عشوائية جديدة"
        >
          <Shuffle className="w-3.5 h-3.5 text-emerald-600" />
          توليد أرقام عشوائية
        </button>
      </div>

      {/* الحقول الأساسية المطلوبة: الإسم واللقب */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            الإسم الشخصي (Prénom) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="مثال: سالم"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-slate-800 font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            اللقب العائلي (Nom) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="مثال: كران"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-slate-800 font-medium"
          />
        </div>
      </div>

      {/* نوع الوثيقة */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" />
          نوع الوثيقة <span className="text-rose-500">*</span>
        </label>
        
        {/* أزرار سريعة لأنواع الوثائق الشائعة */}
        <div className="flex flex-wrap gap-2 mb-3">
          {DOCUMENT_PRESETS.slice(0, 6).map((preset) => {
            const isSelected = !isCustomDocType && formData.documentType === preset.value;
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => handleDocumentTypePreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsCustomDocType(true)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              isCustomDocType
                ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            + نوع آخر مخصص
          </button>
        </div>

        <input
          type="text"
          required
          value={formData.documentType}
          onChange={(e) => handleChange('documentType', e.target.value)}
          placeholder="مثال: جواز السفر، بطاقة التعريف، رخصة السياقة..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-slate-800 font-medium"
        />
      </div>

      {/* المبلغ / السعر */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <Coins className="w-4 h-4 text-emerald-600" />
          المبلغ المستحق (دج) <span className="text-rose-500">*</span>
        </label>

        {/* أزرار مبالغ مقترحة */}
        <div className="flex flex-wrap gap-2 mb-3">
          {POPULAR_AMOUNTS.map((amt) => {
            const isSelected = Number(formData.amount) === amt;
            return (
              <button
                key={amt}
                type="button"
                onClick={() => handleChange('amount', amt)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-mono ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {amt.toLocaleString('fr-DZ')} دج
              </button>
            );
          })}
        </div>

        <div className="relative">
          <input
            type="number"
            min="0"
            step="100"
            required
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            placeholder="مثال: 6000"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition text-slate-800 font-mono text-lg font-bold"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
            دينار جزائري (دج)
          </span>
        </div>
      </div>

      {/* قسم الإعدادات والتفاصيل المتقدمة */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between py-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          <span className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-emerald-600" />
            التفاصيل الرسمية المتقدمة (رقم التعريف، المعاملة، الترخيص، التاريخ...)
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4 text-sm animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  رقم التعريف الوطني (NIN - 18 رقماً)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.nin}
                    onChange={(e) => handleChange('nin', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('nin', generateRandomNIN())}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                    title="توليد عشوائي"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  رقم الإيصال (Numéro Quittance)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.receiptNumber}
                    onChange={(e) => handleChange('receiptNumber', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('receiptNumber', generateReceiptNumber())}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                    title="توليد عشوائي"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  رقم المعاملة (N° Transaction)
                </label>
                <input
                  type="text"
                  value={formData.transactionNumber}
                  onChange={(e) => handleChange('transactionNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  رقم الطلب (N° Commande)
                </label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => handleChange('orderNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  رقم الترخيص (N° Autorisation)
                </label>
                <input
                  type="text"
                  value={formData.authNumber}
                  onChange={(e) => handleChange('authNumber', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  تاريخ ووقت الدفع
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.paymentDate}
                    onChange={(e) => handleChange('paymentDate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleChange('paymentDate', formatCurrentDateTime())}
                    className="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100"
                    title="تحديث للوقت الحالي"
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* زر الإرسال وتوليد الوثيقة */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50"
      >
        <Sparkles className="w-5 h-5" />
        {isSubmitting ? 'جاري حفظ الوثيقة وتوليد الباركود...' : 'إنشاء الوثيقة وتوليد رمز QR الفوري'}
      </button>
    </form>
  );
}
