const moment = require('moment');

const START_DATE = moment('1950-01');
const END_DATE = moment('2017-01');

function aggregateSightings(sightings) {
  return aggregate(transform(sightings));
}

function transform(sightings) {
  console.log(`Transforming ${sightings.length} sightings...`);
  return sightings
    .map(sighting => {
      return {
        date: justTheDate(sighting.timestamp),
        quantity: 1
      }
    });
}

function aggregate(sightings) {
  console.log(`Aggregating ${sightings.length} sightings...`);
  return generateYearAndMonthForRange(START_DATE, END_DATE)
    .map(date => {
      let quantity = sightings
        .filter(sighting => sighting.date.isSame(date))
        .reduce((accumulator, sighting) => accumulator + sighting.quantity, 0);
      return { date: date, quantity: quantity };
    });
}

function generateYearAndMonthForRange(startDate, endDate) {

  let dates = [];

  let currentDate = startDate.clone();
  while (endDate > currentDate) {
     dates.push(currentDate);
     currentDate = currentDate.clone().add(1, 'month');
  }

  return dates;
}

function justTheDate(dateTime) {
  return moment(dateTime.substring(0,7));
}

exports.aggregateSightings = aggregateSightings
