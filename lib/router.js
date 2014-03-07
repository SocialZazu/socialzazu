var ir_before_hooks = {
  is_editor: function() {
    if (!Meteor.userId()) {
      this.redirect('home');
    } else if (Meteor.subscribe('user_roles', Meteor.userId()).ready() && !Roles.userIsInRole(Meteor.userId(), ['admin', 'editor'])) {
      this.redirect('home');
    }
  }
}

if (Meteor.isClient) {
  Router.before(ir_before_hooks.is_editor, {only:['editor']})
}

Router.map(function() {
  this.route('home', { //Shows map of where you are + commonly-searched resources around you
    path:'/',
    waitOn: function() {
      return [
        Meteor.subscribe('sub_services'),
        Meteor.subscribe('flags_from_user', Meteor.userId()),
      ];
    },
    data: function() {
      return {
        flags: Flags.find(
          {open:true, user_id:Meteor.userId()}).map(
            function(flag) {return flag._id;}),
        services: Services.find(
          {},
          {sort:{init_priority:-1}, limit:6}).map(
            function(service) {
              return {name:service.name, name_route:service.name_route, _id:service._id}
            }
          )
      }
    }
  });
  this.route('resource', {  //Information about particular resource
    path:'/resource/:name_route',
  });
  this.route('service', {   //Service of Resources, e.g. Treatment Center
    path:'/service/:name_route',
    });
  this.route('editor', { //Backend input for Highland Workers
    path:'/editor',
    waitOn: function() {
      return [
        Meteor.subscribe('sub_services'),
        Meteor.subscribe('inputs'),
      ]
    },
  });
});

Router.configure({
    notFoundTemplate:'notFound',
    layoutTemplate:'base'
});