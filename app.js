const NEXOSIS_API_KEY = process.env.NEXOSIS_API_KEY;

const NexosisClient = require('nexosis-api-client').default
const client = new NexosisClient({ key: NEXOSIS_API_KEY });

const loader = require('./src/loader');
const session = require('./src/session');
const results = require('./src/results');
const saver = require('./src/saver');

loader.aggregateDataForComparison('bfro-report-locations.csv', 'output/monthly-bigfoot-sightings.csv')
  .then(() => loader.loadToNexosis(client, 'bigfootsightings', 'bfro-report-locations.csv'))
  .then(() => Promise.all([
    processForecstSession(),
    processImpactSession()
  ]))
  .catch(reason => console.log('Error:', reason));

function processForecstSession() {
  return session
    .createForecast(client, 'bigfootsightings', '2017-01', '2020-01', 'month')
    .then(sessionId => results.fetch(client, sessionId))
    .then(results => Promise.all([
      saver.saveDataToCSV(results, 'output/bigfoot-sightings-forecast.csv'),
      saver.saveToJSON(results, 'output/bigfoot-sightings-forecast.json')
    ]))
}

function processImpactSession() {
  return session
    .createImpactAnalysis(client, 'bigfootsightings', '1993-10', '2002-04', 'x-files', 'month')
    .then(sessionId => results.fetch(client, sessionId))
    .then(results => Promise.all([
      saver.saveDataToCSV(results, 'output/x-files-impact-on-bigfoot-sightings.csv'),
      saver.saveMetricsToCSV(results, 'output/x-files-impact-on-bigfoot-sightings-metrics.csv'),
      saver.saveToJSON(results, 'output/x-files-impact-on-bigfoot-sightings.json')
    ]))
}
