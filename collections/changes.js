// Changes are explicit changes to a resource or service made by someone with the permission level to do so
// {created_time:Int, target_resource_id:String, field:String, target_service_id:String, old:String, new:String, service_adj:{removed:Boolean, _id:String}, marked_complete:Boolean, editor_id:String, new_resource:Boolean}
Changes = new Meteor.Collection('changes');
