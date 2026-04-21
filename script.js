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
    onEnter(id);
    setTimeout(() => { busy = false; cur = id; }, 80);
  }, 1000);
}

function restartGame() { stopConfetti(); stopEndingMusic(); setGlitchLevel(0); goTo('s-intro'); }

/* ─── SCENE ENTER HOOKS ─────────────────────────── */
function onEnter(id) {
  if (id === 's-b4')   setTimeout(startDominos, 400);
  if (id === 's-g3')   initStamp();

  // Ending-specific music
  if (id === 's-gend') { buildVictoryStars(); triggerGoodEndingMusic(); }
  if (id === 's-nend') triggerNeutralEndingMusic();
  if (id === 's-bend') triggerBadEndingMusic();

  // Stop ending music when navigating away from any ending
  if (!['s-gend','s-nend','s-bend'].includes(id)) stopEndingMusic();

  // Progressive glitch for Bad Path
  const glitchMap = { 's-b1':1, 's-b2':2, 's-b3':3, 's-b4':4, 's-bend':5 };
  setGlitchLevel(glitchMap[id] || 0);
}

/* ─── GLITCH LEVEL CONTROLLER ───────────────────── */
function setGlitchLevel(lvl) {
  document.body.classList.remove('glitch-lv1','glitch-lv2','glitch-lv3','glitch-lv4','glitch-lv5');
  if (lvl > 0) document.body.classList.add('glitch-lv' + lvl);
}

/* ─── FLASH TRANSITION ──────────────────────────── */
function flash() {
  const f = document.getElementById('flash');
  f.classList.remove('go');
  f.offsetHeight; // reflow
  f.classList.add('go');
  setTimeout(() => f.classList.remove('go'), 700);
}

/* ─── RAIN PARTICLES ────────────────────────────── */
(function createRain() {
  const box = document.getElementById('rain-box');
  if (!box) return;
  for (let i = 0; i < 65; i++) {
    const l = document.createElement('div');
    l.className = 'rain-line';
    const h = Math.random() * 80 + 40;
    l.style.cssText =
      `left:${Math.random() * 100}%;height:${h}px;top:${Math.random() * -50}%;` +
      `animation-duration:${0.7 + Math.random() * 1.4}s;` +
      `animation-delay:${Math.random() * 2}s;` +
      `opacity:${0.15 + Math.random() * 0.25}`;
    box.appendChild(l);
  }
})();

/* ─── DOMINO CASCADE ────────────────────────────── */
function startDominos() {
  document.querySelectorAll('.domino').forEach(d => {
    d.classList.remove('fallen');
    d.offsetHeight;
  });
  // Stagger add class
  document.querySelectorAll('.domino').forEach((d, i) => {
    setTimeout(() => d.classList.add('fallen'), i * 380);
  });
}

/* ─── STAMP ANIMATION ───────────────────────────── */
function initStamp() {
  const s = document.querySelector('.stamp-circle');
  if (!s) return;
  s.style.animation = 'none';
  s.offsetHeight;
  s.style.animation = 'stampDrop .6s cubic-bezier(.2,1.5,.5,1) .3s both';
}

/* ─── VICTORY STARS ─────────────────────────────── */
function buildVictoryStars() {
  const wrap = document.querySelector('.victory-rays');
  const items = document.querySelector('.illust-victory-wrap');
  if (!wrap) return;

  // Rays
  wrap.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const ray = document.createElement('div');
    ray.className = 'ray';
    ray.style.cssText = `transform:rotate(${i * 30}deg) translateY(-80px)`;
    wrap.appendChild(ray);
  }

  // Floating stars
  if (!items) return;
  const existing = items.querySelectorAll('.victory-star-item');
  existing.forEach(e => e.remove());
  const stars = ['✦', '✧', '⋆', '★', '☆'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('div');
    s.className = 'victory-star-item';
    s.textContent = stars[Math.floor(Math.random() * stars.length)];
    s.style.cssText =
      `left:${Math.random() * 90 + 5}%;` +
      `top:${Math.random() * 80 + 5}%;` +
      `font-size:${Math.random() * 14 + 8}px;` +
      `color:rgba(${200 + Math.random() * 55},${150 + Math.random() * 80},${0 + Math.random() * 30},.8);` +
      `animation-duration:${1.5 + Math.random() * 2}s;` +
      `animation-delay:${Math.random() * 2}s`;
    items.appendChild(s);
  }
}

