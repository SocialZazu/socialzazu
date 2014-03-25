// Changes are explicit changes to a resource or service made by someone with the permission level to do so
// {created_time:Int, target_resource_id:String, field:String, target_service_id:String, oldval:String, newval:String, service_adj:{removed:Boolean, _id:String}, marked_complete:Boolean, editor_id:String, new_resource:Boolean}
Changes = new Meteor.Collection('changes');

location_field_change = function(time, location_id, field, oldval, newval,
                                 editor_id) {
  return Changes.insert({created_time:time, target_location_id:location_id,
                         field:field, oldval:oldval, newval:newval,
                         editor_id:editor_id});
}