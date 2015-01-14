var animationEnd = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";
var transitionEnd = "transitionend webkitTransitionEnd oTransitionEnd otransitionend";

var myFirebaseRef = new Firebase("https://fiery-torch-8389.firebaseio.com/");

var CHADEV = CHADEV || {};

CHADEV.votingBooth = {
  init: function() {
    // Forcing to go online - sometimes app gets disconnected
    Firebase.goOnline();

    var votesRef = myFirebaseRef.child("votes");

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
      $('button.voting-booth-item-action').prop("disabled", true);

      var voteItem = $(this).parent()

      var voteRef = votesRef.push({
        vote_lunch: {
          ended_at: Firebase.ServerValue.TIMESTAMP,
          vote: voteItem.data('vote')
        }
      }, function(error) {
        if(error) {
          alert("Data could not be saved :( Jordan has failed you.")
        } else {
          var result = $('.voting-booth-thanks-prompt[data-vote='+ voteItem.data('vote') +']');

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

          $('button.voting-booth-item-action').prop("disabled", false);
        }
      });
    });

    votesRef.on("value", function(snapshot) {
      var totalVotes = snapshot.numChildren();
      var dislikeVotes = 0;
      var neutralVotes = 0;
      var likeVotes = 0;

      snapshot.forEach(function(voteSnapshot) {
        switch(voteSnapshot.child('vote_lunch/vote').val()) {
          case "dislike":
            dislikeVotes += 1;
            break;
          case "neutral":
            neutralVotes += 1;
            break;
          case "like":
            likeVotes += 1;
            break;
        }
      });

      CHADEV.votingBooth.vote($('.bar-chart-item.is-dislike'), dislikeVotes, totalVotes);
      CHADEV.votingBooth.vote($('.bar-chart-item.is-neutral'), neutralVotes, totalVotes);
      CHADEV.votingBooth.vote($('.bar-chart-item.is-like'), likeVotes, totalVotes);

    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  },

  vote: function(barChartItem, itemVotes, totalVotes) {
    var percentage = (itemVotes / totalVotes) * 100;

    barChartItem
      .find('.bar-chart-item-count').text(itemVotes).end()
      .find('.bar-chart-item-bar').css('height', percentage + "%");

    barChartItem.addClass('has-new-vote');
    setTimeout(function() {
      barChartItem.removeClass('has-new-vote');
    }, 500);
  },
}

$(function() {
  FastClick.attach(document.body);
});

$(window).load(function() {
  CHADEV.votingBooth.init();
});
