const { groupByDealerByCustomer, groupByGeneric } = require("./util/groupByFunctions");
const { writeFile } = require("./util/writeToExcelFileFunctions");
const { getReport, getToken } = require("./util/moTVCalls");
require('dotenv').config();
const { smsBody, smsHeader, REPORT, SMSURL, MWURL, mwBody, mwHeader, TELEMEDICINA_QUERY, } = require("./util/constants");
const { validation } = require("./util/packageValidationFunctions");
const { validationUrban } = require("./util/urbanValidation");

const pool = require("./util/dbconnection.js");
const { validateTelemedicinaData } = require("./util/validateTelemedicinaCustomer");
const { accessLog } = require("./util/logs");
const telemedicina = pool.query(TELEMEDICINA_QUERY);

const LOGINSMS = process.env.loginSMS
const SECRETSMS = process.env.secretSMS

const LOGINMW = process.env.loginMW
const SECRETMW = process.env.secretMW

const REPORTBRAND = 119;
const REPORTDEALERS = 126;
const REPORTACTIVECUSTOMERS = 118;
const REPORTURBANTV = 88;
const TELEMEDICINAREPORT = 263;

const getTelemedicinaData = () => getReport(
    SMSURL + REPORT,
    smsBody(TELEMEDICINAREPORT),
    smsHeader(
        getToken(
            LOGINSMS,
            SECRETSMS
        )
    )
);

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


(async function (){
    try {
        const customers = await getCustomersData();
        const dealers = await getDealersData();
        const activeCustomers = await getActiveCustomers();
        const urban = await getUrbanReports()
        const telemedicinaActive = await telemedicina;
        const telemedicinaSubscribed = await getTelemedicinaData();
    
        const telemedicinaValidatedData = validateTelemedicinaData(telemedicinaActive.rows, telemedicinaSubscribed.response.rows);
        const groupedData = groupByDealerByCustomer(customers.response.rows);
        const validatedUrban = validationUrban(urban.response.rows);
        const { newPackaging, oldPackaging } = await validation(groupedData, activeCustomers.response.rows, dealers.response.rows);
        console.log(oldPackaging);
        writeFile(
            customers.response.rows,
            oldPackaging,
            newPackaging,
            dealers.response.rows,
            validatedUrban,
            urban.response.rows,
            telemedicinaValidatedData
        );        
    } catch (error) {
        console.log(error);
        accessLog(error.stack);
    }
})()

// Promise.all([
//     getCustomersData(),
//     getDealersData(),
//     getActiveCustomers(),
//     getUrbanReports(),
//     telemedicina,
//     getTelemedicinaData()
// ]).then(async (result) => {
//     const [
//             customers,
//             dealers,
//             activeCustomers,
//             urban,
//             telemedicinaActive,
//             telemedicinaSubscribed
//     ] = result;

//     const telemedicinaValidatedData = validateTelemedicinaData(telemedicinaActive.rows, telemedicinaSubscribed.response.rows);
//     writeFile(telemedicinaValidatedData);
//     const groupedData = groupByDealerByCustomer(customers.response.rows);
//     const validatedUrban = validationUrban(urban.response.rows);
//     const { newPackaging, oldPackaging } = await validation(groupedData, activeCustomers.response.rows, dealers.response.rows);
//     console.log(oldPackaging);
//     writeFile(
//         customers.response.rows,
//         oldPackaging,
//         newPackaging,
//         dealers.response.rows,
//         validatedUrban,
//         urban.response.rows
//     );
// }).catch((err) => {
//     console.log(err);
// });