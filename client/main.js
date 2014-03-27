Deps.autorun(function() {
  //Base
  Meteor.subscribe('counties', function() {
    if (!Session.get('county')) {
      Session.set('county', Counties.findOne({name:"Alameda"}));
    }
  });
  if (Roles.userIsInRole(Meteor.userId(), ['editor', 'admin'])) {
    Meteor.subscribe('open_flags', Session.get('county'))
  }

  //Editor
  Meteor.subscribe(
    'locations_from_resource_id_and_county',
    Session.get('resource_id'),
    Session.get('county')
  );

  Meteor.subscribe(
    'locations_need_editing',
    Session.get('county')
  );

  Meteor.subscribe(
    'open_flags',
    Session.get('county')
  );

  //Home
  Meteor.subscribe(
    'locations_from_services',
    Session.get('display_services'),
    Session.get('county'),
    function() {
      if (Session.get('display_services') && Session.get('display_services').length == SIDEBAR_NUM) {
        var service_ids = Session.get('display_services').map(
          function(service) {return service._id}
        );

        map.remove_all_markers();

        Locations.find(
          {service_area:Session.get('county')._id,
           sub_service_ids:{$in:service_ids}},
          {fields:{
            sub_service_ids:true, address:true, _id:true, name:true}
          }).forEach(function(location) {
             map.add_marker_from_location(location);
          });
      }
    }
  )
});