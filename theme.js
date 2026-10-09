(() => {
  const N = 7, root = document.documentElement;
  const NAMES = ['Jazz café', 'Rétro néon', 'Rêverie', 'Épique', 'Enfance', 'Classique', 'Sport'];
  const LOGOS = ['jazz', 'retro', 'reve', 'epic', 'enfant', 'classic', 'sport'];
  const store = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let theme = parseInt(store.get('currentTheme'), 10); if (isNaN(theme)) theme = 0;
  let wantsMusic = store.get('music') === 'on';   // préférence mémorisée entre les pages

  /* ---------- Musique : un seul <audio>, chargé à la demande, avec fondu ---------- */
  const audio = new Audio(); audio.loop = true; audio.preload = 'none';
  let fadeTimer, muted = false;
  const GAME_URL = '';   // ← easter egg : adresse du jeu une fois en ligne (ex. 'https://mon-jeu.onrender.com')
  function fade(to, done) {
    clearInterval(fadeTimer);
    fadeTimer = setInterval(() => {
      const d = to - audio.volume;
      if (Math.abs(d) < 0.08) { audio.volume = to; clearInterval(fadeTimer); done && done(); }
      else audio.volume = Math.min(1, Math.max(0, audio.volume + Math.sign(d) * 0.08));
    }, 40);
  }
  function play(resumeAt) {
    const src = `musique/theme${theme}.mp3`;
    if (!audio.src.endsWith(src)) { audio.src = src; }
    if (resumeAt) audio.addEventListener('loadedmetadata', () => { audio.currentTime = resumeAt; }, { once: true });
    muted = false; audio.volume = 0;
    return audio.play().then(() => { wantsMusic = true; store.set('music', 'on'); fade(1); ui(); })
      .catch(() => { ui(); });                      // autoplay refusé : on attendra un clic
  }
  function pause(remember = true) {
    muted = true; fade(0, () => audio.pause());
    if (remember) { wantsMusic = false; store.set('music', 'off'); }
    ui();
  }
  const toggle = () => (audio.paused || muted ? play() : pause());

  /* Reprise de la musique là où elle s'était arrêtée en changeant de page */
  addEventListener('pagehide', () => {
    if (!audio.paused) store.set('musicTime', JSON.stringify({ t: audio.currentTime, th: theme }));
  });

  /* ---------- Changement d'ambiance ---------- */
  function apply(i, animate) {
    theme = (i + N) % N; store.set('currentTheme', theme);
    const logo = document.getElementById('header-logo');
    const swap = () => {
      root.dataset.theme = theme;
      if (logo) { logo.src = `PNG_page_acceuil/logo-${LOGOS[theme]}.webp`; logo.classList.remove('fade'); }
      root.classList.remove('swap'); ui();
    };
    if (animate && !reduce) {
      root.classList.add('swap'); logo && logo.classList.add('fade'); setTimeout(swap, 280);
    } else swap();
    if (animate && (wantsMusic || !audio.paused)) { audio.pause(); play(); }
  }

  /* ---------- Lecteur flottant (injecté sur toutes les pages) ---------- */
  let playerEl;
  function buildPlayer() {
    playerEl = document.createElement('div'); playerEl.id = 'player';
    playerEl.setAttribute('role', 'group'); playerEl.setAttribute('aria-label', "Ambiance et musique");
    playerEl.innerHTML = `<button class="pv" aria-label="Ambiance précédente">&#10094;</button>
      <button class="ic" aria-label="Lancer ou couper la musique"><img alt=""></button>
      <button class="nx" aria-label="Ambiance suivante">&#10095;</button>`;
    document.body.appendChild(playerEl);
    playerEl.querySelector('.pv').onclick = () => apply(theme - 1, true);
    playerEl.querySelector('.nx').onclick = () => apply(theme + 1, true);
    playerEl.querySelector('.ic').onclick = toggle;
  }
  function ui() {
    if (!playerEl) return;
    playerEl.querySelector('img').src = `PNG_page_acceuil/icon${theme}.webp`;
    playerEl.querySelector('.ic').setAttribute('aria-label', NAMES[theme] + ' : lancer ou couper la musique');
    const on = !audio.paused && !muted;
    playerEl.classList.toggle('playing', on);
    playerEl.querySelector('.ic').title = NAMES[theme] + (on ? ' · couper la musique' : ' · lancer la musique');
  }

  /* ---------- Parallaxe du fond (légère, via variable CSS) ---------- */
  let tick = false;
  if (!reduce) addEventListener('scroll', () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const h = document.body.scrollHeight - innerHeight;
      root.style.setProperty('--py', (h > 0 ? -(scrollY / h) * 100 : 0) + 'px'); tick = false;
    });
  }, { passive: true });

  /* ---------- Visionneuse photo (pages galerie) ---------- */
  function lightbox() {
    const items = [...document.querySelectorAll('.ph img')]; if (!items.length) return;
    const lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = `<button class="x" aria-label="Fermer">&times;</button><button class="p" aria-label="Photo précédente">&#10094;</button>
      <img alt=""><button class="n" aria-label="Photo suivante">&#10095;</button><div class="c"></div>`;
    document.body.appendChild(lb);
    const img = lb.querySelector('img'), cnt = lb.querySelector('.c'); let i = 0, opener;
    const show = k => {
      i = (k + items.length) % items.length; const el = items[i];
      img.style.opacity = .3; img.src = el.dataset.full; img.alt = el.alt;
      img.onload = () => (img.style.opacity = 1); cnt.textContent = `${i + 1} / ${items.length}`;
      [i - 1, i + 1].forEach(j => { new Image().src = items[(j + items.length) % items.length].dataset.full; });
    };
    const open = k => { opener = document.activeElement; show(k); lb.classList.add('on'); document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus(); };
    const close = () => { lb.classList.remove('on'); document.body.style.overflow = ''; opener && opener.focus(); };
    items.forEach((el, k) => el.closest('.ph').addEventListener('click', () => open(k)));
    lb.querySelector('.x').onclick = close; lb.querySelector('.p').onclick = () => show(i - 1); lb.querySelector('.n').onclick = () => show(i + 1);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('on')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1);
    });
    let x0 = null;                                   // balayage au doigt
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => {
      if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); x0 = null;
    });
  }

  /* ---------- Vidéos d'aperçu : survol (souris) ou visibilité (tactile) ---------- */
  function previews() {
    const vids = [...document.querySelectorAll('video[data-preview]')]; if (!vids.length) return;
    const touch = matchMedia('(hover: none)').matches;
    vids.forEach(v => {
      const card = v.closest('a'); card.addEventListener('mouseenter', () => v.play().catch(() => {}));
      card.addEventListener('mouseleave', () => v.pause()); card.addEventListener('focus', () => v.play().catch(() => {}));
      card.addEventListener('blur', () => v.pause());
    });
    if (touch && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: .6 });
      vids.forEach(v => io.observe(v));
    }
  }

  /* ---------- Carrousel de logiciels : duplication auto (pas de copier-coller) ---------- */
  function marquee() {
    const t = document.querySelector('.track'); if (!t) return;
    [...t.children].forEach(c => { const d = c.cloneNode(true); d.setAttribute('aria-hidden', 'true'); d.querySelector('img').alt = ''; t.appendChild(d); });
  }

  /* ---------- Lien actif dans le menu ---------- */
  function spy() {
    const links = [...document.querySelectorAll('.nav a[href^="#"]')]; if (!links.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.hash === '#' + e.target.id));
    }), { rootMargin: '-40% 0px -55% 0px' });
    links.forEach(a => { const s = document.querySelector(a.hash); s && io.observe(s); });
  }


  /* ---------- Fonds animés : une scène différente par thème, réactive à la souris et au clic ---------- */
  function fx() {
    const cv = document.createElement('canvas'); cv.id = 'fx'; document.body.prepend(cv);
    if (reduce) return;
    const c = cv.getContext('2d'); let W, H, P = [], m = { x: -999, y: -999 }, t = 0;
    const R = (a, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
    const rs = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; }; rs(); addEventListener('resize', rs);
    const dot = (p, col) => { c.fillStyle = col; c.beginPath(); c.arc(p.x, p.y, p.r, 0, 7); c.fill(); };
    const K = [
      { n: 30, mk: () => ({ x: R(W), y: R(H), r: R(10, 50), vx: R(-.2, .2), vy: R(-.35, -.05), h: R(20, 45), a: R(.06, .2) }),   // café : bokeh chaud
        dr: p => dot(p, `hsla(${p.h},90%,60%,${p.a})`) },
      { n: 18, mk: () => ({ x: R(W), y: R(H), r: R(1, 3), vx: 0, vy: R(.3, .9), h: R(0, 1) > .5 ? 320 : 185, a: 1 }),             // néon : grille + soleil
        pre: () => {
          const hz = H * .6, g = c.createLinearGradient(0, hz - 140, 0, hz); g.addColorStop(0, '#ffe14a'); g.addColorStop(1, '#ff2d95');
          c.fillStyle = g; c.beginPath(); c.arc(W / 2, hz, 110, Math.PI, 0); c.fill();
          c.strokeStyle = 'rgba(255,79,163,.45)'; c.lineWidth = 1;
          for (let i = -24; i <= 24; i++) { c.beginPath(); c.moveTo(W / 2 + i * 30, hz); c.lineTo(W / 2 + i * W / 10, H); c.stroke(); }
          for (let i = 0; i < 12; i++) { const k = ((i + t / 50) % 12) / 12, y = hz + (H - hz) * k * k; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        }, dr: p => dot(p, `hsl(${p.h},100%,70%)`) },
      { n: 70, mk: () => ({ x: R(W), y: R(H), r: R(.8, 3), vx: R(-.05, .05), vy: R(-.12, -.02), ph: R(6), h: R(0, 1) > .5 ? 300 : 250 }),   // rêverie : étoiles
        dr: p => dot(p, `hsla(${p.h},90%,85%,${.35 + .45 * Math.sin(t / 30 + p.ph)})`) },
      { n: 55, mk: () => ({ x: R(W), y: H + R(40), r: R(1, 3.5), vx: R(-.3, .3), vy: R(-1.8, -.5), h: R(12, 42) }),                     // épique : braises
        dr: p => dot(p, `hsla(${p.h},100%,55%,${.55 + .4 * Math.sin(t / 5 + p.x)})`) },
      { n: 16, mk: () => ({ x: R(W), y: H + R(60), r: R(30, 52), vx: 0, vy: R(-.9, -.35), ph: R(6), g: ['🎈', '⭐', '🌈', '🦋', '🌻', '☁️', '🎨'][Math.floor(R(7))] }),   // enfance : ballons, étoiles, papillons
        dr: p => { p.x += Math.sin(t / 45 + p.ph) * .7; c.font = `${p.r}px serif`; c.globalAlpha = .85; c.fillText(p.g, p.x, p.y); c.globalAlpha = 1; } },
      { n: 26, mk: () => ({ x: R(W), y: H + R(60), r: R(14, 34), vx: 0, vy: R(-.7, -.3), ph: R(6), g: '♪♫♬♩'[Math.floor(R(4))], a: R(.15, .35) }), // classique : notes
        dr: p => { p.x += Math.sin(t / 40 + p.ph) * .5; c.font = `${p.r}px serif`; c.fillStyle = `rgba(240,225,190,${p.a})`; c.fillText(p.g, p.x, p.y); } },
      { n: 9, mk: () => ({ x: R(W), y: R(H * .6), r: R(34, 54), vx: R(1, 2.6) * (R(1) > .5 ? 1 : -1), vy: R(-2, 2), g: ['⚽', '🏀', '🎾', '🏸', '🏐', '🏉', '🏓'][Math.floor(R(7))] }),   // sport : balles qui rebondissent
        dr: p => { p.vy += .28; if (p.y > H - 10) { p.y = H - 10; p.vy *= -.84; } c.font = `${p.r}px serif`; c.fillText(p.g, p.x, p.y); } }
    ];
    addEventListener('mousemove', e => { m.x = e.clientX; m.y = e.clientY; }, { passive: true });
    addEventListener('click', e => {
      const k = K[theme]; for (let i = 0; i < 14; i++) P.push({ ...k.mk(), x: e.clientX, y: e.clientY, vx: R(-4, 4), vy: R(-4, 4), life: 70 });
    });
    (function loop() {
      t++; c.clearRect(0, 0, W, H); const k = K[theme];
      if (P.th !== theme) { P = []; P.th = theme; }
      k.pre && k.pre(); while (P.filter(p => p.life === undefined).length < k.n) P.push(k.mk());
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i]; p.x += p.vx; p.y += p.vy;
        const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
        if (d < 140 && d > 0) { p.x += dx / d * 2.4; p.y += dy / d * 2.4; }       // la souris repousse les éléments
        const out = p.y < -80 || p.y > H + 80 || p.x < -320 || p.x > W + 80;
        if (p.life !== undefined) { if (--p.life < 0 || out) { P.splice(i, 1); continue; } }
        else if (out) { const q = k.mk(); if (Math.abs(q.vy) >= Math.abs(q.vx) && q.vy) q.y = q.vy < 0 ? H + 50 : -50; else q.x = q.vx > 0 ? -50 - (q.len || 0) : W + 50; Object.assign(p, q); }
        k.dr(p);
      }
      requestAnimationFrame(loop);
    })();
  }

  /* ---------- Accueil : timecode, logo qui suit la souris, cartes inclinables ---------- */
  function life() {
    const tc = document.getElementById('tc');
    if (tc) setInterval(() => { const f = Math.floor(performance.now() / 40), p = n => String(n).padStart(2, '0');
      tc.textContent = `${p(Math.floor(f / 90000) % 100)}:${p(Math.floor(f / 1500) % 60)}:${p(Math.floor(f / 25) % 60)}:${p(f % 25)}`; }, 40);
    if (reduce) return;
    const logo = document.getElementById('header-logo');
    if (logo) addEventListener('mousemove', e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      logo.style.transform = `translate(${x * -22}px,${y * -14}px)`; }, { passive: true });
    document.querySelectorAll('.card').forEach(cd => {
      cd.addEventListener('mousemove', e => { const r = cd.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        cd.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-5px)`; });
      cd.addEventListener('mouseleave', () => { cd.style.transform = ''; });
    });
  }


  /* ---------- Easter egg : 7 clics d'affilée sur DaVinci Resolve ---------- */
  function egg() {
    const track = document.querySelector('.track'); if (!track) return;
    let n = 0, last = 0;
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('.app'), now = Date.now();
      if (!a || a.dataset.k !== 'davinci' || now - last > 2000) n = (a && a.dataset.k === 'davinci') ? 0 : 0;
      if (a && a.dataset.k === 'davinci') { n++; last = now; } else { n = 0; return; }
      if (n < 7) return; n = 0;
      const t = document.createElement('div'); t.textContent = '🐺';
      t.style.cssText = 'position:fixed;inset:0;z-index:5000;display:grid;place-items:center;font-size:30vmin;background:rgba(0,0,0,.85);animation:none';
      document.body.appendChild(t);
      if (GAME_URL) setTimeout(() => { location.href = GAME_URL; }, 700);
      else { t.innerHTML += '<p style="position:absolute;bottom:18%;font:700 1.1rem system-ui;color:#fff;text-align:center;padding:0 20px">Le jeu n\'est pas encore en ligne…</p>'; setTimeout(() => t.remove(), 2200); }
    });
  }

  /* ---------- Démarrage ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    buildPlayer(); fx(); life(); egg(); apply(theme, false); marquee(); lightbox(); previews(); spy();
    // reprise automatique si l'utilisateur écoutait déjà sur la page précédente
    let saved; try { saved = JSON.parse(store.get('musicTime')); } catch (e) {}
    if (wantsMusic) play(saved && saved.th === theme ? saved.t : 0);
    // sinon / si bloqué : le premier clic ou toucher lance la musique (sauf si coupée volontairement)
    const first = e => {
      if (e.target.closest && e.target.closest('#player')) return;
      if (store.get('music') !== 'off' && audio.paused) play();
      removeEventListener('click', first); removeEventListener('touchstart', first);
    };
    addEventListener('click', first); addEventListener('touchstart', first, { passive: true });
  });
})();