/* ─── CONFETTI ───────────────────────────────────── */
const cv  = document.getElementById('confetti');
const cx  = cv.getContext('2d');
let pts   = [], run = false, rid = null;

function resizeCV() { cv.width = innerWidth; cv.height = innerHeight; }
resizeCV();
addEventListener('resize', resizeCV);

function triggerConfetti() {
  stopConfetti();
  pts = []; run = true;
  const cols = ['#c8a820','#f0d050','#40c060','#5090e0','#c04060','#fff','#cc2020','#e8a040'];
  for (let i = 0; i < 230; i++) {
    pts.push({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height - cv.height,
      w: Math.random() * 10 + 4,
      h: Math.random() * 5 + 3,
      c: cols[Math.floor(Math.random() * cols.length)],
      vx: (Math.random() - .5) * 4,
      vy: Math.random() * 4 + 2,
      a: Math.random() * Math.PI * 2,
      s: (Math.random() - .5) * .25,
      life: 1
    });
  }
  animConf();
  setTimeout(stopConfetti, 6000);
}

function animConf() {
  if (!run) return;
  cx.clearRect(0, 0, cv.width, cv.height);
  pts.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.a += p.s; p.vy += .06; p.life -= .004;
    cx.save();
    cx.globalAlpha = Math.max(0, p.life);
    cx.translate(p.x, p.y); cx.rotate(p.a);
    cx.fillStyle = p.c;
    cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cx.restore();
  });
  pts = pts.filter(p => p.life > 0 && p.y < cv.height + 30);
  rid = requestAnimationFrame(animConf);
}

function stopConfetti() {
  run = false;
  if (rid) { cancelAnimationFrame(rid); rid = null; }
  cx.clearRect(0, 0, cv.width, cv.height);
}

