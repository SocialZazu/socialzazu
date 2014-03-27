MAX_RESOURCES = 15;
TOTAL_NEEDS_EDIT = null;

Template.category_input.events({
  'click .category_checkbox': function(e, tmpl) {
    var target = $(e.target);
    var checked = target.prop('checked');
    var location_id = Session.get('is_editing');
    if (location_id) {
      Meteor.call('check_category_input_to_location', location_id, this.field, checked);
    } else {
      var inputs = Session.get('track_inputs')
      var category_specific_inputs = inputs['category_specific_inputs'] || {};
      category_specific_inputs[this.field] = checked;
      inputs['category_specific_inputs'] = category_specific_inputs;
      Session.set('track_inputs', inputs);
    }
  },
});

Template.category_input.helpers({
  category_dropdown: function() {
    var field = this.field;
    return {
      list: this.values.map(function(value) {
        return {id:value, field:field, value:value, remove_key:'remove_category_input_from_location'}
      }),
      all: this.list.map(function(value) {
        return {id:value, field:field, value:value, remove_key:'remove_category_input_from_location'}
      }),
      reactive_save_key: 'add_category_input_to_location',
      field:field,
      location_id:this.location_id
    }
  },
  checked: function() {
    if (this.values == true || this.autocheck) {
        return "checked";
    }
    return "";
  },
  checked_yes_no: function() {
    if (this.values == true || this.autocheck) {
      return "Yes";
    } else if (this.values == false) {
      return "No";
    } else {
      return "Unknown";
    }
  },
  field_class: function() {
    return get_field_class(this.type);
  },
  is_type: function(type) {
    return this.type == type;
  },
  number_toggle: function() {
    return {
      width:"90%",
      current:this.values,
      id:this.field,
      is_category_specific_input:true,
      location_id:this.location_id
    }
  },
  value: function() {
    return input.values;
  },
});

Template.editor.created = function() {
  Session.set('message', null);
  Session.set('track_inputs', {});
  Session.set('is_editing', false);
  Session.set('category_id', null);
  Session.set('resource_id', null);
  Session.set('keyup_timers', {});
  Session.set('skip_resource_page', 0);
  Session.set('weekday_hours_the_same', true);
}

Template.editor.destroyed = function() {
  Session.set('message', null);
  Session.set('is_editing', false);
  Session.set('category_id', null);
  Session.set('resource_id', null);
}

Template.editor.events({
  'click #new_resource': function(e, tmpl) {
    Session.set('resource_id', null);
    Session.set('is_editing', false);
    Session.set('message', null);
  },
  'click #next_page_edit': function(e, tmpl) {
    key = 'skip_resource_page'
    var val = Session.get(key) + 1;
    if (val * MAX_RESOURCES < total_needs_edit_count()) {
      Session.set(key, val);
    }
  },
  'click #previous_page_edit': function(e, tmpl) {
    key = 'skip_resource_page'
    var val = Session.get(key) - 1;
    Session.set(key, Math.max(0, val));
  }
});

Template.editor.helpers({
  county: function() {
    var county = Session.get('county');
    if (county) {
      return county.name + ': ';
    }
    return '';
  },
  has_needs_edit: function() {
    return total_needs_edit_count() > 0;
  },
  has_open_flags: function() {
    return Flags.find({open:true}).count() > 0
  },
  info_from_edit: function() {
    var timestamp = this.created_time || this.updated_time || '';
    return {
      created_time: timestamp,
      resource: this,
      type: 'edit'
    }
  },
  locations: function() {
    var index = 0;
    var resource_locations = this.locations
    return Locations.find({_id:{$in:resource_locations}}).map(function(location) {
      index += 1;
      if (index == resource_locations.length) {
        location.last_location = true;
      }
      return location;
    });
  },
  max_resources: function() {
    return MAX_RESOURCES.toString();
  },
  name_resource: function() {
    return {
      current: trim(this.name),
      field: 'Resource Name'
    }
  },
  page_start_edit: function() {
    return 1 + Session.get('skip_resource_page')*MAX_RESOURCES
  },
  page_end_edit: function() {
    return Math.min(
      (1 + Session.get('skip_resource_page'))*MAX_RESOURCES,
      total_needs_edit_count()
    )
  },
  resource_datums: function() {
    return {
      datums: Resources.find().map(function(resource) {
        //TODO: include a way to search by resource locations
        return {value:resource.name, name_route:resource._id}
      }),
      placeholder:"Search Resource to Edit"
    }
  },
  resource: function() {
    return Resources.findOne({_id:Session.get('resource_id')});
  },
  resources: function() {
    var resource_ids = Locations.find({needs_edit:true, service_area:Session.get('county')._id}).map(function(location) {
      return location.resource_id;
    });
    return Resources.find(
      {_id:{$in:resource_ids}},
      {limit:MAX_RESOURCES, skip:Session.get('skip_resource_page')*MAX_RESOURCES});
  },
  show_edit_resource: function() {
    return Session.get('resource_id') !== null;
  },
  total_edit: function() {
    return total_needs_edit_count();
  }
});

