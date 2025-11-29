(function () {
  'use strict';

  window.requireAuth = async function requireAuth() {
    try {
      var res = await sb.auth.getSession();
      if (!res || !res.data || !res.data.session) {
        window.location.href = '/index.html';
      }
    } catch (e) {
      console.error(e);
      window.location.href = '/index.html';
    }
  };

  // Auto-bounce if user signs out while on a protected page
  if (window.sb) {
    sb.auth.onAuthStateChange(function (_event, session) {
      var protectedPaths = ['/home.html','/tracker.html','/journal.html','/tips.html','/settings.html'];
      if (!session && protectedPaths.indexOf(window.location.pathname) !== -1) {
        window.location.href = '/index.html';
      }
    });
  }
})();