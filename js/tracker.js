// js/tracker.js
// Habits CRUD, icon picker (default + user uploads), monthly completions
(function () {
  'use strict';

  async function currentUserId() {
    var out = await sb.auth.getUser();
    return out && out.data && out.data.user ? out.data.user.id : null;
  }

  // ===== Habits CRUD =====
  window.createHabit = async function (h) {
    var payload = {
      habit_name: (h && h.name) || '',
      is_measurable: !!(h && h.is_measurable),
      target_value: h && h.target_value != null ? h.target_value : null,
      unit: (h && h.unit) || null,
      icon_kind: (h && h.icon_kind) || 'default',
      icon_key: (h && h.icon_key) || 'check.svg'
    };
    var res = await sb.from('habits').insert(payload);
    if (res.error) alert(res.error.message);
    return res.data && res.data[0];
  };

  window.listHabits = async function () {
    var res = await sb.from('habits').select('*').order('created_at', { ascending: true });
    if (res.error) { alert(res.error.message); return []; }
    return res.data || [];
  };

  window.updateHabit = async function (id, patch) {
    var res = await sb.from('habits').update(patch).eq('id', id);
    if (res.error) alert(res.error.message);
    return res.data && res.data[0];
  };

  window.deleteHabit = async function (id) {
    var res = await sb.from('habits').delete().eq('id', id);
    if (res.error) alert(res.error.message);
    return true;
  };

  // ===== Icons (Storage) =====
  // default-icons is public
  window.listDefaultIcons = async function () {
    var r = await sb.storage.from('default-icons').list('', { limit: 200 });
    if (r.error) { alert(r.error.message); return []; }
    return (r.data || []).filter(function (o) { return o && o.name && o.name[0] !== '.'; });
  };

  // user-icons is private, files are under USER_ID/
  window.listUserIcons = async function () {
    var uid = await currentUserId();
    if (!uid) return [];
    var r = await sb.storage.from('user-icons').list(uid, { limit: 200 });
    if (r.error) { console.error(r.error); return []; }
    return r.data || [];
  };

  window.uploadUserIcon = async function (file) {
    var uid = await currentUserId();
    if (!uid) return alert('Not signed in.');
    if (!file || !file.type || file.type.indexOf('image/') !== 0) {
      return alert('Please upload an image file.');
    }
    if (file.size > 1024 * 1024) return alert('Max 1 MB.');

    var key = uid + '/' + Date.now() + '_' + file.name;
    var r = await sb.storage.from('user-icons').upload(key, file, {
      upsert: false,
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream'
    });
    if (r.error) { alert(r.error.message); return null; }
    return key;
  };

  window.getIconUrl = async function (icon_kind, icon_key) {
    if (icon_kind === 'default') {
      return sb.storage.from('default-icons').getPublicUrl(icon_key).data.publicUrl;
    }
    var r = await sb.storage.from('user-icons').createSignedUrl(icon_key, 3600);
    if (r.error) { console.error(r.error); return null; }
    return r.data && r.data.signedUrl;
  };

  window.setHabitIcon = async function (habitId, kind, key) {
    var r = await sb.from('habits').update({ icon_kind: kind, icon_key: key }).eq('id', habitId);
    if (r.error) alert(r.error.message);
    return r.data && r.data[0];
  };

  // ===== Monthly Completions =====
  function pad2(x) { return (x < 10 ? '0' : '') + x; }

  window.toggleCompletion = async function (habit_id, dateISO, is_completed, value) {
    var uid = await currentUserId();
    if (!uid) return alert('Not signed in.');

    var payload = {
      habit_id: habit_id,
      user_id: uid,
      completion_date: dateISO, // "YYYY-MM-DD"
      is_completed: !!is_completed
    };
    if (value != null) payload.value = value;

    var r = await sb.from('habit_completions').upsert(payload, { onConflict: 'habit_id,completion_date' });
    if (r.error) alert(r.error.message);
    return r.data && r.data[0];
  };

  window.getCompletionsForMonth = async function (yyyy, mm /* 1-12 */) {
    var from = yyyy + '-' + pad2(mm) + '-01';
    var nextMonth = (mm === 12) ? (yyyy + 1) + '-01-01' : yyyy + '-' + pad2(mm + 1) + '-01';
    var r = await sb.from('habit_completions')
      .select('*')
      .gte('completion_date', from)
      .lt('completion_date', nextMonth);
    if (r.error) { alert(r.error.message); return []; }
    return r.data || [];
  };

  // ===== Optional: minimal DOM helpers for picker =====
  // You can wire these to your modal/buttons.
  window.renderIconPicker = async function (containerEl, onChoose) {
    containerEl.innerHTML = '';
    var defaults = await listDefaultIcons();
    var userIcons = await listUserIcons();
    var uid = await currentUserId();

    // Defaults (public)
    var defWrap = document.createElement('div');
    defWrap.innerHTML = '<h4>Default</h4>';
    defaults.forEach(function (obj) {
      var url = sb.storage.from('default-icons').getPublicUrl(obj.name).data.publicUrl;
      var img = document.createElement('img');
      img.src = url; img.alt = obj.name; img.style.width = '40px'; img.style.cursor = 'pointer'; img.title = obj.name;
      img.onclick = function () { onChoose('default', obj.name); };
      defWrap.appendChild(img);
    });
    containerEl.appendChild(defWrap);

    // User (signed URLs)
    var userWrap = document.createElement('div');
    userWrap.innerHTML = '<h4>Your Uploads</h4>';
    for (var i = 0; i < userIcons.length; i++) {
      var key = uid + '/' + userIcons[i].name;
      var s = await sb.storage.from('user-icons').createSignedUrl(key, 3600);
      if (s.error) continue;
      var uimg = document.createElement('img');
      uimg.src = s.data.signedUrl; uimg.alt = userIcons[i].name; uimg.style.width = '40px'; uimg.style.cursor = 'pointer'; uimg.title = userIcons[i].name;
      (function (k) {
        uimg.onclick = function () { onChoose('user', k); };
      })(key);
      userWrap.appendChild(uimg);
    }
    containerEl.appendChild(userWrap);
  };
})();