Template.edit_address.helpers({
  field_class: function() {
    return get_field_class('input');
  },
  toggle: function(key) {
    var width = null;
    if (key == 'zipcode') {
      width = '46px'
    }

    var resource_id = Session.get('resource_id');
    if (resource_id) { //editing a resource
      var current = this[key];
    } else { //new resource
      var current = capitalize(key);
      if (current == 'Zipcode') {
        current = 'Zip';
      }
    }

    return {
      current:current,
      id:key + '_' + this.index,
      width:width,
      location_id:this.id
    }
  },
});

Template.edit_buttons.events({
  'click #save_location': function(e, tmpl) {
    //save edits made
    Session.set('message', null);
    var edits = collate_edits(false);
    Meteor.call(
      'save_location_edits',
      Session.get('is_editing'), Meteor.userId(), edits,
      function(error, result) {
        if (!error && result['success']) {
          success_message_with_warning();
          Session.set('is_editing', false);
          Session.set('track_inputs', {});
        } else {
          Session.set('message', 'Error: Eek, server mistake. We apologize');
        }
      }
    );
  },
  'click #cancel_edits': function(e, tmpl) {
    //cancel edits made, revert back div mode
    Session.set('track_inputs', {});
    Session.set('message', null);
    Session.set('is_editing', false);
  },
  'click #edit_location': function(e, tmpl) {
    //enter edit mode
    Session.set('track_inputs', {});
    Session.set('message', null);
    Session.set('is_editing', this.id);
  },
  'click #mark_complete': function(e, tmpl) {
    //close all flags with this resource's _id
    //mark needs_edit to false
    Meteor.call('mark_complete',
                Session.get('resource_id'), Meteor.userId(),
                function(e, result) {
                  if (!e) {
                    Session.set('message', 'Success: Marked as complete. Thanks!');
                    Session.set('track_inputs', {});
                    Session.set('is_editing', false);
                    Session.set('resource_id', null);
                  }
                }
               );
  }
});

Template.edit_dropdown.events({
  'change select': function(e, tmpl) {
    var val = $(e.target).val();
    var field = $(e.target).attr('field');
    if (!(val == 'instr')) {
      save_reactive_data(this.reactive_save_key, field, val);
    }
  },
  'click .remove_dropdown': function(e, tmpl) {
    var a = $(e.target).closest('a');
    var id = a.attr('id');
    var field = a.attr('field');
    var remove_key = a.attr('remove_key')
    save_reactive_data(remove_key, field, id);
  }
});

Template.edit_dropdown.helpers({
  field_class: function() {
    return get_field_class('input');
  },
  has_span_size: function() {
    return this.span_size != null;
  },
  list: function() {
    return this.list;
  },
  other_list: function() {
    if (this.all && this.list) {
      return array_diff_ids(this.all, this.list);
    }
    return this.all;
  }
});

Template.edit_field.helpers({
  field_class: function() {
    return get_field_class('input', this.id);
  },
  toggle_info: function() {
    return {
      current: this.current,
      id: this.field.trim().split(' ').join('_'),
      location_id: this.id
    }
  }
});

Template.edit_hours.events({
  'click #weekday_hours_checkbox': function(e, tmpl) {
    Session.set('weekday_hours_the_same', $(e.target).prop('checked'));
  }
});

Template.edit_hours.helpers({
  checked_closed: function() {
    if (this.closed) {
      return "checked";
    }
    return "";
  },
  checked_hours_same: function() {
    if (Session.get('weekday_hours_the_same')) {
      return "checked";
    }
    return "";
  },
  closed_yes_no: function() {
    if (this.closed) {
      return "Yes";
    }
    return "No";
  },
  close_time: function() {
    return time_placeholder(this.close_time);
  },
  edit_hours_subfields: function() {
    var hours = this.hours || {};
    var location_id = this.id;
    return days_abbr.map(function(day) {
      var obj = obj_trim(hours, day);
      obj['location_id'] = location_id;
      return obj;
    })
  },
  is_monday: function() {
    return this.period == 'mon';
  },
  open_time: function() {
    return time_placeholder(this.open_time);
  },
  period_title: function() {
    return display_day(this.period);
  },
  show_subfield: function() {
    if (Session.get('weekday_hours_the_same') && weekdays_minus_mon.indexOf(this.period) > -1) {
      return "none";
    }
    return "block";
  }
});

