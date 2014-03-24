Meteor.methods({
  assign_geocode: function(resource_id, i, lat, lng) {
    Resources.update({_id:resource_id}, {$set:{'locations.address.$i.coordinates':{'lat':lat, 'lng':lng}}});
  },

  add_access_to_resource: function(resource_id, access_name) {
    Resources.update({_id:resource_id}, {$addToSet:{'locations.accessibility':access_name}});
  },

  add_category_input_to_resource: function(resource_id, field, value) {
    var update_query = {};
    update_query['category_specific_inputs.' + field] = value;
    Resources.update({_id:resource_id}, {$addToSet:update_query});
  },

  add_language_to_resource: function(resource_id, language) {
    Resources.update({_id:resource_id}, {$addToSet:{'locations.languages':language}});
  },

  add_service_to_resource: function(resource_id, service_id) {
    //assuming service_id is a sub for now...
    Resources.update({_id:resource_id}, {$addToSet:{sub_service_ids:service_id}});
    Services.update({_id:service_id}, {$push:{resources:resource_id}});
  },

  check_category_input_to_resource: function(resource_id, field, checked) {
    var update_query = {};
    update_query['category_specific_inputs.' + field] = checked;
    Resources.update({_id:resource_id}, {$set:update_query});
  },

  flag_resource: function(resource_id, user_id) {
    var timestamp = (new Date()).getTime();
    var counties = Resources.findOne({_id:resource_id}).service_areas
    flag_id = Flags.insert({created_time:timestamp, resource_id:resource_id, user_id:user_id, open:true, closed_time:null, counties:counties});
  },

  make_editor: function(user_id, username) {
    var timestamp = (new Date()).getTime();
    Roles.addUsersToRoles(user_id, ['editor']);
    var update_query = {};
    update_query['profiles.name'] = username;
    Meteor.users.update({_id:user_id}, {$set:update_query});
  },

  mark_complete: function(resource_id, user_id) {
    var timestamp = (new Date()).getTime();
    Resources.update({_id:resource_id}, {$set:{needs_edit:false}})
    Flags.update({resource_id:resource_id},
                 {$set:
                  {closed_time:timestamp, open:false,
                   resource_id:resource_id, user_id:user_id}
                 }
                );
    Changes.insert({target_resource_id:resource_id, marked_complete:true,
                    editor_id:user_id, created_time:timestamp});
  },

  remove_all_services: function() {
        return Service.remove({});
  },

  remove_all_resources: function() {
    return Resources.remove({});
  },

  remove_access_from_resource: function(resource_id, access_name) {
    Resources.update({_id:resource_id}, {$pull:{'locations.accessibility':access_name}});
  },

  remove_category_input_from_resource: function(resource_id, field, value) {
    var update_query = {};
    update_query['category_specific_inputs.' + field] = value;
    Resources.update({_id:resource_id}, {$pull:update_query});
  },

  remove_language_from_resource: function(resource_id, language) {
    Resources.update({_id:resource_id}, {$pull:{'locations.languages':language}});
  },

  remove_service_from_resource: function(resource_id, service_id) {
    Resources.update({_id:resource_id}, {$pull:{sub_service_ids:service_id}})
    Services.update({_id:service_id}, {$pull:{resources:resource_id}});
  },

  save_resource_edits: function(resource_id, user_id, edits) {
    var failures = validate_edits(resource_id, edits)
    if (failures.length == 1 && failures[0].key == 'all') {
      return failures[0];
    } else {
      failures.forEach(function(failure) {
        delete edits[failure.key];
      });
    }

    //record all of the edits in the resource and the changelog
    var timestamp = (new Date()).getTime();

    if (resource_id == null) { //new resource
      var phones = [];
      edits['phones'].forEach(function(phone) {
        var phone_number = phone['phone_number'];
        if (phone_number != '' && phone_number != 'Number') {
          phones.push(make_phone(phone['phone_number'],
                                 phone['phone_hours'],
                                 "voice")
                     );
        }
      });

      var contacts=[make_contact(edits['contact_name'], edits['contact_title'])]

      console.log(edits) //Did address get deleted if it wasn't kosher?
      var addresses = [];
      edits['address'].forEach(function(address) {
        var street = address['street'];
        if (street != '' && street != 'Street') {
          addresses.push(make_address(street=address['street'],
                                      city=address['city'],
                                      state='CA', //TODO
                                      zipcode=address['zipcode'],
                                      lat=null,
                                      lng=null)
                        )
        }
      });

      var resource_id = make_resource(
        edits['name'], timestamp,
        make_location(
          timestamp,
          contacts,
          edits['description'],
          edits['short_desc'],
          addresses,
          edits['hours'],
          edits['accessibility'],
          edits['languages'],
          edits['sub_service_ids'],
          phones,
          edits['url'],
          edits['email'],
          edits['audience'],
          edits['eligibility'],
          edits['fees'],
          edits['how_to_apply'],
          edits['county'],
          edits['category_specific_inputs']
        )
      );
      Services.update({_id:{$in:edits['sub_service_ids']}},
                      {$addToSet:{resources:resource_id}});
      Changes.insert({created_time:timestamp, target_resource_id:resource_id,
                      new_resource:true, editor_id:user_id});
      failures.push({'resource_id':resource_id})
      return failures;
    } else { //existing resource
      var resource = Resources.findOne({_id:resource_id});

      var new_contacts = {};
      if (resource.locations.contacts && resource.locations.contacts[0]) {
        contact_fields.forEach(function(field) {
          var key = field.slice(8);
          new_contacts[key] = edits_or_current(edits[field], resource.locations.contacts[0], key);
        });
      }

      var new_locations = {};
      location_fields.forEach(function(field) {
        new_locations[field] = edits_or_current(edits[field], resource.locations, field);
      });

      special_fields.forEach(function(field) {
        if (field == 'phones') {
          var oldvals = resource.locations.phones;
          var newvals = copy_array_with_obj(oldvals);
          adjust_values_array(newvals, edits[field], 6)
          update_resource(resource.locations.phones, newvals, user_id, resource_id, timestamp, 'phones', 'locations.phones');
        } else if (field == 'address') {
          var oldvals = resource.locations.address;
          var newvals = copy_array_with_obj(oldvals);
          adjust_values_array(newvals, edits[field], 0)
          update_resource(resource.locations.address, newvals, user_id, resource_id, timestamp, 'address', 'locations.address');
        } else if (field == 'hours') {
          var current = resource.locations.hours;
          var newvals = hours_adjusted_values(current, edits[field]);
          if (Object.keys(newvals).length > 0) {
            update_resource(current, newvals, user_id, resource_id, timestamp, 'hours', 'locations.hours');
          }
        }
      });
      update_resource(resource.locations.service_poc, new_poc, user_id, resource_id,
                      timestamp, 'service_pos', 'locations.service_poc');
      update_resource(resource.locations.internet_resource, new_internets, user_id,
                      resource_id, timestamp, 'internet_res', 'locations.internet_resource');
      update_resource(resource.locations.services, new_services, user_id,
                      resource_id, timestamp, 'services', 'locations.services');
      update_resource(resource.locations.contacts[0], new_contacts, user_id,
                      resource_id, timestamp, 'contacts', 'locations.contacts.0');

      if ('name' in edits) {
        var new_names = {};
        new_names['name'] = edits_or_current(edits['name'], resource.name, 'name')
        new_names['name_route'] = make_name_route(new_names['name']);
      }


      var update_obj = {}; //TODO: make everything one big change like this one
      for (field in new_locations) {
        var value = new_locations[field];
        if (value !== resource.locations[field]) {
          resource_field_change(timestamp, resource_id, field, resource.locations[field],
                                value, user_id);
          update_obj['locations.' + field] = value;
        }
      }
      for (field in new_names) {
        var value = new_names[field]
        if (value !== resource[field]) {
          resource_field_change(timestamp, resource_id, field, resource[field], value, user_id);
          update_obj[field] = value;
        }
      }
      for (field in edits['category_specific_inputs']) {
        var value = edits['category_specific_inputs'][field];
        if (!resource.category_specific_inputs || value !== resource.category_specific_inputs[field]) {
          if (resource.category_specific_inputs) {var oldval = resource.category_specific_inputs[field];}
          else {var oldval = null;}
          resource_field_change(timestamp, resource_id, field, oldval, value, user_id);
          update_obj['category_specific_inputs.' + field] = value;
        }
      }
      if (Object.keys(update_obj).length > 0) {
        set_update_resource_obj(resource_id, update_obj);
      }
      return {"success":true}
    }
  }
});

