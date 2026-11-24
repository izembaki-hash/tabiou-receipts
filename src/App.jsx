import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Printer, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  ShieldCheck, 
  QrCode,
  Info,
  Smartphone,
  Cloud
} from 'lucide-react';
import Navbar from './components/Navbar';
import DocumentForm from './components/DocumentForm';
import DocumentReceipt from './components/DocumentReceipt';
import VerificationView from './components/VerificationView';
import HistoryModal from './components/HistoryModal';
import FirebaseModal from './components/FirebaseModal';
import CloudinaryModal from './components/CloudinaryModal';

import { 
  captureAndUploadToCloudinary, 
  getSavedCloudinaryConfig 
} from './services/cloudinary';

import { 
  saveReceipt, 
  saveReceiptLocally,
  getReceiptById, 
  getAllReceipts, 
  deleteReceipt, 
  isFirebaseReady 
} from './services/firebase';

import { 
  encodeDocumentPayload, 
  decodeDocumentPayload, 
  generateRandomNIN, 
  generateReceiptNumber, 
  generateTransactionNumber, 
  generateOrderNumber, 
  generateAuthNumber, 
  formatCurrentDateTime 
} from './utils/generators';

export default function App() {
  // الحالة الافتراضية للوثيقة
  const [currentDoc, setCurrentDoc] = useState({
    firstName: 'سالم',
    lastName: 'كران',
    documentType: 'جواز السفر',
    amount: 6000,
    nin: generateRandomNIN(),
    receiptNumber: generateReceiptNumber(),
    transactionNumber: generateTransactionNumber(),
    orderNumber: generateOrderNumber(),
    authNumber: generateAuthNumber(),
    paymentDate: formatCurrentDateTime()
  });

  const [verificationDoc, setVerificationDoc] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [isFirebaseActive, setIsFirebaseActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageSize, setPageSize] = useState('A5');

  // النوافذ المنبثقة
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [isCloudinaryModalOpen, setIsCloudinaryModalOpen] = useState(false);
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const receiptContainerRef = React.useRef(null);

  const handleUploadCloudinary = async () => {
    if (!receiptContainerRef.current) return;
    const targetEl = receiptContainerRef.current.querySelector('.receipt-a5-page') || receiptContainerRef.current;
    setIsUploadingCloudinary(true);
    try {
      const res = await captureAndUploadToCloudinary(targetEl, { receiptNumber: currentDoc.receiptNumber });
      setCurrentDoc((prev) => ({ ...prev, cloudinaryUrl: res.url }));
      alert(`تم رفع الوثيقة بنجاح إلى Cloudinary:\n${res.url}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  // حساب رابط التحقق الخاص بالـ QR Code للوثيقة الحالية
  const [customHost, setCustomHost] = useState('');
  const [qrDestination, setQrDestination] = useState('cloudinary'); // 'cloudinary' | 'cloudinary_download' | 'webapp'

  const getVerificationUrl = (docData) => {
    // 1. رابط Cloudinary المباشر (متاح دائماً 24/7 دون الحاجة لتشغيل السيرفر!)
    if (qrDestination === 'cloudinary' && docData.cloudinaryUrl) {
      return docData.cloudinaryUrl;
    }
    // 2. تحميل مباشر تلقائي للملف عند مسح الرمز من Cloudinary
    if (qrDestination === 'cloudinary_download' && docData.cloudinaryUrl) {
      return docData.cloudinaryUrl.replace('/upload/', '/upload/fl_attachment/');
    }

    // 3. رابط صفحة الفحص التفاعلية في المتصفح
    const payload = encodeDocumentPayload(docData);
    let baseUrl = `${window.location.origin}${window.location.pathname}`;
    
    // إذا قام المستخدم بتحديد عنوان IP المحلي (للمسح بكاميرا الهاتف عبر الواي فاي)
    if (customHost) {
      const cleanHost = customHost.replace(/\/+$/, '');
      baseUrl = `${cleanHost}${window.location.pathname}`;
    }

    if (docData.firestoreId) {
      return `${baseUrl}?id=${docData.firestoreId}`;
    }
    return `${baseUrl}?doc=${payload}`;
  };

  const currentQrUrl = getVerificationUrl(currentDoc);

  // تحميل البيانات والتحقق من الروابط عند فتح الصفحة
  useEffect(() => {
    checkUrlParams();
    refreshReceiptsList();
    setIsFirebaseActive(isFirebaseReady());
  }, []);

  // فحص معلمات الرابط URL (عند مسح رمز الـ QR)
  const checkUrlParams = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get('id');
    const docPayload = urlParams.get('doc');

    if (docId) {
      const fetched = await getReceiptById(docId);
      if (fetched) {
        setVerificationDoc(fetched);
        setIsVerifying(true);
        return;
      }
    }

    if (docPayload) {
      const decoded = decodeDocumentPayload(docPayload);
      if (decoded) {
        setVerificationDoc(decoded);
        setIsVerifying(true);
        return;
      }
    }
  };

  const refreshReceiptsList = async () => {
    const all = await getAllReceipts();
    setReceipts(all);
    setIsFirebaseActive(isFirebaseReady());
  };

  // عند إرسال النموذج لإنشاء إيصال
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const result = await saveReceipt(formData);
      let savedDoc = result.data;
      setCurrentDoc(savedDoc);
      await refreshReceiptsList();

      // تأثير احتفالي عند النجاح
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });

      // رفع تلقائي فوري لسحابة Cloudinary ليصبح الباركود دائماً 24/7 حتى لو أُطفئ السيرفر
      const cConfig = getSavedCloudinaryConfig();
      if (cConfig.autoUpload && receiptContainerRef.current) {
        setIsUploadingCloudinary(true);
        setTimeout(async () => {
          try {
            const targetEl = receiptContainerRef.current.querySelector('.receipt-a5-page') || receiptContainerRef.current;
            const uploadRes = await captureAndUploadToCloudinary(targetEl, { receiptNumber: savedDoc.receiptNumber });
            savedDoc = { ...savedDoc, cloudinaryUrl: uploadRes.url };
            setCurrentDoc(savedDoc);
            saveReceiptLocally(savedDoc);
          } catch (cErr) {
            console.warn('Auto Cloudinary upload warning:', cErr);
          } finally {
            setIsUploadingCloudinary(false);
          }
        }, 400);
      }
    } catch (err) {
      console.error('Error generating document:', err);
      setCurrentDoc(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // نسخ رابط التحقق
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentQrUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // محاكاة مسح الباركود وفتح صفحة الفحص
  const handleSimulateScan = () => {
    setVerificationDoc(currentDoc);
    setIsVerifying(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // العودة للرئيسية
  const handleBackToGenerator = () => {
    // مسح المعلمات من شريط العنوان بدون إعادة تحميل
    window.history.pushState({}, document.title, window.location.pathname);
    setIsVerifying(false);
    setVerificationDoc(null);
  };

  // حذف إيصال
  const handleDeleteReceipt = async (id, firestoreId) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الإيصال؟')) {
      await deleteReceipt(id, firestoreId);
      refreshReceiptsList();
    }
  };

  // معاينة إيصال من الأرشيف
  const handleSelectFromHistory = (receipt) => {
    setVerificationDoc(receipt);
    setIsVerifying(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar
        onNewReceipt={handleBackToGenerator}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenFirebase={() => setIsFirebaseModalOpen(true)}
        onOpenCloudinary={() => setIsCloudinaryModalOpen(true)}
        receiptsCount={receipts.length}
        isFirebaseActive={isFirebaseActive}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {isVerifying ? (
          /* ===================================================
             شاشة التحقق من الوثيقة (التي تظهر عند فحص الباركود)
             =================================================== */
          <VerificationView 
            documentData={verificationDoc}
            onBackToGenerator={handleBackToGenerator}
          />
        ) : (
          /* ===================================================
             الشاشة الرئيسية: إدخال البيانات + المعاينة المباشرة
             =================================================== */
          <div className="space-y-8">
            
            {/* لافتة ترحيبية وتوضيحية */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden print-hide">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-bold mb-3 border border-emerald-600/40">
                  <Sparkles className="w-3.5 h-3.5" /> نظام إنشاء إيصالات حقوق الطابع مع الباركود التفاعلي
                </div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2">
                  أنشئ إيصال دفع حقوق الطابع وافحصه فوراً بكاميرا الهاتف
                </h2>
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                  أدخل الإسم، اللقب، نوع الوثيقة والمبلغ. يتم إنشاء الوثيقة طبق الأصل بالمقاييس الرسمية A5 مع رمز استجابة سريعة QR. عند فحص الرمز بأي هاتف ذكي تظهر الوثيقة مع شارة التحقق الرسمية.
                </p>
              </div>

              {/* بطاقات ميزات سريعة */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-emerald-700/60 text-xs font-semibold">
                <div className="flex items-center gap-2 text-emerald-100">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>توليد باركود QR دقيق وتفاعلي</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-100">
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>طباعة A5 أفقية مطابقة 100%</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-100 col-span-2 sm:col-span-1">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>فحص مباشر من أي كاميرا هاتف</span>
                </div>
              </div>
            </div>

            {/* شبكة العمل: نموذج الإدخال يميناً، والمعاينة الحية يساراً */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* نموذج إدخال البيانات */}
              <div className="lg:col-span-5 print-hide">
                <DocumentForm
                  initialData={currentDoc}
                  onSubmit={handleFormSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>

              {/* المعاينة الحية للوثيقة المنشأة */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* شريط أدوات المعاينة واختيار مقاس الورقة A5 / A4 */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 print-hide">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-sm text-slate-800">المعاينة المباشرة للإيصال</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono">
                        {pageSize === 'A5' ? 'A5 (210×148 مم)' : pageSize === 'A4_DUAL' ? 'A4 نسختين' : pageSize === 'A4_LANDSCAPE' ? 'A4 أفقي كامل' : 'A4 عمودي'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.print()}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        title="طباعة الإيصال بالمقاس المحدد"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        طباعة الإيصال ({pageSize.startsWith('A4') ? 'A4' : 'A5'})
                      </button>

                      <button
                        onClick={handleSimulateScan}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                        title="محاكاة مسح الرمز وفتح صفحة الفحص الرسمية"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        تجربة فحص الباركود
                      </button>

                      <button
                        onClick={handleUploadCloudinary}
                        disabled={isUploadingCloudinary}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                        title="رفع صورة الإيصال سحابياً إلى Cloudinary (DOLA06)"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        {isUploadingCloudinary ? 'جاري الرفع...' : 'رفع لـ Cloudinary'}
                      </button>

                      <button
                        onClick={handleCopyLink}
                        className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                        title="نسخ رابط الفحص"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* أزرار اختيار مقاس الورقة (A5 / A4) */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-600">📐 مقاس الورقة للطباعة والمعاينة:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPageSize('A5')}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                          pageSize === 'A5'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        📄 A5 الأصلي (أفقي)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageSize('A4_DUAL')}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                          pageSize === 'A4_DUAL'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="طباعة نسختين في ورقة A4 واحدة: نسخة أصلية للمعني بالأمر + نسخة للمصلحة مع خط قص بالمنتصف"
                      >
                        📑 A4 نسختين (أصل + مصلحة)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageSize('A4_LANDSCAPE')}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                          pageSize === 'A4_LANDSCAPE'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="تكبير الإيصال ليملأ ورقة A4 كاملة بالعرض"
                      >
                        🖼️ A4 أفقي موسع (كامل)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPageSize('A4_PORTRAIT')}
                        className={`px-3 py-1.5 rounded-lg font-bold border transition ${
                          pageSize === 'A4_PORTRAIT'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                        title="ورقة A4 عمودية عادية مع خط قص"
                      >
                        📄 A4 عمودي
                      </button>
                    </div>
                  </div>
                </div>

                {/* وعاء الوثيقة مع التجاوب الدقيق */}
                <div ref={receiptContainerRef} className="bg-slate-300/60 p-4 sm:p-6 rounded-3xl border border-slate-300 shadow-inner flex flex-col justify-center items-center overflow-hidden gap-3">
                  <DocumentReceipt
                    documentData={currentDoc}
                    verificationUrl={currentQrUrl}
                    pageSize={pageSize}
                  />

                  {currentDoc.cloudinaryUrl && (
                    <div className="w-full p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-900 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <Cloud className="w-4 h-4 text-sky-600 shrink-0" />
                        <span className="font-semibold">الصورة على Cloudinary:</span>
                        <span className="font-mono text-[11px] truncate">{currentDoc.cloudinaryUrl}</span>
                      </div>
                      <a
                        href={currentDoc.cloudinaryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-sky-600 text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-sky-700 transition"
                      >
                        عرض الصورة ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* نصيحة للمستخدم حول كيفية فحص الباركود */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-3 print-hide">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>كيف تفحص الوثيقة وتظهر لك؟</strong>
                      <p className="mt-1">
                        1. <strong>فحص مباشر داخل التطبيق:</strong> انقر على زر <strong>"تجربة فحص الباركود"</strong> بالأعلى، وستفتح لك صفحة التحقق الرسمية للوثيقة مع شارة التوثيق فوراً.
                      </p>
                      <p className="mt-1">
                        2. <strong>فحص عبر كاميرا هاتفك المحمول (Wi-Fi):</strong> افتح كاميرا هاتفك ووجّهها نحو رمز QR في الوثيقة.
                      </p>
                    </div>
                  </div>

                  {/* خيار وجهة الرابط في الباركود */}
                  <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[12px] text-emerald-950 font-bold block">
                        ⚡ وجهة الرابط داخل رمز الـ QR:
                      </span>
                      <span className="text-[10px] text-emerald-700 block">
                        {qrDestination === 'cloudinary' 
                          ? '✅ متاح دائماً للأبد عبر سحابة Cloudinary حتى مع إطفاء الكمبيوتر والسيرفر' 
                          : qrDestination === 'cloudinary_download' 
                          ? '📥 يبدأ تحميل صورة الإيصال فوراً على هاتف الشخص بمجرد مسح الكود' 
                          : '🖥️ يفتح صفحة الفحص التفاعلية بالموقع'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQrDestination('cloudinary')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                          qrDestination === 'cloudinary'
                            ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                        title="رابط سحابي دائم 24/7 لا ينقطع أبداً حتى بعد إطفاء السيرفر"
                      >
                        ☁️ سحابة Cloudinary (دائم 24/7)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrDestination('cloudinary_download')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                          qrDestination === 'cloudinary_download'
                            ? 'bg-sky-700 text-white border-sky-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                        title="تحميل فوري وتلقائي لصورة الإيصال عند مسح الرمز"
                      >
                        📥 تحميل فوري عند المسح
                      </button>
                      <button
                        type="button"
                        onClick={() => setQrDestination('webapp')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                          qrDestination === 'webapp'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                        title="صفحة الفحص التفاعلية بالموقع"
                      >
                        🖥️ صفحة الفحص بالموقع
                      </button>
                    </div>
                  </div>

                  {/* خيار التبديل لعنوان الواي فاي المحلي للمسح بالهاتف */}
                  {qrDestination === 'webapp' && (
                    <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-emerald-800 font-medium">
                        📱 عنوان الشبكة لصفحة الفحص التفاعلية:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCustomHost('')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                            !customHost 
                              ? 'bg-emerald-700 text-white border-emerald-700' 
                              : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          الكمبيوتر (Localhost)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomHost('http://192.168.1.105:5173')}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                            customHost === 'http://192.168.1.105:5173'
                              ? 'bg-emerald-700 text-white border-emerald-700' 
                              : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                          }`}
                          title="استخدام عنوان الشبكة المحلية لكي يفتح الرابط على هاتفك عند مسح الرمز"
                        >
                          شبكة الهاتف (192.168.1.105:5173) 📶
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        )}
      </main>

      {/* نوافذ منبثقة */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        receipts={receipts}
        onSelectReceipt={handleSelectFromHistory}
        onDeleteReceipt={handleDeleteReceipt}
      />

      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
        onConfigSaved={refreshReceiptsList}
      />

      <CloudinaryModal
        isOpen={isCloudinaryModalOpen}
        onClose={() => setIsCloudinaryModalOpen(false)}
      />

      {/* تذييل الموقع */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 print-hide text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>
            الجمهورية الجزائرية الديمقراطية الشعبية • وزارة المالية • المديرية العامة للضرائب (DGI)
          </p>
          <p className="mt-1 text-slate-400">
            تطبيق إلكتروني متقدم لإنشاء والتحقق من إيصالات دفع حقوق الطابع مع رمز الاستجابة السريعة QR
          </p>
        </div>
      </footer>
    </div>
  );
}
