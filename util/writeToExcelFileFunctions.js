const excel = require('excel4node');
const { BASIC, COMPACT, FULL, PREMIUM, URBANTV, ERROR, START } = require('./constants');
const { getCurrentMonth, getCurrentYear, getCurrentMonthYearShort, getDateRange } = require('./dateManipulation');
const { groupByGeneric } = require('./groupByFunctions');
const { validateYplayExceptions, dealerValidation } = require('./packageValidationFunctions');
const {
    headerStyle,
    dataStyle,
    dataStyleError,
    dataStyleOK,
    headerStyleException,
    dataStyleException1,
    dataStyleException2,
    dataStyleException3,
    dataStyleSimba,
    headerStyleSimba,
    dataStyleSimbaProviders
} = require('./stylesExcelFile');
const writePdfFile = require('./writePdfFile');
const sendEmail = require('./email/mailSender');

const FILENAMES = [];

function insertFilenameToFilenames(filename) {
    FILENAMES.push({
        filename: filename,
        path: `./${filename}`,
    });
}

function writeFile(oldPackaging, newPackaging, dealers) {
    // writeBrandReportOld(oldPackaging);
    // writeBrandReportNew(newPackaging);
    // writeToExeptionReport([...newPackaging, ...oldPackaging]);

    // Olhar relatório Sumicity ativo bl
    // Report Astarte
    writePdfFile(oldPackaging, newPackaging, insertFilenameToFilenames);

    // Olhar relatório Sumicity ativo bl
    // Report Simba
    // writeProgramadorasReportSimba(oldPackaging, newPackaging, dealers);

    // Olhar relatório Sumicity ativo bl
    // Report CNN / FISH
    // writeProgramadorasReportGeneric(oldPackaging, newPackaging);

    // Send email
    // sendEmail(FILENAMES).catch(e => console.log(e));
}

