const CSV = require('csvtojson');

function loadToNexosis(client, datasetName, filename) {
  return client.DataSets.list()
    .then(datasets => isBigfootDataAlreadyLoaded(datasets))
    .then(isLoaded => deleteIfLoaded(isLoaded))
    .then(() => loadBigfootSightingsFromCSV())
    .then(sightings => transformSightings(sightings))
    .then(sightings => uploadSightings(sightings));

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

  function loadBigfootSightingsFromCSV() {
    console.log('Loading data from CSV...');
    return new Promise(function(resolve, reject) {
      let sightings = [];
      CSV()
        .fromFile(filename)
        .on('json', sighting => sightings.push(sighting))
        .on('done', () => resolve(sightings));
    });
  }

  function transformSightings(sightings) {
    console.log(`Transforming ${sightings.length} sightings...`);
    return sightings.map(sighting => {
      return {
        timestamp: sighting.timestamp,
        classification: sighting.classification,
        latitude: Number(sighting.latitude),
        longitude: Number(sighting.longitude),
        quantity: 1
      }
    })
  }

  function uploadSightings(sightings) {
    console.log(`Loading ${sightings.length} sightings...`);
    return client.DataSets.create(datasetName, { data: sightings });
  }
}

exports.loadToNexosis = loadToNexosis
