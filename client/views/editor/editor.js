ALL_REQUIRED_MSG = 'Error: For a new resource, all fields required';

Template.editor.created = function() {
  Session.set('message', null);
  Session.set('new_service', []);
  Session.set('new_access', []);
  Session.set('new_language', []);
  Session.set('is_editing', false);
  Session.set('category_id', null);
  Session.set('resource_id', null);
  Session.set('has_county_select', true);
}

Template.editor.destroyed = function() {
  Session.set('message', null);
  Session.set('new_service', null);
  Session.set('new_access', null);
  Session.set('new_language', null);
  Session.set('is_editing', null);
  Session.set('category_id', null);
  Session.set('resource_id', null);
  Session.set('has_county_select', false);
}

Template.editor.events({
  'click #new_resource': function(e, tmpl) {
    Session.set('resource_id', null);
    Session.set('is_editing', false);
    Session.set('message', null);
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
    return Resources.find({needs_edit:true}).count() > 0
  },
  has_open_flags: function() {
    return Flags.find({open:true}).count() > 0
  },
  message: function() {
    var message = Session.get('message');
    if (message && message.slice(0,7) == 'Success') {
      return message;
    }
    return '';
  },
  resource_datums: function() {
    return {
      datums: Resources.find({}).map(function(resource) {
        return {value:resource.name, name_route:resource._id}
      }),
      placeholder:"Search Resource to Edit"
    }
  },
  resource: function() {
    return Resources.findOne({_id:Session.get('resource_id')});
  },
  show_edit_resource: function() {
    return Session.get('resource_id') !== null;
  }
});

Deps.autorun(function() {
  Meteor.subscribe(
    'resources_from_id',
    Session.get('resource_id')
  );
  Meteor.subscribe(
    'open_flags',
    Session.get('county')
  );
});

Template.edit_access.events({
  'change select': function(e, tmpl) {
    var access_name = $(e.target).val();
    if (!(access_name == 'instr')) {
      save_reactive_data('add_access_to_resource', access_name);
    }
  },
  'click .remove_access': function(e, tmpl) {
    var access_name = $(tmpl.find('.remove_access')).attr('id');
    save_reactive_data('remove_access_from_resource', access_name);
  }
});

Template.edit_access.helpers({
  accessibles: function() {
    return this.accessibles;
  },
  capitalize: function(str) {
    return capitalize(str);
  },
  is_editing: function() {
    return is_editing_plus();
  },
  other_access: function() {
    var all_access = ['blind', 'deaf', 'elevator', 'parking', 'ramp', 'restroom', 'wheelchair'];
    var other = array_diff(all_access, this.accessibles);
    return other;
  },
});

Template.edit_address.helpers({
  field_name: function() {
    return get_field_name_class();
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
      width:width
    }
  },
});

Template.edit_buttons.events({
  'click #save_resource': function(e, tmpl) {
    //save edits made
    Session.set('message', null);
    var edits = collate_edits(false);
    validate_edits(edits, false);

    var message = Session.get('message');
    if (!message || !(message.slice(0,5) == "Error")) {
      Meteor.call('save_resource_edits',
                  Session.get('resource_id'), Meteor.userId(), edits,
                  function(error, result) {
                    if (!e) {
                      Session.set('message', 'Success: Saved edits. Thanks!');
                      Session.set('is_editing', false);
                    }
                  }
                 );
    }
  },
  'click #cancel_edits': function(e, tmpl) {
    //cancel edits made, revert back div mode
    Session.set('message', null);
    Session.set('is_editing', false);
  },
  'click #edit_resource': function(e, tmpl) {
    //enter div mode
    Session.set('message', null);
    Session.set('is_editing', true);
  },
  'click #mark_complete': function(e, tmpl) {
    //close all flags with this resource's _id
    //mark needs_edit to false
    Meteor.call('mark_complete',
                Session.get('resource_id'), Meteor.userId(),
                function(e, result) {
                  if (!e) {
                    Session.set('message', 'Success: Marked as complete. Thanks!');
                    Session.set('is_editing', false);
                    Session.set('resource_id', null);
                  }
                }
               );
  }
});

Template.edit_buttons.helpers({
  is_editing: function() {
    return Session.get('is_editing');
  },
});

Template.edit_field.helpers({
  field_name: function() {
    return get_field_name_class();
  },
  toggle_info: function() {
    return {
      current: this.current,
      id: this.field.trim().split(' ').join('_')
    }
  }
});

