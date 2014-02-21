// geocode_check(Session.get('resources'));

Deps.autorun(function() {
  Meteor.subscribe(
    'resources_from_services',
    Session.get('display_services'),
    function() {
      Session.set(
        'resources_from_services',
        Resources.find({}).fetch()
      );
      //TODO: make this update the resources available on map
    }
  );
});

Template.display_home.events({
  'click .flag': function(e, tmpl) {
    flag = $(tmpl.find('.fa-flag'));
    if (!flag.hasClass('red')) {
      Meteor.call("flagResource", $('.flag')[0].id, Meteor.userId());
      if (!Meteor.userId()) { //should auto add if there is a userId
        flag.addClass('red');
      }
    }
  }
});

Template.display_home.helpers({
  resource: function() {
    return !(Session.get('display_resource') == null);
  },
  services: function() {
    return Services.find({_id:{$in:Session.get('display_resource').services}});
  },
  flag_on: function() {
    if (this.flags.indexOf(Session.get('display_resource')._id) > -1) {
        return 'red';
    } else {
        return '';
    }
  },
});

Template.home.created = function() {
  Session.set('map_markers_in_view', []);
  Session.set('resources_from_services', []);
  Session.set('display_resource', null);
  Session.set('display_services', []);
  Session.set('bounded', false);
}

Template.home.rendered = function() {
  var i = -1;
  if (Session.get('display_services').length == 0) {
    Session.set('display_services',
                this.data.services.map(
                  function(service) {
                    i += 1;
                    return {color:colors[i], name:service.name, name_route:service.name_route,
                            count:service.count, _id:service._id};
                  }
                )
               );
  }
}

Template.home.helpers({
  service_datums: function() {
    return Services.find().map(function(service) {
      return {value:service.name, name_route:service.nameRoute, count:service.count}
    });
  },
  resource_datums: function() {
    return Resources.find().map(function(resource) {
      return {value:resource.name, name_route:resource._id}
    });
  },
});

Template.map_home.rendered = function() {
  if (!Session.get('map')) {
    map.initialize_map();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var center = new google.maps.LatLng(position.coords.latitude,
                                            position.coords.longitude);
        if(center) {
          map.panTo(center);
        }
      });
    }
    google.maps.event.addListener(map.gmap, 'bounds_changed', function() {
      Session.set('map_markers_in_view', map.markers_in_bounds());
    });
  }

  Deps.autorun(function() {
    _.each(Session.get('resources_from_services'), function(resource) {
      //TODO: make this a diff change, not an all change.
      geocode_check(resource);
      add_marker(resource);
    });
    if (!Session.get('bounded')) {
      var bounds = map.calc_bounds();
      map.gmap.fitBounds(bounds);
      Session.set('bounded', true);
    }
  });
}

Template.map_home.destroyed = function() {
  Session.set('map', false);
};

Template.search_map.rendered = function() {
  initialize_map_search();
  $('#search_map_field').outerWidth($('#map_canvas').width());
}

Template.home_search_resources.rendered = function() {
  var data = this.data;
  var datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  });
  datums.initialize();

  $('#search_resources_form').outerWidth($('#titleBox').width());
  $('#search_resources_field').typeahead(null, {
    displayKey: 'value',
    source: datums.ttAdapter()
  }).on('typeahead:selected', function(event, datum) {
    Router.go('/resource/' + datum.name_route);
  });
};

Template.search_services.rendered = function() {
  var data = this.data;
  var services_datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  });
  services_datums.initialize();

  $('#search_services_form').outerWidth($('#services_home').width());
  $('#search_services_field').typeahead(null, {
    displayKey: 'value',
    source: services_datums.ttAdapter()
  }).on('typeahead:selected', function(event, datum) {
    var display_services = Session.get('display_services');
    var name_route = datum.name_route;
    var has_service = false;
    for (var i = 0; i < display_services.length; i++) {
      if (display_services[i].name_route == name_route) {
        has_service = true;
        break;
      }
    }
    if (!has_service) {
      var element = display_services.pop();
      map.remove_service(element._id);
      var color = element.color;
      Services.find({nameRoute:name_route}).forEach(function(service) {
        display_services.unshift(
          {name:service.name, name_route:service.nameRoute,
           count:service.count, _id:service._id, color:color}
        );
        Session.set('display_services', display_services);
      });
    }
  });
}

