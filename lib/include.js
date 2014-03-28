array_diff = function(A, B) {
  //array diff of A - B
  var B_ids = {}
  B.forEach(function(obj){
    B_ids[obj] = 1;
  });
  return A.filter(function(obj) {
    return !(obj in B_ids);
  });
}

array_diff_ids = function(A, B) {
  var B_ids = {}
  B.forEach(function(obj) {
    B_ids[obj['id']] = 1;
  });
  return A.filter(function(obj) {
    return !(obj['id'] in B_ids);
  });
}

capitalize = function(st) {
  if (!st) {
    return '';
  }
  return st.charAt(0).toUpperCase() + st.slice(1);
}

make_name_route = function(name) {
  var count = Resources.find({name:name}).count();
  var parts = name.split(' ')
  var copy = [];
  for (var pos in parts) {
    var part = parts[pos];
    if (part == '') {
      continue;
    } else {
      var part_split = part.split('.');
      for (var sub_pos in part_split) {
        var sub_part = part_split[sub_pos];
        copy.push(capitalize(sub_part));
      }
    }
  }
  if (count > 0) {
    copy.push(count.toString());
  }
  return copy.join('-');
}

map_arr_to_object_arr = function(arr, key) {
  ret = [];
  if (!arr) {
    return [{}];
  }
  arr.forEach(function(elem) {
    var dict = {};
    dict[key] = elem;
    ret.push(dict);
  });
  return ret;
}

required_fields = ['resource_name', 'location_name', 'street_0', 'city_0',
                   'zipcode_0', 'contact_name', 'contact_title',
                   'description', 'short_desc', 'email']
SIDEBAR_NUM = 6;