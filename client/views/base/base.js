Template.base.helpers({
  hasEditorPermission: function() {
    //TODO: check permission level on Meteor.userId()
  }
});

Template.base.created = function() {
    $('input').height(25);
}

