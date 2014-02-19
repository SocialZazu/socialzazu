Template.base.helpers({
  has_editor_permission: function() {
    return Roles.userIsInRole(Meteor.userId(), ['editor', 'admin']);
  }
});

Template.base.created = function() {
    $('input').height(25);
}

