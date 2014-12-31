var animationEnd = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";
var transitionEnd = "transitionend webkitTransitionEnd oTransitionEnd otransitionend";

var CHADEV = CHADEV || {};

CHADEV.votingBooth = {
  init: function() {
    // this.booth = $('.voting-booth');
    // this.booth.addClass('is-active');

    $('.voting-booth').addClass('is-active');

    $('button.voting-booth-item-action').one('mousedown', function() {
      var voteItem = $(this).parent()
      var result = $('.voting-booth-result[data-vote='+ voteItem.data('vote') +']');

      voteItem.addClass('is-active').bind(transitionEnd, function(){
        result.addClass('has-voted');
        $('.voting-booth').removeClass('is-active');

        window.setTimeout(function() {
          result
            .removeClass('has-voted')
            .addClass('has-seen-results')
            .unbind();
          voteItem
            .removeClass('is-active');

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
