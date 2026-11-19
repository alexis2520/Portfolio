/* Affiche les albums à partir de galleries.js (modifié automatiquement par admin.html) */
(() => {
  const A = window.GALLERIES || [];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const st = p => (p ? `--ox:${p[0]}%;--oy:${p[1]}%;--z:${p[2] || 1}` : '');
  const idx = document.getElementById('albums');
  if (idx) {
    const bar = document.getElementById('chips'), cats = [...new Set(A.map(a => a.cat).filter(Boolean))];
    const card = a => `<a class="card panel" href="galerie.html?g=${encodeURIComponent(a.id)}"><div class="thumb"><img src="${a.folder}/thumb/${a.thumb || a.cover}.webp" style="${st(a.tpos)}" alt="" loading="lazy" decoding="async"></div>
      <div class="info"><h3>${esc(a.title)}</h3><p>${esc(a.date)} · ${a.photos.length} photos</p></div></a>`;
    const draw = cat => {
      idx.innerHTML = A.filter(a => !cat || a.cat === cat).map(card).join('');
      bar.querySelectorAll('.chip').forEach(b => b.classList.toggle('on', b.dataset.c === cat));
    };
    bar.innerHTML = cats.length > 1 ? ['', ...cats].map(c => `<button class="chip" data-c="${esc(c)}">${c ? esc(c) : 'Tout'}</button>`).join('') : '';
    bar.onclick = e => { const b = e.target.closest('.chip'); if (b) draw(b.dataset.c); };
    draw('');
  }
  const pg = document.getElementById('album-page');
  if (pg) {
    const k = A.findIndex(a => a.id === new URLSearchParams(location.search).get('g')), a = A[k];
    if (!a) { pg.innerHTML = '<p style="text-align:center;padding:80px 20px">Album introuvable. <a class="btn" href="index.html#photo">Retour aux photos</a></p>'; return; }
    document.title = `${a.title} - Alexis Bouchaud`;
    const n = a.photos.length, pv = A[(k - 1 + A.length) % A.length], nx = A[(k + 1) % A.length];
    pg.innerHTML = `<div class="g-hero"><div class="cbox"><img class="cover" style="${st(a.cpos)}" src="${a.folder}/large/${a.cover}.webp" alt="Couverture : ${esc(a.title)}"></div>
      <small>${esc(a.date)}</small><h1>${esc(a.title)}</h1><p>Alexis Bouchaud</p>
      ${a.link ? `<p style="margin-top:18px"><a class="btn" href="${esc(a.link.href)}">${esc(a.link.label)}</a></p>` : ''}</div>
      <div class="masonry">${a.photos.map(([p, w, h], i) => `<button class="ph" aria-label="Agrandir la photo ${i + 1}"><img src="${a.folder}/thumb/${p}.webp" data-full="${a.folder}/large/${p}.webp" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${esc(a.title)}, photo ${i + 1} sur ${n}"></button>`).join('')}</div>
      ${A.length > 1 ? `<div class="project"><nav class="next" aria-label="Autres albums"><a class="btn" href="galerie.html?g=${encodeURIComponent(pv.id)}">&larr; ${esc(pv.title)}</a><a class="btn" href="galerie.html?g=${encodeURIComponent(nx.id)}">${esc(nx.title)} &rarr;</a></nav></div>` : ''}`;
  }

  /* ---------- Vidéos ---------- */
  const V = window.VIDEOS || [];
  const embed = u => { let m;
    if ((m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-z0-9]+))?/i))) return `https://player.vimeo.com/video/${m[1]}?badge=0&autopause=0${m[2] ? '&h=' + m[2] : ''}`;
    if ((m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/))) return `https://www.youtube-nocookie.com/embed/${m[1]}?enablejsapi=1&rel=0`;
    return null; };
  const ext = v => /^https?:/.test(v.link), page = v => (ext(v) && embed(v.link) ? `video.html?v=${encodeURIComponent(v.id)}` : v.link);
  const vl = document.getElementById('videos');
  if (vl) vl.innerHTML = V.map(v => `<a class="card panel" href="${esc(page(v))}"${ext(v) && !embed(v.link) ? ' target="_blank" rel="noopener"' : ''}>
    <div class="thumb"><video data-preview muted loop playsinline preload="metadata" ${v.poster ? `poster="${esc(v.poster)}"` : ''} src="${esc(v.preview)}#t=0.1" aria-hidden="true"></video><span class="play">&#9654;</span></div>
    <div class="info"><h3>${esc(v.title)}</h3><p>${esc(v.sub || '')}</p></div></a>`).join('');
  const vp = document.getElementById('video-page');
  if (vp) {
    const v = V.find(x => x.id === new URLSearchParams(location.search).get('v')), src = v && ext(v) && embed(v.link);
    if (!src) vp.innerHTML = '<p style="text-align:center;padding:80px 20px">Vidéo introuvable. <a class="btn" href="index.html#video">Retour aux vidéos</a></p>';
    else {
      document.title = `${v.title} - Alexis Bouchaud`;
      const ps = String(v.desc || '').split(/\n+/).filter(Boolean).map(t => `<p>${t}</p>`).join('');
      const bt = `<p style="display:flex;gap:12px;flex-wrap:wrap;margin-top:24px"><a class="btn" href="index.html#video">&larr; Toutes les vidéos</a>${v.btn ? `<a class="btn solid" href="${esc(v.btn.href)}">${esc(v.btn.label)}</a>` : ''}<a class="btn" href="${esc(v.link)}" target="_blank" rel="noopener">Voir sur le site d'origine</a></p>`;
      const parts = v.parts && v.parts.length ? `<div class="chips" id="parts">${v.parts.map((p, i) => `<button class="chip${i ? '' : ' on'}" data-l="${esc(p.link)}">${esc(p.t)}</button>`).join('')}</div>` : '';
      const player = `<div class="player-box"><iframe id="vf" src="${esc(src)}" title="${esc(v.title)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
      const head = `<h1>${esc(v.title)}</h1><p class="sub">${esc(v.sub || '')}</p>`;
      vp.className = v.portrait ? 'project portrait' : 'project';
      vp.innerHTML = v.portrait ? `<div class="desc">${head}${ps}${bt}</div>${player}` : `${head}${parts}${player}<div class="desc">${ps}</div>${bt}`;
      const pb = document.getElementById('parts');
      if (pb) pb.onclick = e => { const b = e.target.closest('.chip'); if (!b) return; pb.querySelectorAll('.chip').forEach(c => c.classList.toggle('on', c === b)); document.getElementById('vf').src = embed(b.dataset.l); };
    }
  }
  /* si le navigateur garde une vieille copie de galleries.js, on la rafraîchit une fois */
  if (location.protocol.startsWith('http')) fetch('galleries.js', { cache: 'no-cache' }).then(r => r.text()).then(t => {
    const o = JSON.stringify([window.GALLERIES, window.VIDEOS]); (0, eval)(t);
    if (JSON.stringify([window.GALLERIES, window.VIDEOS]) !== o && !sessionStorage.gf) { sessionStorage.gf = 1; location.reload(); } else sessionStorage.removeItem('gf');
  }).catch(() => {});
})();
