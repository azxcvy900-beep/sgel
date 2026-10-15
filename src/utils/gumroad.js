/**
 * Gumroad In-Page Modal Checkout Launcher
 * Uses ?wanted=true to display ONLY price and payment fields, skipping all product page fluff.
 */
export function openGumroadCheckout(gumroadUrl) {
  if (typeof window === 'undefined') return;
  if (!gumroadUrl) return;

  let cleanUrl = gumroadUrl.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // Append ?wanted=true to jump directly to the checkout modal (Email + Card/Apple Pay)
  try {
    const urlObj = new URL(cleanUrl);
    urlObj.searchParams.set('wanted', 'true');
    cleanUrl = urlObj.toString();
  } catch (e) {
    cleanUrl += cleanUrl.includes('?') ? '&wanted=true' : '?wanted=true';
  }

  // Create anchor to trigger Gumroad's official JS overlay
  const link = document.createElement('a');
  link.href = cleanUrl;
  link.className = 'gumroad-button';
  link.target = '_blank';
  link.style.display = 'none';
  document.body.appendChild(link);

  link.click();

  setTimeout(() => {
    try {
      document.body.removeChild(link);
    } catch (e) {}
  }, 1200);
}

/**
 * Universal payment launcher: detects Gumroad or Payhip automatically
 */
export function openExternalCheckout(url) {
  if (!url) return;
  if (url.includes('gumroad.com')) {
    openGumroadCheckout(url);
  } else {
    // Payhip
    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://payhip.com/b/${cleanUrl.replace(/^b\//, '')}`;
    }
    const link = document.createElement('a');
    link.href = cleanUrl;
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
}
