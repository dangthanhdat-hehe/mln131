/* ═══════════════════════════════════════════════════
   RANH GIỚI MỎNG MANH · script.js
   State machine, animations, particle effects
═══════════════════════════════════════════════════ */

/* ─── STATE MACHINE ─────────────────────────────── */
let cur = 's-intro', busy = false;

function goTo(id) {
  if (busy || id === cur) return;
  busy = true;
  const c = document.getElementById(cur);
  const n = document.getElementById(id);
  if (!c || !n) { busy = false; return; }
  flash();
  c.style.opacity = '0';
  c.style.pointerEvents = 'none';
  setTimeout(() => {
    c.classList.remove('active');
    c.style.opacity = '';
    n.scrollTop = 0;
    n.classList.add('active');
    n.style.pointerEvents = '';
    try { onEnter(id); } catch(e) { console.error('onEnter error:', e); }
    setTimeout(() => { busy = false; cur = id; }, 80);
  }, 1000);
}

function restartGame() { stopConfetti(); stopEndingMusic(); setGlitchLevel(0); goTo('s-intro'); }

/* ─── SCENE ENTER HOOKS ─────────────────────────── */
function onEnter(id) {
  if (id === 's-b4')   setTimeout(startDominos, 400);
  if (id === 's-g3')   initStamp();

  if (id === 's-gend') { buildVictoryStars(); triggerGoodEndingMusic(); }
  if (id === 's-nend') triggerNeutralEndingMusic();
  if (id === 's-bend') triggerBadEndingMusic();

  if (!['s-gend','s-nend','s-bend'].includes(id)) stopEndingMusic();

  const glitchMap = { 's-b1':1, 's-b2':2, 's-b3':3, 's-b4':4, 's-bend':5 };
  setGlitchLevel(glitchMap[id] || 0);

  if (id === 's-quiz') startQuiz();
}

function setGlitchLevel(lvl) {
  document.body.classList.remove('glitch-lv1','glitch-lv2','glitch-lv3','glitch-lv4','glitch-lv5');
  if (lvl > 0) document.body.classList.add('glitch-lv' + lvl);
}

function flash() {
  const f = document.getElementById('flash');
  f.classList.remove('go');
  f.offsetHeight;
  f.classList.add('go');
  setTimeout(() => f.classList.remove('go'), 700);
}

(function createRain() {
  const box = document.getElementById('rain-box');
  if (!box) return;
  for (let i = 0; i < 65; i++) {
    const l = document.createElement('div');
    l.className = 'rain-line';
    const h = Math.random() * 80 + 40;
    l.style.cssText = `left:${Math.random() * 100}%;height:${h}px;top:${Math.random() * -50}%;animation-duration:${0.7 + Math.random() * 1.4}s;animation-delay:${Math.random() * 2}s;opacity:${0.15 + Math.random() * 0.25}`;
    box.appendChild(l);
  }
})();

function startDominos() {
  document.querySelectorAll('.domino').forEach(d => { d.classList.remove('fallen'); d.offsetHeight; });
  document.querySelectorAll('.domino').forEach((d, i) => { setTimeout(() => d.classList.add('fallen'), i * 380); });
}

function initStamp() {
  const s = document.querySelector('.stamp-circle');
  if (!s) return;
  s.style.animation = 'none';
  s.offsetHeight;
  s.style.animation = 'stampDrop .6s cubic-bezier(.2,1.5,.5,1) .3s both';
}

function buildVictoryStars() {
  const wrap = document.querySelector('.victory-rays');
  const items = document.querySelector('.illust-victory-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const ray = document.createElement('div');
    ray.className = 'ray';
    ray.style.cssText = `transform:rotate(${i * 30}deg) translateY(-80px)`;
    wrap.appendChild(ray);
  }
  if (!items) return;
  document.querySelectorAll('.victory-star-item').forEach(e => e.remove());
  const stars = ['✦', '✧', '⋆', '★', '☆'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('div');
    s.className = 'victory-star-item';
    s.textContent = stars[Math.floor(Math.random() * stars.length)];
    s.style.cssText = `left:${Math.random() * 90 + 5}%;top:${Math.random() * 80 + 5}%;font-size:${Math.random() * 14 + 8}px;color:rgba(${200 + Math.random() * 55},${150 + Math.random() * 80},${0 + Math.random() * 30},.8);animation-duration:${1.5 + Math.random() * 2}s;animation-delay:${Math.random() * 2}s`;
    items.appendChild(s);
  }
}

