// خدمة الرفع والتخزين السحابي عبر Cloudinary
import html2canvas from 'html2canvas';

const STORAGE_KEY_CLOUDINARY = 'tabiou_cloudinary_config';

export function getSavedCloudinaryConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CLOUDINARY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // إذا كانت القيم القديمة معكوسة نقوم بتصحيحها تلقائياً
      if (parsed.cloudName === 'DOLA06' && parsed.uploadPreset === 'kwguggmd') {
        parsed.cloudName = 'kwguggmd';
        parsed.uploadPreset = 'DOLA06';
        saveCloudinaryConfig(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error reading saved cloudinary config', e);
  }

  return {
    cloudName: 'kwguggmd',
    uploadPreset: 'DOLA06',
    autoUpload: true // رفع تلقائي عند إنشاء الوثيقة
  };
}

export function saveCloudinaryConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_CLOUDINARY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save cloudinary config', e);
    return false;
  }
}

// التقاط صورة عالية الدقة للوثيقة ورفعها إلى Cloudinary
export async function captureAndUploadToCloudinary(receiptElement, metadata = {}) {
  const config = getSavedCloudinaryConfig();
  if (!config.cloudName || !config.uploadPreset) {
    throw new Error('يرجى تحديد Cloud Name و Upload Preset لـ Cloudinary');
  }

  // انتظار اكتمال تحميل الخطوط لضمان دقة الرسم
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  // 1. تحويل عنصر الوثيقة في الصفحة إلى صورة Canvas فائقة الدقة
  const canvas = await html2canvas(receiptElement, {
    scale: 2.5, // دقة عالية جداً للطباعة والقراءة الواضحة
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false
  });

  // تحويل الكانفاس إلى Blob لتجنب مشاكل حجم الـ Base64 في المتصفح
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));

  // 2. إرسال الصورة إلى واجهة Cloudinary API
  const formData = new FormData();
  formData.append('file', blob, `receipt_${metadata.receiptNumber || Date.now()}.png`);
  formData.append('upload_preset', config.uploadPreset);
  formData.append('folder', 'tabiou_receipts');
  
  if (metadata.receiptNumber) {
    formData.append('tags', `receipt,${metadata.receiptNumber}`);
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`;

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData
  });

  const result = await response.json();

  if (!response.ok) {
    const errorMsg = result?.error?.message || 'فشل الرفع إلى Cloudinary';
    throw new Error(`خطأ Cloudinary: ${errorMsg}`);
  }

  return {
    success: true,
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
    width: result.width,
    height: result.height,
    bytes: result.bytes
  };
}

// اختبار اتصال Cloudinary
export async function testCloudinaryConnection(cloudName = 'kwguggmd', uploadPreset = 'DOLA06') {
  const sampleSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="green"/></svg>';
  const blob = new Blob([sampleSvg], { type: 'image/svg+xml' });
  const formData = new FormData();
  formData.append('file', blob, 'test.svg');
  formData.append('upload_preset', uploadPreset);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const res = await fetch(endpoint, { method: 'POST', body: formData });
    const data = await res.json();
    if (res.ok) {
      return { success: true, message: `الاتصال بسحابة ${cloudName} والـ Preset (${uploadPreset}) يعمل بنجاح 100%! تم الرفع وتوليد الرابط السحابي.` };
    } else {
      return { success: false, message: data?.error?.message || 'فشل الاتصال' };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}
