// Locations are instances of a resource
// {
//   resource_id:String
//   name:String,
//   name_route:String,
//   more_name_info:String //more info about name
//   contact: [
//     {
//       name:String,
//       title:String
//     }
//   ],
//   description:String,
//   short_desc:String,
//   address: [
//     {
//       street:String,
//       city:String,
//       state:String,
//       zip:String,
//       type:String (physical / mailing),
//       coordinates: {
//         lat:String,
//         lng:String
//       }
//     },
//   ],
//   hours: {
//     mon:{open_time:Int (military), close_time:Int, closed:Boolean},
//     tue:{open_time:Int (military), close_time:Int, closed:Boolean},
//       ...
//       sat:{open_time:Int (military), close_time:Int, closed:Boolean},
//     sun:{open_time:Int (military), close_time:Int, closed:Boolean},
//   },
//   transportation:String,
//   accessibility: [
//     String (e.g. restroom / elevator / wheelchair / ramp / special parking / deaf (interpreter or deaf) / blind (blind or braille))
//   ],
//   languages: [
//     String
//   ],
//   phones: [
//     {
//       number:String,
//       hours:String,
//     }
//   ],
//   url:String,
//   email:String
//   audience:String,
//   eligibility:String,
//   fees:String,
//   how_to_apply:String,
//   service_area:String (county_id)
//   sub_service_ids:[
//     String (service_ids)
//   ],
// }
Locations = new Meteor.Collection('locations');


if (Meteor.server) {
  make_contact = function(name, title) {
    return {name:name, title:title};
  }

  make_address = function(street, city, state, zipcode, type, lat, lng) {
    return {street:street, city:city, state:state, zipcode:zipcode,
            type:type, coordinates:{lat:lat, lng:lng}};
  }

  make_phone = function(number, hours, type) {
    return {number:number, hours:hours, type:type};
  }

  make_location = function(name, more_name_info, contacts, description,
                           short_desc, addresses, hours, accessibility,
                           languages, sub_service_ids, phones, url,
                           email, audience, eligibility, fees, how_to_apply,
                           service_area, category_specific_inputs, resource_id, needs_edit) {
    var location = Locations.findOne({resource_id:resource_id, name:name});
    if (location) {
      return location._id;
    } else {
      category_specific_inputs = category_specific_inputs || {};
      return Locations.insert({
        name:name, name_route:make_name_route(name),
        more_name_info:more_name_info, contacts:contacts,
        description:description, short_desc:short_desc, address:addresses,
        hours:hours, accessibility:accessibility,
        languages:languages, sub_service_ids:sub_service_ids,
        phones:phones, url:url, email:email, audience:audience,
        eligibility:eligibility, fees:fees, how_to_apply:how_to_apply,
        service_area:service_area, category_specific_inputs:category_specific_inputs,
        resource_id:resource_id, needs_edit:needs_edit
      });
    }
  }

  set_update_location_obj = function(id, obj) {
    Locations.update({_id:id}, {$set:obj});
  }

  set_update_location_with_str = function(id, update_str, value) {
    var update_query = {};
    update_query[update_str] = value;
    set_update_location_obj(id, update_query);
  }
}