Template.edit_languages.events({
  'click #add_language': function(e, tmpl) {
    var new_language = $(tmpl.find('#language_input')).val();
    if (new_language && new_language.trim() !== '') {
      save_reactive_data('add_language_to_location', 'languages', new_language);
    }
  },
  'click .remove_language': function(e, tmpl) {
    var language = $(tmpl.find('.remove_language')).attr('name');
    save_reactive_data('remove_language_from_location', 'languages', language);
  },
});

Template.edit_languages.helpers({
  languages: function() {
    return this.languages;
  },
});

Template.edit_location.helpers({
  accessibility_dropdown: function() {
    var _all = ['blind', 'deaf', 'elevator', 'parking', 'ramp', 'restroom', 'wheelchair'];
    var list = this.accessibility || [];
    return {
      list: list.map(function(value) {
        return {id:value, value:value, remove_key:'remove_access_from_location'}
      }),
      all: _all.map(function(value) {
        return {id:value, value:value, remove_key:'remove_access_from_location'}
      }),
      reactive_save_key: 'add_access_to_location',
      span_size:3,
      span_diff:9,
      field:"Accessibility",
      location_id:this._id
    }
  },
  addresses: function() {
    var location_id = this._id;
    var i = -1;
    return this.address.map(function(address) {
      i += 1;
      return {zipcode:address.zipcode, city:address.city,
              street:address.street, index:i,
              id:location_id};
    });
  },
  audience: function() {
    return {
      current: trim(this.audience),
      field: 'Audience',
      id: this._id
    }
  },
  contacts: function() { //TODO: allow more contacts
    var contacts = this.contacts;
    if (contacts.length == 0) {
      return [{name:'', title:'', _id:this._id}];
    } else {
      return contacts;
    }
  },
  contact_name: function() {
    return {
      current: trim(this.name),
      field: 'Contact Name',
      id: this._id
    }
  },
  contact_title: function() {
    return {
      current: trim(this.title),
      field: 'Contact Title',
      id: this._id
    }
  },
  description: function() {
    return {
      current: trim(this.description),
      field: 'Description',
      id: this._id
    }
  },
  eligibility: function() {
    return {
      current: trim(this.eligibility),
      field: 'Eligibility',
      id: this._id
    }
  },
  email: function() {
    return {
      current: trim(this.email),
      field: 'Email',
      id: this._id
    }
  },
  fees: function() {
    return {
      current: trim(this.fees),
      field: 'Fees',
      id: this._id
    }
  },
  hours: function() {
    return {
      hours: this.hours,
      id: this._id
    }
  },
  how_to_apply: function() {
    return {
      current: trim(this.how_to_apply),
      field: 'How To Apply',
      id: this._id
    }
  },
  inputs: function() {
    values = this.category_specific_inputs;
    services = get_service_names_with_parent_inputs(this.sub_service_ids)
    return category_specific_inputs(services, values, this._id);
  },
  languages: function() {
    return {
      languages:this.languages,
      location_id: this._id
    }
  },
  location_id: function() {
    return {id: this._id};
  },
  more_name_info: function() {
    var mni = this.more_name_info;
    if (!mni) {
      return null;
    }
    return {
      current: trim(this.mni),
      field: 'More Name Info',
      id: this._id
    }
  },
  name_location: function() {
    return {
      current: trim(this.name),
      field: 'Location Name',
      id: this._id
    }
  },
  phones: function() {
    var location_id = this._id;
    var i = -1;
    return this.phones.map(function(phone) {
      i += 1;
      return {phone_number:phone.number, phone_hours:phone.hours,
              index:i, id:location_id};
    });
  },
  short_desc: function() {
    return {
      current: trim(this.short_desc),
      field: 'Short Desc',
      id: this._id
    }
  },
  services_dropdown: function() {
    return {
      list: Services.find({_id:{$in:this.sub_service_ids}}, {sort:{name:1}}).map(function(service) {
        return {id:service._id, value:service.name, remove_key:'remove_service_from_location'}
      }),
      all: Services.find({parents:{$exists:true, $ne:null}}, {sort:{name:1}}).map(function(service) {
        return {id:service._id, value:service.name, remove_key:'remove_service_from_location'}
      }),
      reactive_save_key: 'add_service_to_location',
      span_size:3,
      span_diff:9,
      field:"Categories",
      location_id:this._id
    }
  },
  url: function() {
    return {
      current: trim(this.url),
      field: 'Website',
      id: this._id
    }
  },
});

