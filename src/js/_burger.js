$(function() {
   $('.nav__burger').on('click', function() {
      $('.nav__burger, .nav__menu').toggleClass('active');
      $('body').toggleClass('lock')
   });
   $('.nav__item a').on('click', function() {
      $('.nav__burger, .nav__menu').toggleClass('active');
      $('body').toggleClass('lock')
   });
});