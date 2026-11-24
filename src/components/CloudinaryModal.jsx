import React, { useState } from 'react';
import { X, Cloud, Check, AlertCircle, Save, ExternalLink, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';
import { getSavedCloudinaryConfig, saveCloudinaryConfig, testCloudinaryConnection } from '../services/cloudinary';

export default function CloudinaryModal({ isOpen, onClose, onConfigSaved }) {
  const currentConfig = getSavedCloudinaryConfig();

  const [formData, setFormData] = useState({
    cloudName: currentConfig.cloudName || 'kwguggmd',
    uploadPreset: currentConfig.uploadPreset || 'DOLA06',
    autoUpload: currentConfig.autoUpload ?? true
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value.trim()
    }));
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testCloudinaryConnection(formData.cloudName, formData.uploadPreset);
      setTestResult(res);
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.cloudName || !formData.uploadPreset) {
      alert('يرجى إدخال Cloud Name و Upload Preset');
      return;
    }

    saveCloudinaryConfig(formData);
    onConfigSaved && onConfigSaved(formData);
    alert('تم حفظ إعدادات Cloudinary بنجاح!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-sky-50 rounded-xl text-sky-600 border border-sky-200">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">إعدادات سحابة Cloudinary</h3>
              <p className="text-xs text-slate-500">رفع وحفظ صور الإيصالات سحابياً مع روابط فحص دائمة</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* نتيجة الاختبار إن وجدت */}
        {testResult && (
          <div className={`mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 ${
            testResult.success 
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            {testResult.success ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="leading-relaxed">
              <strong>{testResult.success ? 'اتصال ناجح:' : 'تنبيه الاتصال:'}</strong> {testResult.message}
              {!testResult.success && testResult.message.includes('API key') && (
                <div className="mt-2 text-[11px] text-amber-800 font-normal bg-white/80 p-2.5 rounded-lg border border-amber-200">
                  💡 <strong>حل هذه الرسالة في دقيقة واحدة:</strong>
                  <br />
                  في لوحة تحكم Cloudinary الخاصة بك:
                  <br />
                  1. ادخل إلى <strong>Settings (أيقونة الترس)</strong> ⚙️ &gt; <strong>Upload</strong>.
                  <br />
                  2. انزل إلى <strong>Upload presets</strong> وابحث عن <strong>{formData.uploadPreset}</strong> واضغط <strong>Edit</strong>.
                  <br />
                  3. غيّر <strong>Signing Mode</strong> من <strong>Signed</strong> إلى <strong>Unsigned</strong> ثم اضغط <strong>Save</strong>.
                </div>
              )}
            </div>
          </div>
        )}

        {/* نموذج الإدخال */}
        <form onSubmit={handleSave} className="space-y-4 my-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 mb-1.5 font-bold">
              اسم السحابة (Cloud Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="cloudName"
              required
              value={formData.cloudName}
              onChange={handleChange}
              placeholder="مثال: kwguggmd"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1.5 font-bold">
              إعداد الرفع المسبق (Upload Preset) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="uploadPreset"
              required
              value={formData.uploadPreset}
              onChange={handleChange}
              placeholder="مثال: DOLA06"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:border-sky-500 outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              يجب أن يكون نمط الـ Preset مضبوطاً على <strong>Unsigned</strong> للسماح بالرفع المباشر من المتصفح بأمان.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-800 block">الرفع السحابي التلقائي إلى Cloudinary</span>
              <span className="text-[11px] text-slate-500 block">رفع صورة الإيصال تلقائياً فور توليدها وتضمين رابطها السحابي</span>
            </div>
            <input
              type="checkbox"
              name="autoUpload"
              checked={formData.autoUpload}
              onChange={handleChange}
              className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              disabled={isTesting}
              onClick={handleTest}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'جاري الاختبار...' : 'اختبار الاتصال'}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
