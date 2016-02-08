# Quick Java Fix Map App
#### A "Udacity Project"

This is a single page app that discovers and displays **coffee shops** near your current location on google maps. It is fully responsive and works well across all your devices.

A [live demo of the app can be found here](http://arosa81.github.io/QuickJavaFixMapApp/).

Note: Either *accept* or *decline* the **geolocation** request to fully run the app.

### Run the App Locally
1. Check out the repository
1. Run a local server
  ```bash
  $> cd /path/to/your-project-folder
  $> python -m SimpleHTTPServer 8080

  OR using [http-server](https://www.npmjs.com/package/http-server)

  $> cd /path/to/your-project-folder
  $> http-server -p 8080
  ```
1. Open a browser and visit localhost:8080

### Features
1. Full screen size Google maps
1. Displays Google map markers and list result items of nearby coffee shops
1. List is sorted by nearest coffee shops
1. Real-time search filter
1. Geolocation request
1. Yelp API - retrieving locations and venue information
1. Fully responsive - usable across modern desktops, tablets, and Smartphones

### Technologies Used
1. [Knockout JS Framework](http://knockoutjs.com/index.html)
1. [Google Maps API](https://developers.google.com/maps/web/)
1. [Yelp API](https://www.yelp.com/developers)
1. [The JQuery library](http://jquery.com/)
1. [Bootstrap CSS](http://getbootstrap.com/css/)
1. [Flex Box](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
1. [JavaScript OAuth 1.0a signature generator (RFC 5849) for node and the browser](https://github.com/bettiolo/oauth-signature-js)
1. [Grunt to assist with my build process](http://gruntjs.com/)

### Resources Used
1. Udacity Forums (Awesome folks from Udacity are very helpful here)
1. [Mozilla Developer Network](https://developer.mozilla.org/en-US/)
1. [Stack Overflow](http://stackoverflow.com/)
1. [cdnjs](http://cdnjs.com/)
1. [Font Awesome](http://fortawesome.github.io/Font-Awesome/)
1. [Google maps developer guide](https://developers.google.com/maps/documentation/javascript/tutorial)
1. [Todd Motto's Mastering the Module Pattern](https://toddmotto.com/mastering-the-module-pattern)
