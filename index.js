const { groupByDealerByCustomer } = require("./util/groupByFunctions");
const { writeFile } = require("./util/writeToExcelFileFunctions");
const { getReport, getToken } = require("./util/moTVCalls");
require('dotenv').config();
const { smsBody, smsHeader, REPORT, SMSURL, } = require("./util/constants");
const validation = require("./util/packageValidationFunctions");

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

automation().then(sms => {
    const groupedData = groupByDealerByCustomer(sms.response.rows);
    validation(groupedData);
    writeFile(groupedData);
}); 