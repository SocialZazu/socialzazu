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
