Router.map(function() {
  this.route('home', { //Shows map of where you are + commonly-searched resources around you
    path:'/',
    waitOn: function() {
      return [
        Meteor.subscribe('services'),
        Meteor.subscribe('flags_from_user', Meteor.userId())
      ];
    },
    data: function() {
      return {
        flags: Flags.find({open:true, user_id:Meteor.userId()}).map(function(flag) {
          return flag._id;
        }),
        services: Services.find({}, {sort:{count:0}, limit:5}).map(function(service) {
          return {name:service.name, name_route:service.nameRoute,
                  count:service.count, _id:service._id};
        })
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
    before: function() {
      console.log('hey yo');
      if (!Roles.userIsInRole(Meteor.userId(), ['editor', 'admin'])) {
        this.redirect('home');
      }
    },
    waitOn: function() {
      return [
        Meteor.subscribe('services'),
        Meteor.subscribe('inputs'),
        Meteor.subscribe('resources_in_zipcode'), //change to based off of county.
        Meteor.subscribe('open_flags')
      ]
    },
  });
});

Router.configure({
    notFoundTemplate:'notFound',
    layoutTemplate:'base'
});