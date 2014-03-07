Meteor.publish('counties', function() {
  return Counties.find();
});

Meteor.publish('flags_from_user', function(user_id) {
  if (!user_id) {
    return null;
  } else {
    return Flags.find({open:true, user_id:user_id});
  }
});

Meteor.publish('inputs', function() {
  return Inputs.find();
});

Meteor.publish('open_flags', function(county) {
  if (!county) {
    return [];
  }
  return Flags.find({open:true, service_areas:county._id})
});

Meteor.publish('resources', function() {
    return Resources.find({})
});

Meteor.publish('resources_from_ids', function(ids) {
    return Resources.find({_id:{$in:ids}});
});

Meteor.publish('resources_from_county', function(county) {
  if (!county) {
    return [];
  }
  return Resources.find({service_areas:county._id}, {limit:30});
});

Meteor.publish('resources_from_services', function(services, county) {
  if (!services || !county) {
    return [];
  }
  service_ids = services.map(function(service) {
    return service._id;
  });
  return Resources.find({sub_service_ids:{$in:service_ids}, service_areas:county._id}, {limit:30});
});

Meteor.publish('service_name_route', function(name_route) {
  return Services.find({name_route:name_route});
});

Meteor.publish('sub_services', function() {
  return Services.find({parents:{$exists:true, $ne:null}});
});

//change to incorporate some metric
Meteor.publish('top_services', function() {
  return Services.find({});
});

Meteor.publish("user_roles", function(user_id) {
  return Meteor.users.find({_id:user_id}, {fields:{roles:true}});
});