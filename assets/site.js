/* موقع خانة: اختيار النسخة (السعودية/مصر)، قائمة الانتظار، والأدوات المجانية */
(function () {
  'use strict';
  // الإعدادات بتتظبط بعد إنشاء حساب Supabase وCloudflare Turnstile
  var CONFIG = { api: '', anonKey: '', turnstileSiteKey: '', app: 'https://app.khanah.app', play: 'https://play.google.com/store/apps/details?id=app.khanah' };

  var html = document.documentElement;
  function pickCountry() {
    var q = new URLSearchParams(location.search).get('c');
    if (q) return q.toUpperCase() === 'SA' ? 'SA' : 'EG';
    try { var s = localStorage.getItem('khanah.c'); if (s) return s; } catch (e) { /* تجاهل */ }
    // المرحلة الأولى مصر: أي حد برا الخليج يشوف نسخة مصر
    var gulf = ['Asia/Riyadh', 'Asia/Dubai', 'Asia/Kuwait', 'Asia/Qatar', 'Asia/Bahrain', 'Asia/Muscat'];
    try { return gulf.indexOf(Intl.DateTimeFormat().resolvedOptions().timeZone) >= 0 ? 'SA' : 'EG'; } catch (e) { return 'EG'; }
  }
  function setCountry(c) {
    html.dataset.c = c;
    try { localStorage.setItem('khanah.c', c); } catch (e) { /* تجاهل */ }
    document.querySelectorAll('[data-set-c]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-set-c') === c); });
    var sel = document.querySelector('#waitForm select[name=country]');
    if (sel && sel.value !== 'OTHER') sel.value = c;
    document.dispatchEvent(new CustomEvent('country', { detail: c }));
  }
  document.querySelectorAll('[data-set-c]').forEach(function (b) {
    b.addEventListener('click', function () { setCountry(b.getAttribute('data-set-c')); });
  });
  setCountry(pickCountry());
  window.khanahCountry = function () { return html.dataset.c; };

  // كود الدعوة من الرابط (khanah.app/?ref=CODE)
  var ref = new URLSearchParams(location.search).get('ref');
  if (ref) try { localStorage.setItem('khanah.ref', ref.toUpperCase()); } catch (e) { /* تجاهل */ }

  // قائمة الانتظار
  var form = document.getElementById('waitForm');
  if (form) {
    if (CONFIG.turnstileSiteKey) {
      var s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      document.head.appendChild(s);
      document.getElementById('turnstile').innerHTML = '<div class="cf-turnstile" data-sitekey="' + CONFIG.turnstileSiteKey + '" data-size="flexible"></div>';
    }
    var msg = document.getElementById('waitMsg');
    var show = function (h) { msg.innerHTML = h; msg.classList.add('show'); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { show('اكتب إيميل صحيح'); return; }
      if (!CONFIG.api) { show('القائمة بتفتح خلال أيام. تابعنا على khanahapp في سناب وتيك توك وإنستجرام.'); return; }
      var tokenEl = form.querySelector('[name="cf-turnstile-response"]');
      var myRef = null;
      try { myRef = localStorage.getItem('khanah.ref'); } catch (e2) { /* تجاهل */ }
      form.querySelector('button').disabled = true;
      fetch(CONFIG.api + '/functions/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, country: form.country.value, ref: myRef, turnstile: tokenEl ? tokenEl.value : '' })
      }).then(function (r) { return r.json(); }).then(function (d) {
        form.querySelector('button').disabled = false;
        if (!d.ok) { show('ما قدرنا نسجلك، جرب مرة ثانية'); return; }
        var link = location.origin + '/?ref=' + d.code;
        show('تم حجزك، ترتيبك في الطابور: <b class="num">' + d.position + '</b><br>رابطك للدعوة: <span class="ref">' + link + '</span><br>سجل من رابطك ' + d.invited + ' حتى الحين.');
      }).catch(function () { form.querySelector('button').disabled = false; show('في مشكلة في الاتصال، جرب بعد شوي'); });
    });
  }

  /* ---------- أدوات مشتركة ---------- */
  var num = function (v) {
    var s = String(v || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[,٬\s]/g, '').replace('٫', '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : 0;
  };
  var fmt = function (v, d) { return Number(v).toLocaleString('en-US', { maximumFractionDigits: d == null ? 2 : d }); };
  var cur = function () { return html.dataset.c === 'EG' ? 'جنيه' : 'ريال'; };
  var $ = function (s) { return document.querySelector(s); };
  var hijri = function (d) {
    try { return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(d); } catch (e) { return ''; }
  };
  var dateAr = function (d) { return d.toLocaleDateString('ar-EG-u-nu-latn', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); };
  window.K = { num: num, fmt: fmt, cur: cur, $: $, hijri: hijri, dateAr: dateAr, app: CONFIG.app, play: CONFIG.play, api: CONFIG.api, anonKey: CONFIG.anonKey };
})();