var adjust_values_array = function(values, edits, slice_num) {
  for (var i = 0; i < edits.length; i++) {
    var index = parseInt(edits[i]['index'])
    for (var subkey in edits[i]) {
      if (subkey == 'index') {
        continue;
      }
      values[index][subkey.slice(slice_num)] = edits[i][subkey];
    }
  }
}

var closed_day = function(day) {
  return day && ('closed' in day) && day.closed;
}

var copy_array_with_obj = function(arr) {
  var copy = [];
  for (var i = 0; i < arr.length; i++) {
    copy.push({});
    var obj = arr[i];
    for (var key in obj) {
      copy[i][key] = obj[key];
    }
  }
  return copy;
}

var hours_adjusted_values = function(current, edits) {
  var values = {};
  for (var day in edits) {
    values[day] = {};
    var new_day_info = edits[day];
    var old_day_info = current[day];
    if (closed_day(new_day_info)) {
      if (!closed_day(old_day_info)) {
        values[day]['closed'] = true;
      } else {
        values[day] = current[day];
      }
    } else {
      var times = ['open_time', 'close_time'];
      times.forEach(function(time) {
        if (!old_day_info || !old_day_info[time]) {
          values[day][time] = new_day_info[time];
        } else {
          values[day][time] = get_valid_time(new_day_info[time],
                                             old_day_info[time]);
        }
      });
    }
  }
  return values;
}