Template.edit_phone.helpers({
  field_class: function() {
    return get_field_class('input');
  },
  toggle: function(key) {
    var width = null;
    if (key == 'phone_number') {
      width = '110px';
    } else if (key == 'phone_hours') {
      width = '90%';
    }

    var resource_id = Session.get('resource_id');
    if (resource_id) {
      var current = trim(this[key]);
    } else if (!resource_id || current == '') {
      var current = capitalize(key.slice(6));
    }

    return {
      current:trim(current),
      id:key + '_' + this.index,
      width:width,
      location_id: this.id
    }
  },
});

Template.edit_search_resources.rendered = function() {
  var data = this.data.datums;
  var datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  });
  datums.initialize();

  $('#search_resources_field').typeahead(null, {
    displayKey: 'value',
    source: datums.ttAdapter()
  }).on('typeahead:selected', function(event, datum) {
    Session.set('resource_id', datum.name_route);
    Session.set('message', null);
  });

  $('.search-query.tt-hint').width('inherit');
}

Template.edit_toggle.events({
  'keyup input': function(e, tmpl) {
    var current = this.current;
    var id = this.id.toLowerCase();
    var value = $(tmpl.find('input')).val();
    var is_category_specific = this.is_category_specific_input;

    var timers = Session.get('keyup_timers');
    if (id in timers) {
      window.clearTimeout(timers[id]);
    }
    var timer = window.setTimeout(function() {
      if (is_category_specific) {
        var inputs = Session.get('track_inputs')
        var category_specific_inputs = inputs['category_specific_inputs'] || {};
        if (value == current && id in category_specific_inputs) {
          delete category_specific_inputs[id];
          inputs['category_specific_inputs'] = category_specific_inputs;
          Session.set('track_inputs', inputs);
        } else if (value != current) {
          category_specific_inputs[id] = value;
          inputs['category_specific_inputs'] = category_specific_inputs;
          Session.set('track_inputs', inputs);
        }
      } else if (value == current) {
        session_var_unset_obj('track_inputs', id);
      } else {
        session_var_set_obj('track_inputs', id, value);
      }
      session_var_set_obj('keyup_timers', id, null);
    }, 1000);
    timers[id] = timer;
    Session.set('keyup_timers', timers);
  }
});

Template.edit_toggle.helpers({
  width: function() {
    var width = this.width || "92%"
    return width;
  }
});

Template.message.helpers({
  color: function() {
    var message = Session.get('message');
    if (!message) {
      return '';
    } else if (message.slice(0,5) == 'Error') {
      return "red";
    } else if (message.slice(0,7) == 'Success') {
      return "green";
    } else if (message.slice(0,7) == 'Warning') {
      return 'orange';
    }
  },
  message: function() {
    return Session.get('message') || '';
  }
});

Template.new_field.events({
  'keyup input': function(e, tmpl) {
    var id = this.id;
    var value = $(tmpl.find('input')).val();
    if (value == '') {
      e.preventDefault();
      return;
    }
    var timers = Session.get('keyup_timers');
    if (id in timers) {
      window.clearTimeout(timers[id]);
    }
    var timer = window.setTimeout(function() {
      session_var_set_obj('keyup_timers', id, null);
      session_var_set_obj('track_inputs', id, value)
    }, 1000);
    timers[id] = timer;
    Session.set('keyup_timers', timers);
  }
})

Template.new_resource.events({
  'click #save_resource': function(e, tmpl) {
    var edits = collate_edits(true);
    Session.set('message', null);
    Meteor.call(
      'save_location_edits', null, Meteor.userId(), edits,
      function(error, result) {
        console.log(result);
        if (!result['success']) {
          Session.set('message', result['message']);
        } else if (result['success']) {
          Session.set('message', result['success']);
          Session.set('is_editing', false);
          // Change later to have it come up as the resource in editing
          // Session.set('is_editing', result['location_id']);
          // Session.set('resource_id', result['resource_id']);
        } else {
          Session.set('message', 'Error: Eek, server mistake. We apologize');
        }
      }
    );
  }
});

