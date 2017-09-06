let COLUMN_METADATA = {
  timestamp:      { dataType: 'date',    role: 'timestamp' },
  classification: { dataType: 'string',  role: 'none'      },
  latitude:       { dataType: 'numeric', role: 'none'      },
  longitude:      { dataType: 'numeric', role: 'none'      },
  quantity:       { dataType: 'numeric', role: 'target'    }
};

function createForecast(client, datasetName, startDate, endDate, interval = 'year') {
  console.log(`Creating forecast session for time period ${startDate} through ${endDate}...`)
  return client.Sessions
    .createForecast(datasetName, startDate, endDate, '', interval, '', undefined, { columns: COLUMN_METADATA })
    .then(session => session.sessionId);
}

function createImpactAnalysis(client, datasetName, startDate, endDate, eventName, interval = 'year') {
  console.log(`Creating impact session for time period ${startDate} through ${endDate}...`)
  return client.Sessions
    .analyzeImpact(datasetName, startDate, endDate, eventName, '', interval, undefined, '', { columns: COLUMN_METADATA })
    .then(session => session.sessionId);
}

exports.createForecast = createForecast
exports.createImpactAnalysis = createImpactAnalysis