Template.edit_hours.helpers({
  m_f: function() {
    return obj_trim(this, 'm_f');
  },
  sat: function() {
    return obj_trim(this, 'sat');
  },
  sun: function() {
    return obj_trim(this, 'sun');
  },
});

Template.edit_hours_subfield.helpers({
  period_title: function() {
    return display_day(this.period);
  },
  checked: function() {
    if (this.closed) {
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
  close_placeholder: function() {
    return time_placeholder(this.close_time);
  },
  is_editing: function() {
    return is_editing_plus();
  },
  open_placeholder: function() {
    return time_placeholder(this.open_time);
  },
});

Template.edit_languages.events({
  'click #add_language': function(e, tmpl) {
    var new_language = $(tmpl.find('#language_input')).val();
    if (new_language && new_language.trim() !== '') {
      save_reactive_data('add_language_to_resource', new_language);
    }
  },
  'click .remove_language': function(e, tmpl) {
    var language = $(tmpl.find('.remove_language')).attr('name');
    save_reactive_data('remove_language_from_resource', language);
  },
});

Template.edit_languages.helpers({
  is_editing: function() {
    return is_editing_plus();
  },
  languages: function() {
    return this.languages;
  },
});

Template.edit_phone.helpers({
  field_name: function() {
    return get_field_name_class();
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
      width:width
    }
  },
});

Template.edit_resource.helpers({
  accessibility_inputs: function() {
    return {
      resource_id: this._id,
      accessibles: this.locations.accessibility
    }
  },
  addresses: function() {
    var i = -1;
    return this.locations.address.map(function(address) {
      i += 1;
      return {index:i, zipcode:address.zipcode,
              city:address.city, street:address.street};
    });
  },
  audience: function() {
    return {
      current: trim(this.locations.services.audience),
      field: 'Audience'
    }
  },
  category_specific_inputs: function() {
    return Inputs.find({resource_inputs:{$in:this.sub_service_ids}});
  },
  contacts: function() {
    return this.locations.contacts.slice(0,1) //TODO: allow more contacts
  },
  contact_name: function() {
    return {
      current: trim(this.name),
      field: 'Contact Name'
    }
  },
  contact_title: function() {
    return {
      current: trim(this.title),
      field: 'Contact Title'
    }
  },
  description: function() {
    return {
      current: trim(this.locations.description),
      field: 'Description'
    }
  },
  eligibility: function() {
    return {
      current: trim(this.locations.services.eligibility),
      field: 'Eligibility'
    }
  },
  email: function() {
    return {
      current: trim(this.locations.internet_resource.email),
      field: 'Email'
    }
  },
  fees: function() {
    return {
      current: trim(this.locations.services.fees),
      field: 'Fees'
    }
  },
  hours: function() {
    return this.locations.hours;
  },
  how_to_apply: function() {
    return {
      current: trim(this.locations.services.how_to_apply),
      field: 'How To Apply'
    }
  },
  languages: function() {
    return {
      languages:this.locations.languages
    }
  },
  name: function() {
    return {
      current: trim(this.name),
      field: 'Name'
    }
  },
  phones: function() {
    var i = -1;
    return this.locations.phones.map(function(phone) {
      i += 1;
      return {index:i, phone_number:phone.number, phone_hours:phone.hours};
    });
  },
  short_desc: function() {
    return {
      current: trim(this.locations.short_desc),
      field: 'Short Desc'
    }
  },
  sub_services: function() {
    return {
      resource_id: this._id,
      service_ids: this.sub_service_ids
    }
  },
  transportation: function() {
    return {
      current: trim(this.locations.transportation),
      field: 'Transportation'
    }
  },
  url: function() {
    return {
      current: trim(this.locations.internet_resource.url),
      field: 'Website'
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

Template.edit_sub_services.events({
  'click .remove_service': function(e, tmpl) {
    var service_id = $(tmpl.find('.remove_service')).attr('id');
    save_reactive_data('remove_service_from_resource', service_id);
  }
});

Template.edit_sub_services.helpers({
  field_name: function() {
    return get_field_name_class();
  },
  is_editing: function() {
    return is_editing_plus();
  },
  margin_top: function() {
    if (this.ids && this.ids.length > 0) {
      return "6px";
    } else {
      return "3px"
    }
  },
  sub_services: function() {
    return Services.find({_id:{$in:this.service_ids}}, {sort:{name:1}})
  },
  sub_service_ids: function() {
    return {
      ids: this.service_ids,
      _id: this.resource_id
    }
  }
})

Template.is_editing_toggle.helpers({
  is_editing: function() {
    return is_editing_plus();
  },
  width: function() {
    var width = this.width || "92%"
    return width;
  }
});

Template.message.helpers({
  message: function() {
    var message = Session.get('message');
    if (message && message.slice(0,5) == 'Error') {
      return message;
    }
    return '';
  }
});

Template.needs_edit.helpers({
  info_from_edit: function() {
    var timestamp = this.created_time || this.updated_time || '';
    return {
      created_time: timestamp,
      resource: this,
      type: 'edit'
    }
  },
  resources: function() {
    return Resources.find({needs_edit:true}, {limit:15})
  },
});

Template.new_field.helpers({
  id: function() {
    return this.field.trim().split(' ').join('_') + '_input';
  },
});

Template.new_resource.events({
  'click #save_resource': function(e, tmpl) {
    Session.set('message', null);
    var edits = collate_edits(true);
    validate_edits(edits, true);

    var message = Session.get('message');
    if (!message || !(message.slice(0,5) == "Error")) {
      Meteor.call('save_resource_edits',
                  null, Meteor.userId(), edits,
                  function(e, result) {
                    Session.set('Saved edits. Thanks!');
                    Session.set('is_editing', false);
                  }
                 );
    }
  },
});

Template.new_resource.helpers({
  accessibility_inputs: function() {
    return {
      resource_id: null,
      accessibles: Session.get('new_access')
    }
  },
  audience: function() {
    return {
      field: 'Audience'
    }
  },
  blank_address: function() {
    return {index:0, zipcode:'', city:'', street:''}
  },
  blank_dict: function() {
    return {};
  },
  languages: function() {
    return {languages: Session.get('new_language')}
  },
  blank_phone: function() {
    return {index:0, phone_number:'', phone_hours:''};
  },
  category_specific_inputs: function() {
    var services = Session.get('new_service');
    return Inputs.find({resource_inputs:{$in:services}});
  },
  contact_name: function() {
    return {
      field: 'Contact Name'
    }
  },
  contact_title: function() {
    return {
      field: 'Contact Title'
    }
  },
  description: function() {
    return {
      field: 'Description'
    }
  },
  eligibility: function() {
    return {
      field: 'Eligibility'
    }
  },
  email: function() {
    return {
      field: 'Email'
    }
  },
  fees: function() {
    return {
      field: 'Fees'
    }
  },
  how_to_apply: function() {
    return {
      field: 'How To Apply'
    }
  },
  name: function() {
    return {
      field: 'Name'
    }
  },
  phone: function() {
    return {
      field: 'Phone'
    }
  },
  short_desc: function() {
    return {
      field: 'Short Desc'
    }
  },
  sub_services: function() {
    return {
      resource_id: null,
      service_ids: Session.get('new_service')
    }
  },
  transportation: function() {
    return {
      field: 'Transportation'
    }
  },
  url: function() {
    return {
      field: 'Website'
    }
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

Template.select_service.events({
  'change select': function(e, tmpl) {
    var service_id = $(e.target).val();
    if (!(service_id == 'instr')) {
      save_reactive_data('add_service_to_resource', service_id);
    }
  }
});

Template.select_service.helpers({
  other_services: function() {
    return Services.find({_id:{$not:{$in:this.ids}}}, {sort:{name:1}});
  }
});

var collate_address_edits = function() {
  return collate_class_edits($('.edit_address'), ['street', 'city', 'zipcode']);
}

var collate_class_edits = function(class_elems, fields) {
  var ret = [];
  for (var i = 0; i < class_elems.length; i++) {
    var index = class_elems[i].getAttribute('index');
    var change = {}
    var has_edit = false;
    fields.forEach(function(field) {
      var edit = collate_edit(field + '_' + index);
      if (edit) {
        change[field] = edit;
        has_edit = true;
      }
    });
    if (has_edit) {
      change['index'] = index;
      ret.push(change);
    }
  }
  return ret;
}

var collate_edit = function(field) {
  var id = '#' + field + '_input';
  val = $(id).val();
  if (!val) {
    return null;
  }
  val = val.trim();
  if (val == '') {
    return null;
  } else {
    return val;
  }
}

var collate_edits = function(all_required) {
  var ret = {}
  var fields = ['Audience', 'Contact_Name', 'Contact_Title', 'Description',
                'Short_Desc', 'Eligibility', 'Email', 'Fees', 'How_To_Apply',
                'Name', 'Transportation', 'Website']
  var resource_id = Session.get('resource_id');

  if (!resource_id) { //new resource ... add service_ids
    ret['sub_service_ids'] = Session.get('new_service');
    ret['accessibility'] = Session.get('new_access');
    ret['languages'] = Session.get('new_language');
    ret['counties'] = [Session.get('county')._id]; //TODO: change to incorporate more counties
  }
  fields.forEach(function(field) {
    var edit = collate_edit(field);
    var lower = field.toLowerCase();
    if (all_required) {
      ret[lower] = edit;
    } else if (edit) { //if editing existing resource, only want changes
      ret[lower] = edit;
    }
  });

  if ('website' in ret) { //would rather use url on backend.
    ret['url'] = ret['website']
    delete ret['website']
  }

  ret['hours'] = collate_hours_edits()
  ret['address'] = collate_address_edits();
  ret['phones'] = collate_phone_edits();
  return ret;
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
  var days = ['m_f', 'sat', 'sun'];
  days.forEach(function(day) {
    ret[day] = {};
    ret[day]['closed'] = $('#' + day + '_checkbox').prop('checked');
    ret[day]['open_time'] = _collate_hours_time(day, 'open');
    ret[day]['close_time'] = _collate_hours_time(day, 'close');
  });
  return ret;
}

var collate_phone_edits = function() {
  return collate_class_edits($('.edit_phone'), ['phone_number', 'phone_hours']);
}

var display_day = function(day) {
  if (day == 'm_f') {
    return 'Mon-Fri';
  } else if (day == 'sat') {
    return 'Saturday';
  } else {
    return 'Sunday';
  }
}

var get_field_name_class = function() {
  if (is_editing_plus()) {
    return 'field_name';
  }
  return '';
}

var is_editing_plus = function() {
  return Session.get('is_editing') || !Session.get('resource_id');
}

var obj_trim = function(obj, key) {
  var ret = obj[key] || {};
  ret['period'] = key;
  return ret;
}

var save_reactive_data = function(instr, value) {
  var resource_id = Session.get('resource_id');
  if (resource_id) {
    Meteor.call(instr, resource_id, value);
  } else {
    var parts = instr.split('_');
    var session_key = 'new_' + parts[1];
    var type_change = parts[0];
    if (type_change == 'remove') {
      session_var_splice(session_key, value);
    } else if (type_change == 'add') {
      session_var_push(session_key, value);
    }
  }
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

var trim = function(current) {
  if (!current) {
    return "";
  }
  return current.trim();
}

var validate_address = function(addresses) {
  for (var i = 0; i < addresses.length; i++) {
    var address = addresses[i];
    if (address['zipcode'] && !(address['zipcode'] == '') && !(/^\d{5}$/.test(address['zipcode']))) {
      return [false, 'Error: Zipcode malformed'];
    }
    //TODO: another clause to make sure that zipcode in county
  }
  return [true, ''];
}

var validate_edits = function(edits, all_required) {
  var resource_id = Session.get('resource_id');
  if (!resource_id && all_required && Object.keys(edits).length == 0) {
    Session.set('message', ALL_REQUIRED_MSG);
    return false;
  }

  for (var key in edits) {
    var val = edits[key];
    if (!resource_id && all_required && !val) {
      Session.set('message', ALL_REQUIRED_MSG);
      return false;
    }

    if (key == 'sub_service_ids' && val && val.length == 0) {
      Session.set('message', 'Error: Please add at least one category');
      return false;
    }

    if (key == 'hours') {
      var hours = validate_hours(val);
      if (!hours[0]) {
        Session.set('message', hours[1]);
        return false;
      }
    }

    if (key == 'address') {
      var address = validate_address(val);
      if (!address[0]) {
        Session.set('message', address[1]);
        return false;
      }
    }
  }
}

var validate_hours = function(hours) {
  //skipping vlaidating hours on client side right now.
  //do it on server side if there's a diff.
  var days = ['m_f', 'sat', 'sun'];

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
        return [false, 'Error: ' + display_day(day) + "'s closing time is earlier than it's opening time"];
      }
    } else if (!(input['open_time'] == '' && input['close_time'] == '')) {
      return [false, 'Error: ' + display_day(day) + ' is not in correct military time'];
    }
  }
  return [true, ''];
}

var validate_time = function(time) {
  if (/^[0-2]\d[0-5]\d$/.test(time) && parseInt(time) < 2400) {
    return time;
  } else {
    return false;
  }
}
