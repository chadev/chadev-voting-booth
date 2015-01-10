var animationEnd = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";
var transitionEnd = "transitionend webkitTransitionEnd oTransitionEnd otransitionend";

var myFirebaseRef = new Firebase("https://fiery-torch-8389.firebaseio.com/");

var CHADEV = CHADEV || {};

CHADEV.votingBooth = {
  init: function() {
    $('.voting-booth').addClass('is-active');

    var startEventType = 'mousedown';
    var endEventType   = 'mouseup';

    if (Modernizr.touch === true) {
      startEventType = 'touchstart';
      endEventType   = 'touchend';
    }

    $('button.voting-booth-item-action').on(startEventType, function() {
      $(this).parent().addClass('has-mousedown');
    });

    $(document).on(endEventType, function() {
      $('.voting-booth-item').removeClass('has-mousedown');
    });

    $('button.voting-booth-item-action').on(endEventType, function() {
      var voteItem = $(this).parent()
      var votesRef = myFirebaseRef.child("votes");
      var voteRef = votesRef.push({
        vote_lunch: {
          ended_at: Firebase.ServerValue.TIMESTAMP,
          vote: voteItem.data('vote')
        }
      }, function(error) {
        if(error) {
          alert("Data could not be saved :( Jordan has failed you.")
        } else {
          var result = $('.voting-booth-result[data-vote='+ voteItem.data('vote') +']');

          voteItem.addClass('is-active').bind(transitionEnd, function(){
            result.addClass('has-voted');
            $('.voting-booth').removeClass('is-active');
            voteItem.unbind(transitionEnd);
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
        }
      });
    });
  }
}

$(function() {
  FastClick.attach(document.body);
});

$(window).load(function() {
  CHADEV.votingBooth.init();
});