const writeBrandReportOld = (data) => {
    try {
        const headerSheetResult = ['Brand', BASIC, COMPACT, FULL, PREMIUM, 'Pacotização errada', 'Usuário teste', 'Total Clientes ativos'];
        const headerSheetAllcustomers = ['Brand', 'Customer', 'Pacote', 'Data Ativação',];
        const headerSheetAllcustomersValidation = ['Dealer', 'Customer', 'Pacote', 'Status',];

        const workbook = new excel.Workbook({
            defaultFont: {
                color: '#000000',
                size: 12
            },
            dateFormat: 'dd/mm/yyyy hh:mm:ss',
        });

        const worksheetResult = workbook.addWorksheet('Resultado', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetResult.column(2).setWidth(27);
        worksheetResult.column(3).setWidth(20);
        worksheetResult.column(4).setWidth(20);
        worksheetResult.column(5).setWidth(20);
        worksheetResult.column(6).setWidth(20);
        worksheetResult.column(7).setWidth(27);
        worksheetResult.column(8).setWidth(27);
        worksheetResult.column(9).setWidth(27);
        worksheetResult.row(2).filter();

        const worksheetAllCustomers = workbook.addWorksheet('TodosClientes', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetAllCustomers.column(2).setWidth(25);
        worksheetAllCustomers.column(3).setWidth(40);
        worksheetAllCustomers.column(4).setWidth(35);
        worksheetAllCustomers.column(5).setWidth(20);
        worksheetAllCustomers.row(2).filter();

        const worksheetAllCustomersValidation = workbook.addWorksheet('TodosClientesValidacao', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetAllCustomersValidation.row(2).filter();
        worksheetAllCustomersValidation.column(2).setWidth(25);
        worksheetAllCustomersValidation.column(3).setWidth(40);
        worksheetAllCustomersValidation.column(4).setWidth(35);
        worksheetAllCustomersValidation.column(5).setWidth(20);

        for (let i = 0; i < headerSheetResult.length; i++) {
            worksheetResult.cell(2, (i + 2)).string(headerSheetResult[i]).style(headerStyle);
        }

        for (let i = 0; i < headerSheetAllcustomers.length; i++) {
            worksheetAllCustomers.cell(2, (i + 2)).string(headerSheetAllcustomers[i]).style(headerStyle);
        }

        for (let i = 0; i < headerSheetAllcustomersValidation.length; i++) {
            worksheetAllCustomersValidation.cell(2, (i + 2)).string(headerSheetAllcustomersValidation[i]).style(headerStyle);
        }

        let rowCounter = 0;
        let rowCustomersCounter = 0;
        for (let i = 0; i < data.length; i++) {
            if (dealerValidation(data[i])) {
                const columns = Object.keys(data[i]);
                let columnCount = 0;
                for (let y = 0; y < columns.length; y++) {
                    switch (columns[y]) {
                        case 'dealer':
                            worksheetResult.cell((rowCounter + 3), 2).string(data[i][columns[y]].toUpperCase()).style(dataStyle);
                            columnCount++;
                            break;
                        case 'basicCount':
                            worksheetResult.cell((rowCounter + 3), 3).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'compactCount':
                            worksheetResult.cell((rowCounter + 3), 4).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'fullCount':
                            worksheetResult.cell((rowCounter + 3), 5).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'premiumCount':
                            worksheetResult.cell((rowCounter + 3), 6).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'error':
                            worksheetResult.cell((rowCounter + 3), 7).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'test':
                            worksheetResult.cell((rowCounter + 3), 8).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        default:
                            break;
                    }
                    if (columnCount === 7) {
                        worksheetResult.cell((rowCounter + 3), 9)
                            .formula(`=SUM(C${rowCounter + 3}:H${rowCounter + 3})`).style(dataStyle);
                    }
                }
                //Validation sheet
                for (let y = 0; y < data[i].customers.length; y++) {
                    worksheetAllCustomersValidation.cell((rowCustomersCounter + 3), 2)
                        .string(data[i].dealer).style(dataStyle);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter + 3), 3)
                        .string(data[i].customers[y].login).style(dataStyle);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter + 3), 4)
                        .string(data[i].customers[y].pacoteYplay ? data[i].customers[y].pacoteYplay : 'UserTest')
                        .style(data[i].customers[y].pacoteYplayStatus === 'ERRO' ? dataStyleError : dataStyleOK);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter + 3), 5)
                        .string(data[i].customers[y].pacoteYplayStatus ? data[i].customers[y].pacoteYplayStatus : 'UserTest')
                        .style(data[i].customers[y].pacoteYplayStatus === 'ERRO' ? dataStyleError : dataStyleOK);
                    rowCustomersCounter++;
                }
                //Validation sheet end
                rowCounter++;
            }
        }

        let rowIndex = 0;
        for (let i = 0; i < data.length; i++) {
            for (let y = 0; y < data[i].customers.length; y++) {
                for (let z = 0; z < data[i].customers[y].products.length; z++) {
                    worksheetAllCustomers.cell((rowIndex + 3), 2).string(data[i].dealer).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex + 3), 3).string(data[i].customers[y].products[z].login).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex + 3), 4).string(data[i].customers[y].products[z].product).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex + 3), 5).date(data[i].customers[y].products[z].activation).style(dataStyle);
                    rowIndex++;
                }
            }
        }
        const filename = `Relatório de Licenças Ativas (Antiga Pacotização) - ${getCurrentMonth()}_${getCurrentYear()}.xlsx`;
        insertFilenameToFilenames(filename);
        workbook.write(filename);
    } catch (error) {
        console.log(error);
    }
}

