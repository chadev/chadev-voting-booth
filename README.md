Chadev Voting Booth
=======

Simple voting app for measuring lunch quality and attendance during Chadev lunches.

[![screenshot](http://media.giphy.com/media/yoJC2ECIVpm6yDkSWc/giphy.gif)](http://chadev.github.io/chadev-voting-booth/)


### Setup

Application is built on top of [Middleman](http://middlemanapp.com) and uses [Bourbon](http://bourbon.io/), [Neat](http://neat.bourbon.io/), and [Bitters](http://bitters.bourbon.io/) for lightweight [Sass](http://sass-lang.com) mixins.

[ more later... ]

All development db data is posted to: http://chadev-voting-dev.firebaseio.com

### Deploy

This app uses 'middleman-gh-pages' gem which adds a rake file to deploy the Middleman build static files to gh-pages branch. Run `rake publish` from console to publish to: 

http://vote.chadev.com

Short URL: http://git.io/vote

All development production data is posted to: http://chadev-voting-prod.firebaseio.com

### Modes

There are three different modes:

1. Individual (default)
This is the URL that we pass around for individuals to access via their mobile devices. They get one vote and then they see the results page. Users are shown a closed voting screen if trying to access the page on a day that's not a Thursday (meeting day).

2. Demo (?mode=demo)
Demo mode is exactly like individual mode but never shows a closed screen and records all data to a separate demo Firebase db. All development db data is posted to: http://chadev-voting-demo.firebaseio.com

3. Kiosk (?mode=kiosk)
Unlike individual mode, kiosk mode allows us to keep capturing new votes without ever showing the results page. This is used for gathering input from many individuals (eg. on an ipad on the way out of the office).

Short URL: http://git.io/booth


### Credits

Created by: [Jordan Isip](http://jordanisip.com) ([@fixie](http://twitter.com/fixie))

Original background illustration courtesy of: [Fabricio Rosa Marques](http://fabric8.de/) via [The Pattern Library](http://thepatternlibrary.com/#science)

Original facial expression icons courtesy of: [Megan Sheehan](http://megansheehan.info/) via [IconDeposit](http://www.icondeposit.com/theicondeposit:124)
