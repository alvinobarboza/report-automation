const excel = require('excel4node');
const { BASIC, COMPACT, FULL, PREMIUM, URBANTV } = require('./constants');

const headerStyle = {
    alignment: {
        horizontal: ['center'],
        shrinkToFit: true,
    },
    font: {
        color: '#000000',
        bold: true,
        size: 12
    },
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#ffff00',
        fgColor: '#ffff00',
    },
    border: { 
        left: {
            style: 'thin', 
            color: '#000000' 
        },
        right: {
            style: 'thin', 
            color: '#000000'
        },
        top: {
            style: 'thin', 
            color: '#000000'
        },
        bottom: {
            style: 'thin', 
            color: '#000000'
        },
    }
}

const dataStyle = {
    fill: {
        type: 'pattern',
        patternType: 'solid',
        bgColor: '#d9e1f2',
        fgColor: '#d9e1f2',
    },
    border: { 
        left: {
            style: 'thin', 
            color: '#000000' 
        },
        right: {
            style: 'thin', 
            color: '#000000'
        },
        top: {
            style: 'thin', 
            color: '#000000'
        },
        bottom: {
            style: 'thin', 
            color: '#000000'
        },
    }
}

const writeFile = (data) => {
    const headerSheetResult = ['Brand', BASIC, COMPACT, FULL, PREMIUM, URBANTV, 'Total'];
    const headerSheetAllcustomers = ['Brand', 'Customer', 'Pacote', 'Data Ativação', ];    
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

    const styleH = workbook.createStyle(headerStyle);
    const styleBorder = workbook.createStyle(dataStyle);
    
    headerSheetResult.forEach((element, index) => {
        worksheetResult.cell(2, (index+2)).string(element).style(styleH);
    });

    headerSheetAllcustomers.forEach((element, index) => {
        worksheetAllCustomers.cell(2, (index+2)).string(element).style(styleH);
    });

    let rowCounter = 0;
    data.forEach((value) => {
        if(value.dealer !== 'ADMIN-YOUCAST' && 
            value.dealer !== 'JACON dealer' && 
            value.dealer !== 'TCM Telecom' &&
            value.dealer !== 'Youcast CSMS' && 
            value.dealer !== 'YPLAY' && 
            value.dealer !== 'Z-Não-usar')
        {
            const columns = Object.keys(value);
            let columnCount = 0;
            columns.forEach((column) => {
                switch (column) {
                    case 'dealer':                
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).string(value[column].toUpperCase()).style(styleBorder);
                        columnCount++;
                        break;        
                    case 'basicCount':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]).style(styleBorder);
                        columnCount++;
                        break;
                    case 'compactCount':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]).style(styleBorder);
                        columnCount++;
                        break;
                    case 'fullCount':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]).style(styleBorder);
                        columnCount++;
                        break;
                    case 'premiumCount':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]).style(styleBorder);
                        columnCount++;
                        break;
                    case 'urbanTv':
                        worksheetResult.cell((rowCounter+3), (columnCount+2)).number(value[column]).style(styleBorder);
                        columnCount++;
                        break;
                    default:
                        break;
                }
                if(columnCount === 6){
                    worksheetResult.cell((rowCounter+3), (columnCount+2)).formula(`=SUM(C${rowCounter+3}:G${rowCounter+3})`).style(styleBorder);
                }
            });
            rowCounter++;
        }
    });

    let rowIndex = 0;
    data.forEach(dealer => {
        dealer.customers.forEach( customer => {
            customer.products.forEach(product => {
                worksheetAllCustomers.cell((rowIndex+3),2).string(dealer.dealer).style(styleBorder);
                worksheetAllCustomers.cell((rowIndex+3),3).string(product.login).style(styleBorder);
                worksheetAllCustomers.cell((rowIndex+3),4).string(product.product).style(styleBorder);
                worksheetAllCustomers.cell((rowIndex+3),5).date(product.activation).style(styleBorder);
                rowIndex++;
            });
        });        
    });

    workbook.write('Excel.xlsx');
}

module.exports = {
    writeFile
}