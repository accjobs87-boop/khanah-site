/* الأدوات المجانية: باقي على الراتب، الزكاة، ضريبة القيمة المضافة، الجمعية */
(function () {
  'use strict';
  var K = window.K;
  var tool = document.body.getAttribute('data-tool');
  var $ = K.$;
  var on = function (sel, ev, fn) { document.querySelectorAll(sel).forEach(function (el) { el.addEventListener(ev, fn); }); };
  var seg = function (sel, cb) {
    on(sel + ' button', 'click', function (e) {
      var b = e.currentTarget;
      b.parentNode.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); });
      cb(b.getAttribute('data-v'));
    });
  };

  /* ---------- باقي على الراتب ---------- */
  if (tool === 'salary') {
    var sector = 'gov';
    var paydayIn = function (y, m, day, shift) {
      var last = new Date(y, m + 1, 0).getDate();
      var d = new Date(y, m, Math.min(day, last));
      if (shift) { var w = d.getDay(); if (w === 5) d.setDate(d.getDate() - 1); else if (w === 6) d.setDate(d.getDate() - 2); }
      return d;
    };
    var run = function () {
      var eg = window.khanahCountry() === 'EG';
      document.querySelectorAll('.only-gov').forEach(function (el) { el.style.display = eg ? 'none' : ''; });
      var day = sector === 'gov' && !eg ? 27 : Math.min(31, Math.max(1, Math.round(K.num($('#day').value)) || (eg ? 1 : 27)));
      var shift = sector === 'gov' && !eg;
      var t = new Date(); t.setHours(0, 0, 0, 0);
      var p = paydayIn(t.getFullYear(), t.getMonth(), day, shift);
      if (p < t) p = paydayIn(t.getFullYear(), t.getMonth() + 1, day, shift);
      var left = Math.round((p - t) / 864e5);
      var have = K.num($('#have').value);
      var word = eg ? 'المرتب' : 'الراتب';
      var days = left === 1 ? 'يوم واحد' : left === 2 ? 'يومين' : left <= 10 ? left + ' أيام' : left + ' يوم';
      var big = left === 0 ? (eg ? 'النهارده يوم القبض' : 'اليوم يوم الراتب') : (eg ? 'فاضل ' : 'باقي ') + days + ' على ' + word;
      var rows = ['<div>' + word + ' الجاي: ' + K.dateAr(p) + '</div>'];
      if (!eg) rows.push('<div>بالهجري: ' + K.hijri(p) + '</div>');
      if (have > 0) rows.push('<div>' + (eg ? 'تقدر تصرف ' : 'تقدر تصرف ') + '<b class="num">' + K.fmt(Math.floor(have / Math.max(1, left)), 0) + '</b> ' + K.cur() + ' في اليوم</div>');
      $('#out').innerHTML = '<div class="big">' + big + '</div><div class="rows">' + rows.join('') + '</div>';
    };
    seg('#sector', function (v) { sector = v; $('#dayWrap').style.display = v === 'gov' ? 'none' : ''; run(); });
    on('#day, #have', 'input', run);
    document.addEventListener('country', function () {
      var eg = window.khanahCountry() === 'EG';
      if (eg) { sector = 'private'; $('#dayWrap').style.display = ''; if (!$('#day').value) $('#day').value = 1; }
      run();
    });
    run();
  }

  /* ---------- الزكاة ---------- */
  if (tool === 'zakat') {
    var basis = 'gold';
    var run2 = function () {
      var v = function (id) { return K.num($('#' + id).value); };
      var gp = v('goldPrice'), sp = v('silverPrice');
      var gold = v('gold') * (K.num($('#karat').value) / 24);
      var jewel = $('#incJ').checked ? v('jewel') * (K.num($('#jkarat').value) / 24) : 0;
      var goldVal = (gold + jewel) * gp;
      var total = v('cash') + goldVal + v('silver') * sp + v('invest') + v('trade') + v('recv') - v('debts');
      var nisab = basis === 'silver' && sp > 0 ? 595 * sp : 85 * gp;
      var c = K.cur();
      if (!(nisab > 0)) { $('#out').className = 'result muted'; $('#out').innerHTML = 'اكتب سعر جرام الذهب عيار 24 عشان نحسب النصاب'; return; }
      var due = total >= nisab ? total * 0.025 : 0;
      $('#out').className = 'result' + (due ? '' : ' muted');
      $('#out').innerHTML = '<div class="big">' + (due ? 'زكاتك: ' + K.fmt(due) + ' ' + c : 'مالك أقل من النصاب') + '</div><div class="rows"><div>الوعاء الزكوي: ' + K.fmt(Math.max(0, total)) + ' ' + c + '</div><div>النصاب (' + (basis === 'silver' ? '595 جرام فضة' : '85 جرام ذهب') + '): ' + K.fmt(nisab) + ' ' + c + '</div></div>';
    };
    seg('#basis', function (v) { basis = v; run2(); });
    on('.tool input, .tool select', 'input', run2);
    on('#incJ', 'change', function () { $('#jWrap').style.display = $('#incJ').checked ? '' : 'none'; run2(); });
    document.addEventListener('country', run2);
    run2();
  }

  /* ---------- ضريبة القيمة المضافة ---------- */
  if (tool === 'vat') {
    var rate = 15, mode = 'add';
    var run3 = function () {
      var a = K.num($('#amount').value);
      var r = rate === 0 ? K.num($('#custom').value) : rate;
      var net, vat, gross;
      if (mode === 'add') { net = a; vat = a * r / 100; gross = a + vat; } else { gross = a; net = a / (1 + r / 100); vat = gross - net; }
      var c = K.cur();
      $('#out').innerHTML = '<div class="big">' + (mode === 'add' ? 'الإجمالي: ' + K.fmt(gross) : 'قبل الضريبة: ' + K.fmt(net)) + ' ' + c + '</div><div class="rows"><div>المبلغ قبل الضريبة: ' + K.fmt(net) + '</div><div>الضريبة ' + r + '%: ' + K.fmt(vat) + '</div><div>الإجمالي شامل الضريبة: ' + K.fmt(gross) + '</div></div>';
    };
    seg('#rate', function (v) { rate = Number(v); $('#customWrap').style.display = rate === 0 ? '' : 'none'; run3(); });
    seg('#mode', function (v) { mode = v; run3(); });
    on('#amount, #custom', 'input', run3);
    document.addEventListener('country', function () {
      rate = window.khanahCountry() === 'EG' ? 14 : 15;
      document.querySelectorAll('#rate button').forEach(function (b) { b.classList.toggle('on', Number(b.getAttribute('data-v')) === rate); });
      run3();
    });
    rate = window.khanahCountry() === 'EG' ? 14 : 15;
    document.querySelectorAll('#rate button').forEach(function (b) { b.classList.toggle('on', Number(b.getAttribute('data-v')) === rate); });
    run3();
  }

  /* ---------- الجمعية ---------- */
  if (tool === 'jamiya') {
    var run4 = function () {
      var amount = K.num($('#amount').value), members = Math.min(60, Math.max(2, Math.round(K.num($('#members').value)) || 10));
      var turn = Math.min(members, Math.max(1, Math.round(K.num($('#turn').value)) || 1));
      var st = $('#start').value ? new Date($('#start').value + '-01') : new Date();
      var c = K.cur();
      var rows = '';
      for (var i = 0; i < members; i++) {
        var d = new Date(st.getFullYear(), st.getMonth() + i, 1);
        rows += '<tr class="' + (i + 1 === turn ? 'me' : '') + '"><td class="num">' + (i + 1) + '</td><td>' + d.toLocaleDateString('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' }) + '</td><td class="num">' + K.fmt(amount * members) + ' ' + c + '</td><td>' + (i + 1 === turn ? 'دورك' : '') + '</td></tr>';
      }
      var myDate = new Date(st.getFullYear(), st.getMonth() + turn - 1, 1);
      $('#out').innerHTML = '<div class="big">قبضك: ' + K.fmt(amount * members) + ' ' + c + '</div><div class="rows"><div>دورك رقم ' + turn + ' في ' + myDate.toLocaleDateString('ar-EG-u-nu-latn', { month: 'long', year: 'numeric' }) + '</div><div>إجمالي اللي هتدفعه: ' + K.fmt(amount * members) + ' ' + c + ' على ' + members + ' شهر</div></div>';
      $('#table').innerHTML = '<table class="t"><thead><tr><th>الدور</th><th>الشهر</th><th>القبض</th><th></th></tr></thead><tbody>' + rows + '</tbody></table>';
    };
    on('.tool input', 'input', run4);
    document.addEventListener('country', run4);
    var now = new Date();
    $('#start').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
    run4();
  }
})();
