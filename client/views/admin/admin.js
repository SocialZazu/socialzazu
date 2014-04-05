Template.admin.created = function() {
  Session.set('user_searched', null);
  Session.set('message', '');
}

Template.admin.destroyed = function() {
  Session.set('user_searched', null);
  Session.set('message', null);
}

Template.admin.helpers({
  child_services: function() {
    return Services.find({parents:{$exists:true, $ne:null}}, {sort:{created_time:1}});
  },
  parent_services: function() {
    return Services.find({'children.0':{$exists:true}}, {sort:{created_time:1}});
  },
  message: function() {
    return Session.get('message') || ''
  },
  selected_service_name: function() {
    return Session.get('selected_service_name') || 'None Selected'
  },
  user_datums: function() {
    return {
      datums: Meteor.users.find({}).map(function(user) {
        return {value:user.emails[0].address, name_route:user._id}
      }),
    }
  },
  user_email: function() {
    var user = Session.get('user_searched');
    if (user && user.emails && user.emails[0].address) {
      return user.emails[0].address;
    }
    return '';
  }
});

Template.admin.events({
  'click #make_editor': function(e, tmpl) {
    var username = $(tmpl.find('#editor_username')).val();
    var user = Session.get('user_searched');
    if (!username || username == '') {
      Session.set('message', 'Enter a username pls');
    } else if (!user) {
      Session.set('message', 'Find a user pls');
    } else {
      Meteor.call('make_editor', user._id, username);
    }
  },
  'click #submit_parent_category': function(e, tmpl) {
    var parent = $('#add_parent_category').val();
    if (parent && parent != '') {
      Meteor.call('add_parent_service', parent);
    }
  },
  'click #submit_child_category': function(e, tmpl) {
    var child = $('#add_child_category').val()
    var parent_id = Session.get('selected_service_id');
    if (child && parent_id && child != '' && parent_id != '') {
      Meteor.call('add_child_service', child, parent_id);
    }
  }
});

Template.admin.rendered = function() {
  var data = Services.find({parents:null}).map(function(service) {
    return {value:service.name, name_route:service.name_route, id:service._id}
  });

  if (data && data.length > 0) {
    var services_datums = new Bloodhound({
      datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: data
    });
    services_datums.initialize();

    $('#search_services').typeahead(null, {
      displayKey: 'value',
      source: services_datums.ttAdapter()
    }).on('typeahead:selected', function(event, datum) {
      Session.set('selected_service_id', datum.id);
      Session.set('selected_service_name', datum.value)
    });
  }
}

Template.user_email_search.rendered = function() {
  var data = this.data.datums;
  var datums = new Bloodhound({
    datumTokenizer: function(d) { return Bloodhound.tokenizers.whitespace(d.value); },
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    local: data
  });
  datums.initialize();

  $('#search_users_field').typeahead(null, {
    displayKey: 'value',
    source: datums.ttAdapter()
  }).on('typeahead:selected', function(event, datum) {
    Session.set('user_searched', Meteor.users.findOne({_id:datum.name_route}));
  });

  $('.search-query.tt-hint').width('inherit');
}
