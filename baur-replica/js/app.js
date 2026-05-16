(function () {
  'use strict';

  var header      = document.getElementById('header');
  var mainNav     = document.getElementById('mainNav');
  var menuBtn     = document.getElementById('menuBtn');
  var navClose    = document.getElementById('navClose');
  var navOverlay  = document.getElementById('navOverlay');
  var fullpage    = document.getElementById('fullpage');
  var scrollbar   = document.getElementById('scrollbar');
  var drag        = document.getElementById('scrollbarDrag');

  /* —— NAV —— */
  function openNav() {
    if (mainNav)    mainNav.classList.add('is-open');
    if (navOverlay) navOverlay.classList.add('is-open');
  }

  function closeNav() {
    if (mainNav)    mainNav.classList.remove('is-open');
    if (navOverlay) navOverlay.classList.remove('is-open');
  }

  if (menuBtn)    menuBtn.addEventListener('click', openNav);
  if (navClose)   navClose.addEventListener('click', closeNav);
  if (navOverlay) navOverlay.addEventListener('click', closeNav);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  /* —— FULLPAGE: header color + scrollbar lateral (home) —— */
  if (fullpage && header) {
    var slides = Array.from(fullpage.querySelectorAll('.slide'));
    var total  = slides.length;

    function updateHeader() {
      var idx = Math.round(fullpage.scrollTop / fullpage.clientHeight);
      var slide = slides[idx];
      if (slide && slide.classList.contains('header-white')) {
        header.classList.add('is-white');
        if (menuBtn) menuBtn.classList.add('is-white');
      } else {
        header.classList.remove('is-white');
        if (menuBtn) menuBtn.classList.remove('is-white');
      }

      /* scrollbar drag height & position */
      if (drag && total > 1) {
        var pct      = (idx / (total - 1));
        var barH     = scrollbar ? scrollbar.clientHeight : window.innerHeight;
        var dragH    = Math.round(barH / total);
        var dragTop  = Math.round(pct * (barH - dragH));
        drag.style.height     = dragH + 'px';
        drag.style.marginTop  = dragTop + 'px';
      }
    }

    fullpage.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  /* —— FADE IN —— */
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s';
  window.addEventListener('load', function () {
    document.body.style.opacity = '1';
  });

})();
