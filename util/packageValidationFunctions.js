const { BASIC, COMPACT, PREMIUM, URBANTV, SUCCESS, switchCase, FULL, ERROR, YPLAYPACOTEPREMIUM, YPLAYPACOTESTART, CANAISLOCAIS, START } = require("./constants");
const { groupByGeneric } = require("./groupByFunctions");

// Main function
function validation(data, activeCustomers) {
    const oldPackage = [];
    const newPackage = [];

    // =======Active/Inactive======

    for (let i = 0; i < data.length; i++) {
        let activeCount = 0;
        for (let j = 0; j < data[i].customers.length; j++) {
            data[i].customers[j].isactive = false;
            for (let y = 0; y < activeCustomers.length; y++) {
                if (activeCustomers[y].mwid === data[i].customers[j].products[0].idmw) {
                    data[i].customers[j].isactive = true;
                    activeCount++;
                }
            }
        }
        data[i].activeCount = activeCount;
    }

    // ============================

    // Seperation for new and old packaging 
    for (let i = 0; i < data.length; i++) {
        let test = false;
        for (let y = 0; y < data[i].customers.length; y++) {
            for (let x = 0; x < data[i].customers[y].products.length; x++) {
                data[i].dealerid = data[i].customers[y].products[x].dealerid;
                if (data[i].customers[y].products[x].productid === YPLAYPACOTEPREMIUM ||
                    data[i].customers[y].products[x].productid === YPLAYPACOTESTART ||
                    data[i].customers[y].products[x].product.includes(CANAISLOCAIS)) {
                    test = true;
                }
            }
        }
        if (test) {
            newPackage.push(data[i]);
        } else {
            oldPackage.push(data[i]);
        }
    }
    const oldPackaging = validationOldProducts(oldPackage);
    const newPackaging = validationNewProducts(newPackage);
    return { oldPackaging, newPackaging };
}

function validationOldProducts(data) {
    for (let indexD = 0; indexD < data.length; indexD++) {
        let basicCount = 0;
        let basicActiveCount = 0;
        let fullCount = 0;
        let fullActiveCount = 0;
        let compactCount = 0;
        let compactActiveCount = 0;
        let premiumCount = 0;
        let premiumActiveCount = 0;
        let urbanTv = 0;
        let error = 0;
        let test = 0;
        if (dealerValidation(data[indexD])) {
            for (let indexC = 0; indexC < data[indexD].customers.length; indexC++) {
                if (validateLoginTest(data[indexD].customers[indexC])) {
                    test++;
                    continue;
                }
                const { pacoteYplayStatus, pacoteYplay, urban } = validateProductsOld(data[indexD].customers[indexC]);
                data[indexD].customers[indexC].pacoteYplayStatus = pacoteYplayStatus;
                data[indexD].customers[indexC].pacoteYplay = pacoteYplay;
                switch (pacoteYplay) {
                    case BASIC:
                        if (data[indexD].customers[indexC].isactive) {
                            basicActiveCount++;
                        }
                        basicCount++;
                        break;
                    case COMPACT:
                        if (data[indexD].customers[indexC].isactive) {
                            compactActiveCount++;
                        }
                        compactCount++;
                        break;
                    case FULL:
                        if (data[indexD].customers[indexC].isactive) {
                            fullActiveCount++;
                        }
                        fullCount++;
                        break;
                    case PREMIUM:
                        if (data[indexD].customers[indexC].isactive) {
                            premiumActiveCount++;
                        }
                        premiumCount++;
                        break;
                    case ERROR:
                        error++;
                        break;
                    default:
                        break;
                }
                if (urban === 1) {
                    urbanTv++;
                }
            }
        }
        data[indexD].basicCount = basicCount;
        data[indexD].basicActiveCount = basicActiveCount;
        data[indexD].fullCount = fullCount;
        data[indexD].fullActiveCount = fullActiveCount;
        data[indexD].compactCount = compactCount;
        data[indexD].compactActiveCount = compactActiveCount;
        data[indexD].premiumCount = premiumCount;
        data[indexD].premiumActiveCount = premiumActiveCount;
        data[indexD].urbanTv = urbanTv;
        data[indexD].error = error;
        data[indexD].test = test;
    }
    return data;
}

function validationNewProducts(data) {
    try {
        for (let indexD = 0; indexD < data.length; indexD++) {
            let startCount = 0;
            let startActiveCount = 0;
            let premiumCount = 0;
            let premiumActiveCount = 0;
            let test = 0;
            if (dealerValidation(data[indexD])) {
                for (let indexC = 0; indexC < data[indexD].customers.length; indexC++) {
                    if (validateLoginTest(data[indexD].customers[indexC])) {
                        test++;
                        continue;
                    }
                    const { pacoteYplayStatus, pacoteYplay } = validateProductsNew(data[indexD].customers[indexC]);
                    data[indexD].customers[indexC].pacoteYplayStatus = pacoteYplayStatus;
                    data[indexD].customers[indexC].pacoteYplay = pacoteYplay;
                    switch (pacoteYplay) {
                        case START:
                            if (data[indexD].customers[indexC].isactive) {
                                startActiveCount++;
                            }
                            startCount++;
                            break;
                        case PREMIUM:
                            if (data[indexD].customers[indexC].isactive) {
                                premiumActiveCount++;
                            }
                            premiumCount++;
                            break;
                        default:
                            break;
                    }
                }
            }
            data[indexD].startCount = startCount;
            data[indexD].startActiveCount = startActiveCount;
            data[indexD].premiumCount = premiumCount;
            data[indexD].premiumActiveCount = premiumActiveCount;
            data[indexD].test = test;
        }
    } catch (error) {
        console.log(error)
    }
    return data;
}

