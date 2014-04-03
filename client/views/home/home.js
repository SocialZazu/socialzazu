Session.set('user_flags', []);

Deps.autorun(function() {
});

Template.flag_control.events({
  'click .flag': function(e, tmpl) {
    flag = $(tmpl.find('i'));
    if (!flag.hasClass('fa-flag')) {
      if (Meteor.userId()) {
        Meteor.call("flag_location", this._id, Meteor.userId());
      } else {
        session_var_push('user_flags', this._id);
        Meteor.call("flag_location", this._id, null);
      }
    }
  }
});

Template.flag_control.helpers({
  flag_on: function() {
    var flag = Flags.findOne({open:true, user_id:Meteor.userId(), location_id:this._id});
    if (flag || Session.get('user_flags').indexOf(this._id) > -1) {
      return "fa fa-flag red"
    } else {
      return "fa fa-flag-o red"
    }
  }
});

Template.home.created = function() {
  Session.set('map_markers_in_view', []);
  Session.set('locations_from_services', []);
  Session.set('display_location', null);
  Session.set('display_services', []); //all in sidebar
  Session.set('visible_services', []); //the ones shown on map
  Session.set('init_pan_to_county', null);
}

Template.home.destroyed = function() {
  Session.set('map_markers_in_view', []);
  Session.set('locations_from_services', []);
}

Template.home.helpers({
  location_datums: function() {
    return {
      datums: Locations.find().map(function(location) {
        return {value:location.name, _id:location._id}
      }),
      placeholder: "Search Location to Show"
    }
  },
  service_datums: function() {
    return Services.find({parents:{$exists:true, $ne:null}}).map(function(service) {
      var search = service.name;
      Services.find({_id:{$in:service.parents}}).forEach(function(parent) {
        search += ' ' + parent.name;
      });
      return {value:service.name, name_route:service.name_route, search:search}
    });
  },
});

Template.home.rendered = function() {
  var i = -1;
  if (!Session.get('display_services') || Session.get('display_services').length < SIDEBAR_NUM) {
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
    Session.set(
      'visible_services',
      this.data.services.map(
        function(service) {
          return service._id;
        }
      )
    );
    $('#search_services_form').outerWidth($('#services_home').width());
  }
    if (Session.get('county') && Session.get('map') && !Session.get('init_pan_to_county')) {
      Session.set('init_pan_to_county', true);
      var coords = Session.get('county').coordinates;
      pan_to(new google.maps.LatLng(coords.lat, coords.lng));
    }
}

Template.search_locations.rendered = function() {
  var data = this.data.datums;
  var datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  });
  datums.initialize();

  $('#search_locations_field').outerWidth($('#display_home').width() - 54)
  $('#search_locations_field').typeahead(null, {
    displayKey: 'value',
    source: datums.ttAdapter()
  }).on('typeahead:selected', function(event, datum) {
    var location = Locations.findOne({_id:datum._id});
    if (location) {
      var address = location.address[0];
      if (address) {
        var coords = address.coordinates;
        pan_to(new google.maps.LatLng(coords.lat, coords.lng));
      }
      Session.set('display_location', location)
    }
  });
};

Template.map_home.rendered = function() {
  if (!this.rendered) {
    map.initialize_map();
    this.rendered = Session.get('map');

    google.maps.event.addListener(map.gmap, 'bounds_changed', function() {
      var markers_in_bounds = map.markers_in_bounds();
      var display_location = Session.get('display_location');
      if (display_location && markers_in_bounds.indexOf(display_location._id) == -1) {
        Session.set('display_location', null);
      }
      Session.set('map_markers_in_view', map.markers_in_bounds());
    });
  }
  $('#search_map_field').outerWidth(
    $('#map_canvas').width() + 30 - $('#find_me').outerWidth())
  trigger_map_resize();
}

Template.map_home.destroyed = function() {
  Session.set('map', false);
};

Template.location_inputs.helpers({
  fields: function() {
    return Object.keys(this).sort();
  },
  has_fields: function() {
    return Object.keys(this).length > 0;
  },
  values: function() {
    var dict = this;
    return Object.keys(this).sort().map(function(field) {
      if (field in dict) {
        return dict[field];
      } else {
        return '';
      }
    })
  }
});

Template.location_list.helpers({
  has_elems: function() {
    return this.list.length > 0;
  }
});

