const fs = require('fs');
const Pdfmake = require('pdfmake');
const AstartesData = require('./AstartesData.json');
const { getDate, getCurrentMonth, getCurrentYear, convertTimestampToMonthAndYear, getLastMonthTimestamp } = require('./dateManipulation');

const fonts = {
	Roboto: {
		normal: './fonts/roboto/Roboto-Regular.ttf',
		bold: './fonts/roboto/Roboto-Medium.ttf',
		italics: './fonts/roboto/Roboto-Italic.ttf',
		bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
	}
};
const getBodyData = (data) => {
	let amount = 0;
	data.forEach(element => {
        if(element.dealer !== 'ADMIN-YOUCAST' && 
            element.dealer !== 'JACON dealer' && 
            element.dealer !== 'TCM Telecom' &&
            element.dealer !== 'Youcast CSMS' && 
            element.dealer !== 'YPLAY' && 
            element.dealer !== 'Z-Não-usar' && 
            element.dealer !== 'softxx' &&
			element.dealer !== 'LBR' && 
			element.dealer !== 'net-angra')
        {
            amount += element.fullCount + element.premiumCount;
        }
    });
	const lastMonthAmount = getAstarteLastMonthCustomers();
	saveAstartesCustomers(amount);
	return {
		content: [
			{text: 'ANEXO 2 - Relatório de Assinantes', style: 'header'},
			{
				style: 'headerTable',
				table: {
					widths: ['*'],
					body: [
						[{text:'RELATÓRIO BASE DE ASSINANTES', },],
					]
				}
			},
			{
				style: 'tableExample',
				table: {
					widths: [200, '*'],
					body: [
						[{text:'Data', fillColor: '#bfbfbf'}, getDate()],
						[{text:'Licenciado', fillColor: '#bfbfbf'}, {text: 'YOU CAST COMERCIO DE EQUIPAMENTOS ELETRONICOS LTDA', }],
						[{text:'Mês de referência ', fillColor: '#bfbfbf'}, {text: `${getCurrentMonth()}_${getCurrentYear()}`,}],
						[{text:'Número total de assinantes no início do mês', fillColor: '#bfbfbf'}, {text: lastMonthAmount,}],
						[{text:'Número total de assinantes no final do mês', fillColor: '#bfbfbf'}, {text: amount,}],
						[{text:'Novos assinantes do mês', fillColor: '#bfbfbf'}, {text: amount-lastMonthAmount,}]
					]
				}
			},
			{
				style: 'tableExample',
				table: {
					widths: [200, '*'],
					body: [
						[{text:'Provedores agregados', fillColor: '#bfbfbf'}, {text:'Número de assinantes', fillColor: '#bfbfbf'}],
						[{text:'YPLAY', }, {text: amount, }],
					]
				}
			},
			{
				style: 'tableExample',
				table: {
					widths: [200, '*'],
					body: [
						[{text:'Responsável pelo report:', fillColor: '#bfbfbf'}, {text:'Carlos Eduardo Salce/Alvino N. C. Barboza', }],
					]
				}
			},
		],
		styles: {
			header: {
				fontSize: 12,
				bold: true,
				alignment: 'center',
				margin: [0, 0, 0, 10]
			},
			headerTable: {
				fontSize: 16,
				alignment: 'center',
				margin: [0, 0, 0, 10]
			},
			tableExample: {
				fontSize: 10,
				margin: [0, 5, 0, 15]
			},
		},
		defaultStyle: {
			// alignment: 'justify'
		}
	}
}

const saveAstartesCustomers = (amount) => {
	let hasValue = false;

	const currentMonth = getCurrentMonth();
	const currentYear = getCurrentYear();

	AstartesData.data.forEach((value, index)=>{
		const storedDate = convertTimestampToMonthAndYear(value.timestamp);
		if(storedDate.month === currentMonth && storedDate.year === currentYear){
			AstartesData.data[index].value = amount;
			hasValue = true;
		}
	})
	if(!hasValue){
		AstartesData.data.push({timestamp: (new Date).getTime(), value: amount});
	}

	const jsonData = JSON.stringify(AstartesData, null, 2);
	fs.writeFileSync('./util/AstartesData.json', jsonData);	
}

const getAstarteLastMonthCustomers = ()=>{
	const lastMonthDate = convertTimestampToMonthAndYear(getLastMonthTimestamp());
	let amount = 0;
	AstartesData.data.forEach((value, index)=>{
		const storedDate = convertTimestampToMonthAndYear(value.timestamp);
		if(storedDate.month === lastMonthDate.month && storedDate.year === lastMonthDate.year){
			amount = AstartesData.data[index].value ;
		}
	})
	return amount;
}

const writePdfFile = (data) => {
	const pdfmake = new Pdfmake(fonts);
	const body = getBodyData(data);
	const pdfDoc = pdfmake.createPdfKitDocument(body, {});
	pdfDoc.pipe(fs.createWriteStream(`Relatório Base de Assinantes - ${getCurrentMonth()}_${getCurrentYear()}.pdf`));
	pdfDoc.end();	
}
module.exports = writePdfFile;