Meteor.publish('all_users', function() {
  return Meteor.users.find({}, {_id:true, emails:true});
});

Meteor.publish('counties', function() {
  return Counties.find({location_count:{$gt:15}}, {$sort:{location_count:-1}});
});

Meteor.publish('flags_from_user', function(user_id, county) {
  if (!user_id) {
    return null;
  } else if (county) {
    return Flags.find({open:true, user_id:user_id, counties:county});
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
  return Flags.find({open:true, county_id:county._id})
});

Meteor.publish('resource_from_id', function(id) {
  return Resources.find({_id:id});
});

Meteor.publish('locations_from_resource_id_and_county', function(resource_id, county) {
  if (!county) {
    return [];
  } else {
    return Locations.find({resource_id:resource_id, county:county._id});
  }
});

Meteor.publish('locations_need_editing', function(county) {
  if (!county) {
    return [];
  }
  return Locations.find({needs_edit:true, service_area:county._id});
});

Meteor.publish('search_resources_from_county', function(county) {
  if (!county) {
    return [];
  }
  var resource_ids = Locations.find({service_area:county._id}).map(function(location) {
    return location.resource_id;
  });
  return Resources.find({_id:{$in:resource_ids}},
                        {sort:{name:1}});
});

Meteor.publish('locations_from_parent_service', function(service_id, county) {
  if (!service_id || !county) {
    return [];
  }
  sub_service_ids = Services.findOne({_id:service_id}).children;
  if (!sub_service_ids || sub_service_ids.length == 0) {
    return [];
  } else {
    return Locations.find({service_area:county._id,
                           sub_service_ids:{$in:sub_service_ids}});
  }
});

Meteor.publish('locations_from_services', function(services, county) {
  if (!services || services.length == 0 || !county) {
    return [];
  }
  service_ids = services.map(function(service) {
    return service._id;
  });
  return Locations.find({service_area:county._id,
                         sub_service_ids:{$in:service_ids}});
});

Meteor.publish('service_name_route', function(name_route) {
  return Services.find({name_route:name_route});
});

Meteor.publish('services', function() {
  return Services.find();
});

Meteor.publish('sub_services', function() {
  return Services.find({parents:{$exists:true, $ne:null}});
});

Meteor.publish('super_services', function() {
  return Services.find({children:{$exists:true}});
});

//TODO: change to incorporate some metric
Meteor.publish('top_services', function() {
  return Services.find({});
});

Meteor.publish("user_roles", function(user_id) {
  return Meteor.users.find({_id:user_id}, {fields:{roles:true}});
});