Template.location_well.helpers({
  accessibility: function() {
    var access = this.accessibility;
    if (is_non_null(access)) {
      return {
        list: access,
        field: 'Access'
      }
    } else {
      return null;
    }
  },
  address: function() {
    return this.address;
  },
  contact: function() {
    return {
      name:this.contacts.name,
      title:this.contacts.title,
      phones:this.phones,
      url:this.url,
      email:this.email
    }
  },
  hours: function() {
    return this.hours
  },
  languages: function() {
    var languages = this.languages;
    if (is_non_null(languages)) {
      return {
        list: languages,
        field: 'Languages'
      }
    } else {
      return null;
    }
  },
  short_desc: function() {
    return this.short_desc || 'No Short Description given';
  },
  single_inputs: function() {
    var ret = get_values_from_fields(this, ['how_to_apply', 'audience', 'eligibility', 'fees']);
    if ('how_to_apply' in ret) {
      ret['apply'] = ret['how_to_apply'];
      delete ret['how_to_apply'];
    }
    var transport = this.transportation;
    if (is_non_null(transport)) {
      ret['transport'] = transport;
    }
    return ret;
  },
  sub_services: function() {
    var i = 0;
    var num_services = 0;
    if (this.sub_service_ids) {
      num_services = this.sub_service_ids.length;
    }
    return Services.find({_id:{$in:this.sub_service_ids}}, {name:true}).map(function(service) { //hack to get the sub_services display |'s to work right
      i += 1;
      if (i == num_services) {
        return {last:true, name:service.name}
      } else {
        return {last:false, name:service.name}
      }
    });
  },
});

Template.location_hours.helpers({
  day_of_week: function() {
    var ret = [];
    for (var i = 0; i < days_abbr.length; i++) {
      if (days_abbr[i] in this) {
        var day = this[days_abbr[i]];
        day['day'] = capitalize(days_abbr[i]);
        if (day['day'].indexOf('_') > -1) {
          day['day'] = day['day'].split('_').join('-').toUpperCase();
        }
        ret.push(day);
      }
    }
    return ret;
  },
  has_hours: function() {
    return Object.keys(this).length > 0;
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
  initialize_map_search();
}

Template.search_services.rendered = function() {
  var data = this.data;
  var services_datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.search); },
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
      session_var_splice('visible_services', element._id);
      map.remove_service(element._id);
      var color = element.color;
      var service = Services.findOne({name_route:name_route});
      display_services.unshift(
        {name:service.name, name_route:service.name_route,
         _id:service._id, color:color}
      );
      Session.set('display_services', display_services);
      session_var_push('visible_services', service._id);
    }
  });
}

Template.service_box.events({
  'click .serviceBox': function(e, tmpl) {
    var box = $(e.target).closest('.serviceBox');
    var service_id = this._id;
    if (box.hasClass('selected')) {
      session_var_splice('visible_services', service_id);
      adjust_map_display(service_id, remove_marker);
      box.removeClass('selected');
      box.css('background-color', '#fff');
    } else {
      session_var_push('visible_services', service_id);
      adjust_map_display(service_id, add_existing_marker);
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
  $('#map_canvas').css("height", $('#services_home').height() - 30);
  $('#display_home').css("height", $('#services_home').height());
  $('.search-query.tt-hint').width('inherit');
}

Template.show_map_locations.helpers({
  has_map_locations: function() {
    return Session.get('map_markers_in_view').length > 0;
  },
  map_locations: function() {
    var ret = [];
    var display_location = Session.get('display_location');
    var display_services = Session.get('display_services');
    var visible_services = Session.get('visible_services');
    if (display_location) {
      var location_id = display_location._id;
      ret.push(display_location);
    } else {
      var location_id = "blank_id";
    }
    Locations.find({_id:{$in:Session.get('map_markers_in_view'), $ne:location_id}}).forEach(function(location) {
      var services = location.sub_service_ids;
      for (var i = 0; i < display_services.length; i++) {
        if (visible_services.indexOf(display_services[i]._id) > -1 && location.sub_service_ids.indexOf(display_services[i]._id) > -1) {
              ret.push(location);
              break;
        }
      }
    });
    return ret;
  }
});

var initialize_map_search = function() {
  var input = document.getElementById('search_map_field');
  var autocomplete = new google.maps.places.Autocomplete(input, {types:['geocode']});
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (place.geometry) {
      pan_to(place.geometry.location);
    } else {
      input.placeholder = 'Change Location';
    }
  });
};

var remove_all_markers = function() {
  map.remove_all_markers();
}

var add_all_selected = function() {
  $('.serviceBox').addClass('selected');
  _.each($('.serviceBox').not('.titleBox'), function(box) {
    box.style.backgroundColor = box.getAttribute('color');
  });
}

var add_existing_marker = function(location) {
  map.add_existing_marker(location);
};

var adjust_map_display = function(service_id, f) {
  Locations.find({sub_service_ids:service_id}).forEach(function(location) {
    f(location);
  });
};

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

var remove_marker = function(location) {
  map.remove_marker(location);
}

var get_values_from_fields = function(loc, fields) {
  var ret = {};
  fields.forEach(function(field) {
    var value = loc[field];
    if (is_non_null(value)) {
      ret[field] = value
    }
  });
  return ret
}

var is_non_null = function(value) {
  return value && value.length > 0;
}
