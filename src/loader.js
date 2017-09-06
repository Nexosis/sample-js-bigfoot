const CSV = require('csvtojson');
const saver = require('./saver');

function loadSightingsFromCSV(filename) {
  console.log('Loading data from CSV...');
  return new Promise(function(resolve, reject) {
    let sightings = [];
    CSV()
      .fromFile(filename)
      .on('json', sighting => sightings.push(sighting))
      .on('done', () => resolve(sightings));
  });
}

function uploadSightings(client, datasetName, sightings) {
  return client.DataSets.list()
    .then(datasets => isBigfootDataAlreadyLoaded(datasets))
    .then(isLoaded => deleteIfLoaded(isLoaded))
    .then(() => uploadSightings(transformSightings(sightings)));

  function isBigfootDataAlreadyLoaded(datasets) {
    console.log('Looking for existing dataset...');
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

  function uploadSightings(sightings) {
    console.log(`Loading ${sightings.length} sightings...`);
    return client.DataSets.create(datasetName, { data: sightings });
  }
}

function transformSightings(sightings) {
  console.log(`Transforming ${sightings.length} sightings...`);
  return sightings
    .map(sighting => {
      return {
        date: sighting.timestamp.substring(0,10),
        classification: sighting.classification,
        latitude: Number(sighting.latitude),
        longitude: Number(sighting.longitude),
        quantity: 1
      }
    })
    .filter(sighting => {
      let sightingDate = sighting.date;
      let startDate = '1950-01-01';
      let endDate = '2017-01-01';
      return sightingDate >= startDate && sightingDate < endDate;
    });
}

exports.loadSightingsFromCSV = loadSightingsFromCSV
exports.uploadSightings = uploadSightings
