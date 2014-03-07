Meteor.methods({
  assign_geocode: function(resource_id, i, lat, lng) {
    Resources.update({_id:resource_id}, {$set:{'locations.address.$i.spatial_location':{'lat':lat, 'lng':lng}}});
  },

  add_service_to_resource: function(resource_id, service_id) {
    //assuming service_id is a sub for now...
    Resources.update({_id:resource_id}, {$addToSet:{sub_service_ids:service_id}});
  },

  flag_resource: function(resource_id, user_id) {
    var timestamp = (new Date()).getTime();
    var counties = Resources.findOne({_id:resource_id}).locations.service_areas
    flag_id = Flags.insert({created_time:timestamp, resource_id:resource_id, user_id:user_id, open:true, closed_time:null, counties:service_areas});
  },

  mark_complete: function(resource_id, user_id) {
    var timestamp = (new Date()).getTime();
    Resources.update({_id:resource_id}, {$set:{needs_edit:false}})
    Flags.update({resource_id:resource_id},
                 {$set:
                  {closed_time:timestamp, open:false,
                   resource_id:resource_id, user_id:user_id}
                 }
                );
  },

  remove_all_services: function() {
        return Service.remove({});
  },

  remove_all_resources: function() {
    return Resources.remove({});
  },

  remove_service_from_resource: function(resource_id, service_id) {
    Resources.update({_id:resource_id}, {$pull:{sub_service_ids:service_id}})
  }
});