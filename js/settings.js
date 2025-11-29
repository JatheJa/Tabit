// js/settings.js
// Load/save user settings and apply UI (CSS vars)
(function () {
  'use strict';

  async function currentUserId() {
    var out = await sb.auth.getUser();
    return out && out.data && out.data.user ? out.data.user.id : null;
  }

  window.loadSettings = async function () {
    var r = await sb.from('user_settings').select('*').maybeSingle();
    if (r.error && r.status !== 406) { console.error(r.error); return null; }
    var data = r.data || null;

    if (data && data.tracker_color_preference) {
      document.documentElement.style.setProperty('--tracker-accent', data.tracker_color_preference);
    }
    // you can apply completion_style-specific UI here as well
    return data;
  };

  window.saveSettings = async function (patch) {
    var uid = await currentUserId();
    if (!uid) return alert('Not signed in.');
    patch = patch || {};
    patch.user_id = uid;

    var r = await sb.from('user_settings').upsert(patch, { onConflict: 'user_id' });
    if (r.error) { alert(r.error.message); return null; }
    // apply immediately if color changed
    if (patch.tracker_color_preference) {
      document.documentElement.style.setProperty('--tracker-accent', patch.tracker_color_preference);
    }
    return r.data && r.data[0];
  };
})();
