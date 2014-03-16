var make_services_and_inputs = function(timestamp) {
  /* Across Parent Services */
  var transit_input = Inputs.insert({name:"Public Transit Accessible", type:"checkbox", field:"transit_accessible"});
  var max_stay = Inputs.insert({name:"Max Stay (days)", type:"number", field:"max_stay"});
  var citizenship = Inputs.insert({name:"Legal Status", type:"dropdown", field:"legal_status", list:["Citizen", "Permanent Resident", "Temporary Visa", "Undocumented"]})
  var smoking = Inputs.insert({name:"Smoking", type:"checkbox", field:"smoking"});
  var pets = Inputs.insert({name:"Pets", type:"checkbox", field:"pets"});
  var parking = Inputs.insert({name:"Parking", type:"checkbox", field:"parking"});
  var insurance = Inputs.insert({name:"Insurance", type:"dropdown", list:["MediCal", "Medicare", "None", "HealthPAC", "HealthySF"], field:"insurance"});
  var income_limit = Inputs.insert({name:"Income Limit ($)", field:"income", type:"number"});

  /* Housing */
  var housing_pop = Inputs.insert({name:"Population (Housing)", type:"dropdown", field:"housing_population", list:["HIV", "Mental Health", "Sober Living", "Battered Women", "Families with Minors", "Single Men", "Single Women", "Veterans", "Elderly"]})
  var housing_restrict = Inputs.insert({name:"Restricted", type:"dropdown", field:"housing_deny", list:["Male", "Female", "Children", "Current Drug Use", "Current Alcohol Use", "Criminal Record"]})
  var section_8 = Inputs.insert({name:"Section 8", field:"section_8", type:"checkbox"});
  var max_occupancy = Inputs.insert({name:"Max Occupancy", field:"max_occupancy", type:"number"});
  var credit_check = Inputs.insert({name:"Credit Check?", field:"credit_check", type:"checkbox"});
  var kitchen = Inputs.insert({name:"Kitchen", field:"kitchen", type:"checkbox"});
  var fridge = Inputs.insert({name:"Fridge", field:"fridge", type:"checkbox"});

  /* Food */
  var food_options = Inputs.insert({name:"Options", field:"food_options", type:"dropdown", list:["Vegetarian", "Vegan", "Gluten-Free"]})
  var minor_children = Inputs.insert({name:"Minor Children", field:"minor_children", type:"checkbox", autocheck:true});
  var days_supply = Inputs.insert({name:"Food Supply (days)", field:"food_supply", type:"number"});
  var home_meal_pop = Inputs.insert({name:"Population", field:"home_meal_pop", type:"dropdown", list:["Elderly", "Other"]});
  var meals_served = Inputs.insert({name:"Meals", field:"meals_served", type:"dropdown", list:["Breakfast", "Lunch", "Dinner", "Snacks"]});
  var accepts_fs = Inputs.insert({name:"Food Stamps", field:"food_stamps", type:"checkbox"});
  var accepts_wic = Inputs.insert({name:"WIC", field:"wic", type:"checkbox"});

  /* Transportation */
  var home_pickup = Inputs.insert({name:"Home Pickup", field:"home_pickup", type:"checkbox"})
  var advance_notice = Inputs.insert({name:"Advance Notice (hours)", field:"advance_notice", type:"number"});
  var disability_req = Inputs.insert({name:"Disability Required", field:"disability_required", checkbox:true});

  /* Financial Aid */
  var finaid_pop = Inputs.insert({name:"Population", type:"dropdown", field:"finaid_population", list:["Disabled", "Victim of Crime", "Families with Minors", "Other", "Veterans", "Elderly"]});
  var max_amt = Inputs.insert({name:"Max Amount ($)", field:"max_amt_money", type:"number"})

  /* Medical */
  var walkins = Inputs.insert({name:"Walk-In Accepted", type:"checkbox", field:"walk_in"});
  var referral = Inputs.insert({name:"Referral Needed", type:"checkbox", field:"referral_needed"});

  /* Health Insurance */
  var obamacare = Inputs.insert({name:"ACA Assistance", type:"checkbox", field:"aca_assist"});
  var mmhp = Inputs.insert({name:"Medicare / Medicaid / HealthPac Assistance", type:"checkbox", field:"mmhp_assist"});
  var ghc = Inputs.insert({name:"Health Care Application Assistance", type:"checkbox", field:"ghc_assist"});

  /* Employment */
  var veteran = Inputs.insert({name:"Veteran Status", type:"checkbox", field:"veteran_status"});

  /* Legal Aid */
  var client_age = Inputs.insert({name:"Age Group", type:"dropdown", list:["All", "Youth", "Adults", "Elderly"], field:"client_age_group"});
  var client_pop = Inputs.insert({name:"Population", type:"dropdown", list:["Seniors", "Veterans", "LGBTQ", "Homeless", "Women", "Children", "Families", "Low-Income", "Tenants", "HIV"], field:"legal_population"})
  var disability = Inputs.insert({name:"Disability Condition", type:"dropdown", list:["Physical Disability", "Mental Disability", "No Disability", "Chronic Illness", "Acute Illness"], field:"disability_condition"});

  /* Tax */
  var percent_taken = Inputs.insert({name:"Fee (%)", type:"number", field:"fee_percent"});

  //make parents
  var s_housing_id = make_parent_service('Housing', timestamp, null, resource_inputs=[housing_pop, housing_restrict]);
  var s_food_id = make_parent_service('Food Providers', timestamp, null, resource_inputs=[food_options]);
  var s_trans_id = make_parent_service('Transportation', timestamp, null, resource_inputs=[home_pickup, advance_notice, disability_req]);
  var s_finaid_id = make_parent_service('Financial Assistance', timestamp, null, resource_inputs=[finaid_pop, max_amt]);
  var s_medical_id = make_parent_service('Medical Care', timestamp, null, resource_inputs=[walkins, referral, insurance]);
  var s_health_insurance_id = make_parent_service('Health Insurance', timestamp, null, resource_inputs=[client_age, income_limit]);
  var s_employment_id = make_parent_service('Employment', timestamp);
  var s_pediatrics_id = make_parent_service('Pediatric Care', timestamp);
  var s_suppgroups_id = make_parent_service('Support Groups', timestamp);

  var s_housinglegal_id = make_parent_service('Housing Legal Assistance', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_consumerlaw_id = make_parent_service('Consumer Law', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_criminallaw_id = make_parent_service('Criminal Law', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_dvlaw_id = make_parent_service('Domestic Violence Law', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_employmentlaw_id = make_parent_service('Employment Law', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_estatelaw_id = make_parent_service('Estate Law', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_familylaw_id = make_parent_service('Family Law', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_civillaw_id = make_parent_service('Civil Law', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_personalinjury_id = make_parent_service('Personal Injury', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_medicalcovlaw_id = make_parent_service('Legal Medical Coverage', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_immigrationlaw_id = make_parent_service('Immigration Law', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);
  var s_policemisconduct_id = make_parent_service('Police Misconduct', timestamp, null, resource_inputs=[client_age, client_pop, disability, citizenship, insurance]);

  var s_tax_id = make_parent_service('Tax Help', timestamp, null, resource_inputs=[percent_taken, income_limit]);
  var s_materialgoods_id = make_parent_service('Material Goods', timestamp);

  /*make children*/

  //housing
  var c_shelter_id = make_child_service('Shelters', timestamp, s_housing_id, init_priority=6, resource_inputs=[max_stay, transit_input]);
  var c_permhouse_id = make_child_service('Permanent Housing', timestamp, s_housing_id, null,
                                          resource_inputs=[citizenship, section_8, max_occupancy, income_limit, credit_check, smoking, pets, parking, kitchen, fridge]);
  var c_transhouse_id = make_child_service('Transitional Housing', timestamp, s_housing_id,
                                          null, resource_inputs=[citizenship, max_stay, income_limit, smoking, pets, parking, kitchen, fridge]);

  //food
  var c_wic_id = make_child_service('WIC', timestamp, s_food_id, null, resource_inputs=[minor_children]);
  var c_pantry_id = make_child_service('Food Pantry', timestamp, s_food_id, init_priority=1, resource_inputs=[days_supply]);
  var c_hotmeals_id = make_child_service('Hot Meals', timestamp, s_food_id, init_priority=2);
  var c_homedeliv_id = make_child_service('Home Meal Delivery', timestamp, s_food_id, null, resource_inputs=[home_meal_pop, meals_served]);
  var c_grocery_id = make_child_service('Grocery Stores', timestamp, s_food_id, null, resource_inputs=[accepts_fs, accepts_wic]);
  var c_resta_id = make_child_service('Restaurants', timestamp, s_food_id, null, resource_inputs=[accepts_fs, accepts_wic]);

  //trans
  var c_trans_id = make_child_service('Transportation Service', timestamp, s_trans_id)

  //finaid
  var c_cash_id = make_child_service('Cash Aid', timestamp, s_finaid_id);
  var c_stamps_id = make_child_service('Food Stamps', timestamp, s_finaid_id);
  var c_utilities_id = make_child_service('Utilities', timestamp, s_finaid_id);
  var c_emercash_id = make_child_service('Emergency Cash Help', timestamp, s_finaid_id);
  var c_emerrent_id = make_child_service('Emergency Rent Help', timestamp, s_finaid_id);
  var c_secdepo_id = make_child_service('Security Deposit Help', timestamp, s_finaid_id);

  //medical
  var c_pcp_id = make_child_service('PCP', timestamp, s_medical_id);
  var c_specialty_id = make_child_service('Specialty Care', timestamp, s_medical_id);
  var c_dental_id = make_child_service('Dental', timestamp, s_medical_id);
  var c_mental_id = make_child_service('Mental Health', timestamp, s_medical_id);
  var c_opt_id = make_child_service('Optometry', timestamp, s_medical_id);
  var c_substance_id = make_child_service('Treatment Center', timestamp, s_medical_id, init_priority=4);
  var c_rehab_id = make_child_service('Rehab', timestamp, s_medical_id);
  var c_hiv_id = make_child_service('HIV', timestamp, s_medical_id);

  //health insur
  var c_aca_id = make_child_service('Affordable Care Assistance', timestamp, s_health_insurance_id);
  var c_hia_id = make_child_service('Health Insurance Application', timestamp, s_health_insurance_id);
  var c_mmhapp_id = make_child_service('Medicare Medicaid HealthPAC', timestamp, s_health_insurance_id);

  //employment
  var c_jobtrain_id = make_child_service('Job Training', timestamp, s_employment_id, null, resource_inputs=[veteran, citizenship]);
  var c_jobfind_id = make_child_service('Employment Search', timestamp, s_employment_id, null, resource_inputs=[veteran, citizenship]);
  var c_jobproblem_id = make_child_service('Employment Problems', timestamp, s_employment_id);

  //tax
  var c_nonprof_id = make_child_service('Nonprofit Agencies', timestamp, s_tax_id);
  var c_events_id = make_child_service('Events', timestamp, s_tax_id);

  //materialgoods
  var c_matgoods_id = make_child_service('Material Goods Service', timestamp, s_materialgoods_id)

  //support groups
  var c_hiv_id = make_child_service('HIV', timestamp, s_suppgroups_id);
  var c_vets_id = make_child_service('Veterans', timestamp, s_suppgroups_id);
  var c_color_id = make_child_service('Men of Color', timestamp, s_suppgroups_id);
  var c_family_id = make_child_service('Family Support', timestamp, s_suppgroups_id);
  var c_domv_id = make_child_service('Domestic Violence', timestamp, s_suppgroups_id);
  var c_sexa_id = make_child_service('Sexual Assault', timestamp, s_suppgroups_id);
  var c_shelter_id = make_child_service('Shelters', timestamp, s_suppgroups_id);

  //pediatrics
  var c_childcare_id = make_child_service('Child Care', timestamp, s_pediatrics_id);
  var c_teens_id = make_child_service('Teens', timestamp, s_pediatrics_id);
  var c_fosters_id = make_child_service('Foster Youth', timestamp, s_pediatrics_id);
  var c_parenting_id = make_child_service('Teen Parenting', timestamp, s_pediatrics_id);
  var c_pregnant_id = make_child_service('Pregnant Women', timestamp, s_pediatrics_id);
  var c_specialneeds_id = make_child_service('Special Needs Children', timestamp, s_pediatrics_id);
  var c_five_id = make_child_service('First Five Years', timestamp, s_pediatrics_id);
  var c_familycouns_id = make_child_service('Family Counseling', timestamp, s_pediatrics_id);

  //housinglegal
  var c_tenant_id = make_child_service("Tenant's Rights", timestamp, s_housinglegal_id);
  var c_eviction_id = make_child_service("Eviction Defense", timestamp, s_housinglegal_id);
  var c_homeowner_id = make_child_service("Homeowner Issues", timestamp, s_housinglegal_id);

  //consumerlaw
  make_child_service("Consumer Debt", timestamp, s_consumerlaw_id);
  make_child_service("Consumer Scam", timestamp, s_consumerlaw_id);
  make_child_service("Medical Bills", timestamp, s_consumerlaw_id);
  make_child_service("Bankruptcy", timestamp, s_consumerlaw_id);
  make_child_service("Identity Theft", timestamp, s_consumerlaw_id);
  make_child_service("Car Repossession", timestamp, s_consumerlaw_id);

  //criminal law
  make_child_service("Parole Probation", timestamp, s_criminallaw_id);
  make_child_service("Record Expungement", timestamp, s_criminallaw_id);
  make_child_service("Youth Criminal Defense", timestamp, s_criminallaw_id);

  //domestic violence
  make_child_service("Restraining Order", timestamp, s_dvlaw_id);
  make_child_service("Shelters", timestamp, s_dvlaw_id);

  //employment law
  make_child_service("Workers Compensation", timestamp, s_employmentlaw_id);
  make_child_service("Wrongful Termination", timestamp, s_employmentlaw_id);
  make_child_service("Discrimination", timestamp, s_employmentlaw_id);
  make_child_service("Unemployment Benefits", timestamp, s_employmentlaw_id);
  make_child_service("Unpaid Wages", timestamp, s_employmentlaw_id);

  //estate law
  make_child_service("Wills and Trusts", timestamp, s_estatelaw_id);
  make_child_service("Inheritance", timestamp, s_estatelaw_id);

  //family law
  make_child_service("Divorce", timestamp, s_familylaw_id);
  make_child_service("Child Custody", timestamp, s_familylaw_id);
  make_child_service("Child Support", timestamp, s_familylaw_id);
  make_child_service("Domestic Violence", timestamp, s_familylaw_id);

  //civil law
  make_child_service("Restraining Order", timestamp, s_civillaw_id);
  make_child_service("Small Claims", timestamp, s_civillaw_id);
  make_child_service("Tort Defense", timestamp, s_civillaw_id);
  make_child_service("Harassment", timestamp, s_civillaw_id);

  //personal injurt
  make_child_service("Medical Malpractice", timestamp, s_personalinjury_id);

  //medical coverage
  make_child_service("Medical Billing Issues", timestamp, s_medicalcovlaw_id);
  make_child_service("Insurance Company Concerns", timestamp, s_medicalcovlaw_id);
  make_child_service("Medical Coverage Disputes", timestamp, s_medicalcovlaw_id);

  //immigration
  make_child_service("Deportation", timestamp, s_immigrationlaw_id);
  make_child_service("Domestic Violence", timestamp, s_immigrationlaw_id);
  make_child_service("Asylum", timestamp, s_immigrationlaw_id);
  make_child_service("Family Immigration", timestamp, s_immigrationlaw_id);
  make_child_service("DACA", timestamp, s_immigrationlaw_id);

  //policemisconduct
  make_child_service("Civil Rights", timestamp, s_policemisconduct_id);
  make_child_service("Police Misconduct", timestamp, s_policemisconduct_id);
}

//bootstrap an empty db
Meteor.startup(function() {
  var admin_id = Meteor.users.findOne({'emails.0.address':'admin@socialzazu.com'});
  if (admin_id) {
    Roles.addUsersToRoles(admin_id, ['admin', 'editor']);
  }

  var timestamp = (new Date()).getTime();

  if (Services.find().count() == 0) {
    make_services_and_inputs();
  }

  if (Resources.find().count() === 0) {
    var sf_id = Counties.insert(
      {name:'San Francisco', coordinates: {lat:37.78551, lng:-122.441978}});
    var alameda_id = Counties.insert(
      {name:'Alameda', coordinates:{lat:37.85142099999999, lng:-122.25718}});
    var marin_id = Counties.insert(
      {name:'Marin', coordinates:{lat:38.0681137, lng:-122.7332743}});

    var _name = 'Epiphany House'
    var epiphany_id = make_resource(
      _name, timestamp,
      make_location(
        timestamp,
        contacts=[make_contact('Sister Estela', 'Executive Director')],
        "Epiphany House is a treatment center in San Francisco, California that focuses on substance abuse services by providing substance abuse treatment services. The programs offered are designed for residential beds for clients' children.",
        "Treatment Center in San Francisco",
        [make_address(
          street="1615 Broderick St",
          city="San Francisco",
          state="CA",
          zipcode="94115",
          type="physical",
          lat=37.78551,
          lng=-122.441978
        ),
         make_address(
           street="100 Masonic Avenue",
           city="San Francisco",
           state="CA",
           zipcode="94118",
           type="physical",
           lat=37.780685,
           lng=-122.446879
         )
        ],
        "Sister Estela",
        {
        },
        transportation=null,
        accessibility=[],
        languages=[],
        phones=[
          make_phone('(415) 409-6003', null, 'voice')
        ],
        internet_resource=make_internet(
          'http://www.msjse.org',
          'sisterestela@TheEpiphanyCenter.org'
        ),
        services=make_services(null, null, null, null)
      ),
      [sf_id],
      [
        Services.findOne({name:"Treatment Center"}._id)
      ]
    );

    _name = 'Homeless Prenatal';
    var hpp_id = Resources.insert(
      {name:_name, updated_time:timestamp, name_route:make_name_route(_name),
       locations: {
         contacts: [make_contact('Shona Baum', 'Director of Programs')],
         description:"HPP offers services focused on housing, prenatal and parenting support, child development, family finances and stability, access to technology, domestic violence and substance abuse, family unification, and emergency support of basic needs.",
         short_desc:"The Homeless Prenatal Program (HPP) is an award-winning San Francisco Family Resource Center.",
         address: [
           {
             street:"2500 18th St",
             city:"San Francisco",
             state:"CA",
             zipcode:"94110",
             type:"physical",
             coordinates: {
               lat:37.762197,
               lng:-122.40756199999998
             },
           }
         ],
         service_poc: [
           'Shona Baum',
         ],
         hours:{
           m_f:{open_time:900, close_time:1700, day:'Mon-Fri'},
           sat:{open_time:1100, close_time:1700, day:'Sat'},
           sun:{closed:true, day:'Sun'}
         },
         transportation:null,
         accessibility: [],
         languages: [],
         phones: [
           make_phone('(415) 546-6756', null, "voice")
         ],
         internet_resource:make_internet('http://www.homelessprenatal.org',
                                         'ShonaBaum@homelessprenatal.org'),
         services: {
           audience:null,
           eligibility:null,
           fees:null,
           how_to_apply:null,
         },
       },
       service_areas: [
         sf_id
       ],
       sub_service_ids: [
         Services.findOne({name:"Treatment Center"}._id)
       ]
      }
    );

    _name = 'San Francisco Marin Food Bank';
    var sffb_id = Resources.insert(
      {name:_name, updated_time:timestamp, name_route:make_name_route(_name),
       locations: {
         contacts: [make_contact('Sean Brooks', 'Director of Programs')],
         description:"Our mission is to end hunger in San Francisco and Marin. It's a huge job that's only gotten harder as our community struggles with a prolonged period of economic distress and record numbers of people are pushed to the point of hunger.",
         short_desc:'Food Bank in San Francisco and Marin',
         address: [
           {
             street:"900 Pennsylvania Ave",
             city:"San Francisco",
             state:"CA",
             zipcode:"94107",
             type:"physical",
             coordinates: {
               lat:37.7544611,
               lng:-122.39367900000002
             },
           },
           {
             street:"75 Digital Drive",
             city:"Novato",
             state:"CA",
             zipcode:"94949",
             type:"physical",
             coordinates: {
               lat:38.0719482,
               lng:-122.5305377
             }
           }
         ],
         service_poc: [
           'Sean Brooks',
         ],
         hours:{},
         transportation:null,
         accessibility: [],
         languages: [],
         phones: [
           make_phone('(415)-282-1900', null, "voice"),
           make_phone('(415)-883-1302', null, "voice")
         ],
         internet_resource:make_internet('http://www.sfmfoodbank.org/',
                                         'lliang@sfmfoodbank.org'),
         services: {
           audience:null,
           eligibility:null,
           fees:null,
           how_to_apply:null,
         },
       },
       service_areas: [
         sf_id, marin_id
       ],
       sub_service_ids: [
         Services.findOne({name:"Food Pantry"})._id, Services.findOne({name:"Food Stamps"})._id, Services.findOne({name:"Home Meal Delivery"})._id
       ]
      }
    );

    _name = 'Oakland Elizabeth House';
    var oakehouse_id = Resources.insert(
      {name:_name, updated_time:timestamp, name_route:make_name_route(_name),
       locations: {
         contacts: [make_contact('Kimberly Martinez', 'Programs Staff Support')],
         description:"Elizabeth House is a transitional program for women with children who have experienced homelessness, violence addiction, or poverty.",
         short_desc:null,
         address: [
           {
             street:"6423 Colby St",
             city:"Oakland",
             state:"CA",
             zipcode:"94618",
             type:"physical",
             coordinates: {
               lat:37.85142099999999,
               lng:-122.25718
             },
           }
         ],
         service_poc: [
           'Kimberly Martinez',
         ],
         hours:{},
         transportation:null,
         accessibility: [],
         languages: [],
         phones: [
           make_phone('(510) 658-1380', null, "voice")
         ],
         internet_resource:make_internet(
           'http://www.oakehouse.org/',
           'oakehouse@oakehouse.org'
         ),
         services: {
           audience:null,
           eligibility:null,
           fees:null,
           how_to_apply:null
         },
       },
       service_areas: [
         alameda_id
       ],
       sub_service_ids: [
         Services.findOne({name:"Transitional Housing"})._id,
         Services.findOne({name:"Domestic Violence"})._id,
         Services.findOne({name:"Family Support"})._id
       ]
      }
    );

    Services.update({_id:Services.findOne({name:"Treatment Center"})._id}, {
      $push:{resources:{$each: [hpp_id, epiphany_id]}},
      $set:{count:2}
    });

    Services.update({_id:Services.findOne({name:"Food Pantry"})._id},
                    {$push:{resources:sffb_id}, $set:{count:1}});

    Services.update({_id:Services.findOne({name:"Food Stamps"})._id}, {
      $push:{resources:sffb_id}, $set:{count:1}});

    Services.update({_id:Services.findOne({name:"Home Meal Delivery"})._id}, {
      $push:{resources:sffb_id}, $set:{count:1}});


    Services.update({_id:Services.findOne({name:"Transitional Housing"})._id}, {$push:{resources:oakehouse_id},
                                            $set:{count:1}});
    Services.update({_id:Services.findOne({name:"Domestic Violence"})._id}, {$push:{resources:oakehouse_id},
                                      $set:{count:1}});
    Services.update({_id:Services.findOne({name:"Family Support"})._id}, {$push:{resources:oakehouse_id},
                                        $set:{count:1}});
  }
});