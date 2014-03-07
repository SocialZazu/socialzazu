capitalize = function(st) {
  return st.charAt(0).toUpperCase() + st.slice(1).toLowerCase();
}

make_name_route = function(name) {
  name = name.trim()
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
  return copy.join('-');
}
