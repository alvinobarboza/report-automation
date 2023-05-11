function validateTelemedicinaData(telemedicinaActive, telemedicinaSubscribed){
    const groupedCustomers = groupTelemedicinaUserFromMotvReport(telemedicinaSubscribed);
    for (const teleActive of telemedicinaActive) {
        if(groupedCustomers[teleActive.smsid]){
            groupedCustomers[teleActive.smsid].status = teleActive.status;
        }
    }
    return groupedCustomers;
}

function groupTelemedicinaUserFromMotvReport(data){
    const grouped = {};
    console.time('group');
    for (const customer of data) {
        if(grouped[customer.idsms]){
            grouped[customer.idsms].products.push(customer);
        }else{
            grouped[customer.idsms] = {
                idsms: customer.idsms,
                login: customer.login,
                dealer: customer.dealer,
                status: false,
                products: [customer]
            }
        }     
    }
    console.timeEnd('group');
    return grouped;
}

module.exports = {
    validateTelemedicinaData,
    groupTelemedicinaUserFromMotvReport
}