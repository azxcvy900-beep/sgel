/**
 * Utility to trigger Payhip In-Page Modal Checkout
 */
export function openPayhipCheckout(payhipUrl) {
  if (typeof window === 'undefined') return;

  if (!payhipUrl) {
    alert('لم يتم تحديد رابط Payhip لهذه القضية بعد.');
    return;
  }

  // Ensure full URL
  let fullUrl = payhipUrl.trim();
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    fullUrl = `https://payhip.com/b/${fullUrl.replace(/^b\//, '')}`;
  }

  // Create temporary anchor to trigger Payhip overlay
  const link = document.createElement('a');
  link.href = fullUrl;
  link.className = 'payhip-buy-button';
  link.setAttribute('data-theme', 'none');
  link.style.display = 'none';
  document.body.appendChild(link);

  // If Payhip global script has initialized, click works immediately
  link.click();

  setTimeout(() => {
    try {
      document.body.removeChild(link);
    } catch (e) {}
  }, 1200);
}
