/* ===== Helpers ===== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// تلوين بسيط لأكواد HTML (من غير مكتبات خارجية)
function highlight(code) {
  return esc(code)
    .replace(/\s([\w-]+)=("[^"]*")/g, ' <i class="at">$1</i>=<u class="vl">$2</u>')
    .replace(/(&lt;\/?)([!\w-]+)/g, '$1<b class="tg">$2</b>');
}
function copyText(text, btn) {
  const done = () => { const o = btn.textContent; btn.textContent = '✔ تم النسخ'; setTimeout(() => btn.textContent = o, 1400); };
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, () => fallback());
  else fallback();
  function fallback() { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { btn.textContent = 'انسخ يدوياً'; } t.remove(); }
}
function renderPre(pre, code) {
  code = code.replace(/^\n/, '').replace(/\s+$/, '');
  pre.innerHTML = '<button class="cp" type="button">📋 Copy</button><code>' + highlight(code) + '</code>';
  $('.cp', pre).onclick = e => copyText(code, e.target);
}
function show(iframe, html) {
  iframe.srcdoc = '<!DOCTYPE html><html lang="ar" dir="rtl"><meta charset="UTF-8"><body style="font-family:Tahoma,sans-serif;margin:12px">' + html + '</body></html>';
}

/* ===== Static code blocks ===== */
$$('pre.code').forEach(p => { const s = $('script', p); if (s) renderPre(p, s.textContent); });

/* ===== Sections / sidebar / pager ===== */
const secs = $$('main section');
const side = $('#side');
let cur = 0;
secs.forEach((s, i) => {
  const a = document.createElement('a');
  a.href = '#' + s.id; a.innerHTML = '<span>' + (i + 1) + '</span>' + s.dataset.title;
  a.onclick = e => { e.preventDefault(); go(i); if (innerWidth <= 900) document.body.classList.add('closed'); };
  side.appendChild(a);
});
function go(i, noScroll) {
  cur = Math.max(0, Math.min(secs.length - 1, i));
  secs.forEach((s, k) => s.classList.toggle('on', k === cur));
  $$('#side a').forEach((a, k) => a.classList.toggle('on', k === cur));
  $('#bar i').style.width = ((cur + 1) / secs.length * 100) + '%';
  $('#prev').style.visibility = cur === 0 ? 'hidden' : 'visible';
  $('#next').style.visibility = cur === secs.length - 1 ? 'hidden' : 'visible';
  history.replaceState(null, '', '#' + secs[cur].id);
  if (!noScroll) scrollTo({ top: 0 });
}
$('#prev').onclick = () => go(cur - 1);
$('#next').onclick = () => go(cur + 1);
$('#menu').onclick = () => document.body.classList.toggle('closed');
$('#top').onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
addEventListener('scroll', () => { $('#top').style.display = scrollY > 400 ? 'block' : 'none'; });
if (innerWidth <= 900) document.body.classList.add('closed');
{ const k = secs.findIndex(s => '#' + s.id === location.hash); go(k > -1 ? k : 0, true); }

/* ===== Playground ===== */
const EX = {
  'عنوان H1': '<h1>أهلاً بيك في عالم الويب</h1>',
  'Paragraph': '<p>دي أول فقرة بكتبها بـHTML.</p>',
  'Button': '<button>دوس هنا</button>',
  'Text': '<input type="text" placeholder="اكتب اسمك">',
  'Password': '<input type="password" placeholder="كلمة المرور">',
  'Email': '<input type="email" placeholder="example@mail.com">',
  'Number': '<input type="number" placeholder="اكتب عمرك">',
  'Checkbox': '<input type="checkbox"> أوافق على الشروط',
  'Radio': '<input type="radio" name="g"> ولد\n<input type="radio" name="g"> بنت'
};
function tabs(box, names, onPick) {
  names.forEach((n, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = n;
    b.onclick = () => { $$('button', box).forEach(x => x.classList.remove('on')); b.classList.add('on'); onPick(n, i); };
    box.appendChild(b);
  });
  $('button', box).click();
}
const pgCode = $('#pgCode'), pgOut = $('#pgOut');
const run = () => show(pgOut, pgCode.value);
tabs($('#pgTabs'), Object.keys(EX), n => { pgCode.value = EX[n]; run(); });
$('#pgRun').onclick = run;
$('#pgCopy').onclick = e => copyText(pgCode.value, e.target);

