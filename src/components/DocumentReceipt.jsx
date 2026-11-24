import React, { useRef, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatAmount } from '../utils/generators';
import { Scissors } from 'lucide-react';

// شعار المديرية العامة للضرائب مدمج مباشرة كـ SVG ذاتي الاكتفاء لضمان ظهوره في صور Cloudinary و Canvas
function DgiLogo() {
  return (
    <svg 
      viewBox="0 0 100 105" 
      fill="#111111" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      {/* الهلال السفلي */}
      <path d="M8.5 67.5 C10 92.5, 42 100, 51 99.8 C64 99.5, 92 90, 93 66.5 C90 85.5, 65 94, 51 94.2 C38 94.4, 13.5 86.5, 8.5 67.5 Z" />
      {/* القوس العمودي الأيسر مع العطفة السفلية والنقطة */}
      <path d="M43.2 7.2 C45.2 9.2, 44.8 14.5, 41.2 19.5 C35.5 27.5, 31.8 35.5, 33.2 43.2 C34.4 49.6, 40.5 53.5, 51.5 54.4 L56.8 54.8 C53.8 56.2, 45.2 56.2, 38.6 53.6 C32.0 50.8, 29.5 44.8, 30.2 36.8 C30.9 28.4, 35.8 20.4, 40.2 14.0 L38.0 13.0 L41.8 9.2 Z" />
      {/* النقطة فوق الضاد */}
      <circle cx="49.8" cy="51.2" r="2.1" />
      {/* حرف العين (يمين أعلى) */}
      <path d="M59.2 21.8 C55.4 18.6, 51.2 22.8, 50.4 27.6 C50.0 29.8, 52.8 31.4, 55.6 31.0 C58.4 30.6, 61.2 28.2, 62.0 26.8 C60.2 28.0, 56.8 28.2, 55.0 27.2 C53.8 26.5, 54.4 23.6, 56.6 23.0 C58.0 22.6, 59.0 23.4, 59.2 21.8 Z" />
      <path d="M55.2 29.8 C51.6 34.4, 49.4 41.5, 51.4 47.4 C53.6 53.6, 61.8 54.2, 67.6 47.2 C70.4 43.8, 72.2 39.8, 72.8 36.4 C70.8 40.8, 67.4 45.6, 63.2 47.6 C58.6 49.8, 54.6 48.2, 53.6 43.8 C52.8 39.8, 54.6 34.2, 57.6 30.6 Z" />
      {/* حرف الضاد المتشابك أسفل الوسط */}
      <path d="M48.5 39.2 C42.8 45.2, 36.5 54.8, 34.4 63.4 C32.6 70.6, 35.4 77.8, 41.2 79.4 C46.2 80.8, 50.2 76.2, 50.4 71.0 C53.8 72.2, 61.4 71.4, 65.2 66.8 C67.6 63.8, 66.6 59.6, 62.6 59.4 C57.8 59.2, 53.4 63.0, 51.8 66.8 C50.0 66.6, 48.0 65.8, 46.8 64.2 C46.4 66.2, 47.2 68.4, 48.8 69.8 C48.4 73.6, 45.4 76.2, 41.8 75.4 C37.8 74.5, 36.4 69.2, 37.6 63.2 C39.2 55.2, 44.6 46.2, 49.8 40.6 Z M54.8 66.8 C56.2 64.2, 59.4 62.4, 61.8 62.8 C63.4 63.1, 63.4 64.8, 61.8 66.2 C59.8 67.8, 56.6 67.6, 54.8 66.8 Z" />
    </svg>
  );
}

