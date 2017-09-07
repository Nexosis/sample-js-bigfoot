const NEXOSIS_API_KEY = process.env.NEXOSIS_API_KEY;

const NexosisClient = require('nexosis-api-client').default
const client = new NexosisClient({ key: NEXOSIS_API_KEY });

const aggregator = require('./src/aggregator');
const loader = require('./src/loader');
const session = require('./src/session');
const results = require('./src/results');
const saver = require('./src/saver');
const moment = require('moment');

loader.loadSightingsFromCSV('bfro-report-locations.csv')
  .then(sightings => Promise.all([
    aggregateSightingsForComparison(sightings),
    loadSightingsToNexosisAndProcess(sightings)
  ]))
  .catch(reason => console.log('Error:', reason));

function aggregateSightingsForComparison(sightings) {
  let aggregatedSightings = aggregator.aggregateSightings(sightings);
  return saver.saveDataToCSV(aggregatedSightings, 'output/monthly-bigfoot-sightings.csv');
}

function loadSightingsToNexosisAndProcess(sightings) {
  loader.uploadSightings(client, 'bigfootsightings', sightings)
    .then(() => Promise.all([
      processForecstSession(),
      processImpactSession()
    ]))
}

function processForecstSession() {
  return session
    .createForecast(client, 'bigfootsightings', '2017-01', '2020-01', 'month')
    .then(sessionId => results.fetch(client, sessionId))
    .then(results => Promise.all([
      saver.saveDataToCSV(momentizeData(results.data), 'output/bigfoot-sightings-forecast.csv'),
      saver.saveToJSON(results, 'output/bigfoot-sightings-forecast.json')
    ]));
}

function processImpactSession() {
  return session
    .createImpactAnalysis(client, 'bigfootsightings', '1993-10', '2002-04', 'x-files', 'month')
    .then(sessionId => results.fetch(client, sessionId))
    .then(results => Promise.all([
      saver.saveDataToCSV(momentizeData(results.data), 'output/x-files-impact-on-bigfoot-sightings.csv'),
      saver.saveMetricsToCSV(results.metrics, 'output/x-files-impact-on-bigfoot-sightings-metrics.csv'),
      saver.saveToJSON(results, 'output/x-files-impact-on-bigfoot-sightings.json')
    ]));
}

function momentizeData(data) {
  return data.map(sighting => {
    return {
      date: moment(sighting.date.substring(0, 10)),
      quantity: sighting.quantity
    }
  });
}
