const SMSURL = 'https://sms.yplay.com.br';
const MWURL = 'https://mw.yplay.com.br';
const REPORT = '/api/report/reportSelection';

const SUCCESS = 'OK';
const ERROR = 'ERRO';
const BASIC = 'Basic';
const COMPACT = 'Compact';
const FULL = 'Full';
const PREMIUM = 'Premium';

const smsBody = (id, date) => `{
    "data":{
        "reports_id": ${id},
        "where":{
            "data":"${date}"
        }
    }
}`
const mwBody = (id,date) => `{
    "data":{
        "reportsId": ${id},
        "where": {
            "data": {
                "type": "FilterText",
                "value": "${date}"
            }
        }
    }
}`
const smsHeader = (token) => {
    return {'Authorization' : token}
}
const mwHeader = (token) => {
    return {'Authorization-user' : token}
}

module.exports = {
    SMSURL,
    MWURL,
    REPORT,
    smsBody,
    mwBody,
    mwHeader,
    smsHeader,
    SUCCESS,
    ERROR,
    BASIC,
    COMPACT,
    FULL,
    PREMIUM,
}
