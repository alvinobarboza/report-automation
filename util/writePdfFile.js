const fs = require('fs');
const Pdfmake = require('pdfmake');
const AstartesData = require('./AstartesData.json');
const { getDateAstertes, getCurrentMonth, getCurrentYear, convertTimestampToYearMonthDay, getLastMonthTimestamp } = require('./dateManipulation');
const { dealerValidation } = require('./packageValidationFunctions');

const fonts = {
	Roboto: {
		normal: './fonts/roboto/Roboto-Regular.ttf',
		bold: './fonts/roboto/Roboto-Medium.ttf',
		italics: './fonts/roboto/Roboto-Italic.ttf',
		bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
	}
};
const getBodyData = (old, neW) => {
	let amount = 0;
	for (let i = 0; i < old.length; i++) {
		if (dealerValidation(old[i])) {
			amount += old[i].fullActiveCount + old[i].premiumActiveCount;
		}
	}
	for (let i = 0; i < neW.length; i++) {
		if (dealerValidation(neW[i])) {
			amount += neW[i].startActiveCount + neW[i].premiumActiveCount;
		}
	}
	const lastMonthAmount = getAstarteLastMonthCustomers();
	saveAstartesCustomers(amount);
	return {
		content: [
			{ text: 'ANEXO 2 - Relatório de Assinantes', style: 'header' },
			{
				style: 'headerTable',
				table: {
					widths: ['*'],
					body: [
						[{ text: 'RELATÓRIO BASE DE ASSINANTES', },],
					]
				}
			},
			{
				style: 'tableExample',
				table: {
					widths: [200, '*'],
					body: [
						[{ text: 'Data', fillColor: '#bfbfbf' }, getDateAstertes()],
						[{ text: 'Licenciado', fillColor: '#bfbfbf' }, { text: 'YOU CAST COMERCIO DE EQUIPAMENTOS ELETRONICOS LTDA', }],
						[{ text: 'Mês de referência ', fillColor: '#bfbfbf' }, { text: `${getCurrentMonth()}_${getCurrentYear()}`, }],
						[{ text: 'Número total de assinantes no início do mês', fillColor: '#bfbfbf' }, { text: lastMonthAmount, }],
						[{ text: 'Número total de assinantes no final do mês', fillColor: '#bfbfbf' }, { text: amount, }],
						[{ text: 'Novos assinantes do mês', fillColor: '#bfbfbf' }, { text: amount - lastMonthAmount, }]
					]
				}
			},
			{
				style: 'tableExample',
				table: {
					widths: [200, '*'],
					body: [
						[{ text: 'Provedores agregados', fillColor: '#bfbfbf' }, { text: 'Número de assinantes', fillColor: '#bfbfbf' }],
						[{ text: 'YPLAY', }, { text: amount, }],
					]
				}
			},
			{
				style: 'tableExample',
				table: {
					widths: [200, '*'],
					body: [
						[{ text: 'Responsável pelo report:', fillColor: '#bfbfbf' }, { text: 'Carlos Eduardo Salce/Alvino N. C. Barboza', }],
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

	const { year, month, day } = convertTimestampToYearMonthDay((new Date()).getTime());

	for (let i = 0; i < AstartesData.data.length; i++) {
		const value = AstartesData.data[i];
		const storedDate = convertTimestampToYearMonthDay(value.timestamp);
		if (storedDate.month === month && storedDate.year === year && storedDate.day === day) {
			AstartesData.data[i].value = amount;
			hasValue = true;
		}
	}

	if (!hasValue) {
		if (day === 20) {
			AstartesData.data.push({ timestamp: (new Date).getTime(), value: amount });
		}
	}

	const jsonData = JSON.stringify(AstartesData, null, 2);
	fs.writeFileSync('./util/AstartesData.json', jsonData);
}

const getAstarteLastMonthCustomers = () => {
	const { year, month, day } = convertTimestampToYearMonthDay(getLastMonthTimestamp());
	let amount = 0;

	for (let i = 0; i < AstartesData.data.length; i++) {
		const data = AstartesData.data[i];
		const storedDate = convertTimestampToYearMonthDay(data.timestamp);
		if (storedDate.month === month && storedDate.year === year && storedDate.day === day) {
			amount = data.value;
		}
	}
	return amount;
}

// Report Astarte
const writePdfFile = (old, neW, insertFilenameToFilenames, getPath) => {
	try {
		const pdfmake = new Pdfmake(fonts);
		const body = getBodyData(old, neW);
		const pdfDoc = pdfmake.createPdfKitDocument(body, {});
		const filename = getPath(`Relatório Base de Assinantes - ${getCurrentMonth()}_${getCurrentYear()}.pdf`);
		insertFilenameToFilenames(filename);
		pdfDoc.pipe(fs.createWriteStream(filename));
		pdfDoc.end();
	} catch (error) {
		console.log(error)
	}
}
module.exports = writePdfFile;