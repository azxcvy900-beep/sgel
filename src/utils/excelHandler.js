import * as XLSX from 'xlsx';

/**
 * Standardize Excel Import into application Product models.
 * Automatically maps company headers to company IDs.
 */
export async function parseExcelFile(file, existingCompanies) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const parsed = convertRowsToProducts(json, existingCompanies);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Parse plain text pasted from Excel or Google Sheets (Tab-separated)
 */
export function parsePastedText(text, existingCompanies) {
  if (!text || !text.trim()) return [];
  const lines = text.trim().split(/\r\n|\n|\r/);
  const rows = lines.map(line => line.split('\t').map(cell => cell.trim()));
  return convertRowsToProducts(rows, existingCompanies);
}

/**
 * Core transformer from raw matrix rows to clean Product objects
 */
function convertRowsToProducts(rows, existingCompanies) {
  if (!rows || rows.length < 2) return [];

  // First row is headers
  const headerRow = rows[0].map(h => String(h || '').trim());
  
  // Find standard column indexes
  let codeIdx = headerRow.findIndex(h => /كود|رقم القطعة|رمز|code|sku|part/i.test(h));
  let nameIdx = headerRow.findIndex(h => /اسم|المنتج|الصنف|name|item|product/i.test(h));
  let categoryIdx = headerRow.findIndex(h => /تصنيف|قسم|category|group/i.test(h));
  let unitIdx = headerRow.findIndex(h => /وحدة|unit/i.test(h));

  // Fallbacks if not explicitly named
  if (nameIdx === -1) nameIdx = 1;
  if (codeIdx === -1) codeIdx = 0;

  // Map each column to a company
  const companyColMap = [];
  headerRow.forEach((colName, colIdx) => {
    if (colIdx === codeIdx || colIdx === nameIdx || colIdx === categoryIdx || colIdx === unitIdx) {
      return;
    }
    // Match by company name or code or "شركة 1", "شركة 2"
    const matched = existingCompanies.find(c => 
      colName.includes(c.name) || 
      c.name.includes(colName) ||
      colName.includes(c.code) ||
      colName.toLowerCase() === c.id.toLowerCase()
    );

    if (matched) {
      companyColMap.push({ colIdx, companyId: matched.id, companyName: matched.name });
    } else {
      // Check if header says "شركة 1" or Company 1
      const numMatch = colName.match(/(\d+)/);
      if (numMatch) {
        const compIndex = parseInt(numMatch[1], 10) - 1;
        if (existingCompanies[compIndex]) {
          companyColMap.push({ 
            colIdx, 
            companyId: existingCompanies[compIndex].id, 
            companyName: existingCompanies[compIndex].name 
          });
        }
      }
    }
  });

  const products = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rawName = String(row[nameIdx] || '').trim();
    const rawCode = String(row[codeIdx] || '').trim();

    if (!rawName && !rawCode) continue;

    const prices = {};
    existingCompanies.forEach(c => { prices[c.id] = null; });

    companyColMap.forEach(map => {
      const rawVal = row[map.colIdx];
      if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
        const cleanNum = parseFloat(String(rawVal).replace(/[^\d.-]/g, ''));
        if (!isNaN(cleanNum) && cleanNum > 0) {
          prices[map.companyId] = cleanNum;
        } else {
          prices[map.companyId] = null; // Unpriced
        }
      } else {
        prices[map.companyId] = null; // Strict unpriced rule
      }
    });

    const id = rawCode ? `prod_${rawCode.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}` : `prod_${Date.now()}_${r}`;

    products.push({
      id,
      code: rawCode || `CODE-${r}`,
      name: rawName || `منتج رقم ${r}`,
      category: categoryIdx !== -1 && row[categoryIdx] ? String(row[categoryIdx]).trim() : 'عام',
      unit: unitIdx !== -1 && row[unitIdx] ? String(row[unitIdx]).trim() : 'حبة',
      prices,
      updatedAt: Date.now()
    });
  }

  return products;
}

/**
 * Export products database to an Excel (.xlsx) file
 */
export function exportProductsToExcel(products, companies, filename = 'قائمة_تسعير_المنتجات.xlsx') {
  const header = ['كود القطعة', 'اسم المنتج', 'التصنيف', 'الوحدة'];
  companies.forEach(c => {
    header.push(`${c.name} (${c.code || c.id})`);
  });

  const dataRows = products.map(p => {
    const row = [p.code || '', p.name || '', p.category || '', p.unit || 'حبة'];
    companies.forEach(c => {
      const price = p.prices ? p.prices[c.id] : null;
      row.push(price !== null && price !== undefined ? price : '');
    });
    return row;
  });

  const ws = XLSX.utils.aoa_to_sheet([header, ...dataRows]);

  // Set column widths
  ws['!cols'] = [
    { wch: 16 }, // كود
    { wch: 38 }, // اسم
    { wch: 18 }, // تصنيف
    { wch: 10 }, // وحدة
    ...companies.map(() => ({ wch: 22 })) // شركات
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'قوائم الأسعار');
  XLSX.writeFile(wb, filename);
}

/**
 * Generate starter template Excel file for new users
 */
export function downloadExcelTemplate(companies) {
  const sampleProducts = [
    {
      code: 'PRD-101',
      name: 'فحمات فرامل سيراميك',
      category: 'فرامل',
      unit: 'طقم',
      prices: { [companies[0]?.id]: 140, [companies[1]?.id]: 155 }
    },
    {
      code: 'PRD-102',
      name: 'فلتر زيت محرك أصلي',
      category: 'فلاتر',
      unit: 'حبة',
      prices: { [companies[0]?.id]: 35, [companies[1]?.id]: 40 }
    },
    {
      code: 'PRD-103',
      name: 'زيت محرك 5W-30 تخليقي',
      category: 'زيوت',
      unit: 'لتر',
      prices: { [companies[0]?.id]: 50 }
    }
  ];

  exportProductsToExcel(sampleProducts, companies, 'قالب_استيراد_الأسعار_النموذجي.xlsx');
}
