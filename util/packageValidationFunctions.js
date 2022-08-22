const { BASIC, COMPACT, PREMIUM, URBANTV, SUCCESS, switchCase, FULL, ERROR } = require("./constants");
const { groupByGeneric } = require("./groupByFunctions");

//Helper function to give final answer on what Yplay product it has - Check combination
const validateYplayProduct = (validator) => {    
    let pacoteYplay = '';
    let pacoteYplayStatus = '';
    let urban = validator.urban;

    if((validator.basic+validator.light+validator.nacionais+validator.kids+validator.tvod)===5 && 
    (validator.full+validator.compact+validator.premium+validator.studios+validator.completo)===0)
    {
        pacoteYplay = BASIC;
        pacoteYplayStatus = SUCCESS;
    }
    else if((validator.compact+validator.light+validator.nacionais+validator.kids+validator.studios+validator.tvod)===6 && 
    (validator.full+validator.basic+validator.premium+validator.completo)===0)
    {
        pacoteYplay = COMPACT;
        pacoteYplayStatus = SUCCESS;
    }
    else if((validator.full+validator.completo+validator.nacionais+validator.kids+validator.tvod+validator.studios)===6 && 
    (validator.basic+validator.compact+validator.premium+validator.light)===0)
    {
        pacoteYplay = FULL;
        pacoteYplayStatus = SUCCESS;
    }
    else if((validator.premium+validator.completo+validator.nacionais+validator.kids+validator.tvod)===5 && 
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
const validateProducts = (customer) => {
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
        tvod: 0,
        urban: 0
    }
    customer.products.forEach(element => {
        if(element.product.includes(FULL)){
            validator.full = 1;
        }else if(element.product.includes(BASIC)){
            validator.basic = 1;
        }else if(element.product.includes(COMPACT)){
            validator.compact = 1;
        }else if(element.product.includes(PREMIUM)){
            validator.premium = 1;
        }else if(element.product.includes(URBANTV)){
            validator.urban = 1;
        }else {
            checkProduts(element.product, validator)
        }
    });
    return validateYplayProduct(validator);
}

const validation = (data) => {
    data.forEach((dealer, indexD) => {
        let basicCount = 0;
        let fullCount = 0;
        let compactCount = 0;
        let premiumCount = 0;
        let urbanTv = 0;
        dealer.customers.forEach((customer, indexC) => {
            if(customer.login.toLowerCase().includes('.demo')){
                return;
            }
            if(customer.login.toLowerCase().includes('demo.')){
                return;
            }
            if(customer.login.toLowerCase().includes('test')){
                return;
            }            
            if(customer.login.toLowerCase().includes('youcast')){
                return;
            }
            if(customer.login.toLowerCase().includes('yc.')){
                return;
            }
            if(customer.login.toLowerCase().includes('.yc')){
                return;
            }
            if(customer.login.toLowerCase().includes('trial')){
                return;
            }
            if(customer.login.toLowerCase().includes('yplay')){
                return;
            }
            const { pacoteYplayStatus, pacoteYplay, urban } = validateProducts(customer); 
            data[indexD].customers[indexC].pacoteYplayStatus = pacoteYplayStatus;
            data[indexD].customers[indexC].pacoteYplay = pacoteYplay;
            if(pacoteYplay === BASIC){
                basicCount++;
            }
            if(pacoteYplay === COMPACT){
                compactCount++;
            }
            if(pacoteYplay === FULL){
                fullCount++;
            }
            if(pacoteYplay === PREMIUM){
                premiumCount++;
            }
            if(urban === 1){
                urbanTv++;
            }
        });
        data[indexD].basicCount = basicCount;
        data[indexD].fullCount = fullCount;
        data[indexD].compactCount = compactCount;
        data[indexD].premiumCount = premiumCount;
        data[indexD].urbanTv = urbanTv;
    });
}

const validateYplayExceptions = (data) => {
    const productCounterCustomers = [];
    data.forEach(e=>{
        switch (e.dealer) {
            case 'softxx':
                addToProductCounterCustomers(e, productCounterCustomers);
                break;
            case 'net-angra':                
                addToProductCounterCustomers(e, productCounterCustomers);
                break;
            case 'nbs':                
                addToProductCounterCustomers(e, productCounterCustomers);
                break;;
            case 'NOVANET':                
                addToProductCounterCustomers(e, productCounterCustomers);
                break;
            case 'ADYLNET':                
                addToProductCounterCustomers(e, productCounterCustomers);
                break;
            default:
                break;
        }
    });
    return productCounterCustomers;
}

const addToProductCounterCustomers = (array, productGrouped) => {
    const tempTest = [];
    let customerCounter = 0;
    array.customers.forEach(d=>{
        if(            
            !(
                d.login.toLowerCase().includes('.demo') ||
                d.login.toLowerCase().includes('demo.') ||
                d.login.toLowerCase().includes('test') ||
                d.login.toLowerCase().includes('youcast') ||
                d.login.toLowerCase().includes('.yc') ||
                d.login.toLowerCase().includes('yc.') ||
                d.login.toLowerCase().includes('trial') ||
                d.login.toLowerCase().includes('yplay')
            )
        ){
            d.products.forEach(p=> tempTest.push(p));
            customerCounter++;
        }
    });
    const groupedData = groupByGeneric(tempTest, 'product','customers');
    productGrouped.push({dealer: array.dealer, products: groupedData, customersCount: customerCounter});
}

module.exports = {
    validation,
    validateYplayExceptions
};