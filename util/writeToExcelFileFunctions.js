const excel = require('excel4node');
const { BASIC, COMPACT, FULL, PREMIUM, URBANTV } = require('./constants');
const { getCurrentMonth, getCurrentYear, getCurrentMonthYearShort, getDateRange } = require('./dateManipulation');
const { groupByGeneric } = require('./groupByFunctions');
const { validateYplayExceptions } = require('./packageValidationFunctions');
const {
    headerStyle,
    dataStyle,
    dataStyleError,
    dataStyleOK,
    headerStyleException,
    dataStyleException1,
    dataStyleException2,
    dataStyleException3
} = require('./stylesExcelFile');
const writePdfFile = require('./writePdfFile');

const writeBrandReport = (data) => {
    try {        
        const headerSheetResult = ['Brand', BASIC, COMPACT, FULL, PREMIUM, URBANTV, 'Total Clientes ativos'];
        const headerSheetAllcustomers = ['Brand', 'Customer', 'Pacote', 'Data Ativação', ];    
        const headerSheetAllcustomersValidation = ['Dealer', 'Customer', 'Pacote', 'Status', ];    
    
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
        worksheetResult.column(7).setWidth(20);        
        worksheetResult.column(8).setWidth(27);
        worksheetResult.row(2).filter();
    
        const worksheetAllCustomers = workbook.addWorksheet('TodosClientes',{
            sheetView: {
                showGridLines: false
            }
        });
        worksheetAllCustomers.column(2).setWidth(25);
        worksheetAllCustomers.column(3).setWidth(40);
        worksheetAllCustomers.column(4).setWidth(35);
        worksheetAllCustomers.column(5).setWidth(20);
        worksheetAllCustomers.row(2).filter();
    
        const worksheetAllCustomersValidation = workbook.addWorksheet('TodosClientesValidacao',{
            sheetView: {
                showGridLines: false
            }
        });
        worksheetAllCustomersValidation.row(2).filter();
        worksheetAllCustomersValidation.column(2).setWidth(25);
        worksheetAllCustomersValidation.column(3).setWidth(40);
        worksheetAllCustomersValidation.column(4).setWidth(35);
        worksheetAllCustomersValidation.column(5).setWidth(20);
        
        headerSheetResult.forEach((element, index) => {
            worksheetResult.cell(2, (index+2)).string(element).style(headerStyle);
        });
    
        headerSheetAllcustomers.forEach((element, index) => {
            worksheetAllCustomers.cell(2, (index+2)).string(element).style(headerStyle);
        });
    
        headerSheetAllcustomersValidation.forEach((element, index) => {
            worksheetAllCustomersValidation.cell(2, (index+2)).string(element).style(headerStyle);
        });
        
        let rowCounter = 0;
        let rowCustomersCounter = 0;
        data.forEach((value) => {
            if(value.dealer !== 'ADMIN-YOUCAST' && 
                value.dealer !== 'JACON dealer' && 
                value.dealer !== 'TCM Telecom' &&
                value.dealer !== 'Youcast CSMS' && 
                value.dealer !== 'YPLAY' && 
                value.dealer !== 'Z-Não-usar' && 
                value.dealer !== 'softxx' &&
                value.dealer !== 'LBR' && 
                value.dealer !== 'net-angra'&& 
                value.dealer !== 'nbs')
            {
                const columns = Object.keys(value);
                let columnCount = 0;
                columns.forEach((column) => {
                    switch (column) {
                        case 'dealer':                
                            worksheetResult.cell((rowCounter+3), 2).string(value[column].toUpperCase()).style(dataStyle);
                            columnCount++;
                            break;        
                        case 'basicCount':
                            worksheetResult.cell((rowCounter+3), 3).number(value[column]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'compactCount':
                            worksheetResult.cell((rowCounter+3), 4).number(value[column]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'fullCount':
                            worksheetResult.cell((rowCounter+3), 5).number(value[column]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'premiumCount':
                            worksheetResult.cell((rowCounter+3), 6).number(value[column]).style(dataStyle);
                            columnCount++;
                            break;
                        case 'urbanTv':
                            worksheetResult.cell((rowCounter+3), 7).number(value[column]).style(dataStyle);
                            columnCount++;
                            break;
                        default:
                            break;
                    }
                    if(columnCount === 6){
                        worksheetResult.cell((rowCounter+3), 8)
                            .formula(`=SUM(C${rowCounter+3}:F${rowCounter+3})`).style(dataStyle);
                    }
                });
                //Validation sheet
                value.customers.forEach(customer => {                
                    worksheetAllCustomersValidation.cell((rowCustomersCounter+3),2)
                        .string(value.dealer).style(dataStyle);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter+3),3)
                        .string(customer.login).style(dataStyle);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter+3),4)
                        .string(customer.pacoteYplay ? customer.pacoteYplay :'UserTest')
                        .style(customer.pacoteYplayStatus === 'ERRO' ? dataStyleError : dataStyleOK);
                    worksheetAllCustomersValidation.cell((rowCustomersCounter+3),5)
                        .string(customer.pacoteYplayStatus ? customer.pacoteYplayStatus : 'UserTest')
                        .style(customer.pacoteYplayStatus === 'ERRO' ? dataStyleError : dataStyleOK);
                    rowCustomersCounter++;
                });
                //Validation sheet end
                rowCounter++;
            }
        });
    
        let rowIndex = 0;
        data.forEach(dealer => {
            dealer.customers.forEach( customer => {
                customer.products.forEach(product => {
                    worksheetAllCustomers.cell((rowIndex+3),2).string(dealer.dealer).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex+3),3).string(product.login).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex+3),4).string(product.product).style(dataStyle);
                    worksheetAllCustomers.cell((rowIndex+3),5).date(product.activation).style(dataStyle);
                    rowIndex++;
                });
            });        
        });
    
        workbook.write(`Relatório de Licenças Ativas - ${getCurrentMonth()}_${getCurrentYear()}.xlsx`);
    } catch (error) {
        console.log(error);
    }
}

