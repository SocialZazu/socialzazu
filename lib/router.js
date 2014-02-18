Router.map(function() {
  this.route('home', { //Shows map of where you are + commonly-searched resources around you
    path:'/',
    waitOn: function() {
      return [
        Meteor.subscribe('resources_from_top_services'),
        Meteor.subscribe('top_services'),
        Meteor.subscribe('flags_from_user', Meteor.userId())
      ];
    },
    data: function() {
      return {
        flags: Flags.find({open:true, user_id:Meteor.userId()}).map(function(flag) {
          return flag._id;
        }),
        services: Services.find({}, {sort:{count:0}, limit:10}),
        resources: Resources.find({})
      }
    }
  });
  this.route('resource', {  //Information about particular resource
    path:'/resource/:_id',
  });
  this.route('service', {   //Service of Resources, e.g. Treatment Center
    path:'/service/:nameRoute',
    });
  this.route('editor', { //Backend input for Highland Workers
    path:'/editor',
    waitOn: function() {
      return Meteor.subscribe('services');
    },
    data: function() { //TODO: fix to use roles and entry points
      if (!hasEditorPermission(Meteor.user())) {
        this.stop();
      } else {
        return Services.find({});
      }
    }
  });
});

Router.configure({
    notFoundTemplate:'notFound',
    layoutTemplate:'base'
});