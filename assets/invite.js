/* صفحة دعوة الجروب: khanah.app/g/CODE (من غير سكريبت داخل الصفحة عشان سياسة الأمان) */
(function () {
  var m = location.pathname.match(/\/g\/([A-Za-z0-9]{8})/);
  var code = m ? m[1].toUpperCase() : (new URLSearchParams(location.search).get('code') || '').toUpperCase();
  var icons = { home: '🏠', friends: '👥', jamiya: '🤝', trip: '✈️', work: '💼' };
  var cur = { EGP: 'جنيه', SAR: 'ريال', USD: 'دولار', AED: 'درهم', KWD: 'دينار', EUR: 'يورو' };
  document.getElementById('gCode').textContent = code || '--------';
  document.getElementById('openApp').href = K.app + '/?join=' + encodeURIComponent(code);
  document.getElementById('getAndroid').href = K.play + '&referrer=' + encodeURIComponent('join=' + code);
  if (!code || !K.api || !K.anonKey) return;
  fetch(K.api + '/rest/v1/rpc/space_preview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: K.anonKey, Authorization: 'Bearer ' + K.anonKey },
    body: JSON.stringify({ p_code: code })
  }).then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.name) return;
    document.getElementById('gName').textContent = d.name;
    document.getElementById('gIcon').textContent = icons[d.kind] || '👥';
    document.getElementById('gMeta').textContent = d.members + ' أعضاء · ' + (cur[d.currency] || d.currency);
  }).catch(function () { /* الصفحة شغالة من غير المعاينة */ });
})();
