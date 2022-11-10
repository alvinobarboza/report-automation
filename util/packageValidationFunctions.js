const { BASIC, COMPACT, PREMIUM, URBANTV, SUCCESS, switchCase, FULL, ERROR, YPLAYPACOTEPREMIUM, YPLAYPACOTESTART, CANAISLOCAIS } = require("./constants");
const { groupByGeneric } = require("./groupByFunctions");

//Helper function to give final answer on what Yplay product it has - Check combination
const validateYplayProduct = (validator) => {    
    let pacoteYplay = '';
    let pacoteYplayStatus = '';
    let urban = validator.urban;

    if((validator.basic+validator.light+validator.nacionais+validator.kids)===4 && 
    (validator.full+validator.compact+validator.premium+validator.studios+validator.completo)===0)
    {
        pacoteYplay = BASIC;
        pacoteYplayStatus = SUCCESS;
    }
    else if((validator.compact+validator.light+validator.nacionais+validator.kids+validator.studios)===5 && 
    (validator.full+validator.basic+validator.premium+validator.completo)===0)
    {
        pacoteYplay = COMPACT;
        pacoteYplayStatus = SUCCESS;
    }
    else if((validator.full+validator.completo+validator.nacionais+validator.kids+validator.studios)===5 && 
    (validator.basic+validator.compact+validator.premium+validator.light)===0)
    {
        pacoteYplay = FULL;
        pacoteYplayStatus = SUCCESS;
    }
    else if((validator.premium+validator.completo+validator.nacionais+validator.kids)===4 && 
    (validator.full+validator.compact+validator.basic+validator.light)===0)
    {
        pacoteYplay = PREMIUM;
        pacoteYplayStatus = SUCCESS;
    }
    else 
    {
        pacoteYplay = ERROR;
        pacoteYplayStatus = ERROR;
    }    
    return { pacoteYplay, pacoteYplayStatus, urban };
}

//Helper function using object leteral to create a switch case
const checkProduts = (caseTest, check) => {    
    (switchCase[caseTest] || switchCase['default'])(check);
}

//Main function to validate wich products customers has - *Needs to find a simpler way to do this
const validateProductsOld = (customer) => {
    const validator = {
        basic: 0,
        compact: 0,
        full: 0,
        premium: 0,
        light: 0,
        completo: 0,
        kids: 0,
        nacionais: 0,
        studios: 0,
        urban: 0
    }
    for(let i = 0; i < customer.products.length; i++) {
        if(customer.products[i].product.includes(FULL)){
            validator.full = 1;
        }else if(customer.products[i].product.includes(BASIC)){
            validator.basic = 1;
        }else if(customer.products[i].product.includes(COMPACT)){
            validator.compact = 1;
        }else if(customer.products[i].product.includes(PREMIUM)){
            validator.premium = 1;
        }else if(customer.products[i].product.includes(URBANTV)){
            validator.urban = 1;
        }else {
            checkProduts(customer.products[i].product, validator)
        }
    };
    return validateYplayProduct(validator);
}

const validateProductsNew = (customer) => {
    let start = false;
    let premium = false;
    let locais = false;    

    let pacoteYplay = '';
    let pacoteYplayStatus = '';

    for(let i = 0; i < customer.products.length; i++) {
        if(customer.products[i].productid === YPLAYPACOTESTART){
            validator.start = true;
        }else if(customer.products[i].productid === YPLAYPACOTEPREMIUM){
            validator.premium = true;
        }else if(customer.products[i].product.includes(CANAISLOCAIS)){
            validator.locais = true;
        }
    };

    // if()

    return { pacoteYplay, pacoteYplayStatus };
}



const validation = (data) => {
    const oldPackage = [];
    const newPackage = [];
    for (let i = 0; i < data.length; i++) {
        let test = false;
        for (let y = 0; y < data[i].customers.length; y++) {
            for (let x = 0; x < data[i].customers[y].products.length; x++) {
                if(data[i].customers[y].products[x].productid === YPLAYPACOTEPREMIUM ||
                    data[i].customers[y].products[x].productid === YPLAYPACOTESTART ||
                    data[i].customers[y].products[x].product.includes(CANAISLOCAIS)){
                    test = true;
                }
            }
        }
        if(test){
            newPackage.push(data[i]);
        }else{
            oldPackage.push(data[i]);
        }
    }
    return [ validationOldProducts(oldPackage), validationNewProducts(oldPackage)];
}

const validationNewProducts = (data) => {
    for( let indexD = 0; indexD < data.length; indexD++) {
        let startCount = 0;
        let premiumCount = 0;
        let test = 0;
        if(dealerValidation(data[indexD])){
            for( let indexC = 0; indexC < data[indexD].customers.length; indexC++) {
                if(validateLoginTest(data[indexD].customers[indexC])){
                    test++;
                    continue;
                }
                const { pacoteYplayStatus, pacoteYplay } = validateProductsNew(data[indexD].customers[indexC]); 
                data[indexD].customers[indexC].pacoteYplayStatus = pacoteYplayStatus;
                data[indexD].customers[indexC].pacoteYplay = pacoteYplay;
                switch (pacoteYplay) {
                    case START:
                        startCount++;
                        break;
                    case PREMIUM:
                        premiumCount++;
                        break;
                    default:
                        break;
                }
            }
        }
        data[indexD].startCount = startCount;
        data[indexD].premiumCount = premiumCount;
        data[indexD].test = test;
    }
    return data;
}

