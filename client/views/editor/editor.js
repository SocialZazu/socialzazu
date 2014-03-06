Template.category_field_hours.helpers({
  day_of_week: function() {
    return [{day:'Monday'}, {day:'Tuesday'}, {day:'Wednesday'}, {day:'Thursday'},
            {day:'Friday'}, {day:'Saturday'}, {day:'Sunday'}]
  }
});

Template.choose_category.events({
  'change #service': function(e, tmpl) {
    var category_id = $(e.target).find(":selected").val();
    if (category_id == '') {
      Session.set('category_id', null);
    } else {
      Session.set('category_id', category_id);
      Session.set('resource_id', null);
    }
  }
});

Template.choose_category.helpers({
  service_category_name: function() {
    if (Session.get('category_id')) {
      return Services.findOne({_id:Session.get('category_id')}).name
    } else {
      return "Service Category";
    }
  },
  categories: function() {
    return Services.find(); //Services.find({});
  },
});

Template.editor.created = function() {
  Session.set('category_id', null);
  Session.set('resource_id', null);
  Session.set('has_county_select', true);
}

Template.editor.destroyed = function() {
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

Template.edit_resource.helpers({
  name_field: function() {
    return {
      current: this.name,
      field: 'name'
    }
  },
  url_field: function() {
    return {
      current: this.url,
      field: 'url'
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
}

Template.needs_edit.helpers({
  resources: function() {
    console.log(Resources.find({needs_edit:true}, {limit:10}).fetch())
    return Resources.find({needs_edit:true}, {limit:10})
  },
  info_from_edit: function() {
    var timestamp = this.created_time || this.updated_time;
    if (!timestamp) {
      timestamp = this._id.getTimestamp();
    }
    return {
      created_time: timestamp,
      resource: this
    }
  }
});

Template.new_resource.helpers({
  resource_fields: function(type) {
    if (!this.resource_inputs) {
      return [];
    }
    return Inputs.find({_id:{$in:this.resource_inputs}, dom:type});
  },
  selected_category: function() {
    return Services.findOne({_id:Session.get('category_id')});
  },
  show_submit: function() {
    return this !== null;
  }
});

Template.open_flags.events({
  'click button': function(e, tmpl) {
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
  resource: function() {
    console.log(this.resource);
    return this.resource
  },
  resource_id: function() {
    return this.resource._id
  }
});

Template.open_flags.helpers({
  flags: function() {
    return Flags.find({open:true}, {sort:{created_time:1}});
  },
  info_from_flag: function() {
    return {
      created_time: this.created_time,
      resource: Resources.findOne({_id:this.resource_id})
    }
  },
});
