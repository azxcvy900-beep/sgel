import { rtdb } from './config';
import { ref, onValue, set, update, remove } from 'firebase/database';
import { INITIAL_COMPANIES, generateInitialProducts } from '../data/samplePricingData';

const LOCAL_STORAGE_KEY_PRODUCTS = 'pricing_hub_products_v1';
const LOCAL_STORAGE_KEY_COMPANIES = 'pricing_hub_companies_v1';
const LOCAL_STORAGE_KEY_SETTINGS = 'pricing_hub_settings_v1';

/**
 * Initialize default data into localStorage if empty
 */
export function getLocalFallbackData() {
  if (typeof window === 'undefined') {
    return {
      companies: INITIAL_COMPANIES,
      products: generateInitialProducts(),
      settings: { adminPin: '1234', centerName: 'مركز التوريدات والتسعير المعتمد' }
    };
  }

  let companies = null;
  let products = null;
  let settings = null;

  try {
    const rawC = localStorage.getItem(LOCAL_STORAGE_KEY_COMPANIES);
    if (rawC) companies = JSON.parse(rawC);
  } catch (e) {}

  try {
    const rawP = localStorage.getItem(LOCAL_STORAGE_KEY_PRODUCTS);
    if (rawP) products = JSON.parse(rawP);
  } catch (e) {}

  try {
    const rawS = localStorage.getItem(LOCAL_STORAGE_KEY_SETTINGS);
    if (rawS) settings = JSON.parse(rawS);
  } catch (e) {}

  if (!companies || !Array.isArray(companies) || companies.length === 0) {
    companies = INITIAL_COMPANIES;
    try { localStorage.setItem(LOCAL_STORAGE_KEY_COMPANIES, JSON.stringify(companies)); } catch (e) {}
  }

  if (!products || !Array.isArray(products) || products.length === 0) {
    products = generateInitialProducts();
    try { localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(products)); } catch (e) {}
  }

  if (!settings) {
    settings = { adminPin: '1234', centerName: 'مركز التوريدات والتسعير المعتمد' };
    try { localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings)); } catch (e) {}
  }

  return { companies, products, settings };
}

/**
 * Subscribe to Realtime Database updates.
 * If Firebase is unreachable or permissions are blocked, seamlessly falls back to LocalStorage
 * and periodically checks Firebase.
 */
export function subscribeToPricingSystem(callback) {
  let isUnsubscribed = false;
  let firebaseActive = false;

  // Immediately notify with local cache first for sub-second UI launch
  const initialData = getLocalFallbackData();
  callback({
    companies: initialData.companies,
    products: initialData.products,
    settings: initialData.settings,
    isSynced: false,
    source: 'cache'
  });

  try {
    const systemRef = ref(rtdb, 'pricing_hub');

    const unsubscribe = onValue(
      systemRef,
      (snapshot) => {
        if (isUnsubscribed) return;
        const val = snapshot.val();

        if (val && (val.products || val.companies)) {
          firebaseActive = true;
          // Normalize products array
          let productList = [];
          if (Array.isArray(val.products)) {
            productList = val.products.filter(Boolean);
          } else if (val.products && typeof val.products === 'object') {
            productList = Object.values(val.products);
          }

          let companyList = [];
          if (Array.isArray(val.companies)) {
            companyList = val.companies.filter(Boolean);
          } else if (val.companies && typeof val.companies === 'object') {
            companyList = Object.values(val.companies);
          }

          if (companyList.length === 0) companyList = INITIAL_COMPANIES;

          const merged = {
            companies: companyList,
            products: productList,
            settings: val.settings || initialData.settings,
            isSynced: true,
            source: 'firebase'
          };

          // Update local cache
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY_COMPANIES, JSON.stringify(companyList));
            localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(productList));
            if (val.settings) localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(val.settings));
          } catch (e) {}

          callback(merged);
        } else {
          // Firebase path is empty, push initial default data to Firebase!
          initializeCloudData(initialData);
        }
      },
      (error) => {
        // Permissions blocked or offline
        console.warn('Firebase RTDB subscription warning (using local sync engine):', error.message);
        callback({
          companies: initialData.companies,
          products: initialData.products,
          settings: initialData.settings,
          isSynced: false,
          source: 'local',
          error: error.message
        });
      }
    );

    return () => {
      isUnsubscribed = true;
      try { unsubscribe(); } catch (e) {}
    };
  } catch (err) {
    console.error('Firebase init error:', err);
    return () => {};
  }
}