function validateProductsOld(customer) {
    let validator = {
        basic: 0,
        compact: 0,
        full: 0,
        premium: 0,
        light: 0,
        completo: 0,
        kids: 0,
        nacionais: 0,
        urban: 0
    }
    try {
        for (let i = 0; i < customer.products.length; i++) {
            if (customer.products[i].product.includes(FULL)) {
                validator.full = 1;
            } else if (customer.products[i].product.includes(BASIC)) {
                validator.basic = 1;
            } else if (customer.products[i].product.includes(COMPACT)) {
                validator.compact = 1;
            } else if (customer.products[i].product.includes(PREMIUM)) {
                validator.premium = 1;
            } else if (customer.products[i].product.includes(URBANTV)) {
                validator.urban = 1;
            } else {
                validator = checkProduts(customer.products[i].product, validator)
            }
        };
    } catch (error) {
        console.log(error)
    }
    return validateYplayProductOld(validator);
}

function validateProductsNew(customer) {
    let start = false;
    let premium = false;
    let locais = false;

    for (let i = 0; i < customer.products.length; i++) {
        if (customer.products[i].productid === YPLAYPACOTESTART) {
            start = true;
        } else if (customer.products[i].productid === YPLAYPACOTEPREMIUM) {
            premium = true;
        } else if (customer.products[i].product.includes(CANAISLOCAIS)) {
            locais = true;
        }
    };

    return validateYplayProductNew(start, premium, locais);
}

function validateYplayProductOld(validator) {
    let pacoteYplay = '';
    let pacoteYplayStatus = '';
    let urban = validator.urban;

    if ((validator.basic + validator.light + validator.nacionais + validator.kids) === 4 &&
        (validator.full + validator.compact + validator.premium + validator.completo) === 0) {
        pacoteYplay = BASIC;
        pacoteYplayStatus = SUCCESS;
    }
    else if ((validator.compact + validator.light + validator.nacionais + validator.kids) === 4 &&
        (validator.full + validator.basic + validator.premium + validator.completo) === 0) {
        pacoteYplay = COMPACT;
        pacoteYplayStatus = SUCCESS;
    }
    else if ((validator.full + validator.completo + validator.nacionais + validator.kids) === 4 &&
        (validator.basic + validator.compact + validator.premium + validator.light) === 0) {
        pacoteYplay = FULL;
        pacoteYplayStatus = SUCCESS;
    }
    else if ((validator.premium + validator.completo + validator.nacionais + validator.kids) === 4 &&
        (validator.full + validator.compact + validator.basic + validator.light) === 0) {
        pacoteYplay = PREMIUM;
        pacoteYplayStatus = SUCCESS;
    }
    else {
        pacoteYplay = ERROR;
        pacoteYplayStatus = ERROR;
    }
    return { pacoteYplay, pacoteYplayStatus, urban };
}

function validateYplayProductNew(start, premium, locais) {
    let pacoteYplay = '';
    let pacoteYplayStatus = '';

    if (start && locais && premium === false) {
        // start+locais = start
        pacoteYplay = START;
        pacoteYplayStatus = SUCCESS;
    } else if (start && premium === false && locais === false) {
        // start = start
        pacoteYplay = START;
        pacoteYplayStatus = ERROR;
    } else if (locais && premium === false && start === false) {
        // locais = start
        pacoteYplay = START;
        pacoteYplayStatus = ERROR;
    } else if (premium && locais && start === false) {
        // premium+locais = premium
        pacoteYplay = PREMIUM;
        pacoteYplayStatus = SUCCESS;
    } else if (premium && start === false && locais === false) {
        // premium = premium
        pacoteYplay = PREMIUM;
        pacoteYplayStatus = ERROR;
    } else if (premium && start && locais) {
        // start+premium+locais = premium
        pacoteYplay = PREMIUM;
        pacoteYplayStatus = ERROR;
    } else {
        // Nothing = start
        pacoteYplay = START;
        pacoteYplayStatus = ERROR;
    }
    return { pacoteYplay, pacoteYplayStatus };
}

function checkProduts(caseTest, check) {
    return (switchCase[caseTest] || switchCase['default'])(check);
}

