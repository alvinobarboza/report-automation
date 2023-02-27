const { groupByVendorByCustomer } = require("./groupByFunctions")

function validationUrban(urban) {
    try {
        const groupedData = groupByVendorByCustomer(urban);
        const dataCountsSubActive = countSubscribeAndActive(groupedData);
        return dataCountsSubActive;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function countSubscribeAndActive(data) {
    for (const vendor of data) {
        let subscribed = 0;
        let active = 0;
        for (const customer of vendor.customers) {
            let activeCheck = false;
            for (const product of customer.products) {
                if (product['profileused'] !== null) {
                    activeCheck = true;
                }
            }
            if (activeCheck) {
                active++;
            }
            subscribed++;
        }
        vendor.subscribed = subscribed;
        vendor.active = active;
    }
    return data;
}

module.exports = {
    validationUrban,
}