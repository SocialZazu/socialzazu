Meteor.startup( function() {
  Accounts.ui.config({
      passwordSignupFields: 'EMAIL_ONLY'
  });
});

AccountsEntry.config({
  privacyUrl: '/privacy-policy',
  termsUrl: '/terms-of-use',
  passwordSignupFields: 'EMAIL_ONLY', //TODO: allow username as well
  homeRoute: '/',
  dashboardRoute: '/',
  profileRoute: '/',
  showSignupCode: false
});
