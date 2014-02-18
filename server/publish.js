Meteor.publish('services', function() {
    return Services.find({});
});

//change to incorporate some metric
Meteor.publish('top_services', function() {
  return Services.find({});
});

Meteor.publish('resources_from_top_services', function() {
  return Resources.find({});
});

Meteor.publish('resources', function() {
    return Resources.find({}, {fields: {contactPerson:false}});
});

Meteor.publish('resources_from_ids', function(ids) {
    return Resources.find({_id:{$in:ids}});
});

//change to using zipcode
Meteor.publish('resources_in_zipcode', function() {
    return Resources.find({});
});

Meteor.publish('resources_from_services', function(services) {
    service_ids = [];
    _.each(services, function(service) {
        service_ids.push(service._id);
    });
    return Resources.find({services:{$in:service_ids}}, {fields: {contactPerson:false}});
});

Meteor.publish('flags_from_user', function(user_id) {
    if (!user_id) {
        return null;
    } else {
        return Flags.find({open:true, user_id:user_id});
    }
});