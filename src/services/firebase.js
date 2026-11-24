// خدمات Firebase Firestore + التخزين المحلي الاحتياطي
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  doc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

// المفاتيح المخزنة محلياً أو من متغيرات البيئة
const STORAGE_KEY_FIREBASE = 'tabiou_firebase_config';
const STORAGE_KEY_LOCAL_RECEIPTS = 'tabiou_local_receipts';

export function getSavedFirebaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading saved firebase config', e);
  }
  
  if (import.meta.env.VITE_FIREBASE_API_KEY) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
    };
  }
  return null;
}

let appInstance = null;
let dbInstance = null;

export function initFirebase(customConfig = null) {
  const config = customConfig || getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (getApps().length === 0) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, db: dbInstance };
  } catch (err) {
    console.warn('Firebase init warning:', err);
    return null;
  }
}

export function saveFirebaseConfigToStorage(config) {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
    appInstance = null;
    dbInstance = null;
    return initFirebase(config);
  } catch (err) {
    console.error('Failed to save firebase config', err);
    return null;
  }
}

export function isFirebaseReady() {
  const { db } = getFirebaseInstances();
  return Boolean(db);
}

function getFirebaseInstances() {
  if (!dbInstance) {
    initFirebase();
  }
  return { app: appInstance, db: dbInstance };
}

// ========================
// حفظ واسترجاع الإيصالات
// ========================

// 1. حفظ في Firebase إذا كانت مهيأة، مع حفظ محلي دائم كنسخة احتياطية
export async function saveReceipt(receiptData) {
  const id = receiptData.id || ('rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
  const fullData = {
    ...receiptData,
    id,
    createdAt: new Date().toISOString()
  };

  // حفظ محلياً دائماً
  saveReceiptLocally(fullData);

  // إذا كانت Firebase متوفرة نقوم بالحفظ في Firestore
  const { db } = getFirebaseInstances();
  if (db) {
    try {
      const docRef = await addDoc(collection(db, 'receipts'), {
        ...fullData,
        firebaseTimestamp: serverTimestamp()
      });
      fullData.firestoreId = docRef.id;
      // تحديث المعرف
      saveReceiptLocally(fullData);
      return { success: true, id: docRef.id, mode: 'firebase', data: fullData };
    } catch (err) {
      console.warn('Firebase save failed, stored locally instead:', err);
      return { success: true, id: fullData.id, mode: 'local', data: fullData };
    }
  }

  return { success: true, id: fullData.id, mode: 'local', data: fullData };
}

// 2. جلب إيصال بواسطة المعرف (من Firebase أولاً ثم Local)
export async function getReceiptById(id) {
  if (!id) return null;

  const { db } = getFirebaseInstances();
  if (db) {
    try {
      const docSnap = await getDoc(doc(db, 'receipts', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
    } catch (err) {
      console.warn('Failed to fetch from firestore, checking local:', err);
    }
  }

  // البحث في التخزين المحلي
  const locals = getLocalReceipts();
  return locals.find((r) => r.id === id || r.firestoreId === id) || null;
}

// 3. جلب كل الإيصالات (مدمجة)
export async function getAllReceipts() {
  const localList = getLocalReceipts();
  const { db } = getFirebaseInstances();
  if (!db) {
    return localList;
  }

  try {
    const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const remoteList = [];
    querySnapshot.forEach((d) => {
      remoteList.push({ firestoreId: d.id, ...d.data() });
    });

    // دمج القائمتين مع إزالة التكرار
    const combined = [...remoteList];
    localList.forEach((local) => {
      if (!combined.some((item) => item.id === local.id || (local.firestoreId && item.firestoreId === local.firestoreId))) {
        combined.push(local);
      }
    });

    return combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (err) {
    console.warn('Error fetching all receipts from firestore:', err);
    return localList;
  }
}

// 4. حذف إيصال
export async function deleteReceipt(id, firestoreId = null) {
  deleteReceiptLocally(id);
  const targetFirestoreId = firestoreId || id;
  const { db } = getFirebaseInstances();
  if (db && targetFirestoreId) {
    try {
      await deleteDoc(doc(db, 'receipts', targetFirestoreId));
    } catch (e) {
      console.warn('Failed to delete from firestore', e);
    }
  }
  return true;
}

// ========================
// التخزين المحلي الاحتياطي
// ========================
export function getLocalReceipts() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LOCAL_RECEIPTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReceiptLocally(receipt) {
  try {
    const list = getLocalReceipts();
    const existingIndex = list.findIndex(r => r.id === receipt.id || (receipt.firestoreId && r.firestoreId === receipt.firestoreId));
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...receipt };
    } else {
      list.unshift(receipt);
    }
    // الاحتفاظ بآخر 100 إيصال
    const capped = list.slice(0, 100);
    localStorage.setItem(STORAGE_KEY_LOCAL_RECEIPTS, JSON.stringify(capped));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

export function deleteReceiptLocally(id) {
  try {
    const list = getLocalReceipts();
    const filtered = list.filter(r => r.id !== id && r.firestoreId !== id);
    localStorage.setItem(STORAGE_KEY_LOCAL_RECEIPTS, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete from local storage', e);
  }
}
