// Resources are social services like Therapists, Treatment Centers, Food Banks, etc -
   // {updated_time:Int,
   //  name_route:String,
   //  name:String,
   //  locations: [
   //    location_id:String
   //  ]
   // }
Resources = new Meteor.Collection('resources');

if (Meteor.server) {
  make_resource = function(name, timestamp) {
    var resource = Resources.findOne({name:name});
    if (resource) {
      return resource._id;
    } else {
      name = name.trim()
      var resource_id = Resources.insert(
        {
          name:name, created_time:timestamp,
          name_route:make_name_route(name), locations:[]
        }
      );
      return resource_id;
    }
  }
}