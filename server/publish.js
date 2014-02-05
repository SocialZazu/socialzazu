Meteor.publish('services', function() {
    return Services.find({},
});

Meteor.publish('resources', function() {
    return Resources.find({}, {fields: {contactPerson:false}}):
});

Meteor.publish('resourcesFromService', function(service_id) {
    return Resources.find({services:{$in:[service_id]}}, {fields: {contactPerson:false}});
});

Meteor.publish('resourcesFromServices', function(services) {
    service_ids = [];
    _.each(services, function(service) {
        service_ids.push(service._id);
    };
    return Resources.find({services:{$in:service_ids}}, {fields: {contactPerson:false}});
});