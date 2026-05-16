(function () {
  'use strict';

  var header     = document.getElementById('header');
  var mainNav    = document.getElementById('mainNav');
  var menuBtn    = document.getElementById('menuBtn');
  var navOverlay = document.getElementById('navOverlay');
  var fullpage   = document.getElementById('fullpage');
  var main       = document.getElementById('main');

  /* Mostrar la página apenas el DOM esté listo (no esperar imágenes) */
  if (main) {
    main.style.transition = 'opacity 0.4s';
    document.addEventListener('DOMContentLoaded', function () {
      main.style.opacity = '1';
    });
    /* fallback por si el script corre después del DOMContentLoaded */
    if (document.readyState !== 'loading') {
      main.style.opacity = '1';
    }
  }

  /* NAV */
  function openNav() {
    if (mainNav)    mainNav.classList.add('is-open');
    if (navOverlay) navOverlay.classList.add('is-open');
  }
  function closeNav() {
    if (mainNav)    mainNav.classList.remove('is-open');
    if (navOverlay) navOverlay.classList.remove('is-open');
  }

  if (menuBtn)    menuBtn.addEventListener('click', openNav);
  if (navOverlay) navOverlay.addEventListener('click', closeNav);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  var navCloseBtn = document.getElementById('navCloseBtn');
  if (navCloseBtn) navCloseBtn.addEventListener('click', closeNav);

  /* HOME: header color + scrollbar lateral */
  if (fullpage && header) {
    var slides     = Array.from(fullpage.querySelectorAll('.section.swiper-slide'));
    var total      = slides.length;
    var drag       = document.querySelector('.swiper-scrollbar-drag');
    var scrollbarEl = document.querySelector('.swiper-scrollbar');

    function updateHeader() {
      var idx = Math.round(fullpage.scrollTop / fullpage.clientHeight);
      var slide = slides[idx];
      if (slide && slide.classList.contains('header-white')) {
        header.classList.add('is-white');
      } else {
        header.classList.remove('is-white');
      }
      if (drag && total > 1 && scrollbarEl) {
        var barH  = scrollbarEl.clientHeight;
        var dragH = Math.max(Math.round(barH / total), 20);
        var pct   = idx / (total - 1);
        drag.style.height    = dragH + 'px';
        drag.style.marginTop = Math.round(pct * (barH - dragH)) + 'px';
      }
    }

    fullpage.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* Videos: reproducir solo cuando son visibles */
  if ('IntersectionObserver' in window) {
    var videos = document.querySelectorAll('video.media');
    var videoObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.play();
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { videoObs.observe(v); });
  }

  /* Scroll to top */
  var goUp = document.querySelector('.arrow.go-up');
  if (goUp) {
    goUp.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
