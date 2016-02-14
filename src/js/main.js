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
      locationSearchQueryTerm = 'coffee',
      marker,
      markers = [],
      mapBindingError = ko.observable(false),
      yelpBindingError = ko.observable(false),
      coordInfoWindow;
      this.locations = [];


  /**
  * @name setGeoLocs
  * @description Setter to update location object
  * @function
  * @param {object} locs - location object (lat, lng)
  */
  var getGeoLocs = function() {
    return locs;
  };

  /**
  * @name setGeoLocs
  * @description Setter to update location object
  * @function
  * @param {object} locs - location object (lat, lng)
  */
  var setGeoLocs = function(locs) {
    that.locs = locs;
  };

  /**
  * @name getLocations
  * @description Getter to retrieve location array
  * @function
  */
  var getLocations = function() {
    return locations;
  };

  /**
  * @name bindKnockout
  * @description initaties the binding to knockout ViewModel object
  * @function
  */
  var bindKnockout = function() {
    ko.applyBindings(new ViewModel());
  };

  /**
  * @name nonce_generate
  * @description Number generator used by the yelpConnect method. Open source attributed to github user bettilio -> https://github.com/bettiolo/oauth-signature-js
  * @function
  */
  function nonce_generate() {
    return (Math.floor(Math.random() * 1e12).toString());
  }

  /**
  * @name yelpConnect
  * @description Generates OAuth signature for Yelp's api. Open source attributed to github user bettilio -> https://github.com/bettiolo/oauth-signature-js
  * @function
  * @param {String} nameLocation - term used for parameters object
  */
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
        //on success creates marker and location object and pushes them in locations array
        //ko bindings begins here
        console.log("YELP success %o", data);
        for (var i = 0; i < data.businesses.length; i++) {
          createMarker({location: data.businesses[i], marker: data.businesses[i]});
          that.locations.push({location: data.businesses[i], marker: marker});
        }
        bindKnockout();
      },
      error: function(data) {
        bindKnockout();
        if (mapBindingError === false) {
          yelpBindingError(true);
        }
        console.log("YELP error %o", data);
      }
    };
    $.ajax(settings);
  };

  /**
  * @name success_geo
  * @description function triggers when Geolocation is successful. Centers map, updates global location object, adds center Geolocation marker, triggers Yelp API request.
  * @function
  * @param {Object} position - Represents location object (lat, lng)
  */
  var success_geo = function(position) {
    locs.lat = position.coords.latitude;
    locs.lng = position.coords.longitude;
    map.setCenter(locs);
    setGeoLocs(locs);
    addCenterMarker();
    yelpConnect(locationSearchQueryTerm);
  };

  /**
  * @name error_geo
  * @description function triggers when Geolocation is unsuccessful. Flags error state, adds center Geolocation marker using global location object, and triggers Yelp API request.
  * @function
  * @param {boolean} errored - Represents success error state
  */
  var error_geo = function(errored) {
    errored = true;
    addCenterMarker();
    yelpConnect(locationSearchQueryTerm);
  };

  /**
  * @name initMap
  * @description Initializes the map object, passes it to global variable, and initiates Geolocation request process.
  * @function
  */
  var initMap = function() {
    // Initializing map
    map = new google.maps.Map(document.getElementById('mapSection'), mapOptions);
    that.map = map;
    // referenced from https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation
    // https://developers.google.com/maps/documentation/javascript/examples/map-geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(success_geo, error_geo);
    } else {
      error_geo(false);
    }
  };

  /**
  * @name googleError
  * @description Runs when error occurs with google maps.
  * @function
  */
  var googleError = function() {
    if (typeof google === 'undefined') {
      mapBindingError(true);
      yelpConnect(' ');
    }
  };

  /**
  * @name addCenterMarker
  * @description Adds marker to map that reflects users location only after initilization of map.
  * @function
  */
  var addCenterMarker = function() {
    var marker = new google.maps.Marker({
        position: map.getCenter(),
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
        },
        clickable: false,
        map: map
      });
  };

  /**
  * @name createMarker
  * @description creates a map marker and associates marker with info window event.
  * @function
  * @param {Object} place - Represents location object from locations array
  */
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

  /**
  * @name animateMarker
  * @description animates a marker when selected for the list.
  * @function
  * @param {Object} marker - Represents marker object from locations array
  */
  var animateMarker = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1400);
  };

  /**
  * @name showMarkerInfoWindow
  * @description Shows infowindow of a marker when marker is clicked on.
  * @function
  * @param {Object} place - Represents location object from locations array
  */
  var showMarkerInfoWindow = function(place) {
    coordInfoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      animateMarker(this);
      createInfoWindow(place);
      coordInfoWindow.open(map, this);
      map.panTo(this.getPosition());
    });
  };

  /**
  * @name createInfoWindow
  * @description creates an infowindow object to a marker and passes venue information.
  * @function
  * @param {Object} place - Represents location object from locations array
  */
  var createInfoWindow = function(place) {
    if (place.location.image_url === undefined) {
      place.location.image_url = '';
    }
    if (place.location.snippet_text === undefined) {
      place.location.snippet_text = '';
    }
    if (place.location.display_phone === undefined) {
      place.location.display_phone = '';
    }

    var contentString =
    '<div class="infoWindow-Container">'+
      '<div class="infoWindow-Content-Top">'+
        '<div class="infoWindow-Content-Left">'+
          '<h5 data-bind="text: name">' + place.location.name + '</h5>'+
          '<img src="' + place.location.rating_img_url + '" alt="" data-bind="attr: {src: rating_img_url}"/>'+
          '<span data-bind="text: rating">  ' + place.location.rating + '</span><br>'+
          '<i class="fa fa-phone-square"></i>  ' + place.location.display_phone +
        '</div>'+
        '<div class="infoWindow-Content-Right">'+
          '<img src="' + place.location.image_url + '" alt="" data-bind="visible: location.image_url"/>'+
        '</div>'+
      '</div>'+
      '<div class="infoWindow-Content-Bottom">' +
        '<p data-bind="text: snippet_text">' + place.location.snippet_text + '</p>'+
        '<a href="' + place.location.mobile_url + '" target="_blank" data-bind="attr: {href: yelpURL}, visible: yelpURL">Click here to view details on Yelp</a>' +
      '</div>' +
    '</div>';
    coordInfoWindow.setContent(contentString);
  };

  /**
  * @name selectListMarker
  * @description Triggers when a venue from list is selected. Animates marker, creates an infowindow object to a marker and passes the venue information
  * @function
  * @param {Object} venue - Represents venue object
  */
  var selectListMarker = function(venue) {
    animateMarker(venue.marker());
    for (var i = 0; i < self.locations.length; i++) {
      if (venue.id() === self.locations[i].location.id) {
        createInfoWindow(self.locations[i]);
        break;
      }
    }
    coordInfoWindow.open(map, venue.marker());
    map.panTo(venue.marker().getPosition());
  };

  // making methods public for ko viewmodel to use
  return {
    initMap: initMap,
    googleError: googleError,
    map: map,
    setGeoLocs: setGeoLocs,
    getLocations: getLocations,
    selectListMarker: selectListMarker,
    mapBindingError: mapBindingError,
    yelpBindingError: yelpBindingError,
  };
})();
