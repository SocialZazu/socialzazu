PAN_TO_ME = false;

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

Template.flag_control.events({
  'click .flag': function(e, tmpl) {
    flag = $(tmpl.find('.icon-flag'));
    if (!flag.hasClass('red')) {
      Meteor.call("flag_resource", flag.parent().attr('id'), Meteor.userId());
      if (!Meteor.userId()) {
        //TODO: doesn't do red if using icon-flag
        flag.addClass('red');
      }
    }
  }
});

Template.home.created = function() {
  Session.set('map_markers_in_view', []);
  Session.set('resources_from_services', []);
  Session.set('display_resource', null);
  Session.set('display_services', []); //all in sidebar
  Session.set('visible_services', []); //the ones shown on map
}

Template.home.helpers({
  service_datums: function() {
    return Services.find().map(function(service) {
      return {value:service.name, name_route:service.name_route}
    });
  },
  resource_datums: function() {
    return Resources.find().map(function(resource) {
      return {value:resource.name, name_route:resource._id}
    });
  },
  county_datums: function() {
    return Counties.find().map(function(county) {
      return {value:county.name, _id:county._id};
    });
  },
});

var colors = ["#74F0F2", "#B3F2C2", "#DCFA9B", "#FABDFC", "#F5A2AD",
              "#BDC9FC", "#A2B2F5", "#F5E1A2", "#AEF5A2", "#42F55D"];
Template.home.rendered = function() {
  var i = -1;
  Session.set(
    'display_services',
    this.data.services.map(
      function(service) {
        i += 1;
        return {color:colors[i], name:service.name, name_route:service.name_route,
                _id:service._id};
      }
    )
  );
  Session.set('visible_services',
              this.data.services.map(
                function(service) {
                  return service._id;
                }
              )
             );

  $('#search_services_form').outerWidth($('#services_home').width());
  $('#search_map_field').outerWidth($('#map_canvas').width())
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

Template.map_home.rendered = function() {
  if (!this.rendered) {
    map.initialize_map();
    this.rendered = Session.get('map');
    if (PAN_TO_ME && navigator.geolocation) {
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
      add_marker(resource);
    });
  });
}

Template.map_home.destroyed = function() {
  Session.set('map', false);
};

Template.resource_well.helpers({
  sub_services: function() {
    return Services.find({_id:{$in:this.sub_service_ids}}, {name:true});
  },
});

Template.resource_hours.helpers({
  day_of_week: function() {
    return [this.m, this.tu, this.w, this.th, this.f, this.sa, this.su];
  },
  closed: function() {
    return this.closed || (!this.open_time && !this.close_time);
  },
  open: function() {
    return military_to_regular(this.open_time);
  },
  close: function() {
    return military_to_regular(this.close_time);
  }
});

Template.search_map.rendered = function() {
//   initialize_map_search();
}

Template.search_county.rendered = function() {
  var data = this.data;
  var counties_datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  });
  counties_datums.initialize();
  $('#search_counties_field').typeahead(null, {
    displayKey:'value',
    source: counties_datums.ttAdapter()
  }).on('typeahead:selected', function(event, datum) {
    Session.set('county', datum._id);
  });
}

Template.search_services.rendered = function() {
  var data = this.data;
  var services_datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  });
  services_datums.initialize();

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
      Services.find({name_route:name_route}).forEach(function(service) {
        display_services.unshift(
          {name:service.name, name_route:service.name_route,
           _id:service._id, color:color}
        );
        Session.set('display_services', display_services);
      });
    }
  });
}

