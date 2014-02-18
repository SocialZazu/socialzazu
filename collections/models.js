//All editing permissions go through the User model that comes in Meteor

// Resources are social services like Therapists, Treatment Centers, Food Banks, etc -
//    {name:String, url:String, street:e.g. "18th St", streetNumber:e.g. "2500", phone:String,
//     email:String, contactPerson:String, shortDescription:String, longDescription:String,
//     services:[service_id], lat:String, lng:Number, nameRoute:String, city:String, state:String, zipcode:String, timeCreated:Int, timeUpdated:Int, hours:String}
Resources = new Meteor.Collection('resources');

// Patients are people who use the social services. Need to implement
Patients = new Meteor.Collection('clients');

// Tokens are from the app //Need to implement
Tokens = new Meteor.Collection('tokens');

// Caretakers are social workers, lawyers, whatever that can submit clients
// {name:String, phone:String, email:String, openTokens:[token_id], closedTokens:[token_id], clients:[client_id], timeCreated:Int}
Caretakers = new Meteor.Collection('caretakers');

// Services are types of resources. Many-to-Many with Resources
// {name:String, count:Integer, resources:[], nameRoute:String, timeCreated:Int, patient_inputs:{field_name:[type_expected, example]}, resource_inputs:{field_name:type_expected}, children:[], isParent:Boolean}
Services = new Meteor.Collection('services');

// Flags are alerts that something has been flagged for changing
// {timeCreated:Int, timeClosed:Int, resource_id:String, user_id:String}
Flags = new Meteor.Collection('flags');

// Changes are explicit changes made by someone with the permission level to do so
// {timeMade:Int, resource_id:String, field:String, service_id:String, old:String, new:String}
Changes = new Meteor.Collection('changes');