const validationOldProducts = (data) => {
    for( let indexD = 0; indexD < data.length; indexD++) {
        let basicCount = 0;
        let fullCount = 0;
        let compactCount = 0;
        let premiumCount = 0;
        let urbanTv = 0;
        let error = 0;
        let test = 0;
        if(dealerValidation(data[indexD])){
            for( let indexC = 0; indexC < data[indexD].customers.length; indexC++) {
                if(validateLoginTest(data[indexD].customers[indexC])){
                    test++;
                    continue;
                }
                const { pacoteYplayStatus, pacoteYplay, urban } = validateProductsOld(data[indexD].customers[indexC]); 
                data[indexD].customers[indexC].pacoteYplayStatus = pacoteYplayStatus;
                data[indexD].customers[indexC].pacoteYplay = pacoteYplay;
                switch (pacoteYplay) {
                    case BASIC:
                        basicCount++;
                        break;
                    case COMPACT:
                        compactCount++;
                        break;
                    case FULL:
                        fullCount++;
                        break;
                    case PREMIUM:
                        premiumCount++;
                        break;
                    case ERROR:
                        error++;
                        break;            
                    default:
                        break;
                }
                if(urban === 1){
                    urbanTv++;
                }
            }
        }
        data[indexD].basicCount = basicCount;
        data[indexD].fullCount = fullCount;
        data[indexD].compactCount = compactCount;
        data[indexD].premiumCount = premiumCount;
        data[indexD].urbanTv = urbanTv;
        data[indexD].error = error;
        data[indexD].test = test;
    }
    return data;
}

const validateYplayExceptions = (data) => {
    const productCounterCustomers = [];
    const ollacustomers = {
        dealer: 'OLLA TELECOM',
        customers: [],
    };
    for (let index = 0; index < data.length; index++) {
        switch (data[index].dealer) {
            case 'softxx':
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 'net-angra':                
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 'nbs':                
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;;
            case 'NOVANET':                
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 'ADYLNET':                
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 'CCS':                
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 'AGE TELECOM':                
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            case 'COPREL':                
                addToProductCounterCustomers(data[index], productCounterCustomers);
                break;
            default:
                break;
        }
        if(data[index].customers[0].products[0].parentdealer === 134 || 
            data[index].dealer === 'OLLA TELECOM' ){
            for(let i = 0; i < data[index].customers.length; i++){
                ollacustomers.customers.push(data[index].customers[i]);
            }
        }
    }
    addToProductCounterCustomers(ollacustomers, productCounterCustomers);
    return productCounterCustomers;
}

const addToProductCounterCustomers = (array, productGrouped) => {
    const tempTest = [];
    let customerCounter = 0;
    for(let i = 0; i < array.customers.length; i++) {
        if(!(validateLoginTest(array.customers[i]))){
            for(let y = 0; y < array.customers[i].products.length; y++){
                tempTest.push(array.customers[i].products[y])
            }
            customerCounter++;
        }
    }
    const groupedData = groupByGeneric(tempTest, 'product','customers');
    productGrouped.push({dealer: array.dealer, products: groupedData, customersCount: customerCounter});
}

const validateLoginTest = (d) => {
    return d.login.toLowerCase().includes('.demo') ||
    d.login.toLowerCase().includes('demo.') ||
    d.login.toLowerCase().includes('test') ||
    d.login.toLowerCase().includes('youcast') ||
    d.login.toLowerCase().includes('.yc') ||
    d.login.toLowerCase().includes('yc.') ||
    d.login.toLowerCase().includes('trial') ||
    d.login.toLowerCase().includes('yplay');
}

const dealerValidation = (customer) => {
    return customer.customers[0].products[0].parentdealer !== 134 &&
    customer.dealer !== 'ADMIN-YOUCAST' && 
    customer.dealer !== 'JACON dealer' && 
    customer.dealer !== 'TCM Telecom' &&
    customer.dealer !== 'Youcast CSMS' && 
    customer.dealer !== 'YPLAY' && 
    customer.dealer !== 'Z-Não-usar' && 
    customer.dealer !== 'softxx' &&
    customer.dealer !== 'LBR' && 
    customer.dealer !== 'net-angra'&& 
    customer.dealer !== 'Admin'&&
    customer.dealer !== 'ADYLNET'&&
    customer.dealer !== 'HSL'&&
    customer.dealer !== 'giganet-ro'&& 
    customer.dealer !== 'OLLA TELECOM'&& 
    customer.dealer !== 'nbs'&& 
    customer.dealer !== 'COPREL'&& 
    customer.dealer !== 'AGE TELECOM'&& 
    customer.dealer !== 'CCS'&& 
    customer.dealer !== 'NOVANET';
}

module.exports = {
    validation,
    validateYplayExceptions,
    dealerValidation,
};