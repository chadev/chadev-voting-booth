var animationEnd = "animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd";
var transitionEnd = "transitionend webkitTransitionEnd oTransitionEnd otransitionend";

var CHADEV = CHADEV || {};
var IS_VOTING_DAY = Date.today().is().thursday();

CHADEV.votingBooth = {
  init: function(mode) {
    switch(mode) {
      case "demo":
        this.mode = "demo"
        // Override dev/prod firebase reference to use demo data
        this.firebaseRef = new Firebase("https://chadev-voting-demo.firebaseio.com/");
        this.showResults = true;
        this.closeResults = true;
        $.cookie('mode', this.mode, { expires: 1 });
        break;
      case "kiosk":
        this.mode = "kiosk"
        this.showResults = false;
        this.closeResults = false;
        $.cookie('mode', this.mode, { expires: 5 });
        break;
      default:
        this.mode = "individual"
        this.showResults = true;
        this.closeResults = false;
    }

    console.log("Initializing voting booth ("+ this.mode +" mode)")
    $('.voting-booth').addClass('voting-booth-mode-' + this.mode);

    // Forcing to go online - sometimes app gets disconnected
    Firebase.goOnline();
    this.votesRef = this.firebaseRef.child("votes");

    var startEventType = 'mousedown';
    var endEventType   = 'mouseup';

    if (Modernizr.touch === true) {
      startEventType = 'touchstart';
      endEventType   = 'touchend';
    }

    console.log('CHADEV.votingBooth.mode',CHADEV.votingBooth.mode)
    if(IS_VOTING_DAY || CHADEV.votingBooth.mode == 'demo') {
      this.changeState('voting');
    } else {
      this.changeState('closed');
    }

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
      CHADEV.votingBooth.votesRef.push({
        vote_lunch: {
          ended_at: Firebase.ServerValue.TIMESTAMP,
          vote: voteItem.data('vote')
        }
      }, function(error) {
        if(error) {
          alert("Data could not be saved :( Jordan has failed you.");

        } else {
          // After button is done transitioning, show thanks prompt
          voteItem.addClass('has-mouseup').bind(transitionEnd, function() {
            CHADEV.votingBooth.changeState('thanks');

            var thanksPrompt = $('.voting-booth-thanks-prompt[data-vote='+ voteItem.data('vote') +']');
            thanksPrompt.addClass('is-active');

            voteItem.unbind(transitionEnd);

            setTimeout(function() {
              // After showing thanks message for a bit, reset states and show the results
              CHADEV.votingBooth.changeState('seen-thanks');

              thanksPrompt.bind(animationEnd, function() {
                thanksPrompt
                .removeClass('is-active')
                .unbind(animationEnd);
                voteItem
                .removeClass('has-mouseup has-mousedown')
                .unbind(transitionEnd);

                if(CHADEV.votingBooth.showResults == true) {
                  CHADEV.votingBooth.changeState('results');

                  $('.bar-chart').bind(animationEnd, function() {
                    CHADEV.votingBooth.populateResults();
                    $('.bar-chart').unbind(animationEnd);
                  });
                } else {
                  console.log('In kiosk mode, skipping results');
                  CHADEV.votingBooth.changeState('voting');
                }
              });
            }, 1000);

          });

          $('button.voting-booth-item-action').prop("disabled", false);
        }
      });
    });
  },

  populateResults: function() {
    CHADEV.votingBooth.votesRef.on("value", function(snapshot) {
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

      console.log('Populating results');

      CHADEV.votingBooth.vote($('.bar-chart-item.is-dislike'), dislikeVotes, totalVotes);
      CHADEV.votingBooth.vote($('.bar-chart-item.is-neutral'), neutralVotes, totalVotes);
      CHADEV.votingBooth.vote($('.bar-chart-item.is-like'), likeVotes, totalVotes);

      $('.bar-chart-item').bind(transitionEnd, function(){
        CHADEV.votingBooth.changeState('seen-results');
        $('.bar-chart-item').unbind(transitionEnd);
      });

    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  },

  vote: function(barChartItem, itemVotes, totalVotes) {
    var percentage = (itemVotes / totalVotes) * 100;

    barChartItem
      .find('.bar-chart-item-count').text(itemVotes).end()
      .find('.bar-chart-item-bar').css('height', percentage + "%");

    if($('.voting-booth').hasClass('has-seen-results')) {
      console.log('Voting')
      barChartItem.addClass('has-new-vote');
      setTimeout(function() {
        barChartItem.removeClass('has-new-vote');
      }, 1000);
    }
  },

  changeState: function(state) {
    // Remove all modifiers
    $('.voting-booth').removeClass (function (index, css) {
      return (css.match (/(?:is-|has-)\S+/g) || []).join(' ');
    });

    switch(state) {
      case "closed":
        $('.voting-booth').addClass('is-closed');
        break;
      case "voting":
        $('.voting-booth').addClass('is-voting');
        break;
      case "seen-thanks":
        $('.voting-booth').addClass('has-seen-thanks');
        break;
      case "thanks":
        $('.voting-booth').addClass('is-viewing-thanks');
        break;
      case "results":
        $('.voting-booth').addClass('is-viewing-results');
        break;
      case "seen-results":
        $('.voting-booth').addClass('has-seen-results');
        break;
    }
  }
}

function getUrlParameter(sParam)
{
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++)
  {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam)
    {
      return sParameterName[1];
    }
  }
}


$(function() {
  FastClick.attach(document.body);
});

$(window).load(function() {
  if($.cookie('mode') !== undefined) {
    var mode = $.cookie('mode');$.cookie('mode');
    console.log('Initiating with cookie: ' + mode)
  } else {
    getUrlParameter('mode');
    console.log('Initiating with URL parameter: ' + mode)
  }
  CHADEV.votingBooth.init(mode);
});
