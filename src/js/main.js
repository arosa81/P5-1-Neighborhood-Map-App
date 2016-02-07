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
      var coordInfoWindow;

  var setGeoLocs = function(locs) {
    that.locs = locs;
  };

  var getLocations = function() {
    return locations;
  };

  var getMarkers = function() {
    return markers;
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
          that.locations.push({location: data.businesses[i], marker: marker});
        }
        ko.applyBindings(new ViewModel());
      },
      error: function(data) {
        $('body').append('<p class="bg-danger">...</p>');
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

  var error_geo = function(errored, locs) {
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
      error_geo(false, map.getCenter());
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

  var animateMarker = function(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      marker.setAnimation(null);
    }, 1400);
  };

  var showMarkerInfoWindow = function(place) {
    coordInfoWindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, 'click', function() {
      animateMarker(this);
      createInfoWindow(place);
      coordInfoWindow.open(map, this);
      map.panTo(this.getPosition());
    });
  };

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
    var pixelOffset = {width: 50, height: 0};
    coordInfoWindow.setContent(contentString);
    coordInfoWindow.setOptions({pixelOffset: pixelOffset});
  };

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

  if (typeof google !== 'undefined') {
    // Initializing map
    initMap();
  } else {
    $('body').append('<p class="bg-danger">...</p>');
  }

  return {
    map: map,
    setGeoLocs: setGeoLocs,
    getLocations: getLocations,
    getMarkers: getMarkers,
    selectListMarker: selectListMarker,
  };
})();

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

var ViewModel = function() {
  var self = this;
  this.locations = ko.observableArray([]);
  this.markers = ko.observableArray([]);
  this.totalNumLocs = app.getLocations().length;
  this.totalNumMarkers = app.getMarkers().length;
  this.inputVal = ko.observable('');

  var addObservableLocations = function() {
    for (var i = 0; i < self.totalNumLocs; i++) {
      self.locations.push(new Venue(app.getLocations()[i]));
    }
  };

  if (self.totalNumLocs) {
    addObservableLocations();
    this.currentListMarker = ko.observable();
  }

  this.selectListMarker = function(clickedListMarker) {
    self.currentListMarker(clickedListMarker);
    app.selectListMarker(self.currentListMarker());
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
