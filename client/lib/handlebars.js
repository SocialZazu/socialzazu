Handlebars.registerHelper("capitalize", function(str) {
  return capitalize(str);
});

Handlebars.registerHelper("is_editing", function() {
  return is_editing_plus();
});