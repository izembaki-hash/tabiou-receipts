import React, { useState } from 'react';
import { X, Database, Check, AlertCircle, Save, ExternalLink, RefreshCw } from 'lucide-react';
import { getSavedFirebaseConfig, saveFirebaseConfigToStorage, isFirebaseReady } from '../services/firebase';

export default function FirebaseModal({ isOpen, onClose, onConfigSaved }) {
  const currentConfig = getSavedFirebaseConfig() || {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  };

  const [formData, setFormData] = useState(currentConfig);
  const [statusMessage, setStatusMessage] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.apiKey || !formData.projectId) {
      setStatusMessage({ type: 'error', text: 'يرجى إدخال apiKey و projectId على الأقل.' });
      return;
    }

    const result = saveFirebaseConfigToStorage(formData);
    if (result) {
      setStatusMessage({ type: 'success', text: 'تم حفظ وتهيئة اتصال Firebase بنجاح!' });
      setTimeout(() => {
        onConfigSaved && onConfigSaved();
        onClose();
      }, 1200);
    } else {
      setStatusMessage({ type: 'error', text: 'تعذر الاتصال بـ Firebase، يرجى مراجعة المفاتيح.' });
    }
  };

  const handleClear = () => {
    localStorage.removeItem('tabiou_firebase_config');
    setFormData({
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: ''
    });
    setStatusMessage({ type: 'info', text: 'تمت إزالة التهيئة، التطبيق يعمل الآن في الوضع المحلي المباشر.' });
    onConfigSaved && onConfigSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600 border border-amber-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">إعدادات سحابة Firebase Firestore</h3>
              <p className="text-xs text-slate-500">حفظ الإيصالات والتحقق منها سحابياً عبر قاعدة بيانات Firebase</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            statusMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {statusMessage.text}
          </div>
        )}

        <div className="my-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
          💡 <strong>ملاحظة هامة:</strong> التطبيق مصمم للعمل <strong>فورياً وتلقائياً</strong> بحفظ محلي وتشفير للباركود دون الحاجة الإلزامية لـ Firebase. إذا كنت ترغب بربط قاعدة بياناتك في Firestore، ألصق إعدادات Web App من لوحة Firebase Console أدناه.
        </div>

        <form onSubmit={handleSave} className="space-y-3.5 text-xs font-medium">
          <div>
            <label className="block text-slate-700 mb-1">API Key (apiKey) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleChange}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1">Project ID (projectId) <span className="text-rose-500">*</span></label>
            <input
              type="text"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              placeholder="my-project-id"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:border-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">Auth Domain</label>
              <input
                type="text"
                name="authDomain"
                value={formData.authDomain}
                onChange={handleChange}
                placeholder="project.firebaseapp.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">Storage Bucket</label>
              <input
                type="text"
                name="storageBucket"
                value={formData.storageBucket}
                onChange={handleChange}
                placeholder="project.appspot.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 mb-1">Messaging Sender ID</label>
              <input
                type="text"
                name="messagingSenderId"
                value={formData.messagingSenderId}
                onChange={handleChange}
                placeholder="1234567890"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-700 mb-1">App ID</label>
              <input
                type="text"
                name="appId"
                value={formData.appId}
                onChange={handleChange}
                placeholder="1:1234567890:web:abcdef"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-xs focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-100 gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-slate-500 hover:text-rose-600 transition"
            >
              إلغاء التهيئة (الوضع المحلي)
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
              >
                إغلاق
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md"
              >
                <Save className="w-4 h-4" />
                حفظ الاتصال
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
