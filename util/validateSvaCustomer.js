const { validateLoginTest } = require('./packageValidationFunctions');

function validateSvaData(svaActive, svaSubscribed) {
    try {
        const groupedCustomers = groupSvaUserFromMotvReport(
            svaActive,
            svaSubscribed
        );
        return [groupedCustomers, svaSubscribed];
    } catch (e) {
        console.log(e);
        return [];
    }
}

function groupSvaUserFromMotvReport(active, data) {
    const tempObject = {};
    const notValidDealers = [
        1, // 'JACON dealer'
        3, // 'Admin'
        5, // 'Youcast CSMS'
        7, // 'Z-Não-usar'
        13, // 'Z-Não-usar'
        22, // 'ADMIN-YOUCAST'
    ];
    const groupedDealersArray = [];

    console.time('groupSubscribed');
    for (const customer of data) {
        if (notValidDealers.includes(customer.dealerid)) {
            continue;
        }

        if (tempObject[customer.dealer]) {
            tempObject[customer.dealer].customers.push(customer);
        } else {
            tempObject[customer.dealer] = {
                dealer: customer.dealer,
                dealerid: customer.dealerid,
                dealersCnpj: customer.cnpj ? customer.cnpj : '',
                customers: [customer],
            };
            groupedDealersArray.push(tempObject[customer.dealer]);
        }
    }
    console.timeEnd('groupSubscribed');
    console.time('groupActive');
    for (const dealer of groupedDealersArray) {
        const customersGrouped = {};
        const customers = [];
        for (const customer of dealer.customers) {
            if (validateLoginTest(customer)) {
                continue;
            }

            let status = false;
            for (const user of active) {
                if (user.smsid == customer.idsms) {
                    status = true;
                }
            }

            if (customersGrouped[customer.idsms]) {
                customersGrouped[customer.idsms].status = status;
                customersGrouped[customer.idsms].products.push(customer);
            } else {
                customersGrouped[customer.idsms] = {
                    idsms: customer.idsms,
                    login: customer.login,
                    dealer: customer.dealer,
                    status: status,
                    products: [customer],
                };
                customers.push(customersGrouped[customer.idsms]);
            }
        }
        dealer.customers = customers;
        dealer.subscribed = customers.length;
        dealer.active = customers.reduce((amount, customer) => {
            if (customer.status) {
                return amount + 1;
            }
            return amount;
        }, 0);
    }
    console.timeEnd('groupActive');
    return groupedDealersArray;
}

module.exports = {
    validateSvaData,
    groupSvaUserFromMotvReport,
};
