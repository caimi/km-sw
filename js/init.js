(function ($) {
  $(function () {
    /*$('.button-collapse').sideNav();
    $('.parallax').parallax();
    $("#footerContent").load("footer.html");
    initializeClock('countdown', '2017-9-25');
    $('.carousel.carousel-slider').carousel({fullWidth: true, duration: 500});*/
  }); // end of document ready
})(jQuery); // end of jQuery name space

/*$(function () { // wait for document ready
  /*
  SETA ALTURA DO DIV PARA O TAMANHO DA TELA DISPONIVEL
  console.log(window.innerHeight, window.innerWidth);
  $(".panel").each(function () {
    $(this).height(window.innerHeight);
  });
  // init
  var controller = new ScrollMagic.Controller({
    globalSceneOptions: {
      triggerHook: 'onLeave'
    }
  });
  // get all slides
  var slides = document.querySelectorAll("section.panel");
  // create scene for every slide
  for (var i = 0; i < slides.length; i++) {
    new ScrollMagic.Scene({
        triggerElement: slides[i]
      })
      .setPin(slides[i])
      //.addIndicators() // add indicators (requires plugin)
      .addTo(controller);
  }
});*/

function getTimeRemaining(endtime){
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor( (t/1000) % 60 );
  var minutes = Math.floor( (t/1000/60) % 60 );
  var hours = Math.floor( (t/(1000*60*60)) % 24 );
  var days = Math.floor( t/(1000*60*60*24) );
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime){
  var clock = document.getElementById(id);
  var timeinterval = setInterval(function(){
    var t = getTimeRemaining(endtime);
    clock.innerHTML = t.days + ' dias ' +
                      t.hours + ' horas ' +
                      t.minutes + ' minutos ' +
                      t.seconds + ' segundos ';
    if(t.total<=0){
      clearInterval(timeinterval);
    }
  },1000);
}