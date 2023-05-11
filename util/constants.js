const SMSURL = 'https://sms.yplay.com.br';
const MWURL = 'https://mw.yplay.com.br';
const REPORT = '/api/report/reportSelection';

const SUCCESS = 'OK';
const ERROR = 'ERRO';

const YPLAYPACOTEPREMIUM = 688;
const YPLAYPACOTESTART = 687;
const YPLAYADULTO = 574;

const STINGRAY = 702;
const STINGRAYCO = 775;
const GIBRAFIBRA50 = 732;
const GIGAFIBRALOCAL = 699;
const TCMFAMILIAUNICAST = 17;
const AMERICANETFULLDEMO = 226;
const SOUPLAYMASTERB = 793;
const SOUPLAYMASTERC = 794;
const COPRELAPPLE = 683;
const COPRELGOOGLE = 682;
const YPLAYCOMLOMBIA = 728;

const STINGRAYCOLOMBIA = [
    STINGRAYCO,
    GIBRAFIBRA50,
    GIGAFIBRALOCAL,
    YPLAYCOMLOMBIA
];
const STINGRAYBRASIL = [
    STINGRAY,
    TCMFAMILIAUNICAST,
    AMERICANETFULLDEMO,
    SOUPLAYMASTERB,
    SOUPLAYMASTERC,
    COPRELAPPLE,
    COPRELGOOGLE
];

const CANAISLOCAIS = 'Canais Locais -';

const START = 'Start';
const BASIC = 'Basic';
const COMPACT = 'Compact';
const FULL = 'Full';
const PREMIUM = 'Premium';
const URBANTV = 'UrbanTV';
const ADULTO = 'Adulto';

const switchCase = {
    'Yplay Light': (t) => {
        t.light = 1;
        return t;
    },
    'YPlay Completo': (t) => {
        t.completo = 1;
        return t;
    },
    'YPlay Completo - GIGANET RO': (t) => {
        t.completo = 1;
        return t;
    },
    'SVOD Kids': (t) => {
        t.kids = 1;
        return t;
    },
    'SVOD Nacional': (t) => {
        t.nacionais = 1;
        return t;
    },
    'Yplay UrbanTV': (t) => {
        t.urban = 1;
        return t;
    },
    'default': (t) => {
        t.error = 0;
        return t;
    }
}

const smsBody = (id) => `{
    "data":{
        "reports_id": ${id}
    }
}`
const mwBody = (id, date) => `{
    "data":{
        "reportsId": ${id}
    }
}`
const smsHeader = (token) => {
    return { 'Authorization': token }
}
const mwHeader = (token) => {
    return { 'Authorization-user': token }
}

const TELEMEDICINA_QUERY = `
select 
	p.partners_name  as empresa,
	c.customer_id as id,
	c.customer_ext_sms_id as smsid,
	c.customer_ext_mw_id as mwid,
	c.customer_partners_id as partnerid,
	cs.customer_svas_status as status,
	cs.customer_svas_issmsactive as issmsactive,
	cs.customer_svas_types as "type",
	s.svas_name as svaname,
	s.svas_enum as svaenum ,
	sp.svas_packages_ext_products_id as productid
from 
	customer_svas cs
	inner join customer c on c.customer_id = cs.customer_svas_customer_id 
	inner join svas s on cs.customer_svas_svas_id = s.svas_id 
	inner join partners p on p.partners_id = c.customer_partners_id 
	inner join svas_packages sp on sp.svas_packages_svas_id = s.svas_id and 
	sp.svas_packages_platforms_id = p.partners_platforms_id 
	inner join package_types pt on pt.package_types_id = sp.svas_packages_package_types_id and 
	pt.package_types_type = cs.customer_svas_types
where 
	customer_svas_status is true and 
	svas_enum = 'TELEMEDICINA'
`;

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
    YPLAYPACOTEPREMIUM,
    YPLAYPACOTESTART,
    YPLAYADULTO,
    STINGRAYCOLOMBIA,
    STINGRAYBRASIL,
    CANAISLOCAIS,
    START,
    BASIC,
    COMPACT,
    FULL,
    PREMIUM,
    URBANTV,
    ADULTO,
    switchCase,
    TELEMEDICINA_QUERY
}
