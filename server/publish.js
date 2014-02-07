Meteor.publish('services', function() {
    return Services.find({});
});

Meteor.publish('resources', function() {
    return Resources.find({}, {fields: {contactPerson:false}});
});

Meteor.publish('resourcesFromIDs', function(ids) {
    return Resources.find({_id:{$in:ids}});
});

//change to using location
Meteor.publish('resourcesNearMe', function() {
    return Resources.find({});
});

Meteor.publish('resourcesFromServices', function(services) {
    service_ids = [];
    _.each(services, function(service) {
        service_ids.push(service._id);
    });
    return Resources.find({services:{$in:service_ids}}, {fields: {contactPerson:false}});
});

Meteor.publish('flagsFromUser', function(user_id) {
    if (!user_id) {
        return null;
    } else {
        flag_ids = [];
        return Flags.find({open:true, user_id:user_id});
    }
});