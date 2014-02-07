Meteor.methods({
    assignGeocode: function(resource_id, lat, lng) {
        Resources.update({_id:resource_id}, {$set:{'lat':lat, 'lng':lng}});
    },

    flagResource: function(resource_id, user_id) {
        var timestamp = (new Date()).getTime();
        flag_id = Flags.insert({timeCreated:timestamp, resource_id:resource_id, user_id:user_id});
    },

    removeAllServices: function() {
        return Service.remove({});
    },

    removeAllResources: function() {
        return Resources.remove({});
    },
});