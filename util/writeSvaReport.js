const excel = require('excel4node');
const {
    headerStyle,
    dataStyle,
    dataStyleOK,
    dataStyleError,
    dataStyleException1,
    dataStyleException2,
    headerStyleException,
    dataStyleException3,
} = require('./stylesExcelFile');
const {
    getCurrentMonthYearShort,
    getCurrentMonth,
    getCurrentYear,
} = require('./dateManipulation');
const { validateLoginTest } = require('./packageValidationFunctions');

const writeSvaReport = (dataTuple, getPath, insertFilenameToFilenames, sva) => {
    const [data, raw] = dataTuple;
    const cadastrados = data.reduce(
        (amount, dealer) => (amount += dealer.subscribed),
        0
    );
    const ativos = data.reduce(
        (amount, dealer) => (amount += dealer.active),
        0
    );

    try {
        //console.log(array.dealer);
        const MAIN_HEADER = sva;
        const MAIN_HEADER_ROWS_COUNT = 8;
        const SECONDARY_HEADER = [
            'Empresas',
            'CNPJ',
            'QTD Cadastrados',
            'QTD Ativos',
        ];
        const headerSheetAllcustomers = [
            'Empresa',
            'Cliente',
            'Pacote',
            'Data Ativação',
        ];

        const workBook = new excel.Workbook();

        //------------------------ workSheet 1 ----------------------------
        const workSheetResult = workBook.addWorksheet('Operadora');

        workSheetResult.column(1).setWidth(50);
        workSheetResult.column(2).setWidth(40);
        workSheetResult.column(3).setWidth(22);
        workSheetResult.column(4).setWidth(18);
        workSheetResult
            .cell(1, 1, 1, 3, true)
            .string(MAIN_HEADER)
            .style(headerStyleException);
        workSheetResult
            .cell(3, 1, 3, 2, true)
            .string('Período')
            .style(dataStyleException1);
        workSheetResult
            .cell(3, 3)
            .string(getCurrentMonthYearShort())
            .style(dataStyleException2);
        workSheetResult
            .cell(5, 1, 5, 2, true)
            .string('Assinantes cadastrados na Plataforma moTV')
            .style(dataStyleException1);
        workSheetResult
            .cell(5, 3)
            .number(cadastrados)
            .style(dataStyleException2);
        workSheetResult
            .cell(7, 1, 7, 2, true)
            .string(`Assinantes ativos na Plataforma ${sva}`)
            .style(dataStyleException1);
        workSheetResult.cell(7, 3).number(ativos).style(dataStyleException2);

        for (let i = 2; i <= MAIN_HEADER_ROWS_COUNT; i++) {
            if (i % 2 === 0) {
                workSheetResult.row(i).setHeight(8);
                continue;
            }
        }
        workSheetResult.row(MAIN_HEADER_ROWS_COUNT + 1).filter();
        for (let i = 0; i < SECONDARY_HEADER.length; i++) {
            workSheetResult
                .cell(MAIN_HEADER_ROWS_COUNT + 1, i + 1)
                .string(SECONDARY_HEADER[i])
                .style(headerStyleException);
        }

        for (let i = 0; i < data.length; i++) {
            workSheetResult
                .cell(i + MAIN_HEADER_ROWS_COUNT + 2, 1)
                .string(data[i].dealer.toUpperCase())
                .style(dataStyleException3);
            workSheetResult
                .cell(i + MAIN_HEADER_ROWS_COUNT + 2, 2)
                .string(data[i].dealersCnpj)
                .style(dataStyleException3);
            workSheetResult
                .cell(i + MAIN_HEADER_ROWS_COUNT + 2, 3)
                .number(data[i].subscribed)
                .style(dataStyleException2);
            workSheetResult
                .cell(i + MAIN_HEADER_ROWS_COUNT + 2, 4)
                .number(data[i].active)
                .style(dataStyleException2);
        }

        // //------------------------ workSheet 2 ----------------------------
        const worksheetAllCustomers = workBook.addWorksheet('TodosClientes');

        worksheetAllCustomers.column(2).setWidth(20);
        worksheetAllCustomers.column(3).setWidth(25);
        worksheetAllCustomers.column(4).setWidth(25);
        worksheetAllCustomers.column(5).setWidth(20);

        worksheetAllCustomers.row(2).filter();
        for (let i = 0; i < headerSheetAllcustomers.length; i++) {
            worksheetAllCustomers
                .cell(2, i + 2)
                .string(headerSheetAllcustomers[i])
                .style(headerStyle);
        }

        const notValidDealers = [
            1, // 'JACON dealer'
            3, // 'Admin'
            5, // 'Youcast CSMS'
            7, // 'Z-Não-usar'
            13, // 'Z-Não-usar'
            22, // 'ADMIN-YOUCAST'
        ];

        for (let i = 0; i < raw.length; i++) {
            // console.log(raw[i])
            const styleValidation = notValidDealers.includes(raw[i].dealerid)
                ? headerStyle
                : validateLoginTest(raw[i])
                ? headerStyle
                : dataStyle;

            worksheetAllCustomers
                .cell(i + 3, 2)
                .string(raw[i].dealer)
                .style(styleValidation);
            worksheetAllCustomers
                .cell(i + 3, 3)
                .string(raw[i].login)
                .style(styleValidation);
            worksheetAllCustomers
                .cell(i + 3, 4)
                .string(raw[i].product)
                .style(styleValidation);
            worksheetAllCustomers
                .cell(i + 3, 5)
                .date(raw[i].activation)
                .style(styleValidation);
        }

        // ==========================Writes file=============================
        const filename = getPath(
            `RELATORIO DE ASSINANTES - ${sva} - Ref. - ${getCurrentMonth()}_${getCurrentYear()}.xlsx`
        );
        insertFilenameToFilenames(filename);
        workBook.write(filename);
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    writeSvaReport,
};
