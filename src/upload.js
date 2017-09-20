const argv = require('yargs').argv

const INPUT_FILE = argv.input || 'output/monthly-bigfoot-sightings.csv';
const DATASET_NAME = argv.datasetName || 'bigfootsightings';
const NEXOSIS_API_KEY = argv.apiKey || process.env.NEXOSIS_API_KEY;

const CSV = require('csvtojson');
const NexosisClient = require('nexosis-api-client').default
const client = new NexosisClient({ key: NEXOSIS_API_KEY });
const moment = require('moment');

removeExistingDataset(DATASET_NAME)
  .then(() => loadAggregatedSightings(INPUT_FILE))
  .then(sightings => transformSightings(sightings))
  .then(transformedSightings => uploadSightings(transformedSightings, DATASET_NAME))
  .then(() => console.log('Upload complete!'))

function removeExistingDataset(datasetName) {
  return client.DataSets.list()
    .then(datasets => isDatasetAlreadyLoaded(datasets))
    .then(isLoaded => deleteIfLoaded(isLoaded));

  function isDatasetAlreadyLoaded(datasets) {
    console.log(`Looking for existing dataset ${datasetName}...`);
    return datasets.items.some(item => item.dataSetName === datasetName);
  }

  function deleteIfLoaded(isLoaded) {
    if (isLoaded) {
      console.log('Dataset was found. Removing...');
      return client.DataSets.remove(datasetName);
    } else {
      console.log('Dataset was not found. Continuing...');
    }
  }
}

function loadAggregatedSightings(filename) {
  console.log(`Loading aggregated data from ${filename}...`);
  return new Promise(function(resolve, reject) {
    let sightings = [];
    CSV()
      .fromFile(filename)
      .on('json', sighting => sightings.push(sighting))
      .on('done', () => resolve(sightings));
  });
}

function transformSightings(sightings) {

  console.log(`Transforming ${sightings.length} months of sightings...`);

  return sightings
    .map(sighting => transformSighting(sighting));

  function transformSighting(sighting) {
    return {
      date: moment(sighting.date, 'M/D/YYYY').format('YYYY-MM-DD'),
      quantity: sighting.quantity
    };
  }
}

function uploadSightings(sightings, datasetName) {
  console.log(`Loading ${sightings.length} months of sightings...`);
  return client.DataSets.create(datasetName, { data: sightings });
}
