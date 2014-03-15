// Inputs are sets of field inputs, all dropdown, checkbox, or number for now.
// field_name examples: list, e.g "Population":["HIV", "Mental Health", ...]
// {name:String (e.g. "Disability"), placeholder=String (e.g. "Select Population Served"), list=[String] (e.g. ["Citizen", "Permanent Resident", "Temporary Visa", "Undocumented"] for Citizenship
Inputs = new Meteor.Collection('inputs');