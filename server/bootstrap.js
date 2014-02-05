//bootstrap an empty db
Meteor.startup(function() {
    if (Services.find().count() === 0) {
        var timestamp = (new Date()).getTime();
        var service_drug_id = Services.insert({name:'Drug Treatment', count:0, resources:[], nameRoute:'Drug-Treatment', creation_time:timestamp, updated_time:timestamp});
        var service_housing_id = Services.insert({name:'Housing', count:0, resources:[], nameRoute:'Housing', creation_time:timestamp, updated_time:timestamp});
        var service_mental_health_id = Services.insert({name:'Mental Health', count:0, resources:[], nameRoute:'Mental-Health', creation_time:timestamp, updated_time:timestamp});
        var service_food_id = Services.insert({name:'Food', count:0, resources:[], nameRoute:'Food', creation_time:timestamp, updated_time:timestamp});

        var epiphany_id = Resources.insert(
            {name:'Epiphany House', street:'Broderick St', streetNumber:'1615',
             email:'sisterestela@TheEpiphanyCenter.org', url:'http://www.msjse.org',
             contactPerson:'Sister Estela', phone:'(415) 409-6003',
             longDescription:"Epiphany House is a treatment center in San Francisco, California that focuses on substance abuse services by providing substance abuse treatment services. The programs offered are designed for residential beds for clients' children. .. ..",
             shortDescription:"Treatment Center in San Francisco",
             services:[service_drug_id], creation_time:timestamp, updated_time:timestamp,
             city:"San Francisco", state:"CA", zipcode:"94115"});

        var hpp_id = Resources.insert(
            {name:'Homeless Prenatal', street:'18th St', streetNumber:'2500',
             email:'ShonaBaum@homelessprenatal.org', url:'http://www.homelessprenatal.org',
             contactPerson:'Shona Baum', phone:'(415) 546-6756',
             longDescription:"Epiphany House is a treatment center in San Francisco, California that focuses on substance abuse services by providing substance abuse treatment services. The programs offered are designed for residential beds for clients' children. .. ..",
             shortDescription:"Treatment Center in San Francisco",
             services:[service_drug_id], creation_time:timestamp, updated_time:timestamp,
             city:"San Francisco", state:"CA", zipcode:"94110"});

        Services.update({_id:service_drug_id}, {$push:{resources:{$each: [hpp_id, epiphany_id]}}});
        Services.update({_id:service_drug_id}, {$set:{count:2}});
    }
});