/* ─── BACKGROUND MUSIC ──────────────────────────── */
(function initBGM() {
  const audio        = document.getElementById('bgm');
  const goodAudio    = document.getElementById('bgm-good');
  const neutralAudio = document.getElementById('bgm-neutral');
  const badAudio     = document.getElementById('bgm-bad');
  const btn          = document.getElementById('music-btn');
  const iconOn       = btn.querySelector('.music-icon-on');
  const iconOff      = btn.querySelector('.music-icon-off');

  let playing   = false;
  let started   = false;
  let activeEnd = null;   // null | 'good' | 'neutral' | 'bad'
  let fadeTimer = null;

  if (!audio || !btn) return;

  function endAudio(type) {
    return { good: goodAudio, neutral: neutralAudio, bad: badAudio }[type] || null;
  }

  function fadeTo(el, target, ms, cb) {
    if (fadeTimer) clearInterval(fadeTimer);
    const steps = 40, interval = ms / steps;
    const delta = (target - el.volume) / steps;
    let n = 0;
    fadeTimer = setInterval(() => {
      n++;
      el.volume = Math.min(1, Math.max(0, el.volume + delta));
      if (n >= steps) {
        clearInterval(fadeTimer); fadeTimer = null;
        el.volume = target;
        if (cb) cb();
      }
    }, interval);
  }

  function setPlaying(state) {
    playing = state;
    iconOn.style.display  = state ? 'flex' : 'none';
    iconOff.style.display = state ? 'none' : 'flex';
    btn.classList.toggle('muted', !state);
  }

  function startAudio() {
    if (started) return;
    started = true;
    audio.volume = 0;
    audio.play()
      .then(() => { fadeTo(audio, 0.65, 2000); setPlaying(true); })
      .catch(() => setPlaying(false));
  }

  ['click','keydown','touchstart'].forEach(e =>
    document.addEventListener(e, startAudio, { once: true })
  );

  /* ── Toggle button (works for any active track) ── */
  window.toggleMusic = function() {
    if (!started) { startAudio(); return; }
    const active = activeEnd ? endAudio(activeEnd) : audio;
    if (playing) { active.pause(); setPlaying(false); }
    else         { active.play().catch(() => {}); setPlaying(true); }
  };

  /* ── Stop any ending track, safely resume BGM ── */
  window.stopEndingMusic = function() {
    if (!activeEnd) return;
    
    // Hide content & stopped Sky Video if active
    const sky = document.getElementById('good-sky-bg');
    if (sky) {
      sky.classList.remove('active');
      if (sky.tagName === 'VIDEO') setTimeout(() => { sky.pause(); sky.currentTime = 0; }, 1500);
    }
    const content = document.getElementById('good-ending-content');
    if (content) content.classList.remove('active');

    const ea = endAudio(activeEnd);
    activeEnd = null;
    if (ea) fadeTo(ea, 0, 800, () => { ea.pause(); ea.currentTime = 0; });
    if (started) {
      audio.volume = 0;
      audio.play()
        .then(() => { fadeTo(audio, 0.65, 1500); setPlaying(true); })
        .catch(() => {});
    }
  };
  window.stopGoodEndingMusic = window.stopEndingMusic; // backward compat

  /* ── Good Ending: BGM fade → 2s silence → Ao No Sumika & Sky ── */
  window.triggerGoodEndingMusic = function() {
    if (!started || activeEnd === 'good') return;
    activeEnd = 'good';
    goodAudio.volume = 0; goodAudio.currentTime = 0;
    fadeTo(audio, 0, 1500, () => {
      audio.pause();
      setTimeout(() => {
        if (activeEnd !== 'good') return;

        // Reveal & play Sky Video
        const sky = document.getElementById('good-sky-bg');
        if (sky) {
          sky.classList.add('active');
          if (sky.tagName === 'VIDEO') sky.play().catch(()=>{});
        }

        // Reveal content and trigger confetti
        const content = document.getElementById('good-ending-content');
        if (content) content.classList.add('active');
        triggerConfetti();

        goodAudio.play()
          .then(() => { fadeTo(goodAudio, 0.72, 3000); setPlaying(true); })
          .catch(() => {});
      }, 2000);
    });
  };

  /* ── Neutral Ending: BGM fade → 2s silence → For River ── */
  window.triggerNeutralEndingMusic = function() {
    if (!started || activeEnd === 'neutral') return;
    activeEnd = 'neutral';
    neutralAudio.volume = 0; neutralAudio.currentTime = 0;
    fadeTo(audio, 0, 1500, () => {
      audio.pause();
      setTimeout(() => {
        if (activeEnd !== 'neutral') return;
        neutralAudio.play()
          .then(() => { fadeTo(neutralAudio, 0.68, 3000); setPlaying(true); })
          .catch(() => {});
      }, 2000);
    });
  };

  /* ── Bad Ending: BGM CUT → 3s dead silence → Prisonic Fairytale ── */
  window.triggerBadEndingMusic = function() {
    if (!started || activeEnd === 'bad') return;
    activeEnd = 'bad';
    badAudio.volume = 0; badAudio.currentTime = 0;
    audio.pause();   // abrupt cut – no fade
    setPlaying(false);
    setTimeout(() => {
      if (activeEnd !== 'bad') return;
      badAudio.play()
        .then(() => { fadeTo(badAudio, 0.62, 4500); setPlaying(true); })
        .catch(() => {});
    }, 3000);
  };
})();
