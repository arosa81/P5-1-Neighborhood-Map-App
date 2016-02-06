var app = (function() {
  var that = this;
  var map,
      locs = {
        lat: 51.0486,
        lng: -114.0708,
      },
      mapOptions = {
        panControl: true,
        zoomControl: true,
        zoom: 14,
        center: locs
      },
      searchRadius = 800,
      locationSearchQueryTerm = 'coffee shops',
      marker,
      markers = [];
      this.locations = [];
      coordInfoWindow = new google.maps.InfoWindow();

  var getGeoLocs = function() {
    return locs;
  };

  var setGeoLocs = function(locs) {
    that.locs = locs;
  };

  var getLocationSearchQueryTerm = function() {
    return locationSearchQueryTerm;
  };

  var getLocations = function() {
    return locations;
  };

  var getMarkers = function() {
    return markers;
  };

  var getSearchRadius = function() {
    return searchRadius;
  };

  function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
  }

  var yelpConnect = function (nameLocation) {
    var httpMethod = 'GET',
        consumerKey = 'fjRNEsukXhL1FB3CIqPcag',
        consumerKeySecret = 'eCHECnGvppAsgd3VNUvDbdr032g',
        url = 'https://api.yelp.com/v2/search?',
        token = 'Rf1FlIlCejJyFN5nTH-86SvRb4yo1Mrt',
        signatureMethod = 'HMAC-SHA1',
        version = '1.0',
        local = locs.lat + ',' + locs.lng,
        tokenSecret = 'SbogXKxFUTSRLRi8OaqReMjzBzs';

    var parameters = {
      term: nameLocation,
      ll: local,
      oauth_consumer_key: consumerKey,
      oauth_token: token,
      oauth_nonce: nonce_generate(),
      oauth_timestamp: Math.floor(Date.now() / 1000),
      oauth_signature_method: 'HMAC-SHA1',
      callback: 'cb'
    };

    var encodedSignature = oauthSignature.generate(httpMethod, url, parameters, consumerKeySecret, tokenSecret);
    parameters.oauth_signature = encodedSignature;

    var settings = {
      url: url,
      data: parameters,
      cache: true,
      dataType: 'jsonp',
      success: function(data) {
        for (var i = 0; i < data.businesses.length; i++) {
          createMarker({location: data.businesses[i], marker: data.businesses[i]});
          console.log('OAUTH Create Marker: ', data.businesses[i]);
          that.locations.push({location: data.businesses[i], marker: marker});
        }
        console.log('initial locations array: ', that.locations);

        ko.applyBindings(new ViewModel());
        console.log("YELP SUCCESS! %o", data);
      },
      error: function(data) {
        console.log("YELP error %o", data);
      }
    };
    $.ajax(settings);
  };

  var success_geo = function(position) {
    locs.lat = position.coords.latitude;
    locs.lng = position.coords.longitude;
    map.setCenter(locs);
    setGeoLocs(locs);
    yelpConnect(locationSearchQueryTerm);
  };

  var error_geo = function(errored, coordInfoWindow, locs) {
    errored = true;
    setGeoLocs(locs);
    yelpConnect(locationSearchQueryTerm);
  };

  var initMap = function() {
    map = new google.maps.Map(document.getElementById('mapSection'), mapOptions);
    that.map = map;
    // referenced from https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation
    // https://developers.google.com/maps/documentation/javascript/examples/map-geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(success_geo, error_geo);
    } else {
      error_geo(false, coordInfoWindow, map.getCenter());
    }
  };

  var createMarker = function(place) {
    var position = {
      lat: place.location.location.coordinate.latitude,
      lng: place.location.location.coordinate.longitude
    };

    marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: position,
      title: place.location.id,
    });
    showMarkerInfoWindow(place);
  };

  var showMarkerInfoWindow = function(place) {
    google.maps.event.addListener(marker, 'click', function() {
      console.log('CLICK EVENT: ', place);
      coordInfoWindow.setContent(place.location.name);
      coordInfoWindow.open(map, this);
      map.panTo(this.getPosition());
    });
  };

  var selectListMarker = function(venue) {//marker) {
    console.log('selectListMarker VENUE: ', venue);
    venue.marker().setAnimation(google.maps.Animation.BOUNCE);
    map.setZoom(14);
    setTimeout(function() {
      venue.marker().setAnimation(null);
    }, 1400);
    coordInfoWindow.setContent(venue.name());
    coordInfoWindow.open(map, venue.marker());
    map.panTo(venue.marker().getPosition());
  };

  if (typeof google !== 'undefined') {
    // Initializing map
    initMap();
  } else {
    console.log("Error loading Google Maps API");
  }

  return {
    map: map,
    getGeoLocs: getGeoLocs,
    setGeoLocs: setGeoLocs,
    initMap: initMap,
    getLocations: getLocations,
    getMarkers: getMarkers,
    getSearchRadius: getSearchRadius,
    selectListMarker: selectListMarker,
    showMarkerInfoWindow: showMarkerInfoWindow,
    getLocationSearchQueryTerm: getLocationSearchQueryTerm
  };
})();

var Venue = function(venue) {
  var self = this;
  this.id = ko.observable(venue.location.id);
  this.name = ko.observable(venue.location.name);
  this.formatted_address = ko.observable(venue.location.location.display_address[0]);
  this.geoLocation = ko.observable(venue.location.coordinate);
  this.distance = ko.observable(venue.location.distance);
  this.is_closed = ko.observable(venue.location.is_closed);
  this.image_url = ko.observable(venue.location.image_url);
  this.rating_img_url = ko.observable(venue.location.rating_img_url);
  this.rating = ko.observable(venue.location.rating);
  this.types = ko.observable(venue.types);
  this.review_count = ko.observable(venue.review_count);
  this.snippet_text = ko.observable(venue.snippet_text);
  this.url = ko.observable(venue.url);
  this.marker = ko.observable(venue.marker);
};

var ViewModel = function() {
  console.dir(window);
  console.dir(app.getLocations());
  var self = this;
  this.locations = ko.observableArray([]);
  this.markers = ko.observableArray([]);
  this.totalNumLocs = app.getLocations().length;
  this.totalNumMarkers = app.getMarkers().length;
  this.inputVal = ko.observable('');
  var geoLocsLatLng = app.getGeoLocs();

  var addObservableLocations = function() {
    for (var i = 0; i < self.totalNumLocs; i++) {
      self.locations.push(new Venue(app.getLocations()[i]));
    }
    console.log('22222 self.locations(): ' + self.totalNumLocs);
    console.dir(self.locations());
  };

  var addObservableMarkers = function() {
    for (var i = 0; i < self.totalNumMarkers; i++) {
      self.markers.push(app.getMarkers()[i]);
    }
    console.log('33333 self.markers(): ' + self.totalNumMarkers);
    console.dir(self.markers());
  };

  if (self.totalNumLocs) {
    addObservableLocations();
    addObservableMarkers();
    this.currentListMarker = ko.observable();
  }

  this.selectListMarker = function(clickedListMarker) {
    self.currentListMarker(clickedListMarker);
    app.selectListMarker(self.currentListMarker());//.marker());
  };

  this.filteredLocations = ko.computed(function() {
    return ko.utils.arrayFilter(self.locations(), function(location) {
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
