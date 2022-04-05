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
    SUCCESS, 
    URBANTV
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

const writeFile = (data) => {

    const headerSheetResult = ['Brand', BASIC, COMPACT, FULL, PREMIUM, URBANTV, 'Total'];
    const headerSheetAllcustomers = ['Brand', 'Customer', 'Pacote', 'Data Ativação', ];
    
    const workbook = new excel.Workbook({
        defaultFont: {
            color: '#000000',
            size: 12
        },
        dateFormat: 'dd/mm/yyyy hh:mm:ss',
    });

    const worksheetResult = workbook.addWorksheet('Resultado');
    worksheetResult.column(2).setWidth(25);
    worksheetResult.row(2).filter();

    const worksheetAllCustomers = workbook.addWorksheet('TodosClientes');
    worksheetAllCustomers.column(2).setWidth(25);
    worksheetAllCustomers.column(3).setWidth(40);
    worksheetAllCustomers.column(4).setWidth(35);
    worksheetAllCustomers.column(5).setWidth(20);
    worksheetAllCustomers.row(2).filter();

    const styleH = workbook.createStyle({
        alignment: {
            horizontal: ['center'],
            shrinkToFit: true,
        },
        font: {
            color: '#000000',
            bold: true,
            size: 12
        }
    });
    
    headerSheetResult.forEach((element, index) => {
        worksheetResult.cell(2, (index+2)).string(element).style(styleH);
    });

    headerSheetAllcustomers.forEach((element, index) => {
        worksheetAllCustomers.cell(2, (index+2)).string(element).style(styleH);
    });

    let rowCounter = 0;
    data.forEach((value) => {
        if(value.dealer !== 'ADMIN-YOUCAST' && 
            value.dealer !== 'JACON dealer' && 
            value.dealer !== 'TCM Telecom' &&
            value.dealer !== 'Youcast CSMS' && 
            value.dealer !== 'YPLAY' && 
            value.dealer !== 'Z-Não-usar')
        {
            const columns = Object.keys(value);
            let columnCount = 0;
            columns.forEach((column) => {
                switch (column) {
                    case 'dealer':                
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).string(value[column].toUpperCase());
                        columnCount++;
                        break;        
                    case 'basicCount':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]);
                        columnCount++;
                        break;
                    case 'compactCount':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]);
                        columnCount++;
                        break;
                    case 'fullCount':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]);
                        columnCount++;
                        break;
                    case 'premiumCount':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]);
                        columnCount++;
                        break;
                    case 'urbanTv':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]);
                        columnCount++;
                        break;
                    default:
                        break;
                }
                if(columnCount === 6){
                    worksheetResult.cell((rowCounter+3), (columnCount+2)).formula(`=SUM(C${rowCounter+3}:G${rowCounter+3})`);
                }
            });
            rowCounter++;
        }
    });

    let rowIndex = 0;
    data.forEach(dealer => {
        dealer.customers.forEach( customer => {
            customer.products.forEach(product => {
                worksheetAllCustomers.cell((rowIndex+3),2).string(dealer.dealer);
                worksheetAllCustomers.cell((rowIndex+3),3).string(product.login);
                worksheetAllCustomers.cell((rowIndex+3),4).string(product.product);
                worksheetAllCustomers.cell((rowIndex+3),5).date(product.activation);
                rowIndex++;
            });
        });        
    });

    workbook.write('Excel.xlsx');
}

automation().then(sms => {
    const groupedData = groupByDealerByCustomer(sms.response.rows);
    groupedData.forEach((dealer, indexD) => {
        let basicCount = 0;
        let fullCount = 0;
        let compactCount = 0;
        let premiumCount = 0;
        let urbanTv = 0;
        dealer.customers.forEach((customer, indexC) => {
            if(customer.login.toLowerCase().includes('demo')){
                return;
            }
            if(customer.login.toLowerCase().includes('test')){
                return;
            }            
            if(customer.login.toLowerCase().includes('youcast')){
                return;
            }            
            if(customer.login.toLowerCase().includes('yc')){
                return;
            }
            if(customer.login.toLowerCase().includes('trial')){
                return;
            }
            if(customer.login.toLowerCase().includes('yplay')){
                return;
            }
            const { pacoteYplayStatus, pacoteYplay, urban } = validateProducts(customer); 
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
            if(urban === 1){
                urbanTv++;
            }
        });
        groupedData[indexD].basicCount = basicCount;
        groupedData[indexD].fullCount = fullCount;
        groupedData[indexD].compactCount = compactCount;
        groupedData[indexD].premiumCount = premiumCount;
        groupedData[indexD].urbanTv = urbanTv;
    });
    writeFile(groupedData);
}); 