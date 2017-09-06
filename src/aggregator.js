function aggregateSightings(sightings) {
  return aggregate(transform(sightings));
}

function transform(sightings) {
  console.log(`Transforming ${sightings.length} sightings...`);
  return sightings
    .map(sighting => {
      return {
        date: sighting.timestamp.substring(0,7),
        quantity: 1
      }
    })
    .filter(sighting => {
      let sightingDate = sighting.date;
      let startDate = '1950-01';
      let endDate = '2017-01';
      return sightingDate >= startDate && sightingDate < endDate;
    })
    .sort((a, b) => {
      if (a.date < b.date) return -1;
      if (a.date > b.date) return 1;
      return 0;
    });
}

function aggregate(sightings) {
  console.log(`Aggregating ${sightings.length} sightings...`);
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

exports.aggregateSightings = aggregateSightings
