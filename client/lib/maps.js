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
    this.markerIDs.push(marker.id + '_' + marker.position.toString());
    this.marker_services.push(marker.services);
    google.maps.event.addListener(gMarker, 'click', function() {
      resource = Resources.findOne({_id:gMarker.id});
      Session.set('display_resource', resource);
    });
    return gMarker;
  },

  add_existing_marker: function(resource) {
    var i = 0;
    var exists = this.marker_exists(resource._id, i);
    while(exists[0]) {
      this.markers[exists[1]].setMap(this.gmap);
      var bounds = this.gmap.getBounds();
      if (bounds && bounds.contains(this.markers[exists[1]].position)) {
        var map_markers_in_view = Session.get('map_markers_in_view');
        map_markers_in_view.push(this.markers[exists[1]].id);
        Session.set('map_markers_in_view', map_markers_in_view);
      }

      i += 1;
      exists = this.marker_exists(resource._id, i);
    }
  },

  remove_marker: function(resource) {
    var i = 0;
    var exists = this.marker_exists(resource._id, i);
    while(exists[0]) {
      this.markers[exists[1]].setMap(null);

      var map_markers_in_view = Session.get('map_markers_in_view');
      var index = map_markers_in_view.indexOf(resource._id);
      if (index > -1) {
        map_markers_in_view.splice(index, 1);
        Session.set('map_markers_in_view', map_markers_in_view);
      }

      i += 1;
      exists = this.marker_exists(resource._id, i);
    }
  },

  remove_service: function(service_id) {
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

  marker_exists: function(id, position) {
    var index = this.markerIDs.indexOf(id + '_' + position.toString());
    if (index != -1) {
      return [true, index];
    }
    return [false, null];
  },

  // initialize the map
  initialize_map: function() {
    var mapOptions = {
      zoom: 13,
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

  assign_geocode: function(resource, i) {
    if (!this.geocoder) {
      this.geocoder = new google.maps.Geocoder();
    }

    var addresses = resource.locations.address;
    var adrs = addresses[i];
    var string_adrs = adrs.street + ', ' + adrs.city + ', ' + adrs.state;
    this.geocoder.geocode({'address':string_adrs}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (status != google.maps.GeocoderStatus.ZERO_RESULTS) {
          r = results[0].geometry.location;
          Meteor.call("assign_geocode", resource._id, i, r.lat(), r.lng());
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
      if (bounds.contains(this.markers[i].position) && this.markers[i].map) {
        console.log('past marker_service_visible');
        markerIDs.push(this.markerIDs[i].slice(0,-2));
      }
    }
    return markerIDs;
  },
}

geocode_check = function(resource) {
  if (resource && resource.locations && resource.address) {
    var addresses = resource.address;
    for (var i = 0; i < addresses.length; i++) {
      if (addresses[i].spatial_location.lat) {
        map.assign_geocode(resource, i);
      }
    }
  }
}