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
    return Resources.find({}).map(function(resource) {
      return {value:resource.name, name_route:resource._id}
    });
  },
  resource: function() {
    return Resources.findOne({_id:Session.get('resource_id')});
  },
  show_edit_resource: function() {
    return Session.get('resource_id') !== null;
  }
});

Template.editor.rendered = function() {
  Deps.autorun(function() {
    Meteor.subscribe(
      'resources_from_county',
      Session.get('county'),
      function() {Session.set('resource_id', null)}
    );
  });
  if (Session.get('resource_id') == null) {
    var resource = Resources.findOne({needs_edit:true});
    if (!resource) {
      var flag = Flags.findOne({open:true});
      if (flag) {
        resource = Resources.findOne({_id:flag.resource_id})
      }
    }
    if (resource) {
      Session.set('resource_id', resource._id);
    }
  }
}

Template.edit_buttons.events({
  'click #save_resource': function(e, tmpl) {
    //save edits made
  },
  'click #cancel_edits': function(e, tmpl) {
    //cancel edits made, revert back div mode
    Session.set('is_editing', false);
  },
  'click #edit_resource': function(e, tmpl) {
    //enter div mode
    console.log('is editing true');
    Session.set('is_editing', true);
  },
  'click #mark_complete': function(e, tmpl) {
    //close all flags with this resource_id
    //mark needs_edit to false
  }
});

Template.edit_buttons.helpers({
  is_editing: function() {
    return Session.get('is_editing');
  }
});

Template.edit_field.helpers({
  is_editing: function() {
    return Session.get('is_editing');
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
    return this.locations.address;
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
  transportation: function() {
    return {
      current: clean(this.locations.transportation),
      field: 'Transport'
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
  var data = this.data;
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

Template.needs_edit.helpers({
  resources: function() {
    return Resources.find({needs_edit:true}, {limit:10})
  },
  info_from_edit: function() {
    var timestamp = this.created_time || this.updated_time;
    if (!timestamp) {
      timestamp = this._id.getTimestamp();
    }
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

var clean = function(current) {
  if (!current) {
    return "[Blank]";
  }
  return current;
}

var obj_clean = function(obj, key) {
  var ret = obj[key] || {};
  ret['period'] = key;
  return ret;
}

var time_placeholder = function(time) {
  if (!time) {
      return '0000';
  }
  var st = time.toString();
  if (st.length == 3) {
    st = '0' + st;
  }
  return st;
}
