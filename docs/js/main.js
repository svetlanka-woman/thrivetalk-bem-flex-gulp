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
// Проверка - может ли браузер отображать .webp, 
// если да, то добавляет к тегу body класс .webp 
 
function testWebP(callback) {

   var webP = new Image();
   webP.onload = webP.onerror = function () {
   callback(webP.height == 2);
   };
   webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
   }
   
   testWebP(function (support) {
   
   if (support == true) {
   document.querySelector('body').classList.add('webp');
   }else{
   document.querySelector('body').classList.add('no-webp');
   }
   });