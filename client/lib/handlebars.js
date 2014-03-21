Handlebars.registerHelper("capitalize", function(str) {
  return capitalize(str);
});

Handlebars.registerHelper("is_editing", function() {
  return is_editing_plus();
});

Handlebars.registerHelper("is_required_field", function(field) {
  if (required_fields.indexOf(field.toLowerCase().trim().split(' ').join('_')) > -1) {
    return '*';
  }
  return '';
});
