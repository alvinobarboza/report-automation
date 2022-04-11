const { groupByDealerByCustomer } = require("./util/groupByFunctions");
const { writeFile } = require("./util/writeToExcelFileFunctions");
const { getReport, getToken } = require("./util/moTVCalls");
require('dotenv').config();
const { smsBody, smsHeader, REPORT, SMSURL, } = require("./util/constants");
const validation = require("./util/packageValidationFunctions");

const LOGINSMS = process.env.loginSMS
const SECRETSMS = process.env.secretSMS

const REPORTBRAND = 119;
const REPORTDEALERS = 126;

const getCustomersData = () => getReport(
    SMSURL+REPORT,
    smsBody(REPORTBRAND),
    smsHeader(
        getToken(
            LOGINSMS, 
            SECRETSMS
        )
    )
);
const getDealersData = () => getReport(
    SMSURL+REPORT,
    smsBody(REPORTDEALERS),
    smsHeader(
        getToken(
            LOGINSMS, 
            SECRETSMS
        )
    )
);

Promise.all([getCustomersData(),getDealersData()]).then((result) => {
    const [customers,dealers] = result; 
    const groupedData = groupByDealerByCustomer(customers.response.rows);
    validation(groupedData);
    writeFile(groupedData, dealers.response.rows);
}).catch((err) => {
    console.table(err);
});