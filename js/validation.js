(function () {
  'use strict';

  window.validateEmail = function (email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email || '').toLowerCase());
  };

  window.minLength = function (value, n) {
    return (value || '').trim().length >= (n || 0);
  };

  // Ensure named fields are non-empty. Returns { ok, errors }
  window.requireFields = function (formEl, fieldNames) {
    var errors = [];
    for (var i = 0; i < fieldNames.length; i++) {
      var name = fieldNames[i];
      var el = formEl.querySelector('[name="' + name + '"]');
      if (!el || !el.value || !el.value.trim()) {
        errors.push(name);
      }
    }
    return { ok: errors.length === 0, errors: errors };
  };
})(); 