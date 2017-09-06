const NEXOSIS_API_KEY = process.env.NEXOSIS_API_KEY;

const NexosisClient = require('nexosis-api-client').default
const client = new NexosisClient({ key: NEXOSIS_API_KEY });

const loader = require('./src/loader');
const session = require('./src/session');
const results = require('./src/results');

loader
  .loadToNexosis(client, 'bigfootsightings', 'bfro_report_locations.csv')
  .then(() => session.createForecast(client, 'bigfootsightings', '2017-01', '2020-01'))
  .then(sessionId => results.fetch(client, sessionId))
  .then(results => console.log(results))
  .then(() => session.createImpactAnalysis(client, 'bigfootsightings', '1994-01', '2002-01', 'x-files'))
  .then(sessionId => results.fetch(client, sessionId))
  .then(results => console.log(results))
