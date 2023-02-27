const { groupByDealerByCustomer, groupByGeneric } = require("./util/groupByFunctions");
const { writeFile } = require("./util/writeToExcelFileFunctions");
const { getReport, getToken } = require("./util/moTVCalls");
require('dotenv').config();
const { smsBody, smsHeader, REPORT, SMSURL, MWURL, mwBody, mwHeader, } = require("./util/constants");
const { validation } = require("./util/packageValidationFunctions");
const { validationUrban } = require("./util/urbanValidation");

const LOGINSMS = process.env.loginSMS
const SECRETSMS = process.env.secretSMS

const LOGINMW = process.env.loginMW
const SECRETMW = process.env.secretMW

const REPORTBRAND = 119;
const REPORTDEALERS = 126;
const REPORTACTIVECUSTOMERS = 118;
const REPORTURBANTV = 88;

const getActiveCustomers = () => getReport(
    MWURL + REPORT,
    mwBody(REPORTACTIVECUSTOMERS),
    mwHeader(
        getToken(LOGINMW, SECRETMW)
    )
);

const getUrbanReports = () => getReport(
    MWURL + REPORT,
    mwBody(REPORTURBANTV),
    mwHeader(
        getToken(LOGINMW, SECRETMW)
    )
);

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

// async function main() {
//     const customers = require('./out/FEV2023_2023-02-27/raw_FEV2023_2023-02-21.json');
//     const dealers = require('./out/FEV2023_2023-02-27/dealers_FEV2023_2023-02-21.json');
//     const activeCustomers = [];
//     const groupedData = groupByDealerByCustomer(customers);
//     for (const dealer of groupedData) {
//         console.log(dealer.dealer);
//     }
//     const { newPackaging, oldPackaging } = await validation(groupedData, activeCustomers, dealers);
//     writeFile(customers, oldPackaging, newPackaging, dealers);
// }

// main();

Promise.all([
    // getCustomersData(), 
    // getDealersData(), 
    // getActiveCustomers(),
    getUrbanReports()
]).then(async (result) => {
    const [
        // customers, 
        // dealers, 
        // activeCustomers, 
        urban
    ] = result;
    // const groupedData = groupByDealerByCustomer(customers.response.rows);
    const validatedUrban = validationUrban(urban.response.rows);
    // const { newPackaging, oldPackaging } = await validation(groupedData, activeCustomers.response.rows, dealers.response.rows);
    writeFile(
        // customers.response.rows, 
        // oldPackaging, 
        // newPackaging, 
        // dealers.response.rows,
        validatedUrban,
        urban.response.rows
    );
}).catch((err) => {
    console.table(err);
});