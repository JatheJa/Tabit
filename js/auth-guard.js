(function () {
  'use strict';
  
  // Check if user is logged in when page loads
  document.addEventListener('DOMContentLoaded', async function () {
    try {
      const { data: { session } } = await sb.auth.getSession();
      
      // If no session, redirect to login
      if (!session) {
        window.location.href = 'index.html';  
        return;
      }
      
      // Optional: Store user info for use in the page
      window.currentUser = session.user;
      
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = 'index.html'; 
    }
  });
})();