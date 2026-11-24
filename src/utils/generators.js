// مولد البيانات الافتراضية والرموز الرسمية الجزائرية

export const DOCUMENT_PRESETS = [
  { label: 'جواز السفر (28 صفحة)', price: 6000, value: 'جواز السفر' },
  { label: 'جواز السفر (48 صفحة)', price: 12000, value: 'جواز السفر 48 صفحة' },
  { label: 'جواز السفر المستعجل (28 صفحة)', price: 25000, value: 'جواز سفر مستعجل' },
  { label: 'بطاقة التعريف الوطنية البيومترية', price: 1000, value: 'بطاقة التعريف الوطنية' },
  { label: 'رخصة السياقة البيومترية', price: 2000, value: 'رخصة السياقة' },
  { label: 'بطاقة ترقيم المركبة (البطاقة الرمادية)', price: 3000, value: 'بطاقة ترقيم المركبة' },
  { label: 'مستخرج السجل التجاري', price: 4000, value: 'السجل التجاري' },
  { label: 'رخصة الصيد البري', price: 5000, value: 'رخصة الصيد' },
  { label: 'بطاقة الإقامة للأجانب', price: 10000, value: 'بطاقة إقامة' },
  { label: 'وثيقة أخرى مخصصة', price: 1000, value: 'وثيقة رسمية' }
];

export const POPULAR_AMOUNTS = [1000, 2000, 3000, 4000, 6000, 10000, 12000, 25000];

// توليد رقم تعريف وطني عشوائي من 18 رقماً
export function generateRandomNIN() {
  const currentYear = new Date().getFullYear();
  const birthYear = currentYear - Math.floor(Math.random() * 50 + 18);
  const prefix = Math.random() > 0.5 ? '1' : '2'; // 1 للذكور، 2 للإناث
  const mid = String(birthYear).slice(2) + String(Math.floor(Math.random() * 48 + 1)).padStart(2, '0');
  const randRest = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
  return (prefix + mid + randRest).slice(0, 18);
}

// توليد رقم إيصال فريد (يبدأ بحرف Q والسنة)
export function generateReceiptNumber() {
  const year = new Date().getFullYear();
  const serial = Math.floor(100000000 + Math.random() * 900000000);
  return `Q${year}000${serial}`.slice(0, 16);
}

// توليد رقم معاملة (20 حرفاً عشوائياً)
export function generateTransactionNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// توليد رقم طلب (10 خانات)
export function generateOrderNumber() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'Q';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// توليد رقم ترخيص بنكي / مالي (6 أرقام)
export function generateAuthNumber() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// تنسيق التاريخ والوقت وفق النمط الرسمي DD/MM/YYYY HH:MM:SS
export function formatCurrentDateTime(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const d = pad(date.getDate());
  const m = pad(date.getMonth() + 1);
  const y = date.getFullYear();
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
}

// تنسيق المبلغ بالدينار الجزائري: e.g. 1 000,00
export function formatAmount(value) {
  if (value === null || value === undefined || value === '') return '0,00';
  const num = typeof value === 'string' ? parseFloat(value.replace(/\s+/g, '').replace(',', '.')) : Number(value);
  if (isNaN(num)) return '0,00';
  
  const fixed = num.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  // فصل الآلاف بمسافات
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formattedInt},${decPart}`;
}

// تشفير بيانات الوثيقة في رابط QR آمن يعمل بدون إنترنت أو خادم (Offline Standalone Support)
export function encodeDocumentPayload(doc) {
  try {
    const compactObj = {
      n: doc.nin || '',
      q: doc.receiptNumber || '',
      t: doc.documentType || '',
      l: doc.lastName || '',
      f: doc.firstName || '',
      tx: doc.transactionNumber || '',
      o: doc.orderNumber || '',
      a: doc.authNumber || '',
      p: doc.amount || 0,
      d: doc.paymentDate || ''
    };
    const jsonStr = JSON.stringify(compactObj);
    return btoa(encodeURIComponent(jsonStr));
  } catch (err) {
    console.error('Error encoding doc payload', err);
    return '';
  }
}

// فك تشفير البيانات من الرابط
export function decodeDocumentPayload(encoded) {
  try {
    const jsonStr = decodeURIComponent(atob(encoded));
    const compactObj = JSON.parse(jsonStr);
    return {
      nin: compactObj.n,
      receiptNumber: compactObj.q,
      documentType: compactObj.t,
      lastName: compactObj.l,
      firstName: compactObj.f,
      transactionNumber: compactObj.tx,
      orderNumber: compactObj.o,
      authNumber: compactObj.a,
      amount: compactObj.p,
      paymentDate: compactObj.d,
      isVerified: true
    };
  } catch (err) {
    console.error('Error decoding doc payload', err);
    return null;
  }
}
