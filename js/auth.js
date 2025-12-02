(function () {
  'use strict';

  function byId(id) { return document.getElementById(id); }

  window.login = async function (email, password) {
    if (!validateEmail(email)) return alert('Invalid email.');
    if (!minLength(password, 6)) return alert('Password too short.');
    var res = await sb.auth.signInWithPassword({ email: email, password: password });
    if (res.error) return alert(res.error.message);
    window.location.href = 'tracker.html';  
  };

  window.register = async function (email, password) {
    if (!validateEmail(email)) return alert('Invalid email.');
    if (!minLength(password, 6)) return alert('Password too short (min 6).');
    var res = await sb.auth.signUp({ email: email, password: password });
    if (res.error) return alert(res.error.message);
    // If confirm emails are disabled in dev, session is active after sign-up
    window.location.href = 'tracker.html';  

  window.logout = async function () {
    try { await sb.auth.signOut(); } catch (e) { console.error(e); }
    window.location.href = 'index.html';  
  };

  // Optional: auto-wire forms if present
  document.addEventListener('DOMContentLoaded', function () {
    var loginForm = byId('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = loginForm.querySelector('[name="email"]').value;
        var password = loginForm.querySelector('[name="password"]').value;
        login(email, password);
      });
    }
    var regForm = byId('register-form');
    if (regForm) {
      regForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = regForm.querySelector('[name="email"]').value;
        var password = regForm.querySelector('[name="password"]').value;
        register(email, password);
      });
    }
  });
})();