Template.new_resource.helpers({
  accessibility_dropdown: function() {
    var _all = ['blind', 'deaf', 'elevator', 'parking', 'ramp', 'restroom', 'wheelchair'];
    var list = Session.get('track_inputs')['accessibility'] || [];
    return {
      list: list.map(function(value) {
        return {id:value, value:value, remove_key: 'remove_access_from_location'};
      }),
      all: _all.map(function(value) {
        return {id:value, value:value, remove_key: 'remove_access_from_location'};
      }),
      reactive_save_key: 'add_access_to_location',
      span_size:3,
      span_diff:9,
      field:"Accessibility"
    }
  },
  audience: function() {
    return {
      field:'Audience',
      id:'audience'
    }
  },
  blank_address: function() {
    return {index:0, zipcode:'', city:'', street:''}
  },
  blank_dict: function() {
    return {};
  },
  languages: function() {
    var languages = Session.get('track_inputs')['languages'] || [];
    return {languages: languages};
  },
  blank_phone: function() {
    return {index:0, phone_number:'', phone_hours:''};
  },
  inputs: function() {
    var track_inputs = Session.get('track_inputs');
    values = track_inputs['category_specific_inputs'] || {};
    services = track_inputs['categories'] || [];
    services = get_service_names_with_parent_inputs(services);
    return category_specific_inputs(services, values, null);
  },
  contact_name: function() {
    return {
      field:'Contact Name',
      id:'contact_name'
    }
  },
  contact_title: function() {
    return {
      field:'Contact Title',
      id:'contact_title'
    }
  },
  description: function() {
    return {
      field:'Description',
      id:'description'
    }
  },
  eligibility: function() {
    return {
      field:'Eligibility',
      id:'eligibility'
    }
  },
  email: function() {
    return {
      field:'Email',
      id:'email'
    }
  },
  fees: function() {
    return {field:'Fees', id:'fees'}
  },
  how_to_apply: function() {
    return {field:'How To Apply', id:'how_to_apply'}
  },
  name_location: function() {
    return {field:'Name Location', id:'location_name'}
  },
  name_resource: function() {
    return {field:'Name Resource', id:'resource_name'}
  },
  short_desc: function() {
    return {field:'Short Desc', id:'short_desc'}
  },
  services_dropdown: function() {
    var list = Session.get('track_inputs')['categories'] || [];
    return {
      list: Services.find({_id:{$in:list}}, {sort:{name:1}}).map(function(service) {
        return {id:service._id, value:service.name, remove_key:'remove_service_from_location'}
      }),
      all: Services.find({parents:{$exists:true, $ne:null}}, {sort:{name:1}}).map(function(service) {
        return {id:service._id, value:service.name, remove_key: 'remove_service_from_location'};
      }),
      reactive_save_key: 'add_service_to_location',
      span_size:3,
      span_diff:9,
      field:"Categories"
    }
  },
  url: function() {
    return {field:'Website', id:'url'}
  },
});

Template.open_edit.events({
  'click a': function(e, tmpl) {
    var resource_id = $(e.target).attr("resource_id");
    Session.set('resource_id', resource_id);
  }
});

Template.open_edit.helpers({
  created: function() {
    if (this.created_time == '') {
      return ''
    };
    var date = new Date(this.created_time);
    var month = date.getMonth() + 1;
    var day   = date.getDate();
    var hour  = date.getHours();
    var minutes = date.getMinutes();
    return month + '/' + day + ', '+ hour + ':' + minutes;
  },
});

Template.open_flags.helpers({
  flags: function() {
    return Flags.find({open:true}, {sort:{created_time:1}});
  },
  info_from_flag: function() {
    return {
      created_time: this.created_time,
      resource: Resources.findOne({_id:this.resource_id}),
      type:'flag'
    }
  },
});

var collate_edits = function(all_required) {
  var location_id = Session.get('is_editing');
  var edits = Session.get('track_inputs');

  if (!location_id) {
    edits['county'] = Session.get('county')._id;
  }

  if ('website' in edits) { //would rather use url on backend.
    edits['url'] = edits['website']
    delete edits['website']
  }

  edits['hours'] = collate_hours_edits()
  return edits;
}

var _collate_hours_time = function(day, time) {
  var val = $('#' + day + '_' + time).val();
  if (!val || val.trim() == '') {
    return '';
  } else {
    return val;
  }
}

