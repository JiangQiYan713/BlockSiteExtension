window.onload = function() {
  chrome.storage.sync.get(['redirectUrl', 'blockedSites'], function(result) {
    const redirectUrl = result.redirectUrl || 'about:blank';
    const blockedSites = result.blockedSites || [];

    const currentUrl = new URL(location.href);
    const currentHostname = currentUrl.hostname;

    if (blockedSites.some(site => currentHostname.includes(site))) {
      const newUrl = redirectUrl; 
      window.location.replace(newUrl);
    }
  });
};
