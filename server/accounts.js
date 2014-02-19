Meteor.startup(function() {
  AccountsEntry.config({
    signupCode: null,
    wrapLinks: true,
    homeRoute: '/',
    dashboardRoute: '/'
  });
});
