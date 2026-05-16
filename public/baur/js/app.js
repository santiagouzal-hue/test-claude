(function () {
  'use strict';

  var header     = document.getElementById('header');
  var mainNav    = document.getElementById('mainNav');
  var menuBtn    = document.getElementById('menuBtn');
  var navOverlay = document.getElementById('navOverlay');
  var fullpage   = document.getElementById('fullpage');

  // Fade in on load
  var main = document.getElementById('main');
  if (main) {
    window.addEventListener('load', function () {
      main.style.opacity = '1';
    });
  }

  // NAV toggle
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

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  // Close button inside nav
  var navCloseBtn = document.getElementById('navCloseBtn');
  if (navCloseBtn) navCloseBtn.addEventListener('click', closeNav);

  // HOME: header color change + scrollbar
  if (fullpage && header) {
    var slides  = Array.from(fullpage.querySelectorAll('.section.swiper-slide'));
    var total   = slides.length;
    var drag    = document.querySelector('.swiper-scrollbar-drag');
    var scrollbarEl = document.querySelector('.swiper-scrollbar');

    function updateHeader() {
      var idx = Math.round(fullpage.scrollTop / fullpage.clientHeight);
      var slide = slides[idx];
      if (slide && slide.classList.contains('header-white')) {
        header.classList.add('is-white');
      } else {
        header.classList.remove('is-white');
      }
      // scrollbar drag
      if (drag && total > 1 && scrollbarEl) {
        var barH   = scrollbarEl.clientHeight;
        var dragH  = Math.max(Math.round(barH / total), 20);
        var pct    = idx / (total - 1);
        var maxTop = barH - dragH;
        drag.style.height    = dragH + 'px';
        drag.style.marginTop = Math.round(pct * maxTop) + 'px';
      }
    }

    fullpage.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // go-up arrow
  var goUp = document.querySelector('.arrow.go-up');
  if (goUp) {
    goUp.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

})();
