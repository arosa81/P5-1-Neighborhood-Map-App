var app = (function() {
  var that = this;
  var map,
      locs = {
        lat: 0,
        lng: 0,
      },
      mapOptions = {
        panControl: true,
        zoomControl: true,
        zoom: 14
      },
      coordInfoWindow,
      marker,
      markers = [],
      locations = [];

  var getGeoLocs = function() {
    return locs;
  };

  var setGeoLocs = function(locs) {
    that.locs = locs;
  };

  var getLocations = function() {
    return locations;
  };

  var getMarkers = function() {
    return markers;
  };

  var initMap = function() {
    map = new google.maps.Map(document.getElementById('mapSection'), mapOptions);

    // referenced from https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation
    // https://developers.google.com/maps/documentation/javascript/examples/map-geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(success_geo, error_geo);
    } else {
      error_geo(false, coordInfoWindow, locs);
    }
  };

  var success_geo = function(position) {
    locs.lat = position.coords.latitude;
    locs.lng = position.coords.longitude;
    map.setCenter(locs);
    setGeoLocs(locs);
    locationFinder();
  };

  var error_geo = function(errored, coordInfoWindow, locs) {
    errored = true;
    locs.lat = 51.0486;
    locs.lng = -114.0708;
    map.setCenter(locs);
    setGeoLocs(locs);
    locationFinder();
  };

  var showMarkerInfoWindow = function(place) {
    google.maps.event.addListener(marker, 'click', function() {
      coordInfoWindow.setContent(place.name);
      coordInfoWindow.open(map, this);
    });
  };

  var selectListMarker = function(marker) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
  };

  var locationFinder = function() {
    var service = new google.maps.places.PlacesService(map);
    service.textSearch({
      query: 'coffee shops',
      location: locs,
      radius: 800
    }, cbCreateMarker);
  };

  var cbCreateMarker = function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createMarker(results[i]);
        locations.push(results[i]);
      }
      ko.applyBindings(new ViewModel());
    }
  };

  var createMarker = function(place) {
    var placeLocLat = place.geometry.location.lat();
    var placeLocLng = place.geometry.location.lng();
    // bounds = window.mapBounds;

    coordInfoWindow = new google.maps.InfoWindow();
    marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: place.geometry.location,
      title: place.place_id,
      clickable: true
    });
    markers.push({marker: marker});
    showMarkerInfoWindow(place);
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
    selectListMarker: selectListMarker,
    showMarkerInfoWindow: showMarkerInfoWindow
  };
})();

var Venue = function(venue) {
  var self = this;
  this.name = ko.observable(venue.name);
  this.formatted_address = ko.observable(venue.formatted_address);
  this.geoLocation = ko.observable(venue.geometry.location);
  this.icon = ko.observable(venue.icon);
  this.opening_hours = ko.observable(venue.opening_hours);
  this.photos = ko.observable(venue.photos);
  this.place_id = ko.observable(venue.place_id);
  this.rating = ko.observable(venue.rating);
  this.types = ko.observable(venue.types);
};

var ViewModel = function() {
  console.dir(window);
  var self = this;
  this.locations = ko.observableArray([]);
  this.markers = ko.observableArray([]);
  this.totalNumLocs = app.getLocations().length;
  this.totalNumMarkers = app.getMarkers().length;

  var addObservableLocations = function() {
    for (var i = 0; i < self.totalNumLocs; i++) {
      self.locations.push(new Venue(app.getLocations()[i]));
      // console.dir(self.locations()[i]);
    }
    console.log('22222 self.locations(): ' + self.totalNumLocs);
    console.dir(self.locations());
  };

  var addObservableMarkers = function() {
    for (var i = 0; i < self.totalNumMarkers; i++) {
      self.markers.push(app.getMarkers()[i]);
      // console.dir(self.markers()[i]);
    }
    console.log('33333 self.markers(): ' + self.totalNumMarkers);
    console.dir(self.markers());
  };

  if (self.totalNumLocs) {
    addObservableLocations();
    addObservableMarkers();
    this.currentListMarker = ko.observable();
  } else {
    google.maps.event.addListenerOnce(app.map, 'idle', function() {
      addObservableLocations();
      addObservableMarkers();
    });
  }

  this.selectListMarker = function(clickedListMarker) {
    self.currentListMarker(clickedListMarker);
    console.log('CURRENT MARKER');
    // console.dir(self.currentListMarker().place_id());
    // app.selectListMarker(self.currentMarker());
    for (var markerItem in self.markers()) {
      if (self.markers().hasOwnProperty(markerItem)) {
        // console.log('111111');
        // console.log(self.currentListMarker().place_id());
        // console.log('222222');
        // console.log(self.markers()[markerItem].marker.title);
        if (self.currentListMarker().place_id() === self.markers()[markerItem].marker.title) {
          app.selectListMarker(self.markers()[markerItem].marker);
          app.showMarkerInfoWindow(self.markers()[markerItem].marker);
          console.log('333333');
          break;
        }
      }
    }

    // console.dir(self.currentListMarker().place_id());
  };

  // ko.bindingHandler.showMarkerData = {
  //   update: function(element, valueAccessor) {
  //
  //   }
  // };
};
