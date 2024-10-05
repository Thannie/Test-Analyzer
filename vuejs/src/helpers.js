import {read, utils} from 'xlsx'
import _ from 'lodash'

/**
 * Loads the data and does a quick analysis
 *
 * Jonathan -- 28-09-'24
 */

function excelFileToJSON(file) {
    var reader = new FileReader();
    reader.readAsBinaryString(file);
    return new Promise((resolve, reject) => {
        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = read(data, {
                type: "binary",
            });
            var result = {};
            workbook.SheetNames.forEach(function (sheetName) {
                var roa = utils.sheet_to_row_object_array(
                    workbook.Sheets[sheetName]
                );
                if (roa.length > 0) {
                    result[sheetName] = roa;
                }
            });
            resolve(result);
        };
    });
}



export {
    excelFileToJSON
}