const writeBrandReportNew = (data) => {
    try {
        const headerSheetResult = ['Brand', START, PREMIUM, 'Usuário teste', 'Total Clientes ativos'];
        const headerSheetAllcustomers = ['Brand', 'Customer', 'Pacote', 'Data Ativação',];
        const headerSheetAllcustomersValidation = ['Dealer', 'Customer', 'Pacote', 'Status',];

        const workbook = new excel.Workbook({
            defaultFont: {
                color: '#000000',
                size: 12
            },
            dateFormat: 'dd/mm/yyyy hh:mm:ss',
        });

        const worksheetResult = workbook.addWorksheet('Resultado', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetResult.column(2).setWidth(27);
        worksheetResult.column(3).setWidth(20);
        worksheetResult.column(4).setWidth(20);
        worksheetResult.column(5).setWidth(20);
        worksheetResult.column(6).setWidth(27);
        worksheetResult.row(2).filter();

        const worksheetAllCustomers = workbook.addWorksheet('TodosClientes', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetAllCustomers.column(2).setWidth(25);
        worksheetAllCustomers.column(3).setWidth(40);
        worksheetAllCustomers.column(4).setWidth(35);
        worksheetAllCustomers.column(5).setWidth(20);
        worksheetAllCustomers.row(2).filter();

        const worksheetAllCustomersValidation = workbook.addWorksheet('TodosClientesValidacao', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetAllCustomersValidation.row(2).filter();
        worksheetAllCustomersValidation.column(2).setWidth(25);
        worksheetAllCustomersValidation.column(3).setWidth(40);
        worksheetAllCustomersValidation.column(4).setWidth(35);
        worksheetAllCustomersValidation.column(5).setWidth(20);

        for (let i = 0; i < headerSheetResult.length; i++) {
            worksheetResult.cell(2, (i + 2)).string(headerSheetResult[i]).style(headerStyle);
        }

        for (let i = 0; i < headerSheetAllcustomers.length; i++) {
            worksheetAllCustomers.cell(2, (i + 2)).string(headerSheetAllcustomers[i]).style(headerStyle);
        }

        for (let i = 0; i < headerSheetAllcustomersValidation.length; i++) {
            worksheetAllCustomersValidation.cell(2, (i + 2)).string(headerSheetAllcustomersValidation[i]).style(headerStyle);
        }

        let rowCounter = 0;
        let rowCustomersCounter = 0;
        for (let i = 0; i < data.length; i++) {
            if (dealerValidation(data[i])) {
                const columns = Object.keys(data[i]);
                let columnCount = 0;
                for (let y = 0; y < columns.length; y++) {
                    switch (columns[y]) {
                        case 'dealer':
                            worksheetResult.cell((rowCounter + 3), 2).string(data[i][columns[y]].toUpperCase()).style(dataStyle);
                            columnCount++;
                            break;
                        case 'startCount':
                            worksheetResult.cell((rowCounter + 3), 3).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'premiumCount':
                            worksheetResult.cell((rowCounter + 3), 4).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'test':
                            worksheetResult.cell((rowCounter + 3), 5).number(data[i][columns[y]]).style(dataStyle);
                            columnCount++;
                            break;
                        default:
                            break;
                    }
                    if (columnCount === 4) {
                        worksheetResult.cell((rowCounter + 3), 6)
                            .formula(`=SUM(C${rowCounter + 3}:E${rowCounter + 3})`).style(dataStyle);
                    }
                }
                //Validation sheet
                for (let y = 0; y < data[i].customers.length; y++) {
                    worksheetAllCustomersValidation.cell((rowCustomersCounter + 3), 2)
                        .string(data[i].dealer).style(dataStyle);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter + 3), 3)
                        .string(data[i].customers[y].login).style(dataStyle);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter + 3), 4)
                        .string(data[i].customers[y].pacoteYplay ? data[i].customers[y].pacoteYplay : 'UserTest')
                        .style(data[i].customers[y].pacoteYplayStatus === 'ERRO' ? dataStyleError : dataStyleOK);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter + 3), 5)
                        .string(data[i].customers[y].pacoteYplayStatus ? data[i].customers[y].pacoteYplayStatus : 'UserTest')
                        .style(data[i].customers[y].pacoteYplayStatus === 'ERRO' ? dataStyleError : dataStyleOK);
                    rowCustomersCounter++;
                }
                //Validation sheet end
                rowCounter++;
            }
        }

        let rowIndex = 0;
        for (let i = 0; i < data.length; i++) {
            for (let y = 0; y < data[i].customers.length; y++) {
                for (let z = 0; z < data[i].customers[y].products.length; z++) {
                    worksheetAllCustomers.cell((rowIndex + 3), 2).string(data[i].dealer).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex + 3), 3).string(data[i].customers[y].products[z].login).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex + 3), 4).string(data[i].customers[y].products[z].product).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex + 3), 5).date(data[i].customers[y].products[z].activation).style(dataStyle);
                    rowIndex++;
                }
            }
        }
        const filename = `Relatório de Licenças Ativas (Nova Pacotização) - ${getCurrentMonth()}_${getCurrentYear()}.xlsx`;
        insertFilenameToFilenames(filename);
        workbook.write(filename);
    } catch (error) {
        console.log(error);
    }
}