Template.service_box.events({
  'click .serviceBox': function(e, tmpl) {
    var box = $(e.target).closest('.serviceBox');
    var color_index = colors.indexOf(box.attr('color'));
    var service = Session.get('display_services')[color_index];
    var visibles = Session.get('visible_services');
    var index = visibles.indexOf(service._id);
    if (box.hasClass('selected')) {
      if (index > -1) {
        visibles.splice(index, 1);
        Session.set('visible_services', visibles);
      }
      adjust_map_display(service, remove_marker);
      box.removeClass('selected');
      box.css('background-color', '#fff');
    } else {
      if (index == -1) {
        visibles.push(service);
        Session.set('visible_services', visibles);
      }
      adjust_map_display(service, add_existing_marker);
      box.addClass('selected');
      box.css('background-color', box.attr('color'));
    }
  }
});

Template.services_sidebar.helpers({
  services: function() {
    return Session.get('display_services');
  }
});

Template.services_sidebar.rendered = function() {
  add_all_selected();
  $('#map_canvas').css("height", $('#services_home').height());
  $('#display_home').css("height", $('#services_home').height());
  $('.search-query.tt-hint').width('inherit');
}

Template.show_map_resources.helpers({
  has_map_resources: function() {
    return Session.get('map_markers_in_view').length > 0;
  },
  map_resources: function() {
    return Resources.find({_id:{$in:Session.get('map_markers_in_view')}}).map(function(resource) {
      var services = resource.sub_service_ids;
      var display = Session.get('display_services');
      for (var i = 0; i < display.length; i++) {
        if (Session.get('visible_services').indexOf(display[i]._id) > -1 && resource.sub_service_ids.indexOf(display[i]._id) > -1) {
          return resource;
          break;
        }
      }
    });
  }
});

var initialize_map_search = function() {
  var input = document.getElementById('search_map_field');
  var autocomplete = new google.maps.places.Autocomplete(input, {types:['geocode']});
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (place.geometry) {
      map.panTo(place.geometry.location);
    } else {
      input.placeholder = 'Change Location';
    }
  });
};

var remove_all_markers = function() {
  map.remove_all_markers();
}

var add_marker = function(resource) {
  var addresses = resource.locations.address;
  for (var i = 0; i < addresses.length; i++) {
    var adrs = addresses[i];
    if (typeof adrs.spatial_location.lat !== 'undefined' &&
        typeof adrs.spatial_location.lng !== 'undefined') {
      var exists = map.marker_exists(resource._id, i);
      if (!exists[0]) {
        var icon = get_icon_for_resource(resource);
        map.add_new_marker({
          id:resource._id, position:i, title:resource.name,
          lat:adrs.spatial_location.lat,
          lng:adrs.spatial_location.lng,
          services:resource.sub_service_ids,
          icon:icon});
      }
    }
  }
};

var add_all_selected = function() {
  $('.serviceBox').addClass('selected');
  _.each($('.serviceBox').not('.titleBox'), function(box) {
    box.style.backgroundColor = box.getAttribute('color');
  });
}

var add_existing_marker = function(resource) {
  map.add_existing_marker(resource);
};

var adjust_map_display = function(service, f) {
  Resources.find({sub_service_ids:service._id}).forEach(function(resource) {
    f(resource);
  });
};

var get_icon_for_resource = function(resource) {
  var display_services = Session.get('display_services');
  var icon = false;
  resource.sub_service_ids.forEach(function(service_id) {
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

var military_to_regular = function(time) {
  //convert military, e.g. 1700 --> 5pm
  if (time == null || time < 0 || time > 2400) {
    return null;
  } else {
    var modifier = 'am';
    time = Math.floor(time); //juuuust in case it's non-int
    if (time >= 1200) {
      modifier = 'pm';
      time = time - 1200;
    }
    var hour = Math.floor(time / 100);
    if (hour == 0) {
      hour = 12;
    }
    var minute = (time % 100).toString();
    if (minute < 10) {
      minute = '0' + minute;
    }
    return hour.toString() + ':' + minute;
  }
}

var remove_all_selected = function() {
  $('.selected').not('.titleBox').css('background-color', "#fff");
  $('.selected').removeClass('selected');
}

var remove_marker = function(resource) {
  map.remove_marker(resource);
}
