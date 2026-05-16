(function () {
  'use strict';

  var header      = document.getElementById('header');
  var mainNav     = document.getElementById('mainNav');
  var menuBtn     = document.getElementById('menuBtn');
  var navClose    = document.getElementById('navClose');
  var navOverlay  = document.getElementById('navOverlay');
  var fullpage    = document.getElementById('fullpage');

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

  /* —— FULLPAGE HEADER COLOR (home) —— */
  if (fullpage && header) {
    var slides = Array.from(fullpage.querySelectorAll('.slide'));

    function updateHeader() {
      var idx = Math.round(fullpage.scrollTop / fullpage.clientHeight);
      var slide = slides[idx];
      if (slide && slide.classList.contains('header-white')) {
        header.classList.add('is-white');
      } else {
        header.classList.remove('is-white');
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
