import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { text, projects } from './content.js';
import { createJourney } from './scene.js';

gsap.registerPlugin(ScrollTrigger);
const $ = selector => document.querySelector(selector);
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let lang = 'zh';
try { lang = localStorage.getItem('yw-lang') === 'en' ? 'en' : 'zh'; } catch {}
let paused = motionPreference.matches;
let journey, animationContext, activeProject = null, modalOpener;
const dialog = $('#project-dialog');
const sectionCopy = {
  zh: {
    available: '金融科技探索者 / 2027 届',
    headline: '<span class="line"><span>不止于</span></span><span class="line"><span>一个</span></span><span class="line"><span><em>维度。</em></span></span>',
    intro: '我是 <strong>yeweiyang</strong>。以金融科技为起点，在代码、财税与开源社区之间，探索更多可能。',
    enter: '进入我的项目空间', scroll: '向下滚动，穿行于不同维度', art: '逻辑 · 好奇心 · 创造力',
    work: '四个项目，四种探索。',
    workIntro: '沿着一条空间路径，看见技术如何连接真实的业务与人。',
    chapters: ['流萤，<br><em>数有所依。</em>', '让文字，<br><em>有了声音。</em>', '连接，<br><em>不止一种。</em>', '留一处，<br><em>自由生长。</em>'],
    detail: '走进这个项目', pause: '暂停动态', play: '开启动态', interact: '触动空间',
    proofs: ['金融科技毕业作品 · 持续迭代', '上游 PR #200 / #201 已合并', '三方框架接入 · 社区持续运营', '独立建站 · ICP 备案 · 内容运营'],
    metrics: ['新增用户', '浏览量', '真实访客'],
    contact: '让下一次相遇，<br>发生点<em>新东西。</em>',
    next: '下一个项目', previous: '上一个项目', source: '源码 / 贡献记录', close: '关闭项目详情',
  },
  en: {
    available: 'FINTECH EXPLORER / CLASS OF 2027',
    headline: '<span class="line"><span>Beyond</span></span><span class="line"><span>one</span></span><span class="line"><span><em>dimension.</em></span></span>',
    intro: 'I’m <strong>yeweiyang</strong>. Exploring the possibilities between financial technology, code, and open-source communities.',
    enter: 'Step into my work', scroll: 'SCROLL TO EXPLORE THE DIMENSIONS', art: 'LOGIC · CURIOSITY · CREATIVITY',
    work: 'Four projects. New perspectives.',
    workIntro: 'Follow a spatial journey through technology, real business needs, and human connections.',
    chapters: ['Finance,<br><em>made fluid.</em>', 'Give words<br><em>a voice.</em>', 'Connected<br><em>by curiosity.</em>', 'A place<br><em>to grow.</em>'],
    detail: 'Inside the project', pause: 'PAUSE MOTION', play: 'ENABLE MOTION', interact: 'ACTIVATE SPACE',
    proofs: ['FINTECH GRADUATION PROJECT / IN DEVELOPMENT', 'UPSTREAM PR #200 / #201 MERGED', 'THREE FRAMEWORKS / COMMUNITY OPERATIONS', 'INDEPENDENT SITE / ICP FILING / CONTENT'],
    metrics: ['NEW USERS', 'PAGE VIEWS', 'UNIQUE VISITORS'],
    contact: 'Let’s make the next<br>intersection <em>matter.</em>',
    next: 'Next project', previous: 'Previous project', source: 'SOURCE / CONTRIBUTION', close: 'Close project details',
  },
};

