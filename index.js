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
)


let temp = '';
const array = [];
automation().then(sms => {
    const dealers = new Set();
    sms.response.rows.forEach(r => dealers.add(r['Dealer']) );

    const groupedReport = [];
    dealers.forEach(d => {
        const dealer = {};
        dealer.dealer = d;
        dealer.customers = [];
        sms.response.rows.forEach(report => {
            if(report['Dealer']===d){
                dealer.customers.push(report);
            }
        })
        groupedReport.push(dealer);
    });

    groupedReport.forEach(t=>console.log(t.dealer+" Customers: "+t.customers.length));
    console.log(dealers.size);
})

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