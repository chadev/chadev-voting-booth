var animationEnd = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";

var CHADEV = CHADEV || {};

CHADEV.votingBooth = {
  init: function() {
    // this.booth = $('.voting-booth');
    // this.booth.addClass('is-active');

    $('.voting-booth').addClass('is-active');

    $('button.voting-booth-item-action').one('click', function() {
      $('.voting-booth').removeClass('is-active');

      var vote = $(this).parent().data('vote');
      var result = $('.voting-booth-result[data-vote='+vote+']');

      result.addClass('has-voted').bind(animationEnd, function(){
        window.setTimeout(function() {
          result
          .removeClass('has-voted')
          .addClass('has-seen-results')
          .unbind();
          result.bind(animationEnd, function(){
            result
            .removeClass('has-seen-results')
            .unbind();
            CHADEV.votingBooth.init();
          });
        }, 1600)
      });
    });
  }
}

$(function() {
  CHADEV.votingBooth.init();
});