const writeProgramadorasReportSimba = (data, dealers) => {
    try {        
        const stringDate = getDateRange();
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
                element.dealer !== 'net-angra'&& 
                element.dealer !== 'nbs')
            {
                amount += element.fullCount + element.premiumCount;
            }
        });
    
        const constantValuesResultSheetHeader = [
            'COMPÊTENCIA', 
            'NUMERO DE ASSINANTES', 
            'VALOR UNITARIO POR ASSINANTES', 
            'VALOR EM REAIS TOTAL A SER FATURADO (MG)'
        ];
        const constantValuesProvidersSheetHeader = [
            'Provedor (nome fantasia)', 
            'Razão social', 
            'CNPJ', 
            'Cidade',
            'Estado',
            'Número de assinantes'
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
    
        const worksheetProviders = workbook.addWorksheet('Provedores', {
            sheetView: {
                showGridLines: false
            }
        });
        worksheetProviders.row(1).setHeight(25);    
        worksheetProviders.row(1).filter();
        worksheetProviders.column(1).setWidth(30);    
        worksheetProviders.column(2).setWidth(45);
        worksheetProviders.column(3).setWidth(25);
        worksheetProviders.column(4).setWidth(25);
        worksheetProviders.column(5).setWidth(10);
        worksheetProviders.column(6).setWidth(30);
    
        worksheetResult.cell(1,1,1,2,true).string(MAINHEADER).style(headerStyle);
        constantValuesResultSheetHeader.forEach((value,index) => {
            worksheetResult.cell((index+2),1).string(value).style(dataStyle);
        });
        constantValuesProvidersSheetHeader.forEach((value,index) => {
            worksheetProviders.cell(1,(index+1))
                .string(value)
                .style({...headerStyle, alignment:{horizontal:['center']}});
        });
    
        tableData.forEach((value, index)=>{
            if(typeof value === 'number'){
                worksheetResult.cell((index+2),2)
                    .number(value)
                    .style({...dataStyle, alignment:{horizontal:['right']}})
            }else{
                worksheetResult.cell((index+2),2)
                    .string(value)
                    .style({...dataStyle, alignment:{horizontal:['right']}})
            }        
        });
    
        //============================================================================
        let rowCounter = 0;
        data.forEach((value) => {
            if(value.dealer !== 'ADMIN-YOUCAST' && 
                value.dealer !== 'JACON dealer' && 
                value.dealer !== 'TCM Telecom' &&
                value.dealer !== 'Youcast CSMS' && 
                value.dealer !== 'YPLAY' && 
                value.dealer !== 'Z-Não-usar' && 
                value.dealer !== 'softxx' &&
                value.dealer !== 'LBR' && 
                value.dealer !== 'net-angra'&& 
                value.dealer !== 'nbs')
            {            
                let countCustomers = 0;
                countCustomers += value.fullCount + value.premiumCount;
                if(countCustomers){
                    dealers.forEach((dealer)=>{
                        if(value.customers[0].products[0].dealerid === dealer.id){
                            worksheetProviders.cell((rowCounter+2),1).string(dealer.nomefantasia === '' ? dealer.name : dealer.nomefantasia).style({...dataStyle, alignment:{horizontal:['left']}});
                            worksheetProviders.cell((rowCounter+2),2).string(dealer.razaosocial).style({...dataStyle, alignment:{horizontal:['left']}});
                            worksheetProviders.cell((rowCounter+2),3).string(dealer.cnpj).style({...dataStyle, alignment:{horizontal:['center']}});
                            worksheetProviders.cell((rowCounter+2),4).string(dealer.cidade).style({...dataStyle, alignment:{horizontal:['left']}});
                            worksheetProviders.cell((rowCounter+2),5).string(dealer.uf).style({...dataStyle, alignment:{horizontal:['center']}});
                            worksheetProviders.cell((rowCounter+2),6).number(countCustomers).style({...dataStyle, alignment:{horizontal:['center']}});
                        }
                    })
                    rowCounter++;
                }
            }
        });
    
        //============================================================================
    
        workbook.write(`RELATORIO DE ASSINANTES - SIMBA - Ref. ${getCurrentMonth()}_${getCurrentYear()}.xlsx`); 
    } catch (error) {
        console.log(error);
    }
}