const writeProgramadorasReportSimba = (old, neW, dealers) => {
    try {
        const stringDate = getDateRange();
        let amount = 0;
        for (let i = 0; i < old.length; i++) {
            if (dealerValidation(old[i])) {
                amount += old[i].fullCount + old[i].premiumCount;
            }
        }
        for (let i = 0; i < neW.length; i++) {
            if (dealerValidation(neW[i])) {
                amount += neW[i].startCount + neW[i].premiumCount;
            }
        }
        const constantValuesResultSheetHeader = [
            'COMPÊTENCIA',
            'NUMERO DE ASSINANTES',
            'VALOR UNITARIO POR ASSINANTES',
            'MÍNIMO GARANTIDO',
            'VALOR EM REAIS TOTAL A SER FATURADO (MG)'
        ];
        const constantValuesProvidersSheetHeader = [
            'Provedor (nome fantasia)',
            'Razão social',
            'CNPJ',
            'Cidade/Estado',
            'Número de assinantes'
        ];
        const MAINHEADER = 'OPERADORA: YOU CAST COMERCIO DE EQUIPAMENTOS ELETRONICOS LTDA';

        const workbook = new excel.Workbook({
            defaultFont: {
                color: '#000000',
                size: 12
            },
        });

        const worksheetResult = workbook.addWorksheet('Operadora', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetResult.row(1).setHeight(25);
        worksheetResult.column(1).setWidth(45);
        worksheetResult.column(2).setWidth(35);

        const worksheetProviders = workbook.addWorksheet('Provedores', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetProviders.row(1).setHeight(25);
        worksheetProviders.row(1).filter();
        worksheetProviders.column(1).setWidth(30);
        worksheetProviders.column(2).setWidth(50);
        worksheetProviders.column(3).setWidth(25);
        worksheetProviders.column(4).setWidth(30);
        worksheetProviders.column(5).setWidth(30);

        worksheetResult.cell(1, 1, 1, 2, true).string(MAINHEADER).style({
            ...headerStyleSimba,
            fill: {
                type: 'pattern',
                patternType: 'solid',
                bgColor: '#ffff00',
                fgColor: '#ffff00',
            }
        });
        for (let i = 0; i < constantValuesResultSheetHeader.length; i++) {
            switch (i) {
                case 0:
                    worksheetResult.cell((i + 2), 1).string(constantValuesResultSheetHeader[i]).style({
                        ...dataStyleSimba,
                        alignment: {
                            horizontal: ['center'],
                            vertical: ['center']
                        },
                        border: {
                            ...dataStyleSimba.border,
                            top: {
                                style: 'medium',
                                color: '#000000'
                            },
                        }
                    });
                    break;
                case constantValuesResultSheetHeader.length - 1:
                    worksheetResult.cell((i + 2), 1).string(constantValuesResultSheetHeader[i]).style({
                        ...dataStyleSimba,
                        alignment: {
                            horizontal: ['center'],
                            vertical: ['center']
                        },
                        border: {
                            ...dataStyleSimba.border,
                            bottom: {
                                style: 'medium',
                                color: '#000000'
                            },
                        }
                    });
                    break;
                default:
                    worksheetResult.cell((i + 2), 1).string(constantValuesResultSheetHeader[i]).style({
                        ...dataStyleSimba,
                        alignment: {
                            horizontal: ['center'],
                            vertical: ['center']
                        },
                    });
                    break;
            }
        }
        for (let i = 0; i < constantValuesProvidersSheetHeader.length; i++) {
            worksheetProviders.cell(1, (i + 1))
                .string(constantValuesProvidersSheetHeader[i])
                .style(headerStyleSimba);
        }

        worksheetResult.cell(2, 2).string(stringDate).style({
            ...dataStyleSimba,
            alignment: {
                horizontal: ['center'],
                vertical: ['center']
            },
            border: {
                ...dataStyleSimba.border,
                top: {
                    style: 'medium',
                    color: '#000000'
                },
            }
        });
        worksheetResult.cell(3, 2).number(amount).style({
            ...dataStyleSimba,
            alignment: {
                horizontal: ['center'],
                vertical: ['center']
            },
        });
        worksheetResult.cell(4, 2).number(1.6).style({
            ...dataStyleSimba,
            alignment: {
                horizontal: ['center'],
                vertical: ['center']
            },
            numberFormat: "R$ #.#0"
        });
        worksheetResult.cell(5, 2).string('').style(dataStyleSimba);
        worksheetResult.cell(6, 2).formula(`=SUM(B3*B4)`).style({
            ...dataStyleSimba,
            alignment: {
                horizontal: ['center'],
                vertical: ['center']
            },
            border: {
                ...dataStyleSimba.border,
                bottom: {
                    style: 'medium',
                    color: '#000000'
                },
            },
            numberFormat: "R$ #.#0"
        });

        //============================================================================
        let rowCounter = 0;
        const oldPlusNew = [...old, ...neW];
        for (let i = 0; i < oldPlusNew.length; i++) {
            if (dealerValidation(oldPlusNew[i])) {
                let countCustomers = 0;
                // check difference between old and new packaging
                if (oldPlusNew[i].fullCount) {
                    countCustomers += oldPlusNew[i].fullCount + oldPlusNew[i].premiumCount;
                } else if (oldPlusNew[i].startCount) {
                    countCustomers += oldPlusNew[i].startCount + oldPlusNew[i].premiumCount;
                }

                if (countCustomers) {
                    for (let y = 0; y < dealers.length; y++) {
                        if (oldPlusNew[i].customers[0].products[0].dealerid === dealers[y].id) {
                            worksheetProviders.cell((rowCounter + 2), 1).string(dealers[y].nomefantasia === '' ? dealers[y].name : dealers[y].nomefantasia).style({ ...dataStyleSimbaProviders, alignment: { horizontal: ['left'] } });
                            worksheetProviders.cell((rowCounter + 2), 2).string(dealers[y].razaosocial).style({ ...dataStyleSimbaProviders, alignment: { horizontal: ['left'] } });
                            worksheetProviders.cell((rowCounter + 2), 3).string(dealers[y].cnpj).style({ ...dataStyleSimbaProviders, alignment: { horizontal: ['center'] } });
                            worksheetProviders.cell((rowCounter + 2), 4).string(`${dealers[y].cidade}/${dealers[y].uf}`).style({ ...dataStyleSimbaProviders, alignment: { horizontal: ['left'] } });
                            worksheetProviders.cell((rowCounter + 2), 5).number(countCustomers).style({ ...dataStyleSimbaProviders, alignment: { horizontal: ['center'] } });
                        }
                    }
                    rowCounter++;
                }
            }
        }

        //============================================================================
        const filename = `RELATORIO DE ASSINANTES - SIMBA - Ref. ${getCurrentMonth()}_${getCurrentYear()}.xlsx`;
        insertFilenameToFilenames(filename);
        workbook.write(filename);
    } catch (error) {
        console.log(error);
    }
}

const writeProgramadorasReportGeneric = (old, neW) => {
    try {
        const stringDate = getDateRange();
        let amount = 0;
        for (let i = 0; i < old.length; i++) {
            if (dealerValidation(old[i])) {
                amount += old[i].fullCount + old[i].premiumCount;
            }
        }
        for (let i = 0; i < neW.length; i++) {
            if (dealerValidation(neW[i])) {
                amount += neW[i].premiumCount;
            }
        }

        const constantValuesResultSheet = [
            'COMPÊTENCIA',
            'NUMERO DE ASSINANTES',
            'VALOR UNITARIO POR ASSINANTES',
            'VALOR EM REAIS TOTAL A SER FATURADO (MG)'
        ];
        const tableData = [stringDate, amount, 'R$', 'R$'];
        const MAINHEADER = 'OPERADORA: YOU CAST COMERCIO DE EQUIPAMENTOS ELETRONICOS LTDA';

        const workbook = new excel.Workbook({
            defaultFont: {
                color: '#000000',
                size: 12
            },
        });

        const worksheetResult = workbook.addWorksheet('Operadora', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetResult.row(1).setHeight(25);
        worksheetResult.column(1).setWidth(45);
        worksheetResult.column(2).setWidth(35);

        worksheetResult.cell(1, 1, 1, 2, true).string(MAINHEADER).style(headerStyle);
        for (let i = 0; i < constantValuesResultSheet.length; i++) {
            worksheetResult.cell((i + 2), 1).string(constantValuesResultSheet[i]).style(dataStyle);
        }
        for (let i = 0; i < tableData.length; i++) {
            if (typeof tableData[i] === 'number') {
                worksheetResult.cell((i + 2), 2)
                    .number(tableData[i])
                    .style({ ...dataStyle, alignment: { horizontal: ['right'] } })
            } else {
                worksheetResult.cell((i + 2), 2)
                    .string(tableData[i])
                    .style({ ...dataStyle, alignment: { horizontal: ['right'] } })
            }
        }
        //console.table(dealers);
        const filename1 = `RELATORIO DE ASSINANTES - CNN - Ref. ${getCurrentMonth()}_${getCurrentYear()}.xlsx`;
        const filename2 = `RELATORIO DE ASSINANTES - FISH - Ref. ${getCurrentMonth()}_${getCurrentYear()}.xlsx`;
        insertFilenameToFilenames(filename1);
        insertFilenameToFilenames(filename2)

        workbook.write(filename1);
        workbook.write(filename2);
    } catch (error) {
        console.log(error);
    }
}

const writeToExeptionReport = (data) => {
    const validatedData = validateYplayExceptions(data);
    // console.log(validatedData);
    validatedData.forEach(v => writeToExeptionReportGeneric(v));
}

const writeToExeptionReportGeneric = (array) => {
    try {
        //console.log(array.dealer);
        const MAIN_HEADER = array.dealer.toUpperCase();
        const MAIN_HEADER_ROWS_COUNT = 6;
        const SECONDARY_HEADER = ['Pacote', 'QTD'];
        const headerSheetAllcustomers = ['Brand', 'Customer', 'Pacote', 'Data Ativação',];

        const workBook = new excel.Workbook();

        //------------------------ workSheet 1 ----------------------------
        const workSheetResult = workBook.addWorksheet('Operadora');

        workSheetResult.column(1).setWidth(50);
        workSheetResult.cell(1, 1, 1, 2, true).string(MAIN_HEADER).style(headerStyleException);
        workSheetResult.cell(3, 1).string('Período').style(dataStyleException1);
        workSheetResult.cell(3, 2).string(getCurrentMonthYearShort()).style(dataStyleException2);
        workSheetResult.cell(5, 1).string('Assinantes ativos na Plataforma').style(dataStyleException1);
        workSheetResult.cell(5, 2).number(array.customersCount).style(dataStyleException2);

        for (let i = 2; i <= MAIN_HEADER_ROWS_COUNT; i++) {
            if (i % 2 === 0) {
                workSheetResult.row(i).setHeight(8);
                continue;
            }
        }
        workSheetResult.row(MAIN_HEADER_ROWS_COUNT + 1).filter();
        for (let i = 0; i < SECONDARY_HEADER.length; i++) {
            workSheetResult.cell(MAIN_HEADER_ROWS_COUNT + 1, i + 1).string(SECONDARY_HEADER[i]).style(headerStyleException)
        }
        for (let i = 0; i < array.products.length; i++) {
            workSheetResult.cell((i + MAIN_HEADER_ROWS_COUNT + 2), 1).string(array.products[i].product).style(dataStyleException3);
            workSheetResult.cell((i + MAIN_HEADER_ROWS_COUNT + 2), 2).number(array.products[i].customers.length).style(dataStyleException2);
        }

        //------------------------ workSheet 2 ----------------------------
        const worksheetAllCustomers = workBook.addWorksheet('TodosClientes');

        worksheetAllCustomers.column(2).setWidth(20);
        worksheetAllCustomers.column(3).setWidth(25);
        worksheetAllCustomers.column(4).setWidth(25);
        worksheetAllCustomers.column(5).setWidth(20);

        worksheetAllCustomers.row(2).filter();
        for (let i = 0; i < headerSheetAllcustomers.length; i++) {
            worksheetAllCustomers.cell(2, (i + 2)).string(headerSheetAllcustomers[i]).style(headerStyle);
        }

        let rowIndex = 0;
        for (let i = 0; i < array.products.length; i++) {
            for (let y = 0; y < array.products[i].customers.length; y++) {
                worksheetAllCustomers.cell((rowIndex + 3), 2).string(array.products[i].customers[y].dealer).style(dataStyle);
                worksheetAllCustomers.cell((rowIndex + 3), 3).string(array.products[i].customers[y].login).style(dataStyle);
                worksheetAllCustomers.cell((rowIndex + 3), 4).string(array.products[i].customers[y].product).style(dataStyle);
                worksheetAllCustomers.cell((rowIndex + 3), 5).date(array.products[i].customers[y].activation).style(dataStyle);
                rowIndex++;
            }
        }
        const filename = `RELATORIO DE ASSINANTES - ${array.dealer.toUpperCase()} - Ref. - ${getCurrentMonth()}_${getCurrentYear()}.xlsx`;
        insertFilenameToFilenames(filename)
        workBook.write(filename);

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    writeFile
}