const cv = document.getElementById('confetti'), cx = cv.getContext('2d');
let pts = [], run = false, rid = null;
function resizeCV() { cv.width = innerWidth; cv.height = innerHeight; }
resizeCV(); addEventListener('resize', resizeCV);

function triggerConfetti() {
  stopConfetti(); pts = []; run = true;
  const cols = ['#c8a820','#f0d050','#40c060','#5090e0','#c04060','#fff','#cc2020','#e8a040'];
  for (let i = 0; i < 230; i++) {
    pts.push({ x: Math.random() * cv.width, y: Math.random() * cv.height - cv.height, w: Math.random() * 10 + 4, h: Math.random() * 5 + 3, c: cols[Math.floor(Math.random() * cols.length)], vx: (Math.random() - .5) * 4, vy: Math.random() * 4 + 2, a: Math.random() * Math.PI * 2, s: (Math.random() - .5) * .25, life: 1 });
  }
  animConf();
  setTimeout(stopConfetti, 6000);
}
function animConf() {
  if (!run) return;
  cx.clearRect(0, 0, cv.width, cv.height);
  pts.forEach(p => { p.x += p.vx; p.y += p.vy; p.a += p.s; p.vy += .06; p.life -= .004; cx.save(); cx.globalAlpha = Math.max(0, p.life); cx.translate(p.x, p.y); cx.rotate(p.a); cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); cx.restore(); });
  pts = pts.filter(p => p.life > 0 && p.y < cv.height + 30);
  rid = requestAnimationFrame(animConf);
}
function stopConfetti() { run = false; if (rid) cancelAnimationFrame(rid); rid = null; cx.clearRect(0, 0, cv.width, cv.height); }

(function initBGM() {
  const audio = document.getElementById('bgm'), goodAudio = document.getElementById('bgm-good'), neutralAudio = document.getElementById('bgm-neutral'), badAudio = document.getElementById('bgm-bad'), btn = document.getElementById('music-btn'), iconOn = btn.querySelector('.music-icon-on'), iconOff = btn.querySelector('.music-icon-off');
  let playing = false, started = false, activeEnd = null, fadeTimer = null;
  if (!audio || !btn) return;
  function endAudio(type) { return { good: goodAudio, neutral: neutralAudio, bad: badAudio }[type] || null; }
  function fadeTo(el, target, ms, cb) { if (fadeTimer) clearInterval(fadeTimer); const steps = 40, interval = ms / steps, delta = (target - el.volume) / steps; let n = 0; fadeTimer = setInterval(() => { n++; el.volume = Math.min(1, Math.max(0, el.volume + delta)); if (n >= steps) { clearInterval(fadeTimer); fadeTimer = null; el.volume = target; if (cb) cb(); } }, interval); }
  function setPlaying(state) { playing = state; iconOn.style.display = state ? 'flex' : 'none'; iconOff.style.display = state ? 'none' : 'flex'; btn.classList.toggle('muted', !state); }
  function startAudio() { if (started) return; started = true; audio.volume = 0; audio.play().then(() => { fadeTo(audio, 0.65, 2000); setPlaying(true); }).catch(() => { started = false; setPlaying(false); }); }
  startAudio();
  ['click','keydown','touchstart'].forEach(e => document.addEventListener(e, startAudio, { once: true }));
  window.toggleMusic = function() { if (!started) { startAudio(); return; } const active = activeEnd ? endAudio(activeEnd) : audio; if (playing) { active.pause(); setPlaying(false); } else { active.play().catch(() => {}); setPlaying(true); } };
  window.stopEndingMusic = function() { if (!activeEnd) return; const sky = document.getElementById('good-sky-bg'); if (sky) { sky.classList.remove('active'); if (sky.tagName === 'VIDEO') setTimeout(() => { sky.pause(); sky.currentTime = 0; }, 1500); } const content = document.getElementById('good-ending-content'); if (content) content.classList.remove('active'); const ea = endAudio(activeEnd); activeEnd = null; function resumeBGM() { if (!started) return; audio.volume = 0; audio.play().then(() => { fadeTo(audio, 0.65, 1500); setPlaying(true); }).catch(() => {}); } if (ea) { fadeTo(ea, 0, 800, () => { ea.pause(); ea.currentTime = 0; resumeBGM(); }); } else { resumeBGM(); } };
  window.triggerGoodEndingMusic = function() { if (!started || activeEnd === 'good') return; activeEnd = 'good'; goodAudio.volume = 0; goodAudio.currentTime = 0; fadeTo(audio, 0, 1500, () => { audio.pause(); setTimeout(() => { if (activeEnd !== 'good') return; const sky = document.getElementById('good-sky-bg'); if (sky) { sky.classList.add('active'); if (sky.tagName === 'VIDEO') sky.play().catch(()=>{}); } const content = document.getElementById('good-ending-content'); if (content) content.classList.add('active'); triggerConfetti(); goodAudio.play().then(() => { fadeTo(goodAudio, 0.72, 3000); setPlaying(true); }).catch(() => {}); }, 2000); }); };
  window.triggerNeutralEndingMusic = function() { if (!started || activeEnd === 'neutral') return; activeEnd = 'neutral'; neutralAudio.volume = 0; neutralAudio.currentTime = 0; fadeTo(audio, 0, 1500, () => { audio.pause(); setTimeout(() => { if (activeEnd !== 'neutral') return; neutralAudio.play().then(() => { fadeTo(neutralAudio, 0.68, 3000); setPlaying(true); }).catch(() => {}); }, 2000); }); };
  window.triggerBadEndingMusic = function() { if (!started || activeEnd === 'bad') return; activeEnd = 'bad'; badAudio.volume = 0; badAudio.currentTime = 0; audio.pause(); setPlaying(false); setTimeout(() => { if (activeEnd !== 'bad') return; badAudio.play().then(() => { fadeTo(badAudio, 0.62, 4500); setPlaying(true); }).catch(() => {}); }, 3000); };
})();

