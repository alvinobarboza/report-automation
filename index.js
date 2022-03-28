const { smsBody, smsHeader, REPORT, SMSURL } = require("./util/constants");
const { getReport, getToken } = require("./util/moTVCalls");
const excel = require('excel4node');
require('dotenv').config();
const date = new Date();

const LOGINSMS = process.env.loginSMS
const SECRETSMS = process.env.secretSMS

const automation = () => getReport(
    SMSURL+REPORT,
    smsBody(113, `${date.toISOString().split('T')[0]}`),
    smsHeader(
        getToken(
            LOGINSMS, 
            SECRETSMS
        )
    )
);

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

const groupByDealerByCustomer = (ungroupedList) => {
    const groupedByDealer = groupByGeneric(ungroupedList, 'dealer', 'customers');
    groupedByDealer.forEach((dealer, index) => {
        const customers = groupByGeneric(dealer.customers, 'login', 'products');
        groupedByDealer[index].customers.splice(0,groupedByDealer[index].customers.length);
        customers.forEach(c => groupedByDealer[index].customers.push(c));
    });
    return groupedByDealer;
}

let temp = '';
const array = [];
automation().then(sms => {    
    const groupedData = groupByDealerByCustomer(sms.response.rows);

    groupedData.forEach(dealer => {
        dealer.customers.forEach(customer => {
            console.log(dealer.dealer);
            console.table(customer.products)
        });
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