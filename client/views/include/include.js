Template.find_me_map.events({
  'click #find_me': function(e, tmpl) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        var center = new google.maps.LatLng(position.coords.latitude,
                                            position.coords.longitude);
        if(center) {
          pan_to(center);
        }
      });
    } else {
      console.log('something failed'); //TODO: tell user
    }
  }
});

session_var_splice = function(session_key, value) {
  var vals = Session.get(session_key);
  var index = vals.indexOf(value);
  if (index > -1) {
    vals.splice(index, 1);
    Session.set(session_key, vals);
  }
};

session_var_push = function(session_key, value) {
  var vals = Session.get(session_key);
  var index = vals.indexOf(value);
  if (index == -1) {
    vals.push(value);
    Session.set(session_key, vals);
  }
}
