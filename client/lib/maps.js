map = {
  gmap: null,
  geocoder: null,
  markers: [],
  latLngs: [],
  markerIDs: [],
  marker_services: [],

  add_marker_from_location: function(location) {
    var address = location.address[0]; //Only one (may change in future)
    if (address.coordinates && typeof address.coordinates.lat !== 'undefined' &&
        typeof address.coordinates.lng !== 'undefined') {

      if (!this.marker_exists(location._id)[0]) {
        var icon = get_icon_for_location(location);
        this.add_new_marker({
          id:location._id, title:location.name,
          lat:address.coordinates.lat,
          lng:address.coordinates.lng,
          services:location.sub_service_ids,
          icon:icon});
      } else {
        this.add_existing_marker(location);
      }
    }
  },

  add_map_marker_in_view: function(marker) {
    console.log(marker);
    var bounds = this.gmap.getBounds();
    if (bounds && bounds.contains(marker.position)) {
      session_var_push('map_markers_in_view', marker.id);
    }
  },

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
    this.add_map_marker_in_view(gMarker);
    google.maps.event.addListener(gMarker, 'click', function() {
      location = Locations.findOne({_id:gMarker.id});
      Session.set('display_location', location);
      pan_to(gMarker.position);
    });
    return gMarker;
  },

  add_existing_marker: function(location) {
    var exists = this.marker_exists(location._id);
    if (exits[0]) {
      this.markers[exists[1]].setMap(this.gmap);
      this.add_map_marker_in_view(this.markers[exists[1]]);
    }
  },

  remove_marker: function(location) {
    var exists = this.marker_exists(location._id);
    if (exists[0]) {
      this.markers[exists[1]].setMap(null);
      session_var_splice('map_markers_in_view', location._id);
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

    this.markers = [];
    this.markerIDs = [];
    this.marker_services = [];
    this.latLngs = [];
  },

  marker_exists: function(id) {
    var index = this.markerIDs.indexOf(id);
    return [index > -1, index];
  },

  // initialize the map
  initialize_map: function() {
    var mapOptions = {
      zoom: 12,
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

    var adrs = resource.locations.address[i];
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
        markerIDs.push(this.markerIDs[i]);
      }
    }
    return markerIDs;
  },
}

geocode_check = function(resource) {
  if (resource && resource.locations && resource.locations.address) {
    var addresses = resource.locations.address;
    for (var i = 0; i < addresses.length; i++) {
      if (!addresses[i].coordinates.lat) {
        map.assign_geocode(resource, i);
      }
    }
  }
}

var get_icon_for_location = function(location) {
  var display_services = Session.get('display_services');
  var icon = false;
  location.sub_service_ids.forEach(function(service_id) {
    display_services.forEach(function(service) {
      if (service._id == service_id) {
        icon = '/gflags/' + icon_from_color(service.color);
      }
    });
  });
  return icon;
}

var icons = ["paleblue_MarkerA.png", "green_MarkerA.png", "yellow_MarkerA.png",
              "pink_MarkerA.png", "red_MarkerA.png", "blue_MarkerA.png"]
var icon_from_color = function(color) {
  return icons[colors.indexOf(color)];
}

pan_to = function(position) {
  map.panTo(position);
}

trigger_map_resize = function() {
  var center = map.gmap.getCenter();
  google.maps.event.trigger(map.gmap, "resize");
  map.gmap.setCenter(center);
}
