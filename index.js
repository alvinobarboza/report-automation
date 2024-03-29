const {
    groupByDealerByCustomer,
    groupByGeneric,
} = require('./util/groupByFunctions');
const { writeFile } = require('./util/writeToExcelFileFunctions');
const { getReport, getToken } = require('./util/moTVCalls');
require('dotenv').config();
const {
    smsBody,
    smsHeader,
    REPORT,
    SMSURL,
    MWURL,
    mwBody,
    mwHeader,
    TELEMEDICINA_QUERY,
} = require('./util/constants');
const { validation } = require('./util/packageValidationFunctions');
const { validationUrban } = require('./util/urbanValidation');

const pool = require('./util/dbconnection.js');
const { validateSvaData } = require('./util/validateSvaCustomer');
const { accessLog, log } = require('./util/logs');

const TELEMEDICINA = 'TELEMEDICINA';
const FITANYWHERE = 'FITANYWHERE';
const BIBLIOTECHIE = 'BIBLIOTECHIE';
const COQUETEL = 'COQUETEL';
const telemedicina = pool.query(TELEMEDICINA_QUERY, [TELEMEDICINA]);
const fitanywhere = pool.query(TELEMEDICINA_QUERY, [FITANYWHERE]);
const bibliotechie = pool.query(TELEMEDICINA_QUERY, [BIBLIOTECHIE]);
const coquetel = pool.query(TELEMEDICINA_QUERY, [COQUETEL]);

const LOGINSMS = process.env.loginSMS;
const SECRETSMS = process.env.secretSMS;

const LOGINMW = process.env.loginMW;
const SECRETMW = process.env.secretMW;

const REPORTBRAND = 119;
const REPORTDEALERS = 126;
const REPORTACTIVECUSTOMERS = 118;
const REPORTURBANTV = 88;
const TELEMEDICINAREPORT = 263;
const FITANYWHEREREPORT = 286;
const BIBLIOTECHIEREPORT = 285;
const COQUETELREPORT = 311;

const getFitanywhereData = () =>
    getReport(
        SMSURL + REPORT,
        smsBody(FITANYWHEREREPORT),
        smsHeader(getToken(LOGINSMS, SECRETSMS))
    );

const getBibliotechieData = () =>
    getReport(
        SMSURL + REPORT,
        smsBody(BIBLIOTECHIEREPORT),
        smsHeader(getToken(LOGINSMS, SECRETSMS))
    );

const getTelemedicinaData = () =>
    getReport(
        SMSURL + REPORT,
        smsBody(TELEMEDICINAREPORT),
        smsHeader(getToken(LOGINSMS, SECRETSMS))
    );

const getCoquetelData = () =>
    getReport(
        SMSURL + REPORT,
        smsBody(COQUETELREPORT),
        smsHeader(getToken(LOGINSMS, SECRETSMS))
    );

const getActiveCustomers = () =>
    getReport(
        MWURL + REPORT,
        mwBody(REPORTACTIVECUSTOMERS),
        mwHeader(getToken(LOGINMW, SECRETMW))
    );

const getUrbanReports = () =>
    getReport(
        MWURL + REPORT,
        mwBody(REPORTURBANTV),
        mwHeader(getToken(LOGINMW, SECRETMW))
    );

const getCustomersData = () =>
    getReport(
        SMSURL + REPORT,
        smsBody(REPORTBRAND),
        smsHeader(getToken(LOGINSMS, SECRETSMS))
    );

const getDealersData = () =>
    getReport(
        SMSURL + REPORT,
        smsBody(REPORTDEALERS),
        smsHeader(getToken(LOGINSMS, SECRETSMS))
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

(async function () {
    try {
        const customers = await getCustomersData();
        const dealers = await getDealersData();
        const activeCustomers = await getActiveCustomers();
        const urban = await getUrbanReports();
        const telemedicinaActive = await telemedicina;
        const bibliotechieActive = await bibliotechie;
        const fitanywhereActive = await fitanywhere;
        const coquetelActive = await coquetel;

        const telemedicinaSubscribed = await getTelemedicinaData();
        const fitanywhereSubscribed = await getFitanywhereData();
        const bibliotechieSubscribed = await getBibliotechieData();
        const coquetelSubscribed = await getCoquetelData();

        const telemedicinaValidatedData = validateSvaData(
            telemedicinaActive.rows,
            telemedicinaSubscribed.response.rows
        );
        const fitanywhereValidatedData = validateSvaData(
            fitanywhereActive.rows,
            fitanywhereSubscribed.response.rows
        );
        const bibliotechieValidatedData = validateSvaData(
            bibliotechieActive.rows,
            bibliotechieSubscribed.response.rows
        );

        const coquetelValidatedData = validateSvaData(
            coquetelActive.rows,
            coquetelSubscribed.response.rows
        );

        const svas = [
            { data: telemedicinaValidatedData, sva: TELEMEDICINA },
            { data: fitanywhereValidatedData, sva: FITANYWHERE },
            { data: bibliotechieValidatedData, sva: BIBLIOTECHIE },
            { data: coquetelValidatedData, sva: COQUETEL },
        ];
        const groupedData = groupByDealerByCustomer(customers.response.rows);
        const validatedUrban = validationUrban(urban.response.rows);
        const { newPackaging, oldPackaging } = await validation(
            groupedData,
            activeCustomers.response.rows,
            dealers.response.rows
        );
        writeFile(
            customers.response.rows,
            oldPackaging,
            newPackaging,
            dealers.response.rows,
            validatedUrban,
            urban.response.rows,
            svas
        );
    } catch (error) {
        console.log(error);
        accessLog(error.stack);
    }
})();
