Template.admin.created = function() {
  Session.set('user_searched', null);
  Session.set('message', '');
}

Template.admin.destroyed = function() {
  Session.set('user_searched', null);
  Session.set('message', null);
}

Template.admin.helpers({
  message: function() {
    return Session.get('message') || ''
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
  }
});


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

