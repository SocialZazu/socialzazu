Template.category_field_hours.helpers({
  day_of_week: function() {
    return [{day:'Monday'}, {day:'Tuesday'}, {day:'Wednesday'}, {day:'Thursday'},
            {day:'Friday'}, {day:'Saturday'}, {day:'Sunday'}]
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

Template.display_flags.events({
  'click button': function(e, tmpl) {
    var resource_id = $(e.target).attr("resource_id");
    console.log(resource_id);
    Session.set('resource_id', resource_id);
  }
});

Template.display_flags.helpers({
  num_flags: function() {
    var count = Flags.find({open:true}).count();
    if (count > 0) {
      return count;
    } else {
      return "No"
    }
  },
  resource_name: function() {
    return Resources.find({_id:this.resource_id}).name
  }
});

Template.editor.created = function() {
  Session.set('category_id', null);
  Session.set('resource_id', null);
}

Template.editor.helpers({
  resource_datums: function() {
    return Resources.find({}).map(function(resource) {
      return {value:resource.name, name_route:resource._id}
    });
  },
  show_new_resource: function() {
    return Session.get('category_id') !== null;
  },
  show_edit_resource: function() {
    return Session.get('resource_id') !== null;
  },
  show_flags: function() {
    return Session.get('resource_id') == null && Session.get('category_id') == null;
  }
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
  }).on('typeahead:autocompleted', function(event, datum) {
    Session.set('edit_resource', datum.name_route);
  });
}

Template.new_resource.events({
  'change #service': function(e, tmpl) {
    var category_id = $(e.target).find(":selected").val();
    if (category_id == '') {
      Session.set('category_id', null);
    } else {
      Session.set('category_id', category_id);
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