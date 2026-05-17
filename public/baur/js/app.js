(function () {
  'use strict';

  var header  = document.getElementById('header');
  var mainNav = document.getElementById('mainNav');
  var menuBtn = document.getElementById('menuBtn');
  var mainEl  = document.getElementById('main');

  /* Reveal page on load */
  if (mainEl) {
    mainEl.style.transition = 'opacity 0.5s';
    window.addEventListener('load', function () { mainEl.style.opacity = '1'; });
  } else {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s';
    window.addEventListener('load', function () { document.body.style.opacity = '1'; });
  }

  /* Nav open / close */
  function openNav() {
    if (mainNav) mainNav.classList.add('is-open');
    if (menuBtn) menuBtn.classList.add('is-open');
  }
  function closeNav() {
    if (mainNav) mainNav.classList.remove('is-open');
    if (menuBtn) menuBtn.classList.remove('is-open');
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      if (mainNav && mainNav.classList.contains('is-open')) closeNav();
      else openNav();
    });
  }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  if (mainNav) {
    mainNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
  }

  /* goBack — usado por páginas de trabajo */
  window.goBack = function () { history.back(); };

  /* HOME: Swiper fullpage */
  var fpEl = document.getElementById('fullpage');
  if (fpEl && typeof Swiper !== 'undefined') {
    var slides      = Array.from(fpEl.querySelectorAll('.slide'));
    var total       = slides.length;
    var fpScrollbar = document.getElementById('fpScrollbar');
    var fpDrag      = document.getElementById('fpDrag');

    function updateUI(idx) {
      if (!header) return;
      var slide = slides[idx];
      if (slide && slide.classList.contains('header-white')) {
        header.classList.add('is-white');
        if (menuBtn) menuBtn.classList.add('is-white');
      } else {
        header.classList.remove('is-white');
        if (menuBtn) menuBtn.classList.remove('is-white');
      }
      if (fpDrag && total > 1 && fpScrollbar) {
        var barH  = fpScrollbar.clientHeight;
        var dragH = Math.max(Math.round(barH / total), 20);
        var pct   = idx / (total - 1);
        fpDrag.style.height    = dragH + 'px';
        fpDrag.style.marginTop = Math.round(pct * (barH - dragH)) + 'px';
      }
    }

    new Swiper('#fullpage', {
      direction: 'vertical',
      speed: 700,
      mousewheel: { sensitivity: 1, thresholdDelta: 30 },
      keyboard: { enabled: true },
      touchReleaseOnEdges: true,
      on: {
        init:        function () { updateUI(0); },
        slideChange: function () { updateUI(this.activeIndex); }
      }
    });
  }

  /* Videos: autoplay cuando son visibles */
  if ('IntersectionObserver' in window) {
    var videos = document.querySelectorAll('.box-bonus video');
    var vObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.play();
        else e.target.pause();
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { vObs.observe(v); });
  }

  /* Go-up arrow */
  var goUp = document.querySelector('.arrow.go-up');
  if (goUp) {
    goUp.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