// عنصر الإيصال الفردي A5
function SingleA5Receipt({ documentData, qrLink, watermarkLabel = '', isA4Scaled = false }) {
  const {
    nin = '100070616008800008',
    receiptNumber = 'Q20260002511205',
    documentType = 'جواز السفر',
    lastName = 'دحمان البصري',
    firstName = 'سالم كران',
    transactionNumber = 'ug5q8KsvxBj3YMBAHIEP',
    orderNumber = 'QEK3ERcA8L',
    authNumber = '725430',
    amount = 1000,
    paymentDate = '19/11/2026 11:09:36'
  } = documentData || {};

  return (
    <div className={`receipt-a5-page ${isA4Scaled ? 'receipt-a4-scaled' : ''}`}>
      {/* شارة النسخة إذا وجدت (أصلية أو نسخة للمصلحة) */}
      {watermarkLabel && (
        <div className="receipt-watermark-tag">
          {watermarkLabel}
        </div>
      )}

      {/* الشعار الأيمن */}
      <div className="receipt-logo logo-right" aria-label="شعار المديرية العامة للضرائب">
        <DgiLogo />
      </div>

      {/* الشعار الأيسر */}
      <div className="receipt-logo logo-left" aria-label="شعار المديرية العامة للضرائب">
        <DgiLogo />
      </div>

      {/* الترويسة الوسطى */}
      <header className="header-text">
        <div>الجمهورية الجزائرية الديمقراطية الشعبية</div>
        <div>وزارة المالية</div>
        <div>المديرية العامة للضرائب</div>
      </header>

      {/* عنوان الإيصال */}
      <h1 className="doc-title">إيصال لدفع حقوق الطابع</h1>

      {/* جدول البيانات */}
      <table className="fields-table">
        <tbody>
          <tr>
            <td className="field-label">رقم التعريف الوطني:</td>
            <td className="field-value"><span className="val-code">{nin}</span></td>
          </tr>
          <tr>
            <td className="field-label">رقم الإيصال:</td>
            <td className="field-value"><span className="val-code">{receiptNumber}</span></td>
          </tr>
          <tr>
            <td className="field-label">نوع الوثيقة:</td>
            <td className="field-value"><span className="val-ar">{documentType}</span></td>
          </tr>
          <tr>
            <td className="field-label">اللقب:</td>
            <td className="field-value"><span className="val-ar">{lastName}</span></td>
          </tr>
          <tr>
            <td className="field-label">الإسم:</td>
            <td className="field-value"><span className="val-ar">{firstName}</span></td>
          </tr>
          <tr>
            <td className="field-label">رقم المعاملة:</td>
            <td className="field-value"><span className="val-code">{transactionNumber}</span></td>
          </tr>
          <tr>
            <td className="field-label">رقم الطلب:</td>
            <td className="field-value"><span className="val-code">{orderNumber}</span></td>
          </tr>
          <tr>
            <td className="field-label">رقم الترخيص:</td>
            <td className="field-value"><span className="val-code">{authNumber}</span></td>
          </tr>
          <tr>
            <td className="field-label">المبلغ:</td>
            <td className="field-value">
              <span className="val-code">{formatAmount(amount)}</span>
              <span className="amount-unit">دج</span>
            </td>
          </tr>
          <tr>
            <td className="field-label">تاريخ الدفع:</td>
            <td className="field-value"><span className="val-code">{paymentDate}</span></td>
          </tr>
        </tbody>
      </table>

      {/* رمز الاستجابة السريعة QR في الأسفل يساراً */}
      <div className="qr-wrapper" aria-label="رمز التحقق QR">
        <QRCodeSVG 
          value={qrLink}
          size={isA4Scaled ? 152 : 108}
          level="L"
          marginSize={0}
          bgColor="#ffffff"
          fgColor="#000000"
          style={{ width: '100%', height: '100%', display: 'block', shapeRendering: 'crispEdges' }}
        />
      </div>

      {/* التذييل */}
      <footer className="footer-text">
        وثيقة ممنوحة بطلب المعني بالأمر لإستعمالها في حدود ما يسمح به القانون
      </footer>
    </div>
  );
}

