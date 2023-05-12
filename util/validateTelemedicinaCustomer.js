const { validateLoginTest } = require("./packageValidationFunctions");

function validateTelemedicinaData(telemedicinaActive, telemedicinaSubscribed){
    try{
        const groupedCustomers = groupTelemedicinaUserFromMotvReport(telemedicinaActive, telemedicinaSubscribed);
        return [groupedCustomers, telemedicinaSubscribed];
    }catch(e){
        console.log(e);
        return [];
    }
}

function groupTelemedicinaUserFromMotvReport(active, data){
    const dealersGrouped = {};
    const notValidDealers = [
         1, // 'JACON dealer'
         3, // 'Admin'
         5, // 'Youcast CSMS'
         7, // 'Z-Não-usar'
         13,  // 'Z-Não-usar'
         22  // 'ADMIN-YOUCAST' 
    ]

    console.time('group');
    for (const customer of data) {
        if(notValidDealers.includes(customer.dealerid)){
            continue;
        }

        if(dealersGrouped[customer.dealer]){
            dealersGrouped[customer.dealer].customers.push(customer);
        }else{
            dealersGrouped[customer.dealer] = {
                dealer: customer.dealer,
                dealerid: customer.dealerid,
                customers: [customer]
            }
        }     
    }
    
    const groupedDealersArray = Object.values(dealersGrouped);
    
    for (const dealer of groupedDealersArray) {
        const customersGrouped = {};
        for (const customer of dealer.customers) {
            if(validateLoginTest(customer)){
                continue;
            }


            let status = false;
            for(const user of active){
                if(user.smsid == customer.idsms){
                    status = true;
                }
            }


            if(customersGrouped[customer.idsms]){
                customersGrouped[customer.idsms].status = status;
                customersGrouped[customer.idsms].products.push(customer);
            }else{
                customersGrouped[customer.idsms] = {
                    idsms: customer.idsms,
                    login: customer.login,
                    dealer: customer.dealer,
                    status: status,
                    products: [customer]
                }
            }     
        }
        const customers = Object.values(customersGrouped)
        dealer.customers = customers;
        dealer.subscribed = customers.length;
        dealer.active = customers.reduce((amount, customer)=>{
            if(customer.status){
                return amount + 1;
            }
            return amount;
        }, 0);
    }
    console.timeEnd('group');
    return groupedDealersArray;
}

module.exports = {
    validateTelemedicinaData,
    groupTelemedicinaUserFromMotvReport
}