/* ===== Input types ===== */
const INP = {
  text: ['نص عادي: اسم، عنوان، أي كلام.', '<input type="text" placeholder="اكتب اسمك">'],
  password: ['كلمة مرور: الحروف بتظهر نقط عشان محدش يشوفها.', '<input type="password" placeholder="كلمة المرور">'],
  email: ['بريد إلكتروني: المتصفح بيتأكد إن الشكل فيه @.', '<input type="email" placeholder="example@mail.com">'],
  number: ['أرقام بس، وفيها أسهم للزيادة والنقصان.', '<input type="number" placeholder="اكتب عمرك">'],
  date: ['اختيار تاريخ من تقويم.', '<input type="date">'],
  checkbox: ['مربع تختاره أو تشيله: تقدر تختار أكتر من اختيار.', '<input type="checkbox"> أوافق على الشروط'],
  radio: ['اختيار واحد بس من مجموعة (لازم نفس name).', '<input type="radio" name="g"> ولد\n<input type="radio" name="g"> بنت'],
  submit: ['زرار إرسال. الفورم الحقيقي محتاج Back-End، فهنا للشكل بس.', '<input type="submit" value="إرسال">']
};
tabs($('#inTabs'), Object.keys(INP), n => {
  $('#inName').innerHTML = 'type="' + n + '"';
  $('#inDesc').textContent = INP[n][0];
  renderPre($('#inCode'), INP[n][1]);
  show($('#inOut'), INP[n][1].replace(/\n/g, '<br>'));
});
show($('#phOut'), '<input type="text" placeholder="اكتب اسمك"> ← placeholder<br><br><input type="text" value="محمد"> ← value');

/* ===== Challenge ===== */
const chCode = $('#chCode'), chOut = $('#chOut');
chCode.value = '<!-- اكتب الحل هنا -->\n';
$('#chRun').onclick = () => show(chOut, chCode.value);
show(chOut, '');
$('#chSol').onclick = e => {
  const s = $('#sol'); s.classList.toggle('show');
  e.target.textContent = s.classList.contains('show') ? '🙈 إخفاء الحل' : '👀 عرض الحل';
};

/* ===== Quiz ===== */
const Q = [
  ['الـFront-End هو؟', ['الجزء اللي المستخدم بيشوفه ويتعامل معاه', 'السيرفر وقاعدة البيانات', 'كابل الإنترنت'], 0, 'الواجهة هي «صالة المطعم»: كل اللي بيظهر قدامك.'],
  ['الـAPI في مثال المطعم بيمثل؟', ['الزبون', 'المطبخ', 'الجرسون'], 2, 'الـAPI بيوصّل الطلب للـBack-End وبيرجّع الرد.'],
  ['HTML نوعها؟', ['لغة برمجة', 'لغة توصيف', 'لغة تنسيق'], 1, 'HTML بتوصف المحتوى، ومفيهاش منطق برمجي.'],
  ['أي تقنية من التلاتة هي لغة البرمجة؟', ['CSS', 'HTML', 'JavaScript'], 2, 'JavaScript بس هي اللي بتكتب فيها منطق وتصرفات.'],
  ['وظيفة CSS؟', ['تنسيق الشكل', 'حفظ البيانات', 'توصيل السيرفر'], 0, 'CSS بتظبط الألوان والخطوط والأحجام: المظهر.'],
  ['امتداد ملف صفحة الويب الصحيح؟', ['.txt', '.html', '.css'], 1, 'الامتداد .html هو اللي بيعرّف المتصفح إن الملف صفحة.'],
  ['الاسم الشائع للصفحة الرئيسية؟', ['main.txt', 'home.css', 'index.html'], 2, 'كتير من السيرفرات بتدوّر على index.html تلقائياً. وده مش إجباري لباقي الملفات.'],
  ['في <input type="password"> كلمة type هي؟', ['Attribute', 'Closing Tag', 'Content'], 0, 'الـAttribute معلومة جوه تاج الفتح بتغيّر شغل العنصر.'],
  ['الـplaceholder هو؟', ['قيمة بتتبعت للسيرفر', 'نص إرشادي باهت بيختفي لما تكتب', 'تاج غلق'], 1, 'placeholder تلميح للمستخدم، مش قيمة فعلية.'],
  ['العناصر اللي بتظهر للمستخدم بتتكتب جوه؟', ['head', 'title', 'body'], 2, 'body هو المحتوى المرئي، وhead للإعدادات.']
];
const quiz = $('#quiz');
function buildQuiz() {
  quiz.innerHTML = ''; $('#score').textContent = '';
  Q.forEach((q, i) => {
    const d = document.createElement('div'); d.className = 'q';
    d.innerHTML = '<p>' + (i + 1) + '. ' + esc(q[0]) + '</p>' + q[1].map((o, k) => '<label><input type="radio" name="q' + i + '" value="' + k + '"> ' + esc(o) + '</label>').join('') + '<div class="ex"></div>';
    quiz.appendChild(d);
  });
}
buildQuiz();
$('#qCheck').onclick = () => {
  let sc = 0, unanswered = 0;
  Q.forEach((q, i) => {
    const d = quiz.children[i], c = $('input:checked', d);
    if (!c) unanswered++;
    const ok = c && +c.value === q[2]; if (ok) sc++;
    d.className = 'q ' + (ok ? 'right' : 'wrong');
    $('.ex', d).innerHTML = (ok ? '✅ إجابة صح. ' : '❌ الإجابة الصح: <b>' + esc(q[1][q[2]]) + '</b>. ') + esc(q[3]);
  });
  $('#score').textContent = 'درجتك: ' + sc + ' من ' + Q.length + (unanswered ? ' (فيه ' + unanswered + ' سؤال من غير إجابة)' : '') + (sc === Q.length ? ' 🎉 ممتاز!' : '');
};
$('#qReset').onclick = () => { buildQuiz(); scrollTo({ top: $('#s20').offsetTop - 20 }); };
