/*
Function to group array by delimiter informed:
[...,{ name: 'jhon', car: 'x' }, { name: 'jhon', car: 'y' },...]
EX:
delimiter = name
dataToGroup = cars => this will generate a new array with all cars with the same 'name'

Result:
[...,{ name: 'jhon', cars: [{ name: 'jhon', car: 'x' }, { name: 'jhon', car: 'y' }] },....]
It preserves all information, since i'll may need them for more manipulation later

**Set used in a lazy way to have unique values, could be foreach check
*/
const groupByGeneric = (ungrouped, delimiter, dataToGroup) => {
    const group = new Set();
    for (let i = 0; i < ungrouped.length; i++) {
        group.add(ungrouped[i][delimiter]);
    }
    const nonRepeated = Array.from(group);
    const groupedValues = [];
    for (let i = 0; i < nonRepeated.length; i++) {
        const value = {};
        value[delimiter] = nonRepeated[i];
        value[dataToGroup] = [];
        for (let y = 0; y < ungrouped.length; y++) {
            if (ungrouped[y][delimiter] === nonRepeated[i]) {
                value[dataToGroup].push(ungrouped[y])
            }
        }
        groupedValues.push(value);
    }
    return groupedValues;
}

/*
Using generec group twice
*/
const groupByDealerByCustomer = (ungroupedList) => {
    const groupedByDealer = groupByGeneric(ungroupedList, 'dealer', 'customers');
    //Group customers together, empty customers from main array and push the new one one-by-one, 
    //since if pushed customers group, it is already an array, it would be [[...,...]]
    for (let i = 0; i < groupedByDealer.length; i++) {
        const customers = groupByGeneric(groupedByDealer[i].customers, 'login', 'products');
        groupedByDealer[i].customers.splice(0, groupedByDealer[i].customers.length);
        for (let y = 0; y < customers.length; y++) {
            groupedByDealer[i].customers.push(customers[y]);
        }
    }
    return groupedByDealer;
}

function groupByVendorByCustomer(data) {
    const tempGrouped = groupByGeneric(data, 'vendors_name', 'customers');

    for (const vendor of tempGrouped) {
        const tempCustomers = groupByGeneric(vendor.customers, 'customers_login', 'products');
        vendor.customers.splice(0, vendor.customers.length);
        for (const customer of tempCustomers) {
            vendor.customers.push(customer);
        }
    }
    return tempGrouped;
}

module.exports = {
    groupByGeneric,
    groupByDealerByCustomer,
    groupByVendorByCustomer
}