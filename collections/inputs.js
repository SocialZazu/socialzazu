// Inputs are sets of field inputs
// field_name examples: list, e.g "Legal Status":["dropdown", ["Citizen", "Permanent Resident", ...]], "Zipcode":["number", "94131"]
// {type:[String] (e.g. ["patient"]), dom:String (e.g. "dropdown"), name:String (e.g. "Disability"), placeholder=String (e.g. "25" for Age), list=[String] (e.g. ["Citizen", "Permanent Resident", "Temporary Visa", "Undocumented"] for Citizenship
Inputs = new Meteor.Collection('inputs');