export default function DocumentReceipt({ 
  documentData, 
  verificationUrl, 
  pageSize = 'A5', 
  isPrintOnly = false 
}) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  // تحديث النمط الطباعي للورقة ديناميكياً
  useEffect(() => {
    let styleEl = document.getElementById('dynamic-paper-print-style');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-paper-print-style';
      document.head.appendChild(styleEl);
    }

    if (pageSize === 'A4_LANDSCAPE') {
      styleEl.textContent = `@media print { @page { size: A4 landscape; margin: 0; } }`;
    } else if (pageSize === 'A4_DUAL' || pageSize === 'A4_PORTRAIT') {
      styleEl.textContent = `@media print { @page { size: A4 portrait; margin: 0; } }`;
    } else {
      styleEl.textContent = `@media print { @page { size: A5 landscape; margin: 0; } }`;
    }
  }, [pageSize]);

  // حساب التكبير/التصغير التلقائي ليتناسب مع شاشة العرض
  useEffect(() => {
    if (isPrintOnly) return;
    function updateScale() {
      if (!containerRef.current) return;
      const parentWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
      
      let baseWidth = 794; // A5 (210mm)
      if (pageSize === 'A4_LANDSCAPE') {
        baseWidth = 1122; // A4 landscape (297mm)
      } else if (pageSize === 'A4_DUAL' || pageSize === 'A4_PORTRAIT') {
        baseWidth = 794; // A4 portrait width is 210mm
      }

      const padding = 32;
      const availableWidth = Math.min(parentWidth - padding, baseWidth);
      if (availableWidth < baseWidth) {
        setScale(Math.max(availableWidth / baseWidth, 0.35));
      } else {
        setScale(1);
      }
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [pageSize, isPrintOnly]);

  const qrLink = verificationUrl || window.location.href;

  // تحديد ارتفاع الصندوق حسب المقاس ونسبة المقياس
  const getContainerHeight = () => {
    if (isPrintOnly) {
      if (pageSize === 'A4_LANDSCAPE') return '210mm';
      if (pageSize === 'A4_DUAL' || pageSize === 'A4_PORTRAIT') return '297mm';
      return '148mm';
    }
    let heightMm = 148;
    if (pageSize === 'A4_LANDSCAPE') heightMm = 210;
    if (pageSize === 'A4_DUAL' || pageSize === 'A4_PORTRAIT') heightMm = 297;
    return `${heightMm * 3.78 * scale + 24}px`;
  };

  return (
    <div 
      ref={containerRef}
      className={`receipt-scale-wrapper flex justify-center items-center ${isPrintOnly ? 'print-only-target' : ''}`}
      style={{
        width: '100%',
        height: getContainerHeight(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* الحاوية المتكيفة حسب نوع الورقة */}
      <div 
        className="receipt-print-wrapper"
        style={{
          transform: isPrintOnly ? 'none' : `scale(${scale})`,
          transformOrigin: 'center center'
        }}
      >
        {/* الحالة 1: ورقة A5 الأصلية */}
        {pageSize === 'A5' && (
          <SingleA5Receipt 
            documentData={documentData} 
            qrLink={qrLink} 
          />
        )}

        {/* الحالة 2: ورقة A4 أفقي موسع (A4 Landscape Full) */}
        {pageSize === 'A4_LANDSCAPE' && (
          <div className="receipt-a4-landscape-page">
            <SingleA5Receipt 
              documentData={documentData} 
              qrLink={qrLink} 
              isA4Scaled={true} 
            />
          </div>
        )}

        {/* الحالة 3: ورقة A4 عمودية تحتوي على نسختين (أصل + نسخة للمصلحة) */}
        {pageSize === 'A4_DUAL' && (
          <div className="receipt-a4-portrait-page">
            {/* النسخة العلوية: الأصلية */}
            <SingleA5Receipt 
              documentData={documentData} 
              qrLink={qrLink} 
              watermarkLabel="نسخة أصلية - المعني بالأمر"
            />

            {/* خط القص الفاصل في منتصف ورقة A4 */}
            <div className="receipt-cut-line">
              <span className="cut-line-icon"><Scissors className="w-3.5 h-3.5" /></span>
              <span className="cut-line-text">خط قص الورقة (Couper suivant les pointillés)</span>
              <span className="cut-line-dashes" />
            </div>

            {/* النسخة السفلية: نسخة المصلحة */}
            <SingleA5Receipt 
              documentData={documentData} 
              qrLink={qrLink} 
              watermarkLabel="نسخة المصلحة الإدارية - للمراقبة والأرشيف"
            />
          </div>
        )}

        {/* الحالة 4: ورقة A4 عمودية نسخة واحدة مع مساحة فارغة وخط قص */}
        {pageSize === 'A4_PORTRAIT' && (
          <div className="receipt-a4-portrait-page single-mode">
            <SingleA5Receipt 
              documentData={documentData} 
              qrLink={qrLink} 
            />
            <div className="receipt-cut-line">
              <span className="cut-line-icon"><Scissors className="w-3.5 h-3.5" /></span>
              <span className="cut-line-text">خط قص الورقة بمقاس A5</span>
              <span className="cut-line-dashes" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