/* ═══════════════════════════════════════════════════
   MINIGAME LOGIC (OPTIMIZED FOR OFFLINE PRESENTATION)
═══════════════════════════════════════════════════ */
const quizData = {
  part1: [
    { q: "Theo Chủ nghĩa Mác - Lênin, tôn giáo có nguồn gốc chủ yếu từ đâu?", a: ["Do nhà nước tạo ra", "Từ tâm lý và điều kiện xã hội của con người", "Do công nghệ phát triển", "Do giáo dục bắt buộc"], c: 1 },
    { q: "Áp lực thi cử khiến con người dễ tìm đến tâm linh thuộc nguồn gốc nào?", a: ["Nhận thức", "Tâm lý", "Kinh tế", "Chính trị"], c: 1 },
    { q: "“Khi con người chưa hiểu rõ hoặc không kiểm soát được tương lai” → dễ tin vào lực lượng siêu nhiên. Đây là nguồn gốc gì?", a: ["Tâm lý", "Nhận thức", "Kinh tế", "Văn hóa"], c: 1 },
    { q: "Yếu tố nào sau đây thuộc nguồn gốc kinh tế – xã hội của tôn giáo?", a: ["Lo lắng cá nhân", "Thiếu kiến thức", "Áp lực cạnh tranh và bất ổn xã hội", "Niềm tin cá nhân"], c: 2 },
    { q: "Hành vi chi tiền mua “bùa”, “lộc” để thi đậu thể hiện:", a: ["Tín ngưỡng đúng đắn", "Văn hóa truyền thống", "Mê tín dị đoan", "Hoạt động khoa học"], c: 2 },
    { q: "Theo chính sách ở Việt Nam, quyền tự do tín ngưỡng có đặc điểm nào?", a: ["Không có giới hạn", " Được làm mọi thứ liên quan tâm linh", "Được bảo vệ nhưng không được lợi dụng để trục lợi", "Chỉ dành cho người lớn"], c: 2 }
  ],
  part2: [
    { q: "Mọi hành vi tâm linh đều là tín ngưỡng hợp pháp", c: false },
    { q: "Mê tín dị đoan thường bị lợi dụng để kiếm tiền", c: true },
    { q: "Người có học sẽ không bao giờ tin vào mê tín", c: false },
    { q: "Tự do tín ngưỡng phải tuân theo pháp luật", c: true },
    { q: "Áp lực tâm lý có thể khiến con người tìm đến niềm tin siêu nhiên", c: true }
  ],
  part3: ["Mê tín dị đoan", "Tự do tín ngưỡng", "Áp lực thi cử", "Niềm tin", "Lợi dụng"],
  part4: [
    "Vì sao sinh viên (có học thức) vẫn dễ tin vào “thầy online” khi áp lực?",
    "Hành vi mua bùa có phải là thực hành tín ngưỡng truyền thống không? Vì sao?",
    "Theo bạn, quyền tự do tín ngưỡng nên giới hạn ở đâu?",
    "Gia đình nên xử lý như thế nào để vừa tôn trọng quyền cá nhân, vừa tránh bị lợi dụng?"
  ]
};