/**
 * Initialize cloud database with seed products & companies
 */
async function initializeCloudData(seedData) {
  try {
    const systemRef = ref(rtdb, 'pricing_hub');
    const productsObj = {};
    seedData.products.forEach(p => {
      productsObj[p.id] = p;
    });

    await set(systemRef, {
      companies: seedData.companies,
      products: productsObj,
      settings: seedData.settings,
      lastUpdated: Date.now()
    });
  } catch (e) {
    // Permission denied until admin adjusts rules
  }
}

/**
 * Save / Update a single product in Realtime Database & Local Storage
 */
export async function saveProduct(product) {
  const updatedProduct = {
    ...product,
    updatedAt: Date.now()
  };

  // 1. Always update LocalStorage immediately for instant UI feedback
  if (typeof window !== 'undefined') {
    try {
      const current = getLocalFallbackData();
      const idx = current.products.findIndex(p => p.id === updatedProduct.id);
      let newProducts;
      if (idx >= 0) {
        newProducts = [...current.products];
        newProducts[idx] = updatedProduct;
      } else {
        newProducts = [updatedProduct, ...current.products];
      }
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(newProducts));
    } catch (e) {}
  }

  // 2. Sync to Firebase Realtime Database
  try {
    const prodRef = ref(rtdb, `pricing_hub/products/${updatedProduct.id}`);
    await set(prodRef, updatedProduct);
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false, warning: 'تم الحفظ محلياً (قواعد Firebase تحتاج تفعيل الإذن)' };
  }
}

/**
 * Batch update products (used after Excel Import or bulk edits)
 */
export async function saveMultipleProducts(newOrUpdatedProducts) {
  if (!Array.isArray(newOrUpdatedProducts) || newOrUpdatedProducts.length === 0) {
    return { success: true, count: 0 };
  }

  // 1. Update LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const current = getLocalFallbackData();
      const map = new Map();
      current.products.forEach(p => map.set(p.id, p));
      newOrUpdatedProducts.forEach(p => {
        map.set(p.id, { ...p, updatedAt: Date.now() });
      });
      const combined = Array.from(map.values());
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(combined));
    } catch (e) {}
  }

  // 2. Sync to Firebase
  try {
    const updates = {};
    newOrUpdatedProducts.forEach(p => {
      updates[`pricing_hub/products/${p.id}`] = {
        ...p,
        updatedAt: Date.now()
      };
    });
    await update(ref(rtdb), updates);
    return { success: true, syncedToCloud: true, count: newOrUpdatedProducts.length };
  } catch (err) {
    return { success: true, syncedToCloud: false, count: newOrUpdatedProducts.length, warning: 'تم الحفظ محلياً (يرجى مراجعة صلاحيات Firebase للربط السحابي)' };
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId) {
  if (typeof window !== 'undefined') {
    try {
      const current = getLocalFallbackData();
      const filtered = current.products.filter(p => p.id !== productId);
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(filtered));
    } catch (e) {}
  }

  try {
    const prodRef = ref(rtdb, `pricing_hub/products/${productId}`);
    await remove(prodRef);
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false };
  }
}

/**
 * Update companies list (e.g. rename companies)
 */
export async function saveCompanies(companies) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    } catch (e) {}
  }

  try {
    const compRef = ref(rtdb, 'pricing_hub/companies');
    await set(compRef, companies);
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false };
  }
}

/**
 * Update Settings (Center name, Admin PIN)
 */
export async function saveSettings(settings) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }

  try {
    const setRef = ref(rtdb, 'pricing_hub/settings');
    await set(setRef, settings);
    return { success: true, syncedToCloud: true };
  } catch (err) {
    return { success: true, syncedToCloud: false };
  }
}

/**
 * Restore sample dataset (100 products & 10 companies)
 */
export async function resetDatabaseToDefault() {
  const seed = {
    companies: INITIAL_COMPANIES,
    products: generateInitialProducts(),
    settings: { adminPin: '1234', centerName: 'مركز التوريدات والتسعير المعتمد' }
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_COMPANIES, JSON.stringify(seed.companies));
      localStorage.setItem(LOCAL_STORAGE_KEY_PRODUCTS, JSON.stringify(seed.products));
      localStorage.setItem(LOCAL_STORAGE_KEY_SETTINGS, JSON.stringify(seed.settings));
    } catch (e) {}
  }

  try {
    await initializeCloudData(seed);
    return { success: true, syncedToCloud: true };
  } catch (e) {
    return { success: true, syncedToCloud: false };
  }
}
