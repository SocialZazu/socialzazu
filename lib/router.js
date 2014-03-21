SIDEBAR_NUM = 6;

var ir_before_hooks = {
  is_editor: function() {
    roles_check(['admin', 'editor'])
  },
  is_admin: function() {
    roles_check(['admin']);
  }
}

var roles_check = function(roles) {
  if (!Meteor.userId()) {
    Router.go('home');
  } else if (Meteor.subscribe('user_roles', Meteor.userId()).ready() && !Roles.userIsInRole(Meteor.userId(), roles)) {
    Router.go('home');
  }
};

if (Meteor.isClient) {
  Router.before(ir_before_hooks.is_editor, {only:['editor', 'ontology']})
  Router.before(ir_before_hooks.is_admin,  {only:['admin']})
}

Router.map(function() {
  this.route('admin', { //Admin interface for promoting people to editors, etc
    path:'/admin',
    waitOn: function() {
      return [
        Meteor.subscribe('all_users')
      ]
    },
  });
  this.route('editor', { //Backend input for Highland Workers
    path:'/editor',
    waitOn: function() {
      return [
        Meteor.subscribe('services'),
        Meteor.subscribe('inputs'),
        Meteor.subscribe('search_resources_from_county', Session.get('county'))
      ]
    },
  });
  this.route('home', { //Shows map of where you are + commonly-searched resources around you
    path:'/',
    waitOn: function() {
      return [
        Meteor.subscribe('services'),
        Meteor.subscribe('flags_from_user', Meteor.userId()),
      ];
    },
    data: function() {
      return {
        flags: Flags.find(
          {open:true, user_id:Meteor.userId()}).map(
            function(flag) {return flag._id;}),
        services: Services.find(
          {parents:{$exists:true, $ne:null}},
          {sort:{init_priority:-1}, limit:SIDEBAR_NUM}).map(
            function(service) {
              return {name:service.name, name_route:service.name_route, _id:service._id}
            }
          )
      }
    }
  });
  this.route('match', {
    path:'/match-me',
    waitOn: function() {
      return [
        Meteor.subscribe('services'),
        Meteor.subscribe('inputs')
      ]
    }
  });
  this.route('ontology', { //Editor tool to adjust the ontology
    path:'/ontology'
  });
  this.route('resource', {  //Information about particular resource
    path:'/resource/:name_route',
  });
  this.route('service', {   //Service of Resources, e.g. Treatment Center
    path:'/service/:name_route',
    });
});

Router.configure({
    notFoundTemplate:'notFound',
    layoutTemplate:'base'
});