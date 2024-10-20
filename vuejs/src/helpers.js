import {read, utils} from 'xlsx'
import _ from 'lodash'
import CircularJSON from 'circular-json'
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

function sum(l){return l.reduce((data, current) => data+current,0)}

function uncircularStringify(obj){
    return CircularJSON.stringify(obj)
}
function erf(x, n) {
    const h = x / n;
    let sum = 0;
  
    for (let i = 1; i < n; i++) {
      const xi = i * h;
      sum += (i % 2 === 0 ? 4 : 2) * Math.exp(-xi * xi);
    }
  
    return 2 * h / 3 * (Math.exp(-x * x) + sum + 2 * Math.exp(0));
  }
function average(data){return sum(data) / data.length}

// Standard Deviation function
function standardDeviation(data) {
    const average = sum(data) / data.length;
    return Math.sqrt(data.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / (data.length - 1));
}

function decCount(num) {
    if(Math.floor(num.valueOf()) === num.valueOf()) return 0;
    return num.toString().split(".")[1].length || 0; 
}
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
export {
    excelFileToJSON,
    sum,
    uncircularStringify,
    erf,
    average,
    standardDeviation,
    decCount,
    isNumeric
}