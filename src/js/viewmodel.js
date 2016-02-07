/**
* @name Venue
* @description Represents the venues displayed throughout the app
* @constructor
* @param {Object} venue - venue object
* @param {String} id - Unique ID assigned to venue by Yelp API
* @param {String} name - display name of venue
* @param {double} distance - distance to venue from location object
* @param {String} image_url - Main image used by venue
* @param {String} rating_img_url - Rating image used by venue with current rating based on user input
* @param {integer} rating - Rating number used by venue
* @param {String} snippet_text - Snippet of most recent entry from a user
* @param {String} yelpURL - mobile url of venue on Yelp's site
* @param {Object} marker - marker object
*/
var Venue = function(venue) {
  this.id = ko.observable(venue.location.id);
  this.name = ko.observable(venue.location.name);
  this.formatted_address = ko.observable(venue.location.location.display_address[0]);
  this.distance = ko.observable(venue.location.distance);
  this.image_url = ko.observable(venue.location.image_url);
  this.rating_img_url = ko.observable(venue.location.rating_img_url);
  this.rating = ko.observable(venue.location.rating);
  this.snippet_text = ko.observable(venue.location.snippet_text);
  this.yelpURL = ko.observable(venue.location.mobile_url);
  this.marker = ko.observable(venue.marker);
};

/**
* @name ViewModel
* @description ViewModel object used by the knockout js framework. Stores observable data and operations to be used on the UI.
* @constructor
*/
var ViewModel = function() {
  var self = this;
  this.locations = ko.observableArray([]);
  this.markers = ko.observableArray([]);
  this.totalNumLocs = app.getLocations().length;
  this.inputVal = ko.observable('');

  // Pushing app model location objects into observable array for dependency tracking and UI use
  var addObservableLocations = function() {
    for (var i = 0; i < self.totalNumLocs; i++) {
      self.locations.push(new Venue(app.getLocations()[i]));
    }
  };

  // Checking for any app model location objects and triggering the use of these objects in KO's framework
  if (self.totalNumLocs) {
    addObservableLocations();
    this.currentListMarker = ko.observable();
  }

  /**
  * @name selectListMarker
  * @description Triggers when user selects venue from list. Passes current venue object to observable variable and selects appropriate marker on map.
  * @function
  * @param {Object} clickedListMarker - Represents currently selected venue from list
  */
  this.selectListMarker = function(clickedListMarker) {
    self.currentListMarker(clickedListMarker);
    app.selectListMarker(self.currentListMarker());
  };

  /**
  * @name sortedLocations
  * @description Sorts all locations by distance to location object.
  * @function
  */
  this.sortedLocations = function() {
    return self.locations().sort(function (left, right) { return left.distance() == right.distance() ? 0 : (left.distance() < right.distance() ? -1 : 1); });
  };

  /**
  * @name filteredLocations
  * @description computed function that returns filtered locations based on users input per key entry. This also shows/hides markers in real-time. I need to give credit to John Mav in giving me the idea to add a marker property to the overall locations array of objects - This is just brilliant - Thank you John (https://discussions.udacity.com/t/filtering-markers-with-search/45331).
  * @function
  */
  this.filteredLocations = ko.computed(function() {
    return ko.utils.arrayFilter(self.sortedLocations(), function(location) {
      if (location.name().toLowerCase().indexOf(self.inputVal().toLowerCase()) !== -1) {
        location.marker().setMap(map);
        return true;
      } else {
        location.marker().setMap(null);
        return false;
      }
    });
  }, this);
};
