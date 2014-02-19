Session.set('map_resources', []);
Session.set('display_resource', null);
Session.set('display_services', []);
Session.set('bounded', false);

Deps.autorun(function() {
  Meteor.subscribe('resources_from_ids', Session.get('map_resources'));
});

Template.display_home.events({
  'click .flag': function(e, tmpl) {
    flag = $(tmpl.find('.glyphicon-flag'));
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
  services: function() {
    return this.services;
  },
});

Template.home.rendered = function() {
}

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
      Session.set('map_resources', map.markers_in_bounds());
    });
  }

  Deps.autorun(function() {
    _.each(Resources.find().fetch(), function(resource) {
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
    Router.go('/service/' + datum.name_route);
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
    var services = this;
    var i = -1;
    ret = services.map(function(service) {
      i += 1;
      return {color:colors[i], name:service.name, count:service.count, id:service._id}
    });
    Session.set('display_services', ret);
    return ret;
  }
});

Template.services.rendered = function() {
  add_all_selected();
  geocode_check(Session.get('resources'));
  $('#map_canvas').css("height", $('#services_home').height());
}

Template.show_map_resources.helpers({
  has_map_resources: function() {
    return Session.get('map_resources').length > 0;
  },
  map_resources: function() {
    return Resources.find({_id:{$in:Session.get('map_resources')}});
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


var add_marker = function(resource) {
  if (typeof resource.lat !== 'undefined' &&
      typeof resource.lng !== 'undefined') {
    if (!map.marker_exists(resource._id)) {
      map.add_new_marker({id:resource._id, title:resource.name,
                          lat:resource.lat, lng:resource.lng});
//     } else {
//       map.add_existing_marker(resource);
    }
  }
};

var colors = ["#74F0F2", "#B3F2C2", "#DCFA9B", "#FABDFC", "#F5A2AD",
              "#BDC9FC", "#A2B2F5", "#F5E1A2", "#AEF5A2", "#42F55D"];

var geocode_check = function(resources) {
  _.each(resources, function(resource) {
    if (!resource.lat) {
      map.assign_geocode(resource);
    }
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
    var map_resources = Session.get('map_resources');
    var index = map_resources.indexOf(resource._id);
    if (index > -1) {
        map_resources.splice(index, 1);
        Session.set('map_resources', map_resources);
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
    Resources.find({services:service.id}).forEach(function(resource) {
      f(resource)
    });
  }
};
