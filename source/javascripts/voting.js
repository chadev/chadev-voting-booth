var animationEnd = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";
var transitionEnd = "transitionend webkitTransitionEnd oTransitionEnd otransitionend";

var myFirebaseRef = new Firebase("https://fiery-torch-8389.firebaseio.com/");

var CHADEV = CHADEV || {};

CHADEV.votingBooth = {
  init: function() {
    $('.voting-booth').addClass('is-active');

    $('button.voting-booth-item-action').on('mousedown', function() {
      var voteItem = $(this).parent()
      var result = $('.voting-booth-result[data-vote='+ voteItem.data('vote') +']');

      var votesRef = myFirebaseRef.child("votes");
      var voteRef = votesRef.push({
        vote_lunch: {
          ended_at: Firebase.ServerValue.TIMESTAMP,
          vote: voteItem.data('vote')
        }
      });

      voteItem.addClass('is-active').bind(transitionEnd, function(){
        result.addClass('has-voted');
        $('.voting-booth').removeClass('is-active');

        setTimeout(function() {
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
            $('.voting-booth').addClass('is-active');
          });
        }, 1000)
      });
    });
  }
}

$(function() {
  CHADEV.votingBooth.init();
});
