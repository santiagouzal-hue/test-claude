(function () {
  'use strict';

  var header     = document.getElementById('header');
  var mainNav    = document.getElementById('mainNav');
  var menuBtn    = document.getElementById('menuBtn');
  var navClose   = document.getElementById('navClose');
  var navOverlay = document.getElementById('navOverlay');
  var fpScrollbar = document.getElementById('fpScrollbar');
  var fpDrag      = document.getElementById('fpDrag');

  /* —— FADE IN —— */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s';
  window.addEventListener('load', function () {
    document.body.style.opacity = '1';
  });

  /* —— NAV —— */
  function openNav() {
    if (mainNav)    mainNav.classList.add('is-open');
    if (navOverlay) navOverlay.classList.add('is-open');
    if (menuBtn)    menuBtn.classList.add('is-open');
  }
  function closeNav() {
    if (mainNav)    mainNav.classList.remove('is-open');
    if (navOverlay) navOverlay.classList.remove('is-open');
    if (menuBtn)    menuBtn.classList.remove('is-open');
  }

  if (menuBtn)    menuBtn.addEventListener('click', openNav);
  if (navClose)   navClose.addEventListener('click', closeNav);
  if (navOverlay) navOverlay.addEventListener('click', closeNav);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* —— FULLPAGE SWIPER (solo home) —— */
  var fpEl = document.getElementById('fullpage');
  if (fpEl && typeof Swiper !== 'undefined') {
    var slides = Array.from(fpEl.querySelectorAll('.slide'));
    var total  = slides.length;

    function updateUI(idx) {
      /* header color */
      var slide = slides[idx];
      if (slide && slide.classList.contains('header-white')) {
        header.classList.add('is-white');
        if (menuBtn) menuBtn.classList.add('is-white');
      } else {
        header.classList.remove('is-white');
        if (menuBtn) menuBtn.classList.remove('is-white');
      }

      /* scrollbar lateral */
      if (fpDrag && total > 1 && fpScrollbar) {
        var barH   = fpScrollbar.clientHeight;
        var dragH  = Math.max(Math.round(barH / total), 20);
        var pct    = idx / (total - 1);
        fpDrag.style.height    = dragH + 'px';
        fpDrag.style.marginTop = Math.round(pct * (barH - dragH)) + 'px';
      }
    }

    var swiper = new Swiper('#fullpage', {
      direction: 'vertical',
      speed: 700,
      mousewheel: {
        sensitivity: 1,
        thresholdDelta: 30
      },
      keyboard: {
        enabled: true
      },
      touchReleaseOnEdges: true,
      on: {
        init: function () { updateUI(0); },
        slideChange: function () { updateUI(this.activeIndex); }
      }
    });
  }

  /* —— Videos: reproducir solo cuando son visibles (páginas internas) —— */
  if ('IntersectionObserver' in window) {
    var videos = document.querySelectorAll('video.media');
    var videoObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.play(); }
        else { entry.target.pause(); }
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { videoObs.observe(v); });
  }

  /* —— Scroll to top —— */
  var goUp = document.querySelector('.arrow.go-up');
  if (goUp) {
    goUp.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