function validateYplayExceptions(data) {
    const productCounterCustomers = [];
    const ollacustomers = {
        dealer: 'OLLA TELECOM',
        customers: [],
    };
    for (let index = 0; index < data.length; index++) {
        switch (data[index].dealerid) {
            case 37: //'softxx'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 55: // 'net-angra'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 87: // 'nbs'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 26: // 'NOVANET'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 19: // 'ADYLNET'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 123: // 'CCS'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 124: // 'AGE TELECOM'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 128: // 'COPREL'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 118: // 'WECLIX'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 145: // 'giga-fibra-co'
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            default:
                break;
        }
        if (data[index].customers[0].products[0].parentdealer === 134 ||
            data[index].dealer === 'OLLA TELECOM') {
            for (let i = 0; i < data[index].customers.length; i++) {
                ollacustomers.customers.push(data[index].customers[i]);
            }
        }
    }
    if (ollacustomers.customers.length > 0) {
        addToProductCounterCustomers(ollacustomers, productCounterCustomers);
    }
    return productCounterCustomers;
}

function addToProductCounterCustomers(array, productGrouped) {
    const tempTest = [];
    let customerCounter = 0;
    try {
        for (let i = 0; i < array.customers.length; i++) {
            if (!(validateLoginTest(array.customers[i])) && array.dealerid !== 145) {
                for (let y = 0; y < array.customers[i].products.length; y++) {
                    tempTest.push(array.customers[i].products[y])
                }
                customerCounter++;
            } else if (array.dealerid === 145) { // GIGA FIBRA must show all customers
                for (let y = 0; y < array.customers[i].products.length; y++) {
                    tempTest.push(array.customers[i].products[y])
                }
                customerCounter++;
            }
        }
        const groupedData = groupByGeneric(tempTest, 'product', 'customers');
        productGrouped.push({
            dealerid: array.dealerid,
            dealer: array.dealer,
            products: groupedData,
            customersCount: customerCounter
        });
    } catch (error) {
        console.log(error);
    }
}

function validateYplayComlombia(data) {
    const productGrouped = {
        packagesname: [],
        groups: []
    };
    const packagesSet = new Set();
    try {
        for (let i = 0; i < data.length; i++) {
            if (data[i].customers[0].products[0].vendorid === 34) {
                const tempTest = [];
                let customerCounter = 0;

                for (let j = 0; j < data[i].customers.length; j++) {
                    for (let y = 0; y < data[i].customers[j].products.length; y++) {
                        tempTest.push(data[i].customers[j].products[y]);
                        const packageTmp = data[i].customers[j].products[y].product;
                        packageTmp.toUpperCase().includes('HOMEPAGE') || data[i].dealerid === 153 ? '' : packagesSet.add(packageTmp);
                    }
                    customerCounter++;
                }

                const groupedData = groupByGeneric(tempTest, 'product', 'customers');
                productGrouped.groups.push({
                    dealerid: data[i].dealerid,
                    dealer: data[i].dealer,
                    products: groupedData,
                    customersCount: customerCounter,
                    validDealer: !(data[i].dealerid === 153) // Discard Yplay colombia
                });
            }
        }
        productGrouped.packagesname = Array.from(packagesSet);
        return productGrouped;

    } catch (error) {
        console.log(error);
        return [];
    }
}

function validateLoginTest(d) {
    return d.login.toLowerCase().includes('.demo') ||
        d.login.toLowerCase().includes('demo.') ||
        d.login.toLowerCase().includes('test') ||
        d.login.toLowerCase().includes('youcast') ||
        d.login.toLowerCase().includes('.yc') ||
        d.login.toLowerCase().includes('yc.') ||
        d.login.toLowerCase().includes('trial') ||
        d.login.toLowerCase().includes('yplay');
}

function dealerValidation(customer) {
    return customer.customers[0].products[0].parentdealer !== 134 &&
        customer.dealerid !== 1 && // 'JACON dealer'
        customer.dealerid !== 3 && // 'Admin'
        customer.dealerid !== 4 && // 'TCM Telecom'
        customer.dealerid !== 5 && // 'Youcast CSMS'
        customer.dealerid !== 7 && // 'Z-Não-usar'
        customer.dealerid !== 13 && // 'Z-Não-usar'
        customer.dealerid !== 15 && // 'YPLAY'
        customer.dealerid !== 19 && // 'ADYLNET'
        customer.dealerid !== 18 &&// 'HSL'
        customer.dealerid !== 22 && // 'ADMIN-YOUCAST' 
        customer.dealerid !== 21 && // 'LBR'
        customer.dealerid !== 26 && // 'NOVANET'
        customer.dealerid !== 37 && // 'softxx'
        customer.dealerid !== 55 && // 'net-angra'
        customer.dealerid !== 87 && // 'nbs'
        customer.dealerid !== 113 && // 'giganet-ro'
        customer.dealerid !== 118 && // 'WECLIX'
        customer.dealerid !== 124 && // 'AGE TELECOM'
        customer.dealerid !== 123 && // 'CCS'
        customer.dealerid !== 128 && // 'COPREL'
        customer.dealerid !== 134 && // 'OLLA TELECOM'
        customer.dealerid !== 145 && // giga-fibra-co
        customer.customers[0].products[0].vendorid !== 34; // Yplay comlombia
}

module.exports = {
    validation,
    validateYplayExceptions,
    dealerValidation,
    validateLoginTest,
    validateYplayComlombia
};