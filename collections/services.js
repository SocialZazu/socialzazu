// Services are types of resources. Many-to-Many with Resources
// {name:String, resources:[], name_route:String, creation_time:Int, updated_time:Int, patient_inputs:[input_ids] resource_inputs:[input_ids], children:[], parent:service_id or null if a parent}
Services = new Meteor.Collection('services');

make_parent_service = function(name, creation_time) {
  name = name.trim();
  var service = Services.findOne({name:name});
  if (service) {
    return service._id;
  } else {
    service_id = Services.insert({name:name, resources:[], name_route:make_name_route(name), creation_time:creation_time, children:[], parent:null});
    return service_id
  }
}

make_child_service = function(name, creation_time, parent_id) {
  name = name.trim();
  var service = Services.findOne({name:name});
  if (service) {
    Services.update({_id:service._id}, {$addToSet:{parents:parent_id}});
    service_id = service._id;
  } else {
    service_id = Services.insert({name:name, resources:[], name_route:make_name_route(name), creation_time:creation_time, parents:[parent_id]});
  }
  Services.update({_id:parent_id}, {$addToSet:{children:service_id}});
  return service_id
}