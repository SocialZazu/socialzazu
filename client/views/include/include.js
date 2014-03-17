Template.find_me_map.events({
  'click #find_me': function(e, tmpl) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var center = new google.maps.LatLng(position.coords.latitude,
                                            position.coords.longitude);
        if(center) {
          pan_to(center);
        }
      });
    } else {
      console.log('something failed'); //TODO: tell user
    }
  }
});

category_specific_inputs = function(services, values) {
  var original_values = values;
  var input_reasons = {};
  var inputs_in_order = [];
  var checks = [];
  var numbers = [];
  var dropdowns = [];
  services.forEach(function(service_input) { //[{service.name, service.inputs}]
    var find_inputs = [];
    service_input.inputs.forEach(function(input) {
      if (input in input_reasons) {
        input_reasons[input].push(service_input.name)
      } else {
        find_inputs.push(input);
      }
    });

    Inputs.find({_id:{$in:find_inputs}}).forEach(function(input) {
      input.values = get_input_values(input.field, original_values);
      input_reasons[input._id] = [service_input.name];
      if (input.type == "checkbox") {checks.push(input)}
      else if (input.type == "number") {numbers.push(input)}
      else if (input.type == "dropdown") {dropdowns.push(input)}
    });
  });
  inputs_in_order = inputs_in_order.concat(checks)
  inputs_in_order = inputs_in_order.concat(dropdowns)
  inputs_in_order = inputs_in_order.concat(numbers);
  inputs_in_order.forEach(function(input) {
    input.reasons = input_reasons[input._id];
  });
  return inputs_in_order;
}

days_abbr = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

var get_input_values = function(field, values) {
  if (values && field && field in values) {
    return values[field];
  } else {
    return [];
  }
}

get_service_names_with_parent_inputs = function(service_ids) {
  var ret = [];
  var parents = [];
  Services.find({_id:{$in:service_ids}}).forEach(function(service) {
    if (service.parents) {
      parents = parents.concat(service.parents);
    }
    var name = service.name;
    var inputs = service.resource_inputs;
    if (inputs) {
      ret.push({name:name, inputs:inputs});
    }
  });
  Services.find({_id:{$in:parents}}).forEach(function(service) {
    var name = service.name;
    var inputs = service.resource_inputs;
    if (inputs) {
      ret.push({name:name, inputs:inputs});
    }
  });
  return ret;
}

session_var_splice_obj = function(key, field, value) {
  var vals = Session.get(key);
  if (vals && field in vals) {
    var index = vals[field].indexOf(value);
    if (index > -1) {
      vals[field].splice(index, 1);
      Session.set(key, vals)
    }
  }
}

session_var_splice = function(session_key, value) {
  var vals = Session.get(session_key);
  var index = vals.indexOf(value);
  if (index > -1) {
    vals.splice(index, 1);
    Session.set(session_key, vals);
  }
};

session_var_push_obj = function(key, field, value) {
  var vals = Session.get(key);
  if (!(field in vals)) {
    vals[field] = [value];
    Session.set(key, vals);
  } else if (vals[field].indexOf(value) == -1) {
    vals[field].push(value);
    Session.set(key, vals);
  }
}

session_var_push = function(session_key, value) {
  var vals = Session.get(session_key);
  var index = vals.indexOf(value);
  if (index == -1) {
    vals.push(value);
    Session.set(session_key, vals);
  }
}
