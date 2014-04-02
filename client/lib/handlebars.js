Handlebars.registerHelper("capitalize", function(str) {
  return capitalize(str);
});

Handlebars.registerHelper("is_editing", function(id) {
  if (id) {
    return Session.get('is_editing') == id;
  }
  return is_editing_plus();
});

Handlebars.registerHelper("is_required_field", function(field) {
  if (required_fields.indexOf(field.toLowerCase().trim().split(' ').join('_')) > -1) {
    return '*';
  }
  return '';
});

Handlebars.registerHelper("lowercase", function(str) {
  return str.toLowerCase();
});
