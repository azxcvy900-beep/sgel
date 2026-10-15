import { openGumroadCheckout } from './gumroad';

/**
 * Universal payment launcher: handles Gumroad and Payhip seamlessly
 */
export function openPayhipCheckout(url) {
  if (typeof window === 'undefined') return;

  if (!url) {
    alert('لم يتم تحديد رابط الدفع لهذه القضية بعد.');
    return;
  }

  // If Gumroad link, launch Gumroad direct minimalist checkout
  if (url.includes('gumroad.com')) {
    openGumroadCheckout(url);
    return;
  }

  // Payhip handling
  let fullUrl = url.trim();
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    fullUrl = `https://payhip.com/b/${fullUrl.replace(/^b\//, '')}`;
  }

  const link = document.createElement('a');
  link.href = fullUrl;
  link.className = 'payhip-buy-button';
  link.setAttribute('data-theme', 'none');
  link.style.display = 'none';
  document.body.appendChild(link);

  link.click();

  setTimeout(() => {
    try {
      document.body.removeChild(link);
    } catch (e) {}
  }, 1200);
}
