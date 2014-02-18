Template.editor.events({
  'click #submitResource': function(e, tmpl) {
    //validate and then submit the resource'
  }
});

Template.editor.helpers({
  categories: function() {
    return this; //Services.find({});
  },
  selected_category: function() {

  },
});