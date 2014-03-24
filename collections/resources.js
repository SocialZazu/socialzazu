// Resources are social services like Therapists, Treatment Centers, Food Banks, etc -
   // {updated_time:Int,
   //  name_route:String,
   //  name:String,
   //  locations: [
   //    {
   //      name:String,
   //      more_name:String //more info about name
   //      contact: [
   //        {
   //          name:String,
   //          title:String
   //        }
   //      ],
   //      description:String,
   //      short_desc:String,
   //      address: [
   //        {
   //          street:String,
   //          city:String,
   //          state:String,
   //          zip:String,
   //          type:String (physical / mailing),
   //          coordinates: {
   //            lat:String,
   //            lng:String
   //          }
   //        },
   //      ],
   //      hours: {
   //        mon:{open_time:Int (military), close_time:Int, closed:Boolean},
   //        tue:{open_time:Int (military), close_time:Int, closed:Boolean},
   //        ...
   //        sat:{open_time:Int (military), close_time:Int, closed:Boolean},
   //        sun:{open_time:Int (military), close_time:Int, closed:Boolean},
   //      },
   //      transportation:String,
   //      accessibility: [
   //        String (e.g. restroom / elevator / wheelchair / ramp / special parking / deaf (interpreter or deaf) / blind (blind or braille))
   //      ],
   //      languages: [
   //        String
   //      ],
   //      phones: [
   //        {
   //          number:String,
   //          hours:String,
   //        }
   //      ],
   //      url:String,
   //      email:String
   //      audience:String,
   //      eligibility:String,
   //      fees:String,
   //      how_to_apply:String,
   //      service_area:String (county_id)
   //      sub_service_ids:[
   //        String (service_ids)
   //      ],
   //    }
   //  ]
   // }
Resources = new Meteor.Collection('resources');

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

  make_internet = function(url, email) {
    return {url:url, email:email}
  }

  make_location = function(timestamp, contacts, description, short_desc,
                           addresses, hours, accessibility, languages,
                           sub_service_ids, phones, url, email, audience,
                           eligibility, fees, how_to_apply, service_area,
                           category_specific_inputs) {
    return {created_time:timestamp,
            contacts:contacts, description:description,
            short_desc:short_desc, address:addresses,
            hours:hours, accessibility:accessibility,
            languages:languages, sub_service_ids:sub_service_ids,
            phones:phones, url:url, email:email, audience:audience,
            eligibility:eligibility, fees:fees, how_to_apply:how_to_apply,
            service_area:service_area,
            category_specific_inputs:category_specific_inputs
           }
  }

  make_resource = function(name, timestamp, location) {
    var resource = Resources.findOne({name:name});
    if (resource) {
      return resource._id;
    } else {
      name = name.trim()
      var resource_id = Resources.insert(
        {
          name:name, created_time:timestamp,
          name_route:make_name_route(name), locations:location
        }
      );
      return resource_id;
    }
  }

  set_update_resource_obj = function(id, obj) {
    Resources.update({_id:id}, {$set:obj});
  }

  set_update_resource_with_str = function(id, update_str, value) {
    var update_query = {};
    update_query[update_str] = value;
    set_update_resource_obj(id, update_query);
  }
}