var collate_hours_edits = function() {
  var ret = {};
  days_abbr.forEach(function(day) {
    ret[day] = {};
    if (Session.get('weekday_hours_the_same') && weekdays_minus_mon.indexOf(day) > -1) {
      ret[day] = ret['mon'];
    } else {
      ret[day]['closed'] = $('#' + day + '_checkbox').prop('checked');
      ret[day]['open_time'] = _collate_hours_time(day, 'open');
      ret[day]['close_time'] = _collate_hours_time(day, 'close');
    }
  });
  return ret;
}

var display_day = function(day) {
  return capitalize(day);
}

var get_category_input_ids = function(services) {
  var input_ids = {};
  var parents = [];
  Services.find({_id:{$in:services}}).forEach(function(service) {
    if (service.resource_inputs && service.resource_inputs.length > 0) {
      var service_id = service._id;
      if (!(service_id in input_ids)) {
        input_ids[service_id] = [];
      }
      for (var input_id in service.resource_inputs) {
        input_ids[service_id].push(input_id);
      }
    }
    parents = parents.concat(service.parents);
  });
  Services.find({_id:{$in:parents}}).forEach(function(parent) {
    if (parent.resource_inputs && parent.resource_inputs.length > 0) {
      input_ids = input_ids.concat(parent.resource_inputs);
    }
    var parent_id = parent._id;
    if (!(parent_id in input_ids)) {
      input_ids[parent_id] = [];
    }
    for (var input_id in parent.resource_inputs) {
      input_ids[parent_id].push(input_id);
    }
  });
  return input_ids;
}

var get_field_class = function(type, id) {
  if ((id && Session.get('location_id') == id) || is_editing_plus()) {
    return 'field_' + type;
  }
  return '';
}

is_editing_plus = function() {
  return Session.get('is_editing') == true || !Session.get('resource_id');
}

var obj_trim = function(obj, key) {
  var ret = obj[key] || {};
  ret['period'] = key;
  return ret;
}

var _save_reactive_data_category_input = function(instr, field, value) {
  var location_id = Session.get('is_editing');
  if (location_id) {
    Meteor.call(instr, location_id, field, value);
  } else {
    var inputs = Session.get('track_inputs');
    var category_specific_inputs = inputs['category_specific_inputs'] || {};
    var field_inputs = category_specific_inputs[field] || [];

    var parts = instr.split('_');
    var type_change = parts[0];
    if (type_change == 'remove') {
      var index = field_inputs.indexOf(value);
      if (index > -1) {
        field_inputs.splice(index, 1);
        category_specific_inputs[field] = field_inputs;
        inputs['category_specific_inputs'] = category_specific_inputs;
        Session.set('track_inputs', inputs);
      }
    } else if (type_change == 'add') {
      var index = field_inputs.indexOf(value);
      if (index == -1) {
        field_inputs.push(value);
        category_specific_inputs[field] = field_inputs;
        inputs['category_specific_inputs'] = category_specific_inputs;
        Session.set('track_inputs', inputs);
      }
    }
  }
}

var save_reactive_data = function(instr, field, value) {
  if (instr.indexOf('category_input') > -1) {
    _save_reactive_data_category_input(instr, field, value);
    return;
  }

  var location_id = Session.get('is_editing');
  if (location_id) {
    Meteor.call(instr, location_id, value);
  } else {
    var parts = instr.split('_');
    var field = field.toLowerCase();
    if (parts[0] == 'remove') {
      session_var_splice_obj('track_inputs', field, value);
    } else if (parts[0] == 'add') {
      session_var_push_obj('track_inputs', field, value);
    }
  }
}

var success_message_with_warning = function() {
  var message = Session.get('message');
  if (message && message.slice(0,7) == "Warning") {
    message += " Saved other edits";
  } else {
    message = "Success: Saved edits. Thanks!";
  }
  Session.set('message', message);
}

var time_placeholder = function(time) {
  if (!time) {
      return 'Blank';
  }
  var st = time.toString();
  if (st.length == 3) {
    st = '0' + st;
  }
  return st;
}


var total_needs_edit_count = function() {
  if (!Session.get('county')) {
    return 0;
  } else {
    var locations = Locations.find(
      {
        needs_edit:true, service_area:Session.get('county')._id,
      },
      {
        fields:{resource_id:true}
      }).fetch()
    var distinct_resources = _.uniq(locations, false, function(location) {
      return location.resource_id
    });
    return distinct_resources.length;
  }
}

var trim = function(current) {
  if (!current) {
    return "";
  }
  return current.trim();
}