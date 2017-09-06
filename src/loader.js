const CSV = require('csvtojson');
const moment = require('moment');
const saver = require('./saver');

function aggregateDataForComparison(inputFilename, outputFilename) {
  return loadBigfootSightingsFromCSV(inputFilename)
    .then(sightings => transformSightings(sightings))
    .then(sightings => aggregateSightings(sightings))
    .then(sightings => saver.saveToCSV(sightings, outputFilename, ['date', 'quantity']));
}

function loadToNexosis(client, datasetName, filename) {
  return client.DataSets.list()
    .then(datasets => isBigfootDataAlreadyLoaded(datasets))
    .then(isLoaded => deleteIfLoaded(isLoaded))
    .then(() => loadBigfootSightingsFromCSV(filename))
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

  function uploadSightings(sightings) {
    console.log(`Loading ${sightings.length} sightings...`);
    return client.DataSets.create(datasetName, { data: sightings });
  }
}

function loadBigfootSightingsFromCSV(filename) {
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
    })
    .sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
}

function aggregateSightings(sightings) {
  return sightings
    .map(sighting => {
      return {
        date: sighting.date.substring(0,7),
        quantity: sighting.quantity
      }
    })
    .reduce((groupedSightings, sighting) => {
      let groupedSighting = groupedSightings.find(groupedSighting => groupedSighting.date === sighting.date);
      if (groupedSighting) {
        groupedSighting.quantity = groupedSighting.quantity + sighting.quantity;
      } else {
        groupedSightings.push(sighting);
      }
      return groupedSightings;
    }, [])
    .map(groupedSighting => {
      return {
        date: `${groupedSighting.date}-01`,
        quantity: groupedSighting.quantity
      }
    });
}

exports.aggregateDataForComparison = aggregateDataForComparison
exports.loadToNexosis = loadToNexosis
