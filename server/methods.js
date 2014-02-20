Meteor.methods({
  assign_geocode: function(resource_id, lat, lng) {
    Resources.update({_id:resource_id}, {$set:{'lat':lat, 'lng':lng}});
  },

  flag_resource: function(resource_id, user_id) {
    var timestamp = (new Date()).getTime();
    flag_id = Flags.insert({timeCreated:timestamp, resource_id:resource_id, user_id:user_id});
  },

  remove_all_services: function() {
        return Service.remove({});
  },

  remove_all_resources: function() {
    return Resources.remove({});
  },
});