const writeProgramadorasReportGeneric = (data) => {
    try {        
        const stringDate = getDateRange();
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
                element.dealer !== 'net-angra'&& 
                element.dealer !== 'nbs')
            {
                amount += element.fullCount + element.premiumCount;
            }
        });
    
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
    
        worksheetResult.cell(1,1,1,2,true).string(MAINHEADER).style(headerStyle);
        constantValuesResultSheet.forEach((value,index) => {
            worksheetResult.cell((index+2),1).string(value).style(dataStyle);
        });
        tableData.forEach((value, index)=>{
            if(typeof value === 'number'){
                worksheetResult.cell((index+2),2)
                    .number(value)
                    .style({...dataStyle, alignment:{horizontal:['right']}})
            }else{
                worksheetResult.cell((index+2),2)
                    .string(value)
                    .style({...dataStyle, alignment:{horizontal:['right']}})
            }        
        })
        //console.table(dealers);
        workbook.write(`RELATORIO DE ASSINANTES - CNN - Ref. ${getCurrentMonth()}_${getCurrentYear()}.xlsx`);    
        workbook.write(`RELATORIO DE ASSINANTES - FISH - Ref. ${getCurrentMonth()}_${getCurrentYear()}.xlsx`);
    } catch (error) {
        console.log(error);
    }
}

const writeToExeptionReport = (data) => {
    const validatedData = validateYplayExceptions(data);
    validatedData.forEach(v => writeToExeptionReportGeneric(v));
}

const writeToExeptionReportGeneric = (array) => {
    try {
        const MAIN_HEADER = array.dealer.toUpperCase();
        const MAIN_HEADER_ROWS_COUNT = 6;
        const SECONDARY_HEADER = ['Pacote','QTD'];
        const headerSheetAllcustomers = ['Brand', 'Customer', 'Pacote', 'Data Ativação', ];
    
        const workBook = new excel.Workbook();

        //------------------------ workSheet 1 ----------------------------
        const workSheetResult = workBook.addWorksheet('Operadora');
    
        workSheetResult.column(1).setWidth(50);
        workSheetResult.cell(1,1,1,2,true).string(MAIN_HEADER).style(headerStyleException);
        workSheetResult.cell(3,1).string('Período').style(dataStyleException1);
        workSheetResult.cell(3,2).string(getCurrentMonthYearShort()).style(dataStyleException2);
        workSheetResult.cell(5,1).string('Assinantes ativos na Plataforma').style(dataStyleException1);
        workSheetResult.cell(5,2).number(array.customersCount).style(dataStyleException2);
    
        for (let i = 2; i <= MAIN_HEADER_ROWS_COUNT; i++) {
            if(i % 2 === 0){
                workSheetResult.row(i).setHeight(8);
                continue;
            }
        }
        workSheetResult.row(MAIN_HEADER_ROWS_COUNT+1).filter();
        SECONDARY_HEADER.forEach((value, index) => workSheetResult.cell(MAIN_HEADER_ROWS_COUNT+1, index+1).string(value).style(headerStyleException));
    
        array.products.forEach((package, index)=>{
            workSheetResult.cell((index+MAIN_HEADER_ROWS_COUNT+2),1).string(package.product).style(dataStyleException3);
            workSheetResult.cell((index+MAIN_HEADER_ROWS_COUNT+2),2).number(package.customers.length).style(dataStyleException2);
        });

        //------------------------ workSheet 2 ----------------------------
        const worksheetAllCustomers = workBook.addWorksheet('TodosClientes');

        worksheetAllCustomers.column(2).setWidth(20);
        worksheetAllCustomers.column(3).setWidth(25);
        worksheetAllCustomers.column(4).setWidth(25);
        worksheetAllCustomers.column(5).setWidth(20);

        worksheetAllCustomers.row(2).filter();
        headerSheetAllcustomers.forEach((element, index) => {
            worksheetAllCustomers.cell(2, (index+2)).string(element).style(headerStyle);
        });

        let rowIndex = 0;
        array.products.forEach(dealer => {
            dealer.customers.forEach( customer => {
                worksheetAllCustomers.cell((rowIndex+3),2).string(customer.dealer).style(dataStyle);
                worksheetAllCustomers.cell((rowIndex+3),3).string(customer.login).style(dataStyle);
                worksheetAllCustomers.cell((rowIndex+3),4).string(customer.product).style(dataStyle);
                worksheetAllCustomers.cell((rowIndex+3),5).date(customer.activation).style(dataStyle);
                rowIndex++;            
            });
        });
        workBook.write(`RELATORIO DE ASSINANTES - ${array.dealer.toUpperCase()} - Ref. - ${getCurrentMonth()}_${getCurrentYear()}.xlsx`);
        
    } catch (error) {
        console.log(error);
    }
}

const writeFile = (data, dealers) => {
    
    writeToExeptionReport(data);
    writeBrandReport(data);
    writeProgramadorasReportGeneric(data);
    writeProgramadorasReportSimba(data, dealers);
    writePdfFile(data);    
}

module.exports = {
    writeFile
}