var animationEnd = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";
var transitionEnd = "transitionend webkitTransitionEnd oTransitionEnd otransitionend";

var myFirebaseRef = new Firebase("https://fiery-torch-8389.firebaseio.com/");

var CHADEV = CHADEV || {};

CHADEV.votingBooth = {
  init: function() {
    // Forcing to go online - sometimes app gets disconnected
    Firebase.goOnline();
    var votesRef = myFirebaseRef.child("votes");

    var startEventType = 'mousedown';
    var endEventType   = 'mouseup';

    if (Modernizr.touch === true) {
      startEventType = 'touchstart';
      endEventType   = 'touchend';
    }

    CHADEV.votingBooth.changeState('voting');

    // Handle vote tap down
    $('button.voting-booth-item-action').on(startEventType, function() {
      $(this).parent().addClass('has-mousedown');
    });

    $(document).on(endEventType, function() {
      $('.voting-booth-item').removeClass('has-mousedown');
    });

    // Handle vote tap release
    $('button.voting-booth-item-action').on(endEventType, function() {

      // Disable button to prevent multiple votes from individual
      $('button.voting-booth-item-action').prop("disabled", true);

      // Send data to Firebase
      var voteItem = $(this).parent();
      var voteRef = votesRef.push({
        vote_lunch: {
          ended_at: Firebase.ServerValue.TIMESTAMP,
          vote: voteItem.data('vote')
        }
      }, function(error) {
        if(error) {
          alert("Data could not be saved :( Jordan has failed you.");

        } else {
          // After button is done transitioning, show thanks prompt
          voteItem.addClass('has-mouseup').bind(transitionEnd, function(){
            CHADEV.votingBooth.changeState('thanks');

            var thanksPrompt = $('.voting-booth-thanks-prompt[data-vote='+ voteItem.data('vote') +']');
            thanksPrompt.addClass('is-active');

            voteItem.unbind(transitionEnd);

            // After showing thanks message for a bit, reset states and show the results
            setTimeout(function() {
              thanksPrompt
                .removeClass('is-active')
                .unbind();
              voteItem
                .removeClass('has-mouseup has-mousedown');

              CHADEV.votingBooth.changeState('results');



              //CHADEV.votingBooth.changeState('init');

            }, 2000)

            //
            //

          });

          $('button.voting-booth-item-action').prop("disabled", false);
        }
      });
    });

    // Populate results
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

  changeState: function(state) {
    switch(state) {
      case "init":
        // Remove all modifiers
        $('.voting-booth').removeClass (function (index, css) {
          return (css.match (/\is-\S+/g) || []).join(' ');
        });
      case "voting":
        $('.voting-booth').addClass('is-voting');
        break;
      case "thanks":
        $('.voting-booth')
          .removeClass('is-voting')
          .addClass('is-viewing-thanks');
        break;
      case "results":
        $('.voting-booth')
          .removeClass('is-voting is-viewing-thanks')
          .addClass('is-viewing-results');
        break;
    }
  }
}

$(function() {
  FastClick.attach(document.body);
});

$(window).load(function() {
  CHADEV.votingBooth.init();
});
