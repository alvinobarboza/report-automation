const { 
    smsBody, 
    smsHeader, 
    REPORT, 
    SMSURL, 
    FULL, 
    BASIC, 
    COMPACT, 
    PREMIUM, 
    ERROR, 
    switchCase, 
    SUCCESS 
} = require("./util/constants");
const { getReport, getToken } = require("./util/moTVCalls");
const excel = require('excel4node');
require('dotenv').config();

const LOGINSMS = process.env.loginSMS
const SECRETSMS = process.env.secretSMS

const automation = () => getReport(
    SMSURL+REPORT,
    smsBody(119),
    smsHeader(
        getToken(
            LOGINSMS, 
            SECRETSMS
        )
    )
);

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

//Helper function to give final answer on what Yplay product it has - Check combination
const validateYplayProduct = (validator) => {    
    let pacoteYplay = '';
    let pacoteYplayStatus = '';

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
    else if((validator.full+validator.completo+validator.nacionais+validator.kids+validator.tvod)===5 && 
    (validator.basic+validator.compact+validator.premium+validator.light+validator.studios)===0)
    {
        pacoteYplay = FULL;
        pacoteYplayStatus = SUCCESS;
    }
    else if((validator.premium+validator.completo+validator.nacionais+validator.kids+validator.tvod+validator.studios)===6 && 
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
    return { pacoteYplay, pacoteYplayStatus };
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
        error: 0
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
        }else{
            checkProduts(element.product, validator)
        }
    });

    return validateYplayProduct(validator);
}

automation().then(sms => {
    const groupedData = groupByDealerByCustomer(sms.response.rows);
    groupedData.forEach((dealer, indexD) => {
        let basicCount = 0;
        let fullCount = 0;
        let compactCount = 0;
        let premiumCount = 0;
        dealer.customers.forEach((customer, indexC) => {
            const { pacoteYplayStatus, pacoteYplay } = validateProducts(customer); 
            groupedData[indexD].customers[indexC].pacoteYplayStatus = pacoteYplayStatus;
            groupedData[indexD].customers[indexC].pacoteYplay = pacoteYplay;
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
        });
        groupedData[indexD].basicCount = basicCount;
        groupedData[indexD].fullCount = fullCount;
        groupedData[indexD].compactCount = compactCount;
        groupedData[indexD].premiumCount = premiumCount;
    });
}); 

const writeFile = (report) => {

    const workbook = new excel.Workbook();

    const worksheet = workbook.addWorksheet('test');
    const styleH = workbook.createStyle({
        font: {
            color: '#000000',
            bold: true,
            size: 12
        }
    });

    const style = workbook.createStyle({
        font: {
            color: '#000000',
            size: 12
        }
    });

    const keys = Object.keys(report[0]);
    keys.forEach((element, index) => {
        worksheet.cell(1, (index+1)).string(element).style(styleH);
    });

    report.forEach((data,row) => {
        keys.forEach((r, column) => {
            if(typeof data[r] === 'number'){
                worksheet.cell((row+2), (column+1))
                    .number(data[r])
                    .style(style);
            }else{
                worksheet.cell((row+2), (column+1))
                    .string(data[r])
                    .style(style);
            }
        });
        console.log(row);
    });

    workbook.write('Excel.xlsx');
}