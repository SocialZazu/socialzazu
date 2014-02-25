map = {
  gmap: null,
  geocoder: null,
  markers: [],
  latLngs: [],
  markerIDs: [],
  marker_services: [],

  add_new_marker: function(marker) {
    var gLatLng = new google.maps.LatLng(marker.lat, marker.lng);
    var gMarker = new google.maps.Marker({
      position: gLatLng,
      map: this.gmap,
      title: marker.title,
      id: marker.id,
      icon: marker.icon
    });

    this.latLngs.push(gLatLng);
    this.markers.push(gMarker);
    this.markerIDs.push(marker.id);
    this.marker_services.push(marker.services);
    google.maps.event.addListener(gMarker, 'click', function() {
      resource = Resources.findOne({_id:gMarker.id});
      Session.set('display_resource', resource);
    });
    return gMarker;
  },

  add_existing_marker: function(resource) {
    var i = this.markerIDs.indexOf(resource._id);
    if (i != -1) {
      this.markers[i].setMap(this.gmap);
      var bounds = this.gmap.getBounds();
      if (bounds && bounds.contains(this.markers[i].position)) {
        var map_markers_in_view = Session.get('map_markers_in_view');
        map_markers_in_view.push(this.markers[i].id);
        Session.set('map_markers_in_view', map_markers_in_view);
      }
    }
  },

  remove_marker: function(resource) {
    var i = this.markerIDs.indexOf(resource._id);
    if (i != -1) {
      this.markers[i].setMap(null);
    }
  },

  remove_service: function(service_id) { //TODO: make this remove the set of markers as well
    for (var i = 0; i < this.marker_services.length; i++) {
      services = this.marker_services[i];
      if (services.indexOf(service_id) > -1) {
        this.markers[i].setMap(null);
      }
    }
  },

  remove_all_markers: function() {
    this.markers.forEach(function(marker) {
      marker.setMap(null);
    });
  },

  calc_bounds: function() {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, latLngLength = this.latLngs.length; i < latLngLength; i++) {
      bounds.extend(this.latLngs[i]);
    }
    return bounds;
  },

  marker_exists: function(id) {
    if (this.markerIDs.indexOf(id) != -1) {
      return true;
    }
    return false;
  },

  // initialize the map
  initialize_map: function() {
    var mapOptions = {
      zoom: 17,
      center: new google.maps.LatLng(37.748933,-122.422632),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    this.gmap = new google.maps.Map(
      document.getElementById('map_canvas'),
      mapOptions
    );
    // global flag saying we intialized already
    Session.set('map', true);
  },

  assign_geocode: function(resource) {
    console.log('assignging geocode for resource');
    console.log(resource);
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }

    address = resource.streetNumber + ' ' + resource.street + ', ' + resource.city + ', ' + resource.state + ', ' + resource.zipcode;
    this.geocoder.geocode({'address':address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
          r = results[0].geometry.location;
          Meteor.call("assign_geocode", resource._id, r.lat(), r.lng());
        } else {
          alert("No geocoder results found");
        }
      } else {
        alert("geocoder failed because " + status);
      }
    });
  },

  panTo: function(location) {
    this.gmap.panTo(location);
  },

  setZoom: function(level) {
    this.gmap.setZoom(level);
  },

  markers_in_bounds: function() {
    var markerIDs = [];
    var bounds = this.gmap.getBounds();
    for (var i = 0; i < this.markers.length; i++) {
      var marker = this.markers[i];
      if (bounds.contains(marker.position)) {
        markerIDs.push(this.markerIDs[i]);
      }
    }
    return markerIDs;
  },
}

geocode_check = function(resource) {
  if (!resource.lat) {
    map.assign_geocode(resource);
  }
}