let quizState = { 
  part: 1, 
  step: -1, 
  busy: false,
  solved: false, 
  completed: { p1: [], p2: [], p3: [], p4: [] } 
};

function startQuiz() {
  quizState = { part: 1, step: -1, busy: false, solved: false, completed: { p1: [], p2: [], p3: [], p4: [] } };
  renderQuiz();
}

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  const progressFill = document.getElementById('quiz-progress-fill');
  if (!container) return;
  container.innerHTML = '';
  quizState.solved = false; 

  const totalSteps = 20;
  let currentProgress = 0;
  if (quizState.part === 1) currentProgress = (quizState.completed.p1.length);
  else if (quizState.part === 2) currentProgress = 6 + quizState.completed.p2.length;
  else if (quizState.part === 3) currentProgress = 11 + quizState.completed.p3.length;
  else if (quizState.part === 4) currentProgress = 16 + quizState.completed.p4.length;
  progressFill.style.width = `${(currentProgress / totalSteps) * 100}%`;

  if (quizState.step === -1) {
    let title = "", items = [], listKey = "";
    if (quizState.part === 1) { title = "Phần 1: Trắc nghiệm"; items = quizData.part1; listKey = "p1"; }
    else if (quizState.part === 2) { title = "Phần 2: Đúng hay Sai"; items = quizData.part2; listKey = "p2"; }
    else if (quizState.part === 3) { title = "Phần 3: Đoán ý đồng đội"; items = quizData.part3; listKey = "p3"; }
    else if (quizState.part === 4) { title = "Phần 4: Câu hỏi thảo luận"; items = quizData.part4; listKey = "p4"; }

    let html = `<div class="quiz-card text-center">
                  <p class="t-amber text-[10px] uppercase tracking-widest mb-2">${title}</p>
                  <h3 class="text-xl font-bold mb-6">Mời bạn chọn một thử thách:</h3>
                  <div class="quiz-grid">`;
    items.forEach((_, i) => {
      const isDone = quizState.completed[listKey].includes(i);
      html += `<div class="quiz-grid-item ${isDone ? 'completed' : ''}" onclick="${isDone ? '' : `selectQuizStep(${i})`}">${i+1}</div>`;
    });
    html += `</div></div>`;
    container.innerHTML = html;
  } else {
    renderSpecificQuestion(container);
  }
}

function selectQuizStep(idx) {
  quizState.step = idx;
  renderQuiz();
}

function renderSpecificQuestion(container) {
  if (quizState.part === 1) {
    const data = quizData.part1[quizState.step];
    let html = `<div class="quiz-card">
                  <p class="t-ghost text-[10px] mb-2 uppercase tracking-widest">Câu hỏi ${quizState.step + 1}</p>
                  <h3 class="text-xl font-bold mb-6">${data.q}</h3>
                  <div class="space-y-3">`;
    data.a.forEach((opt, i) => {
      html += `<button class="quiz-option" onclick="checkQuizAnswer(${i})">${opt}</button>`;
    });
    html += `</div><div id="quiz-next-btn" class="hidden mt-6">
                <button class="btn-gold w-full !text-white" onclick="backToMenu()">Đúng rồi! Quay lại bảng chọn <i class="fa-solid fa-rotate-left ml-2"></i></button>
              </div></div>`;
    container.innerHTML = html;
  } else if (quizState.part === 2) {
    const data = quizData.part2[quizState.step];
    container.innerHTML = `<div class="quiz-card">
                  <p class="t-ghost text-[10px] mb-2 uppercase tracking-widest">Thử thách ${quizState.step + 1}</p>
                  <h3 class="text-xl font-bold mb-8">"${data.q}"</h3>
                  <div class="flex gap-4">
                    <button class="quiz-option flex-1 text-center" onclick="checkQuizAnswer(true)">✅ ĐÚNG</button>
                    <button class="quiz-option flex-1 text-center" onclick="checkQuizAnswer(false)">❌ SAI</button>
                  </div>
                  <div id="quiz-next-btn" class="hidden mt-6">
                    <button class="btn-gold w-full !text-white" onclick="backToMenu()">Chính xác! Quay lại bảng chọn <i class="fa-solid fa-rotate-left ml-2"></i></button>
                  </div></div>`;
  } else if (quizState.part === 3) {
    const word = quizData.part3[quizState.step];
    container.innerHTML = `<div class="quiz-card text-center">
                  <p class="t-ghost text-[10px] mb-2 uppercase tracking-widest">Từ khóa số ${quizState.step + 1}</p>
                  <p class="t-amber text-xs mb-6 italic font-bold">Nhấp vào ô để hiện đáp án sau khi các bạn đoán</p>
                  <div class="keyword-box" onclick="if(!quizState.completed.p3.includes(${quizState.step})){ this.classList.add('revealed'); quizState.completed.p3.push(${quizState.step}); triggerConfetti(); }">
                    <span class="keyword-text">${word}</span>
                  </div>
                  <button class="btn-gold mt-10 w-full !text-white" onclick="backToMenu()">Xong - Quay lại bảng chọn</button></div>`;
  } else if (quizState.part === 4) {
    const sit = quizData.part4[quizState.step];
    container.innerHTML = `<div class="quiz-card">
                  <p class="t-ghost text-[10px] mb-2 uppercase tracking-widest">Tình huống ${quizState.step + 1}</p>
                  <div class="situation-card mt-4"><h3 class="text-lg font-bold leading-relaxed">${sit}</h3></div>
                  <p class="t-ghost text-xs mt-6 italic font-bold">Hãy mời các bạn thảo luận và đưa ra ý kiến!</p>
                  <button class="btn-gold mt-10 w-full !text-white" onclick="if(!quizState.completed.p4.includes(${quizState.step})){ quizState.completed.p4.push(${quizState.step}); } backToMenu();">
                    Hoàn thành thảo luận
                  </button></div>`;
  }
}

