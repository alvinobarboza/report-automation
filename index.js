const { groupByDealerByCustomer } = require("./util/groupByFunctions");
const { writeFile } = require("./util/writeToExcelFileFunctions");
const { getReport, getToken } = require("./util/moTVCalls");
require('dotenv').config();
const { smsBody, smsHeader, REPORT, SMSURL, MWURL, mwBody, mwHeader, } = require("./util/constants");
const { validation } = require("./util/packageValidationFunctions");

const LOGINSMS = process.env.loginSMS
const SECRETSMS = process.env.secretSMS

const LOGINMW = process.env.loginMW
const SECRETMW = process.env.secretMW

const REPORTBRAND = 119;
const REPORTDEALERS = 126;
const REPORTACTIVECUSTOMERS = 118;

const getActiveCustomers = () => getReport(
    MWURL + REPORT,
    mwBody(REPORTACTIVECUSTOMERS),
    mwHeader(
        getToken(LOGINMW, SECRETMW)
    )
)

const getCustomersData = () => getReport(
    SMSURL + REPORT,
    smsBody(REPORTBRAND),
    smsHeader(
        getToken(
            LOGINSMS,
            SECRETSMS
        )
    )
);
const getDealersData = () => getReport(
    SMSURL + REPORT,
    smsBody(REPORTDEALERS),
    smsHeader(
        getToken(
            LOGINSMS,
            SECRETSMS
        )
    )
);

Promise.all([getCustomersData(), getDealersData(), getActiveCustomers()]).then((result) => {
    const [customers, dealers, activeCustomers] = result;
    const groupedData = groupByDealerByCustomer(customers.response.rows);
    const { newPackaging, oldPackaging } = validation(groupedData, activeCustomers.response.rows);
    newPackaging.forEach(c => c.customers.forEach(d => console.log(d.login, d.isactive)));
    writeFile(oldPackaging, newPackaging, dealers.response.rows);
}).catch((err) => {
    console.table(err);
});