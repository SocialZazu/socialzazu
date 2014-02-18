Meteor.startup( function() {
  Accounts.ui.config({
      passwordSignupFields: 'EMAIL_ONLY'
  });
});

// AccountsEntry.config({
//     privacyUrl: '/privacy-policy',
//     termsUrl: '/terms-of-use',
//     passwordSignupFields: 'USERNAME_AND_EMAIL',
//     homeRoute: '/',
//     dashboardRoute: '/',
//     profileRoute: '/',
//     showSignupCode: false
// });
