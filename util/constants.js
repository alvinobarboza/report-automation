const SMSURL = 'https://sms.yplay.com.br';
const MWURL = 'https://mw.yplay.com.br';
const REPORT = '/api/report/reportSelection';

const SUCCESS = 'OK';
const ERROR = 'ERRO';

const BASIC = 'Basic';
const COMPACT = 'Compact';
const FULL = 'Full';
const PREMIUM = 'Premium';
const URBANTV = 'UrbanTV';

const switchCase = {
    'Yplay Light': (t) => {
        t.light = 1;
    },
    'YPlay Completo': (t) => {
        t.completo = 1;
    },
    'SVOD Kids': (t) => {
        t.kids = 1;
    },
    'SVOD Nacional': (t) => {
        t.nacionais = 1;
    },
    'SVOD Studio': (t) => {
        t.studios = 1;
    },
    'Yplay UrbanTV': (t) => {
        t.urban = 1;
    },
    'default': (t) => {
        t.error = 0;
    }        
}

const smsBody = (id) => `{
    "data":{
        "reports_id": ${id}
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
    URBANTV,
    switchCase
}