function renderPage() {
  const c = text[lang], s = sectionCopy[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = 'yeweiyang — ' + (lang === 'zh' ? '不止于一个维度。' : 'Beyond one dimension.');
  $('#language').innerHTML = lang === 'zh' ? '中 <span>/ EN</span>' : 'EN <span>/ 中</span>';
  $('#language').setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换为中文');
  document.querySelectorAll('[data-i]').forEach(el => el.textContent = c[el.dataset.i]);
  $('#main').innerHTML = `
    <section id="home" class="hero" aria-labelledby="hero-title">
      <div class="hero-content">
        <p class="eyebrow hero-kicker"><span class="availability-dot"></span>${s.available}</p>
        <h1 id="hero-title">${s.headline}</h1>
        <p class="hero-intro">${s.intro}</p>
        <div class="hero-actions"><a class="round-link" href="#projects"><span class="arrow">↘</span><span>${s.enter}</span></a><button class="text-link" id="print">${c.resume} ↓</button></div>
      </div>
      <div class="hero-index" aria-hidden="true">FIG. 00 — THE INTERSECTION</div>
      <div class="hero-bottom"><a class="scroll-cue" href="#projects"><span class="scroll-line"></span>${s.scroll}</a><div>INDEPENDENT MIND.<br>${s.art}</div></div>
    </section>
    <section class="work-intro" id="projects"><p class="eyebrow">01 — 04 / SELECTED EXPLORATIONS</p><h2>${s.work}</h2><p>${s.workIntro}</p></section>
    <div class="project-journey">
      ${projects.map((p, i) => `
        <section class="chapter" id="${p.id}" data-scene="${i + 1}" aria-labelledby="title-${p.id}">
          <div class="chapter-inner"><div class="chapter-copy">
            <span class="chapter-num" aria-hidden="true">0${i + 1}</span>
            <p class="eyebrow">${p.category}</p>
            <h2 id="title-${p.id}">${s.chapters[i]}</h2>
            <p class="chapter-summary"><strong>${p[lang][0]}</strong><br>${p[lang][1]}</p>
            <div class="tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
            ${p.id === 'blog' ? `<div class="project-stats">${['~50', '~5k', '~2k'].map((n, j) => `<div><b>${n}</b><small>${s.metrics[j]}</small></div>`).join('')}</div>` : ''}
            <button class="round-link project-open" data-project="${p.id}" aria-label="${s.detail}: ${p[lang][0]}"><span class="arrow">↗</span><span>${s.detail}</span></button>
            <p class="project-proof">${s.proofs[i]}</p>
          </div></div>
          <span class="scene-tag" aria-hidden="true">0${i + 1} / ${['FINANCIAL FLOW', 'RESONANCE', 'CONNECTED', 'UNFOLD'][i]}</span>
        </section>`).join('')}
    </div>
    <p class="source-note">${c.sourceNote}</p>
    <section class="paper-section experience-section" id="experience">
      <div class="section-heading reveal"><div><p class="eyebrow">05 / IN THE REAL WORLD</p><h2>${c.experienceTitle}</h2></div><p>${c.experienceIntro}</p></div>
      <article class="experience-layout reveal"><div><span class="date">2026.03 — 2026.06</span><h3>${c.taxOffice}</h3><p class="muted">${c.internship}</p><div class="experience-symbol" aria-hidden="true">↗</div></div>
        <div><p class="experience-lead">${c.taxLead}</p><ol class="task-list">${[1, 2, 3, 4].map(i => `<li>${c['task' + i]}</li>`).join('')}</ol><div class="tags"><span>${c.system1}</span><span>${c.system2}</span><span>${c.system3}</span></div></div>
      </article>
    </section>
    <section class="paper-section about-section" id="about">
      <div class="section-heading reveal"><div><p class="eyebrow">06 / ALWAYS IN PROGRESS</p><h2>${c.aboutTitle}</h2></div><p>${c.aboutIntro}</p></div>
      <div class="about-grid reveal"><article class="education"><p class="eyebrow">${c.education}</p><h3>${c.major}</h3><p class="muted">${c.degree}</p><div class="education-bottom"><b>2024 — 2027</b><span>CET-4 / CET-6</span></div></article>
        <article class="awards" aria-label="${c.awards}">${c.awardList.map(([name, prize]) => `<div class="award"><span aria-hidden="true">✳</span><div><p>${name}</p><small>${prize}</small></div></div>`).join('')}</article>
      </div>
      <div class="skills reveal">${['Python', 'API Integration', 'WordPress', 'Cloudflare', c.skillData, c.skillTax, c.skillCommunity].map(t => `<span>${t}</span>`).join('')}</div>
    </section>
    <section class="contact"><p class="eyebrow">07 / AN OPEN INVITATION</p><h2 class="reveal">${s.contact}</h2><div class="contact-bottom"><p>${c.contactText}</p><a class="round-link" href="https://github.com/ikun441" target="_blank" rel="noopener noreferrer"><span class="arrow">↗</span><span>${c.contactButton}</span></a></div></section>
    <footer><a class="wordmark" href="#home">yeweiyang<span>®</span></a><span>© 2026 / PERSONAL EXPLORATIONS</span><a href="#home">${c.backTop}</a></footer>
  `;
  $('#scene-control span').textContent = lang === 'zh' ? '拖动旋转 / 点击触动' : 'DRAG TO ROTATE / CLICK TO PLAY';
  $('#scene-control').setAttribute('aria-label', lang === 'zh' ? '拖动旋转场景，方向键旋转，回车触动' : 'Drag to rotate scene. Use arrow keys to rotate, Enter to activate.');
  $('.journey-rail').innerHTML = ['home', ...projects.map(p => p.id)].map((id, i) => `<a href="#${id}" aria-label="${i === 0 ? (lang === 'zh' ? '首页' : 'Home') : projects[i - 1][lang][0]}" ${i === 0 ? 'aria-current="step"' : ''}><span class="rail-label">${i === 0 ? '00 / HOME' : '0' + i + ' / ' + projects[i - 1].id.toUpperCase()}</span></a>`).join('');
  $('#print').onclick = () => print();
  updateMotionButton();
}

function animatePage() {
  animationContext?.revert();
  if (paused) return;
  animationContext = gsap.context(() => {
    gsap.from('.hero .line > span', { yPercent: 115, rotate: 4, duration: 1.35, stagger: .11, ease: 'power4.out', delay: .12 });
    gsap.from('.hero-kicker,.hero-intro,.hero-actions', { opacity: 0, y: 20, duration: 1, stagger: .13, delay: .5, ease: 'power3.out' });
    gsap.to('.hero-content', { y: -90, opacity: .15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 10%', scrub: true } });
    document.querySelectorAll('.chapter-copy').forEach(el => {
      gsap.from(el, { opacity: 0, y: 65, rotateX: -8, transformPerspective: 1000, duration: 1.2, ease: 'power3.out',
        scrollTrigger: { trigger: el.closest('.chapter'), start: 'top 60%', toggleActions: 'play none none reverse' } });
    });
    document.querySelectorAll('.reveal').forEach(el => {
      gsap.from(el, { opacity: 0, y: 35, duration: .9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 93%', toggleActions: 'play none none reverse' } });
    });
  });
}

function updateMotionButton() {
  const button = $('#motion-toggle');
  button.textContent = paused ? sectionCopy[lang].play : sectionCopy[lang].pause;
  button.setAttribute('aria-pressed', String(paused));
  document.body.classList.toggle('motion-paused', paused);
}
function setPaused(value) {
  paused = value; updateMotionButton(); journey?.setPaused(value); animatePage(); ScrollTrigger.refresh();
}
function showProject(id, opening = true) {
  const p = projects.find(p => p.id === id), t = p[lang], c = text[lang], s = sectionCopy[lang];
  activeProject = id;
  const index = projects.indexOf(p);
  $('#dialog-content').innerHTML = `
    <p class="eyebrow">${p.category}</p><h2 id="dialog-title">${t[0]}</h2>
    <p class="dialog-proof">${s.proofs[index]}</p>
    <div class="tags">${p.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
    <h3>${c.context}</h3><p>${t[2]}</p><h3>${c.practice}</h3>
    <ul>${t[3].map(step => `<li>${step}</li>`).join('')}</ul>
    <h3>${c.outcome}</h3><p>${t[4]}</p>
    <a class="dialog-link" href="${p.url}" target="_blank" rel="noopener noreferrer">${c.link}</a>
    ${id === 'tts' ? '<p><a class="text-link" href="https://github.com/xinnan-tech/xiaozhi-esp32-server/pull/201" target="_blank" rel="noopener noreferrer">Configuration PR #201 ↗</a></p>' : ''}
    <div class="modal-nav"><button data-modal-next="${projects[(index + 1) % projects.length].id}">${s.next} →</button><span>0${index + 1} / 04</span></div>
  `;
  $('.close-dialog').setAttribute('aria-label', s.close);
  if (!dialog.open) {
    modalOpener = document.activeElement;
    dialog.showModal(); journey?.pulse();
  }
  dialog.scrollTop = 0;
  if (!opening) $('.close-dialog').focus();
}
$('#main').addEventListener('click', e => {
  const button = e.target.closest('[data-project]');
  if (button) showProject(button.dataset.project);
});
dialog.addEventListener('click', e => {
  const next = e.target.closest('[data-modal-next]');
  if (next) showProject(next.dataset.modalNext, false);
  const r = dialog.getBoundingClientRect();
  if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
});
$('.close-dialog').onclick = () => dialog.close();
dialog.addEventListener('close', () => {
  if (modalOpener?.isConnected) modalOpener.focus({ preventScroll: true });
});
$('#language').onclick = () => {
  const anchor = ['home', 'projects', ...projects.map(p => p.id), 'experience', 'about'].map(id => {
    const el = document.getElementById(id); return { id, offset: Math.abs(el.getBoundingClientRect().top), top: el.getBoundingClientRect().top };
  }).sort((a, b) => a.offset - b.offset)[0];
  animationContext?.revert();
  lang = lang === 'zh' ? 'en' : 'zh';
  try { localStorage.setItem('yw-lang', lang); } catch {}
  renderPage(); animatePage(); journey?.refresh(); ScrollTrigger.refresh();
  const el = document.getElementById(anchor.id);
  window.scrollTo({ top: el.offsetTop - anchor.top, behavior: 'instant' });
  if (dialog.open) showProject(activeProject, false);
};
$('#motion-toggle').onclick = () => setPaused(!paused);
motionPreference.addEventListener('change', e => setPaused(e.matches));

renderPage();
journey = createJourney({
  container: $('#stage'), reduced: paused,
  onStation(index, name) {
    $('#scene-control').classList.toggle('on-left', index === 2 || index === 4);
    $('#scene-control').classList.toggle('is-hero', index === 0);
    $('#scene-name').textContent = name; $('#scene-number').textContent = '0' + index + ' / 04';
    document.querySelectorAll('.journey-rail a').forEach((a, i) => {
      if (i === index) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
  },
  onStatus(status) { $('#render-status').textContent = status; },
});
animatePage();
let scrollPending = false;
addEventListener('scroll', () => {
  if (scrollPending) return; scrollPending = true;
  requestAnimationFrame(() => {
    const total = document.documentElement.scrollHeight - innerHeight;
    $('.scroll-progress > div').style.width = (total > 0 ? scrollY / total * 100 : 0) + '%';
    const pastScenes = scrollY > document.querySelector('.source-note').offsetTop - innerHeight * .3;
    $('.scene-hud').style.opacity = pastScenes ? '0' : '1';
    $('.journey-rail').style.opacity = pastScenes ? '0' : '1';
    $('.journey-rail').style.pointerEvents = pastScenes ? 'none' : '';
    $('.journey-rail').inert = pastScenes;
    $('#scene-control').hidden = pastScenes;
    scrollPending = false;
  });
}, { passive: true });
document.fonts.ready.then(() => { journey.refresh(); ScrollTrigger.refresh(); });
if (import.meta.hot) import.meta.hot.dispose(() => { journey.dispose(); animationContext?.revert(); });

const sceneControl = $('#scene-control');
let drag = null;
sceneControl.addEventListener('pointerdown', e => {
  drag = { x: e.clientX, y: e.clientY, distance: 0 };
  sceneControl.setPointerCapture(e.pointerId);
});
sceneControl.addEventListener('pointermove', e => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  drag.distance += Math.abs(dx) + Math.abs(dy);
  journey.rotate(dx * .008, dy * .006);
  drag.x = e.clientX; drag.y = e.clientY;
});
sceneControl.addEventListener('pointerup', () => {
  if (drag && drag.distance < 5) journey.pulse();
  drag = null;
});
sceneControl.addEventListener('pointercancel', () => { drag = null; });
sceneControl.addEventListener('keydown', e => {
  const keys = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, -.1], ArrowDown: [0, .1] };
  if (keys[e.key]) { e.preventDefault(); journey.rotate(...keys[e.key]); }
  else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); journey.pulse(); }
});
