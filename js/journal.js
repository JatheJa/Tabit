// js/journal.js
// Journal CRUD (one entry per user per date)
(function () {
  'use strict';

  async function currentUserId() {
    var out = await sb.auth.getUser();
    return out && out.data && out.data.user ? out.data.user.id : null;
  }

  window.loadJournalEntry = async function (dateISO) {
    var r = await sb.from('journal_entries').select('*').eq('entry_date', dateISO).maybeSingle();
    if (r.error && r.status !== 406) { alert(r.error.message); return null; }
    return r.data || null;
  };

  window.upsertJournalEntry = async function (dateISO, text) {
    var uid = await currentUserId();
    if (!uid) return alert('Not signed in.');
    var r = await sb.from('journal_entries').upsert({
      user_id: uid,
      entry_date: dateISO,
      entry_text: text
    }, { onConflict: 'user_id,entry_date' });
    if (r.error) alert(r.error.message);
    return r.data && r.data[0];
  };

  window.deleteJournalEntry = async function (dateISO) {
    var uid = await currentUserId();
    if (!uid) return alert('Not signed in.');
    var r = await sb.from('journal_entries').delete().eq('user_id', uid).eq('entry_date', dateISO);
    if (r.error) alert(r.error.message);
    return true;
  };
})();
