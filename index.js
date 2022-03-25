const { smsBody, smsHeader, mwHeader, MWURL, REPORT, mwBody, SMSURL } = require("./util/constants");
const { getReport, getToken } = require("./util/moTVCalls");
const excel = require('excel4node');
require('dotenv').config();

const LOGINSMS = process.env.loginSMS
const SECRETSMS = process.env.secretSMS
const LOGINMW = process.env.loginMW
const SECRETMW = process.env.secretMW

const automation = () => getReport(
    MWURL+REPORT,
    mwBody(69, '2022/03/24'),
    mwHeader(
        getToken(
            LOGINMW, 
            SECRETMW
        )
    )
)

const automation2 = () => getReport(
    SMSURL+REPORT,
    smsBody(113, '2022/03/24'),
    smsHeader(
        getToken(
            LOGINSMS, 
            SECRETSMS
        )
    )
)

let temp = '';
const array = [];
automation().then(mw => {
    automation2().then(sms => {
        writeFile(sms.response.rows);
        for(let i=0; i < sms.response.rows.length; i++){
            for(let y=1; y <= mw.response.rows.length; y++) {
                if(y === mw.response.rows.length){
                    if(temp != sms.response.rows[i]['Login']){
                        if(sms.response.rows[i]['cancelled'] === 0){
                            array.push(sms.response.rows[i]['Login']);
                            console.log(sms.response.rows[i]['Login']);
                        }
                    }
                    temp = sms.response.rows[i]['Login'];
                }
            }
        }
        console.log(array.length);
    })
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