function checkQuizAnswer(val) {
  if (quizState.solved) return; 

  const btns = document.querySelectorAll('.quiz-option');
  let data = (quizState.part === 1) ? quizData.part1[quizState.step] : quizData.part2[quizState.step];
  let correctIdx = (quizState.part === 1) ? data.c : (data.c ? 0 : 1);
  let clickedIdx = (quizState.part === 1) ? val : (val ? 0 : 1);

  if (clickedIdx === correctIdx) {
    // CORRECT
    quizState.solved = true;
    btns[clickedIdx].classList.add('correct');
    triggerConfetti();
    btns.forEach(b => b.disabled = true);
    if(quizState.part === 1) { if(!quizState.completed.p1.includes(quizState.step)) quizState.completed.p1.push(quizState.step); }
    else if(quizState.part === 2) { if(!quizState.completed.p2.includes(quizState.step)) quizState.completed.p2.push(quizState.step); }
    document.getElementById('quiz-next-btn').classList.remove('hidden');
  } else {
    // WRONG
    btns[clickedIdx].classList.add('wrong');
    btns[clickedIdx].disabled = true; 
    
    // PART 2 SPECIFIC: IF WRONG, SHOW CORRECT IMMEDIATELY AND END
    if (quizState.part === 2) {
      quizState.solved = true;
      btns[correctIdx].classList.add('correct');
      if(!quizState.completed.p2.includes(quizState.step)) quizState.completed.p2.push(quizState.step);
      document.getElementById('quiz-next-btn').classList.remove('hidden');
    }
  }
}

function backToMenu() {
  quizState.busy = false;
  quizState.step = -1;
  let finished = false;
  if (quizState.part === 1 && quizState.completed.p1.length === 6) finished = true;
  else if (quizState.part === 2 && quizState.completed.p2.length === 5) finished = true;
  else if (quizState.part === 3 && quizState.completed.p3.length === 5) finished = true;
  else if (quizState.part === 4 && quizState.completed.p4.length === 4) finished = true;

  if (finished) {
    if (quizState.part < 4) {
      quizState.part++;
      quizState.step = -1;
    } else {
      finishQuiz();
      return;
    }
  }
  renderQuiz();
}

function finishQuiz() {
  const container = document.getElementById('quiz-container');
  document.getElementById('quiz-progress-fill').style.width = '100%';
  container.innerHTML = `<div class="quiz-card text-center">
    <div class="text-6xl mb-6">🏆</div>
    <h3 class="text-2xl font-bold text-amber-900 mb-2">Tuyệt Vời!</h3>
    <p class="t-ghost text-sm mb-8">Bạn và cả lớp đã hoàn thành buổi thuyết trình tương tác.</p>
    <button onclick="restartGame()" class="btn-gold w-full py-4 !text-white font-bold">KẾT THÚC & QUAY VỀ</button>
  </div>`;
  triggerConfetti();
}
