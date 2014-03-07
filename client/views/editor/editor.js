Template.editor.created = function() {
  Session.set('is_editing', false);
  Session.set('category_id', null);
  Session.set('resource_id', null);
  Session.set('has_county_select', true);
}

Template.editor.destroyed = function() {
  Session.set('is_editing', false);
  Session.set('category_id', null);
  Session.set('resource_id', null);
  Session.set('has_county_select', false);
}

Template.editor.helpers({
  has_needs_edit: function() {
    return Resources.find({needs_edit:true}).count() > 0
  },
  has_open_flags: function() {
    return Flags.find({open:true}).count() > 0
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
    'resources_from_county',
    Session.get('county')
  )
});

Template.edit_address.helpers({
  toggle: function(key) {
    console.log(this);
    var width = null;
    if (key == 'zipcode') {
      width = '46px'
    }
    return {
      current:this[key],
      id:key + '_' + this.index,
      width:width
    }
  },
});

Template.edit_buttons.events({
  'click #save_resource': function(e, tmpl) {
    //save edits made
    Meteor.call('save_resource_edits', Session.get('resource_id'),
                Meteor.userId(), collate_edits());
  },
  'click #cancel_edits': function(e, tmpl) {
    //cancel edits made, revert back div mode
    Session.set('is_editing', false);
  },
  'click #edit_resource': function(e, tmpl) {
    //enter div mode
    Session.set('is_editing', true);
  },
  'click #mark_complete': function(e, tmpl) {
    //close all flags with this resource's _id
    //mark needs_edit to false
    Meteor.call('mark_complete', Session.get('resource_id'), Meteor.userId());
  }
});

Template.edit_buttons.helpers({
  is_editing: function() {
    return Session.get('is_editing');
  }
});

Template.edit_field.helpers({
  toggle_info: function() {
    return {
      current: this.current,
      id: this.field + '_input'
    }
  }
});

Template.edit_hours.helpers({
  m_f: function() {
    return obj_clean(this, 'm_f');
  },
  sat: function() {
    return obj_clean(this, 'sat');
  },
  sun: function() {
    return obj_clean(this, 'sun');
  },
});

Template.edit_hours_subfield.helpers({
  period_title: function() {
    if (this.period == 'm_f') {
      return 'M-F';
    } else {
      return capitalize(this.period);
    }
  },
  checked: function() {
    if (this.closed) {
      return "checked";
    }
    return "";
  },
  closed: function() {
    return this.closed == true;
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
    return Session.get('is_editing');
  },
  open_placeholder: function() {
    return time_placeholder(this.open_time);
  },
});

Template.edit_resource.helpers({
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
      current: clean(this.locations.services.audience),
      field: 'Audience'
    }
  },
  contacts: function() {
    return this.locations.contacts
  },
  contact_name: function() {
    return {
      current: clean(this.name),
      field: 'Contact Name'
    }
  },
  contact_title: function() {
    return {
      current: clean(this.title),
      field: 'Contact Title'
    }
  },
  description: function() {
    return {
      current: clean(this.locations.description),
      field: 'Description'
    }
  },
  eligibility: function() {
    return {
      current: clean(this.locations.services.eligibility),
      field: 'Eligibility'
    }
  },
  email: function() {
    return {
      current: clean(this.locations.internet_resource.email),
      field: 'Email'
    }
  },
  fees: function() {
    return {
      current: clean(this.locations.services.fees),
      field: 'Fees'
    }
  },
  hours: function() {
    return this.locations.hours;
  },
  how_to_apply: function() {
    return {
      current: clean(this.locations.services.how_to_apply),
      field: 'How To Apply'
    }
  },
  name: function() {
    return {
      current: clean(this.name),
      field: 'Name'
    }
  },
  short_desc: function() {
    return {
      current: clean(this.locations.short_desc),
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
      current: clean(this.locations.transportation),
      field: 'Transportation'
    }
  },
  url: function() {
    return {
      current: clean(this.locations.internet_resource.url),
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
  });

  $('.search-query.tt-hint').width('inherit');
}

Template.edit_sub_services.events({
  'click .remove_service': function(e, tmpl) {
    var service_id = $(tmpl.find('.remove_service')).attr('id');
    Meteor.call('remove_service_from_resource', Session.get('resource_id'), service_id);
  }
});

Template.edit_sub_services.helpers({
  is_editing: function() {
    return Session.get('is_editing');
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
    return Session.get('is_editing');
  },
  width: function() {
    var width = this.width || "90%"
    return width;
  }
});

Template.needs_edit.helpers({
  resources: function() {
    return Resources.find({needs_edit:true}, {limit:10})
  },
  info_from_edit: function() {
    var timestamp = this.created_time || this.updated_time || '';
    return {
      created_time: timestamp,
      resource: this,
      type: 'edit'
    }
  }
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
      var resource_id = this._id;
      Meteor.call('add_service_to_resource', resource_id, service_id);
    }
  }
});

Template.select_service.helpers({
  other_services: function() {
    return Services.find({_id:{$not:{$in:this.ids}}}, {sort:{name:1}});
  }
});

var _single_address_edits = function(index, key) {
  var val = $('#' + key + '_' + index + '_input').val();
  if (val == '') {
    return null;
  } else {
    return val.trim();
  }
}

var collate_address_edits = function() {
  var ret = []
  var addrss = $('.edit_address');
  var fields = ['street', 'city', 'zipcode'];
  for (var i = 0; i < addrss.length; i++) {
    var index = addrss[i].getAttribute('index');
    var change = {}
    var has_edit = false;
    fields.forEach(function(field) {
      var edit = _single_address_edits(index, field);
      if (edit) {
        change[field] = edit;
        has_edit = true;
      }
    });
    if (has_edit) {
      ret.push(change);
    }
  }
}

var collate_edit = function(field) {
  var id = '#' + field + '_input';
  val = $(id).val();
  if (val == '') {
    return null;
  } else {
    return val;
  }
}

var collate_edits = function() {
  var ret = {}
  var fields = ['Audience', 'Contact Name', 'Contact Title', 'Description',
                'Short Desc', 'Eligibility', 'Email', 'Fees', 'How To Apply',
                'Name', 'Transportation', 'Website']
  fields.forEach(function(field) {
    var edit = collate_edit(field);
    if (edit) {
      ret[field] = edit;
    }
  });
  ret['hours'] = collate_hours_edits()
  ret['address'] = collate_address_edits()
  return ret;
}

var collate_hours_edits = function() {

}

var clean = function(current) {
  if (!current) {
    return "";
  }
  return current.trim();
}

var obj_clean = function(obj, key) {
  var ret = obj[key] || {};
  ret['period'] = key;
  return ret;
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
