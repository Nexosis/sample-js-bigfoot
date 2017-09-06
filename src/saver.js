const json2csv = require('json2csv');
const fs = require('fs');

function saveDataToCSV(results, filename) {
  console.log(`Saving results for session ${results.sessionId} to ${filename}...`);
  return saveToCSV(results.data, filename, ['timestamp', 'quantity']);
}

function saveMetricsToCSV(results, filename) {
  console.log(`Saving metrics for session ${results.sessionId} to ${filename}...`);
  return saveToCSV(results.metrics, filename, ['pValue', 'absoluteEffect', 'relativeEffect']);
}

function saveToJSON(results, filename) {
  console.log(`Saving data for session ${results.sessionId} to ${filename}...`);
  let json = JSON.stringify(results);
  return saveToFile(json, filename);
}

function saveToCSV(data, filename, fields) {
  let csv = json2csv({ data, fields });
  return saveToFile(csv, filename);
}

function saveToFile(data, filename) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(filename, data, err => err ? reject(err) : resolve());
  });
}

exports.saveDataToCSV = saveDataToCSV
exports.saveMetricsToCSV = saveMetricsToCSV
exports.saveToJSON = saveToJSON
