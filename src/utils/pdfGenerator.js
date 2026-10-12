import { jsPDF } from 'jspdf';

/**
 * Downloads the custom uploaded PDF/ZIP, opens cloud link, or falls back to generated PDF
 */
export function downloadCaseFile(item) {
  if (item.fileUrl) {
    window.open(item.fileUrl, '_blank');
    return;
  }
  if (item.fileData) {
    const link = document.createElement('a');
    link.href = item.fileData;
    link.download = item.fileName || `${item.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }
  generateCasePdf(item, true);
}

/**
 * Generates an authentic Detective Case File PDF
 * @param {Object} caseItem - The case dossier object
 * @param {boolean} includeSolution - Whether to include the sealed solution section
 */
export function generateCasePdf(caseItem, includeSolution = true) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper to add detective header
  const addHeader = (pageNum, totalPages = 3) => {
    // Dark header bar
    doc.setFillColor(25, 27, 34);
    doc.rect(0, 0, pageWidth, 22, 'F');

    // Red crime tape line
    doc.setFillColor(185, 28, 28);
    doc.rect(0, 22, pageWidth, 2, 'F');

    // Header text
    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(245, 158, 11);
    doc.text('SIJILL INVESTIGATION ARCHIVES // CLASSIFIED DOSSIER', 14, 12);

    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(`REF: ${caseItem.caseNumber} | CLASSIFICATION: ${caseItem.classification}`, 14, 18);

    doc.setFontSize(8);
    doc.text(`PAGE ${pageNum} OF ${totalPages}`, pageWidth - 35, 15);
  };

  // Helper to add detective footer
  const addFooter = () => {
    doc.setFillColor(25, 27, 34);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    doc.setFont('courier', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('CONFIDENTIAL - PROPERTY OF SIJILL DETECTIVE DIVISION. ALL RIGHTS RESERVED.', 14, pageHeight - 5);
  };

  // === PAGE 1: CASE OVERVIEW & CRIME SCENE ===
  addHeader(1);

  // Background aged tint
  doc.setFillColor(250, 248, 242);
  doc.rect(10, 30, pageWidth - 20, pageHeight - 48, 'F');
  doc.setDrawColor(212, 186, 128);
  doc.setLineWidth(0.5);
  doc.rect(10, 30, pageWidth - 20, pageHeight - 48, 'S');

  // Red Stamp: TOP SECRET / CONFIDENTIAL
  doc.setDrawColor(185, 28, 28);
  doc.setLineWidth(1);
  doc.rect(pageWidth - 65, 36, 50, 16, 'S');
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28);
  doc.text('CONFIDENTIAL', pageWidth - 60, 47);

  // Case Title
  doc.setFont('courier', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text(caseItem.title, 16, 44);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Subtitle: ${caseItem.subtitle}`, 16, 52);
  doc.text(`Difficulty: ${caseItem.difficulty} | Estimated Investigation: ${caseItem.estimatedSolveTime}`, 16, 58);

  // Divider
  doc.setDrawColor(180, 180, 180);
  doc.line(16, 64, pageWidth - 16, 64);

  // Crime Scene Incident Report
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28);
  doc.text('1. CRIME SCENE INCIDENT REPORT / تقرير الحادثة', 16, 74);

  doc.setFont('courier', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  const synopsisLines = doc.splitTextToSize(caseItem.synopsis, pageWidth - 36);
  doc.text(synopsisLines, 16, 82);

  let currentY = 82 + synopsisLines.length * 5 + 8;

  // Evidence Inventory
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28);
  doc.text('2. EVIDENCE INVENTORY / قائمة الأحراز والأدلة', 16, currentY);
  currentY += 8;

  doc.setFont('courier', 'normal');
  doc.setFontSize(9);
  caseItem.evidenceList.forEach((ev, idx) => {
    doc.setTextColor(20, 20, 20);
    doc.setFont('courier', 'bold');
    doc.text(`[EVIDENCE #${idx + 1}] ${ev.title}`, 18, currentY);
    currentY += 5;
    doc.setFont('courier', 'normal');
    doc.setTextColor(60, 60, 60);
    const evLines = doc.splitTextToSize(ev.description, pageWidth - 42);
    doc.text(evLines, 22, currentY);
    currentY += evLines.length * 4.5 + 4;
  });

  addFooter();

  // === PAGE 2: SUSPECTS & INVESTIGATIVE HINTS ===
  doc.addPage();
  addHeader(2);

  doc.setFillColor(250, 248, 242);
  doc.rect(10, 30, pageWidth - 20, pageHeight - 48, 'F');
  doc.setDrawColor(212, 186, 128);
  doc.setLineWidth(0.5);
  doc.rect(10, 30, pageWidth - 20, pageHeight - 48, 'S');

  // Suspects Header
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28);
  doc.text('3. SUSPECTS & ALIBIS / المشتبه بهم وإفادات الشهود', 16, 42);

  let suspectY = 50;
  caseItem.suspects.forEach((s) => {
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(`* ${s.name} (${s.role}) - Suspicion: ${s.suspicionScore}%`, 18, suspectY);
    suspectY += 5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 60, 60);
    doc.text(`- Alibi: ${s.alibi}`, 22, suspectY);
    suspectY += 5;
    doc.text(`- Motive: ${s.motive}`, 22, suspectY);
    suspectY += 8;
  });

  // Clues & Hints Section
  suspectY += 4;
  doc.setFont('courier', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(185, 28, 28);
  doc.text('4. GRADUATED INVESTIGATION CLUES / تلميحات التحقيق المتدرجة', 16, suspectY);
  suspectY += 8;

  doc.setFont('courier', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Warning: Read hints sequentially only if you are completely stuck.', 16, suspectY);
  suspectY += 7;

  caseItem.hints.forEach((h) => {
    doc.setFont('courier', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9); // Amber
    doc.text(`[LEVEL ${h.level}] ${h.title}`, 18, suspectY);
    suspectY += 5;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    const hintLines = doc.splitTextToSize(h.hint, pageWidth - 42);
    doc.text(hintLines, 22, suspectY);
    suspectY += hintLines.length * 4.5 + 4;
  });

  addFooter();

  // === PAGE 3: SEALED SOLUTION DOSSIER ===
  if (includeSolution) {
    doc.addPage();
    addHeader(3);

    // Darker classified style for solution page
    doc.setFillColor(242, 237, 224);
    doc.rect(10, 30, pageWidth - 20, pageHeight - 48, 'F');
    doc.setDrawColor(185, 28, 28);
    doc.setLineWidth(1);
    doc.rect(10, 30, pageWidth - 20, pageHeight - 48, 'S');

    // Warning Banner
    doc.setFillColor(185, 28, 28);
    doc.rect(14, 34, pageWidth - 28, 12, 'F');
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('*** OFFICIAL SOLUTION DOSSIER - BREAK SEAL ONLY AFTER SOLVING ***', 20, 42);

    let solY = 56;
    doc.setFont('courier', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(185, 28, 28);
    doc.text('THE VERDICT & THE CULPRIT / هوية الجاني والحل الرسمي', 16, solY);
    solY += 10;

    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(`Culprit / الجاني: ${caseItem.solution.culprit}`, 18, solY);
    solY += 7;

    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text(`Motive / الدافع: ${caseItem.solution.motive}`, 18, solY);
    solY += 8;

    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(185, 28, 28);
    doc.text('Execution Method / طريقة ارتكاب الجريمة:', 18, solY);
    solY += 6;

    doc.setFont('courier', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    const methodLines = doc.splitTextToSize(caseItem.solution.method, pageWidth - 42);
    doc.text(methodLines, 22, solY);
    solY += methodLines.length * 5 + 8;

    doc.setFont('courier', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(185, 28, 28);
    doc.text('Deduction Chain / خطوات الاستنتاج الجنائي:', 18, solY);
    solY += 6;

    doc.setFont('courier', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(50, 50, 50);
    caseItem.solution.deductionSteps.forEach((step) => {
      const stepLines = doc.splitTextToSize(step, pageWidth - 44);
      doc.text(stepLines, 22, solY);
      solY += stepLines.length * 4.5 + 3;
    });

    // Verification Seal Stamp
    doc.setDrawColor(22, 101, 52); // green seal
    doc.setLineWidth(0.8);
    doc.rect(pageWidth - 70, pageHeight - 40, 56, 18, 'S');
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(22, 101, 52);
    doc.text('CASE CLOSED', pageWidth - 64, pageHeight - 31);
    doc.setFontSize(7.5);
    doc.text('VERIFIED BY SIJILL HQ', pageWidth - 64, pageHeight - 26);

    addFooter();
  }

  // Save the PDF
  const filename = `${caseItem.caseNumber.replace(/[^a-zA-Z0-9-]/g, '_')}_Sijill_Dossier.pdf`;
  doc.save(filename);
}
