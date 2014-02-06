//All editing permissions go through the User model that comes in Meteor

// Resources are social services like Therapists, Treatment Centers, Food Banks, etc -
//    {name:String, url:String, street:e.g. "18th St", streetNumber:e.g. "2500", phone:String,
//     email:String, contactPerson:String, shortDescription:String, longDescription:String,
//     services:[service_id], lat:String, lng:Number, nameRoute:String, city:String, state:String, zipcode:String}
Resources = new Meteor.Collection('resources');

// Clients are people who use the social services. Need to implement
Clients = new Meteor.Collection('clients');

// Tokens are from the app //Need to implement
Tokens = new Meteor.Collection('tokens');

// Caretakers are social workers, lawyers, whatever that can submit clients
// {name:String, phone:String, email:String, openTokens:[token_id], closedTokens:[token_id], clients:[client_id]}
Caretakers = new Meteor.Collection('caretakers');

// Services are types of resources. Many-to-Many with Resources
// {name:String, count:Integer, resources:[], nameRoute:String}
Services = new Meteor.Collection('services');