Template.services.events({
  'click .serviceBox': function(e, tmpl) {
    var box = $(e.target).closest('.serviceBox');
    if (box.hasClass('titleBox')) {
      if (box.hasClass('selected')) {
        remove_all_selected();
        _.each(Session.get('resources'), function(resource) {
          remove_marker(resource);
        });
      } else {
        add_all_selected();
        _.each(Session.get('resources'), function(resource) {
          add_existing_marker(resource);
        });
      }
    } else if (box.hasClass('selected')) {
      box.removeClass('selected');
      adjust_map_display(box, remove_marker);
      box.css('background-color', '#fff');
    } else {
      box.addClass('selected');
      adjust_map_display(box, add_existing_marker);
      box.css('background-color', box.attr('color'));
    }
  }
});

Template.services.helpers({
  services: function() {
    return Session.get('display_services');
  }
});

Template.services.rendered = function() {
  add_all_selected();
  $('#map_canvas').css("height", $('#services_home').height());
  $('#display_home').css("height", $('#services_home').height());
}

Template.show_map_resources.helpers({
  has_map_resources: function() {
    return Session.get('map_markers_in_view').length > 0;
  },
  map_resources: function() {
    return Resources.find({_id:{$in:Session.get('map_markers_in_view')}});
  }
});

var initialize_map_search = function() {
  var input = document.getElementById('search_map_field');
  var autocomplete = new google.maps.places.Autocomplete(input, {types:['geocode']});
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (place.geometry) {
      map.panTo(place.geometry.location);
      map.setZoom(14);
    } else {
      input.placeholder = 'Change Location';
    }
  });
};

var remove_all_markers = function() {
  map.remove_all_markers();
}

var add_marker = function(resource) {
  if (typeof resource.lat !== 'undefined' &&
      typeof resource.lng !== 'undefined') {
    if (!map.marker_exists(resource._id)) {
      map.add_new_marker({id:resource._id, title:resource.name,
                          lat:resource.lat, lng:resource.lng,
                          services:resource.services,
                          icon:get_icon_for_resource(resource)});
//     } else {
//       map.add_existing_marker(resource);
    }
  }
};

var colors = ["#74F0F2", "#B3F2C2", "#DCFA9B", "#FABDFC", "#F5A2AD",
              "#BDC9FC", "#A2B2F5", "#F5E1A2", "#AEF5A2", "#42F55D"];
var icons  = ["paleblue_MarkerA.png", "green_MarkerA.png", "yellow_MarkerA.png",
              "pink_MarkerA.png", "red_MarkerA.png"]
var icon_from_color = function(color) {
  return icons[colors.indexOf(color)];
}

var get_icon_for_resource = function(resource) {
  var display_services = Session.get('display_services');
  resource.services.forEach(function(service_id) {
    display_services.forEach(function(service) {
      if (service._id == service_id) {
        return icon_from_color(service.color);
      }
    });
  });
}

var remove_all_selected = function() {
  $('.selected').not('.titleBox').css('background-color', "#fff");
  $('.selected').removeClass('selected');
}

var add_all_selected = function() {
  $('.serviceBox').addClass('selected');
  _.each($('.serviceBox').not('.titleBox'), function(box) {
    box.style.backgroundColor = box.getAttribute('color');
  });
}

var remove_marker = function(resource) {
    map.remove_marker(resource);
    var map_markers_in_view = Session.get('map_markers_in_view');
    var index = map_markers_in_view.indexOf(resource._id);
    if (index > -1) {
        map_markers_in_view.splice(index, 1);
        Session.set('map_markers_in_view', map_markers_in_view);
    }
};

var add_existing_marker = function(resource) {
    map.add_existing_marker(resource);
};

var adjust_map_display = function(box, f) {
  //TODO: fix this. It's very hacky.
  var color = box.attr('color');
  var color_index = colors.indexOf(color);
  var services = Session.get('display_services');
  if (color_index != -1 && color_index < services.length && services) {
    var service = services[color_index];
    Resources.find({services:service._id}).forEach(function(resource) {
      f(resource)
    });
  }
};
