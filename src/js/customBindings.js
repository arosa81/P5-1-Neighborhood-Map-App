var app = app || {};
(function() {
  ko.bindingHandlers.mapsErrorVisible = {
    init: function(element, valueAccessor) {
      var mapErrorVal = valueAccessor();
      if (mapErrorVal()) {
        $(element).addClass('bg-danger');
        $(element).append('<p>Oops...Something went wrong with Google maps. Please refresh or try later and either accept or decline the geolocation request.</p>');
        $('.left-panel').remove();
      } else {
        $(element).remove();
      }
    }
  };

  ko.bindingHandlers.yelpErrorVisible = {
    init: function(element, valueAccessor) {
      var yelpErrorVal = valueAccessor();
      if (yelpErrorVal()) {
        $(element).addClass('bg-danger');
        $(element).append('<p>Oops...Something went wrong in contacting Yelp. Please refresh or try again at a later time.</p>');
        $('.left-panel').remove();
      } else {
        $(element).remove();
      }
    }
  };
})();
