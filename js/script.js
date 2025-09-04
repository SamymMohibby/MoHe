// Active nav link based on section in view
const sections = ['hero','services','pricing','booking','testimonials','gallery','about','contact']
  .map(id => document.getElementById(id));
const allNavLinks = Array.from(document.querySelectorAll('header a[href^="#"]'));
const setActive = (id) => {
  allNavLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
};
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); });
}, { root: null, rootMargin: '-40% 0px -55% 0px', threshold: 0 });
sections.forEach(sec => sec && navObserver.observe(sec));

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(ent => { if (ent.isIntersecting) { ent.target.classList.add('show'); revealObs.unobserve(ent.target); } });
},{ threshold: .12 });
revealEls.forEach(el => revealObs.observe(el));

// Button ripple
function addRipple(e){
  const btn = e.currentTarget;
  const rect = btn.getBoundingClientRect();
  const x = e.clientX - rect.left; const y = e.clientY - rect.top;
  const span = document.createElement('span');
  span.className = 'pulse'; span.style.left = x + 'px'; span.style.top = y + 'px';
  btn.appendChild(span); setTimeout(() => span.remove(), 600);
}
document.querySelectorAll('[data-ripple]').forEach(b => b.addEventListener('click', addRipple));

// Formspree AJAX submit + toast (reg number required)
const form = document.getElementById('bookingForm');
const toast = document.getElementById('toast');
if (form) {
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const required = ['name','phone','email','service','reg'];
    for (const id of required) {
      const el = form.querySelector('#' + id);
      if (!el || !el.value) { el && el.focus(); el && el.reportValidity && el.reportValidity(); return; }
    }
    const endpoint = form.getAttribute('action');
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form) });
      if (res.ok) {
        toast.textContent = 'Kiitos! Pyyntösi on vastaanotettu.';
        toast.classList.add('show');
        setTimeout(()=> toast.classList.remove('show'), 3200);
        form.reset();
      } else {
        const data = await res.json().catch(()=>({}));
        const msg = data.errors && data.errors.length ? data.errors.map(e=>e.message).join(', ') : 'Lähetys epäonnistui.';
        alert(msg + '\nVoit kokeilla uudelleen tai soittaa meille.');
      }
    } catch(err){
      alert('Verkkovirhe. Yritä uudelleen tai soita meille.');
    }
  });
}

// Testimonials auto-scroll & swipe
// Testimonials auto-scroll & swipe (flicker-free)
const carousel = document.getElementById('testimonialCarousel');

if (carousel) {
  let autoTimer = null;
  let userActive = false;
  let scrollDebounce = null;

  const STEP = () => Math.round(carousel.clientWidth * 0.9);
  const MAX = () => carousel.scrollWidth - carousel.clientWidth;

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(nextStep, 3500);
  }
  function stopAuto() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  }

  function nextStep() {
    if (userActive) return;

    const max = MAX();
    const next = Math.min(carousel.scrollLeft + STEP(), max);

    // Smoothly move forward one step
    carousel.scrollTo({ left: next, behavior: 'smooth' });

    // If we hit (or nearly hit) the end, jump back to 0 without snap/animation
    if (next >= max - 2) {
      // wait for the smooth scroll to finish, then jump to 0 without snapping
      setTimeout(() => {
        carousel.classList.add('no-snap');
        carousel.scrollTo({ left: 0, behavior: 'auto' });
        // tiny delay to let layout settle, then re-enable snapping
        setTimeout(() => carousel.classList.remove('no-snap'), 40);
      }, 450);
    }
  }

  // Pause auto while the user interacts / momentum is active
  function markActive() {
    userActive = true;
    stopAuto();
  }
  function unmarkActiveSoon() {
    if (scrollDebounce) clearTimeout(scrollDebounce);
    scrollDebounce = setTimeout(() => {
      userActive = false;
      startAuto();
    }, 250); // wait for momentum scrolling to end
  }

  // Pointer drag to scroll
  let isDown = false, startX = 0, startLeft = 0;
  carousel.addEventListener('pointerdown', (e) => {
    isDown = true; carousel.setPointerCapture(e.pointerId);
    startX = e.pageX - carousel.offsetLeft;
    startLeft = carousel.scrollLeft;
    markActive();
  });
  carousel.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX);
    carousel.scrollLeft = startLeft - walk;
  });
  ['pointerup','pointerleave','pointercancel'].forEach(ev => {
    carousel.addEventListener(ev, () => { isDown = false; unmarkActiveSoon(); });
  });

  // If user scrolls via flick momentum/touch, debounce it
  carousel.addEventListener('scroll', () => {
    if (!userActive) return;      // only when user started it
    unmarkActiveSoon();
  }, { passive: true });

  // Kick things off
  startAuto();
}
// Mobile menu toggle
const menuBtn   = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');
  const headerEl  = document.querySelector('header');

  function setMobileNavTop(){
    if (!mobileNav || !headerEl) return;
    mobileNav.style.top = headerEl.offsetHeight + 'px';
  }
  setMobileNavTop();
  window.addEventListener('resize', setMobileNavTop);

  if (menuBtn && mobileNav){
    menuBtn.addEventListener('click', ()=>{
      const open = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileNav.addEventListener('click', (e)=>{
      if (e.target.tagName === 'A'){
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded','false');
      }
    });
  }



// Gallery lightbox
const gallery = Array.from(document.querySelectorAll('#galleryGrid a'));
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
let current = 0;
function openLB(i){ current=i; const href = gallery[i].getAttribute('href'); lbImg.src = href; lb.classList.add('open'); document.body.style.overflow='hidden'; }
function closeLB(){ lb.classList.remove('open'); document.body.style.overflow=''; }
function prev(){ openLB((current - 1 + gallery.length) % gallery.length); }
function next(){ openLB((current + 1) % gallery.length); }
gallery.forEach((a,i)=>{ a.addEventListener('click', (e)=>{ e.preventDefault(); openLB(i); }); });
lbClose && lbClose.addEventListener('click', closeLB);
lb && lb.addEventListener('click', (e)=>{ if(e.target===lb) closeLB(); });
lbPrev && lbPrev.addEventListener('click', (e)=>{ e.stopPropagation(); prev(); });
lbNext && lbNext.addEventListener('click', (e)=>{ e.stopPropagation(); next(); });

// Year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();


