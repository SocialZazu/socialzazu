Meteor.methods({
    assignGeocode: function(resource_id, lat, lng) {
        console.log('r, lat, lng: ' + resource_id + ',' + lat + ',' + lng);
        Resources.update({_id:resource_id}, {$set:{'lat':lat, 'lng':lng}});
    },

    removeAllServices: function() {
        return Service.remove({});
    },

    removeAllResources: function() {
        return Resources.remove({});
    },
});