var edits_or_current = function(edit, current, key) {
  return edit || current[key];
}

var get_valid_time = function(new_time, old_time) {
  //already validated that it fit hte regex or was ''
  if (new_time && !(new_time == '') && !(new_time == 'Blank')) {
    return new_time;
  }
  return old_time;
}

//Would like to use this but update_string doesn't work as I thought it would
var update_resource = function(oldvals, newvals, editor_id, resource_id, ts, field, update_string) {
  if (!_.isEqual(oldvals, newvals)) {
    resource_field_change(ts, resource_id, field, oldvals, newvals, editor_id);
    set_update_resource_with_str(resource_id, update_string, newvals);
  }
}

var location_fields = ['short_desc', 'description', 'audience',
                       'eligibility', 'fees', 'how_to_apply',
                       'email', 'url', ];
var contact_fields  = ['contact_title', 'contact_name'];
var special_fields  = ['phones', 'address', 'hours'];
var all_required_msg = 'Error: Missing a required field (name, address, contact info, descriptions)'

var is_placeholder_value = function(value, placeholder) {
  return value == '' || value == placeholder
}

var validate_address = function(addresses) {
  for (var i = 0; i < addresses.length; i++) {
    var address = addresses[i];
    if (address['zipcode'] && !(is_placeholder_value(address['zipcode'], 'Zip')) && !(/^\d{5}$/.test(address['zipcode']))) {
      return {'success':false, message:'Warning: Zipcode malformed, not updating address', key:'address'};
    }
    //TODO: another clause to make sure that zipcode in county
  }
  return {'success':true}
}


var validate_edits = function(resource_id, edits) {
  var failures = [];
  for (var key in edits) {
    var val = edits[key];
    if (!resource_id && !val && required_fields.indexOf(key) > -1) {
      return [{'success':false, 'message':all_required_msg, 'key':'all'}]
    }

    if (key == 'sub_service_ids' && val && val.length == 0) {
      failures.push({
        'success':false,
        'message':'Warning: Please include at least one category',
        'key':'sub_service_ids'});
    }

    if (key == 'address') {
      var address = validate_address(val);
      if (!address['success']) {
        failures.push(address);
        continue
      }
    }

    if (key == 'hours') {
      var hours = validate_hours(val);
      if (!hours['success']) {
        failures.push(hours);
        continue
      }
    }
  }
  return failures;
}

var validate_hours = function(hours) {
  for (var day in hours) {
    var input = hours[day];
    if (input.closed) {
      continue;
    }

    //we want either both open and close to be real times OR
    //we want both to be blank values.
    var open_military = validate_time(input['open_time']);
    var close_military = validate_time(input['close_time']);
    if (open_military && close_military) {
      if (close_military < open_military) {
        return {'success':false,
                'message':"Warning: " + display_day(day) + "'s closing time is earlier than it's opening time. Not setting hours.",
                'key':'hours'}
      }
    } else if (!(is_placeholder_value(input['open_time'], 'Blank') && is_placeholder_value(input['close_time'], 'Blank'))) {
      return {'success':false,
              'message':"Warning: " + display_day(day) + ' is not in correct military time. Not setting hours.',
              'key':'hours'}
    }
  }
  return {'success':true}
}

var validate_time = function(time) {
  if (/^[0-2]\d[0-5]\d$/.test(time) && parseInt(time) < 2400) {
    return time;
  } else {
    return false;
  }
}