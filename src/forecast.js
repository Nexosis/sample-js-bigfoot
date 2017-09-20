const argv = require('yargs').argv

const DATASET_NAME = argv.datasetName || 'bigfootsightings';
const OUTPUT_FILE = argv.output || 'data/forecasted-bigfoot-sightings.csv';
const START_DATE = argv.startDate || '2017-01';
const END_DATE = argv.endDate || '2020-01';
const NEXOSIS_API_KEY = argv.apiKey || process.env.NEXOSIS_API_KEY;
const POLLING_INTERVAL = (Number(argv.pollingInterval) || 60) * 1000;

const json2csv = require('json2csv');
const fs = require('fs');
const moment = require('moment');
const NexosisClient = require('nexosis-api-client').default
const client = new NexosisClient({ key: NEXOSIS_API_KEY });

createForecast(DATASET_NAME, START_DATE, END_DATE)
  .then(session => fetchResults(session.sessionId, POLLING_INTERVAL))
  .then(results => saveForecastData(results.data, OUTPUT_FILE))
  .then(() => console.log("Forecast completed!"));


function createForecast(datasetName, startDate, endDate) {
  console.log(`Creating forecast session on dataset ${datasetName} for time period ${startDate} through ${endDate}...`)
  return client.Sessions
    .createForecast(datasetName, startDate, endDate, 'quantity', 'month');
}

function fetchResults(sessionId, interval) {
  console.log(`Fetching session results for impact session ${sessionId}`);

  return new Promise(function(resolve, reject) {
    let intervalHandle = setInterval(checkStatus, interval);

    function checkStatus() {
      console.log(`Checking status for impact session ${sessionId}`);

      fetchStatus().then(status => {
        if (isDone(status)) {
          clearInterval(intervalHandle);
          fetchResults()
        }
      })
    }

    function fetchStatus() {
      return client.Sessions.get(sessionId).then(session => session.status)
    }

    function isDone(status) {
      return ['completed', 'failed', 'cancelled'].includes(status);
    }

    function fetchResults() {
      return client.Sessions.results(sessionId)
        .then(results => resolve(results))
    }

  });
}

function saveForecastData(data, filename) {

  console.log(`Saving impact data to ${filename}...`);

  let formattedData = data
    .map(sighting => formatSighting(sighting));

  return saveToCSV(formattedData, filename, ['date', 'quantity']);

  function formatSighting(sighting) {
    return {
      date: moment(sighting.date).format('M/D/YYYY'),
      quantity: Number(sighting.quantity)
    }
  }
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
