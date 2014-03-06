Meteor.methods({
  assign_geocode: function(resource_id, i, lat, lng) {
    Resources.update({_id:resource_id}, {$set:{'locations.address.$i.spatial_location':{'lat':lat, 'lng':lng}}});
  },

  flag_resource: function(resource_id, user_id) {
    var timestamp = (new Date()).getTime();
    var counties = Resources.findOne({_id:resource_id}).locations.service_areas
    flag_id = Flags.insert({created_time:timestamp, resource_id:resource_id, user_id:user_id, open:true, closed_time:null, counties:service_areas});
  },

  remove_all_services: function() {
        return Service.remove({});
  },

  remove_all_resources: function() {
    return Resources.remove({});
  },
});