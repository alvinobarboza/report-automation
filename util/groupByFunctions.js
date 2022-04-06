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
    ungrouped.forEach(r => group.add(r[delimiter]));
    const groupedValues = [];
    group.forEach(d => {
        const value = {};
        value[delimiter] = d;
        value[dataToGroup] = [];
        ungrouped.forEach(e => {
            if(e[delimiter] === d){
                value[dataToGroup].push(e)
            }
        });
        groupedValues.push(value);
    });
    return groupedValues;
}

/*
Using generec group twice
*/
const groupByDealerByCustomer = (ungroupedList) => {
    const groupedByDealer = groupByGeneric(ungroupedList, 'dealer', 'customers');

    //Group customers together, empty customers from main array and push the new one one-by-one, 
    //since if pushed customers group, it is already an array, it would be [[...,...]]
    groupedByDealer.forEach((dealer, index) => {
        const customers = groupByGeneric(dealer.customers, 'login', 'products');
        groupedByDealer[index].customers.splice(0,groupedByDealer[index].customers.length);
        customers.forEach(c => groupedByDealer[index].customers.push(c));
    });
    return groupedByDealer;
}

module.exports = {
    groupByGeneric,
    groupByDealerByCustomer
}