// Resources are social services like Therapists, Treatment Centers, Food Banks, etc -
//    {updated_time:Int, name_route:String,
//     name:String,
//     locations: [
//       {
//         name:String,
//         contacts: [
//           {
//             name:String,
//             title:String
//           }
//         ],
//         description:String,
//         short_desc:String,
//         address: [
//           {
//             street:String,
//             city:String,
//             state:String,
//             zip:String,
//             type:String (physical / mailing),
//             geo: { //Not in Ohana Spec
//               lat:String,
//               lng:String
//             }
//           },
//         ],
//         service_poc: [
//           String (e.g. Kathy Kinkaid (kkinkaid@mpslc.com))
//         ],
//         hours: { //Ohana Spec only has String here
//           m:{open_time:Int (military), close_time:Int, closed:Boolean}
//         },
//         transportation:String,
//         accessibility: [
//           String (e.g. restroom / wheelchair / ramp / special parking / deaf (interpreter or deaf) / blind (blind or braille))
//         ],
//         languages: [
//           String
//         ],
//         phones: [
//           {
//             number:String,
//             hours:String,
//             type:String (voice / fax)
//           }
//         ],
//         internet_resource: [
//           url:String,
//           email:String
//         ],
//         services: [
//           {
//             audience:String,
//             eligibility:String,
//             fees:String,
//             how_to_apply:String,
//             service_areas:[
//               String (county_ids)
//             ],
//             service_id:String, //Arbitrarily, at most 1, Not in Ohana... replacing their keywords, reason being this is finer control
//             sub_service_ids:[ //Arbitrarily, at most 3, Not in Ohana
//               String (service_ids)
//             ],
//             wait:String,
//             funding_sources: [
//               String (e.g. Fees)
//             ]
//           }
//         ]
//       }
//     ]
//    }
Resources = new Meteor.Collection('resources');

make_contact = function(name, title) {
  return {name:name, title:title};
}

make_address = function(street, city, state, zipcode, type, lat, lng) {
  return {street:street, city:city, state:state, zipcode:zipcode,
          type:type, spatial_location:{lat:lat, lng:lng}};
}

make_phone = function(number, hours, type) {
  return {number:number, hours:hours, type:type};
}

make_internet = function(url, email) {
  return {url:url, email:email}
}

make_services = function(audience, eligibility, fees, how_to_apply) {
  return {audience:audience, eligibility:eligibility, fees:fees,
          how_to_apply:how_to_apply};
}

make_location = function(timestamp, contacts, description, short_desc,
                         addresses, service_poc, hours,
                         transportation, accessibility, languages,
                         phones, internet_resource, services) {
  return {created_time:timestamp,
          contacts:contacts, description:description,
          short_desc:short_desc, address:addresses, service_poc:[service_poc],
          hours:hours, transportation:transportation, languages:languages,
          accessibility:accessibility, phones:phones, services:services,
          internet_resource:internet_resource
         }
}

make_resource = function(name, timestamp, location, service_areas, sub_services) {
  var resource = Resources.findOne({name:name});
  if (resource) {
    return resource._id;
  } else {
    var resource_id = Resources.insert(
      {
        name:name, created_time:timestamp, name_route:make_name_route(name),
        locations:location, service_areas:service_areas, sub_services:sub_services
      }
    );
    return resource_id;
  }
}