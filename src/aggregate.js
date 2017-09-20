const argv = require('yargs').argv

const INPUT_FILE = argv.input || 'data/bfro-report-locations.csv';
const OUTPUT_FILE = argv.output || 'data/monthly-bigfoot-sightings.csv';
const START_DATE = argv.startDate || '1950-01';
const END_DATE = argv.endDate || '2017-01';

const CSV = require('csvtojson');
const json2csv = require('json2csv');
const fs = require('fs');
const moment = require('moment');

loadRawSightings(INPUT_FILE)
  .then(sightings => transformSightings(sightings))
  .then(transformedSightings => aggregateSightings(transformedSightings))
  .then(aggregatedSightings => saveMontlySightings(aggregatedSightings, OUTPUT_FILE))
  .then(() => console.log('Aggregation completed!'));

function loadRawSightings(filename) {
  console.log(`Loading raw data from ${filename}...`);
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
    .map(sighting => transformSighting(sighting));

  function transformSighting(sighting) {
    return {
      date: justTheYearAndMonth(sighting.timestamp),
      quantity: 1
    }
  }

  function justTheYearAndMonth(dateTime) {
    return moment(dateTime.substring(0,7));
  }
}

function aggregateSightings(sightings) {

  let months = generateMonthlyDateRanges();

  console.log(`Aggregating ${sightings.length} sightings to ${months.length} months...`);

  return months
    .map(date => aggregateSightingsForMonth(date));

  function generateMonthlyDateRanges() {

    let dates = [];

    let currentDate = moment(START_DATE);
    let endDate = moment(END_DATE);

    while (endDate > currentDate) {
       dates.push(currentDate);
       currentDate = currentDate.clone().add(1, 'month');
    }

    return dates;
  }

  function aggregateSightingsForMonth(date) {
    let quantity = countSightingsForMonth(date);
    return { date, quantity };
  }

  function countSightingsForMonth(date) {
    return sightings
      .filter(sighting => sighting.date.isSame(date))
      .reduce((accumulator, sighting) => accumulator + sighting.quantity, 0);
  }
}

function saveMontlySightings(sightings, filename) {

  console.log(`Saving aggregated sightings to ${filename}...`);

  formattedSightings = sightings.map(sighting => formatSighting(sighting));
  return saveToCSV(formattedSightings, filename, );

  function formatSighting(sighting) {
    return {
      date: sighting.date.format('M/D/YYYY'),
      quantity: sighting.quantity
    }
  }

  function saveToCSV(data, filename) {
    let csv = json2csv({ data, fields: ['date', 'quantity'] });
    return saveToFile(csv, filename);
  }

  function saveToFile(data, filename) {
    return new Promise(function(resolve, reject) {
      fs.writeFile(filename, data, err => err ? reject(err) : resolve());
    });
  }
}
