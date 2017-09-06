function fetch(client, sessionId) {
  console.log(`Fetching session results for ${sessionId}`);

  return new Promise(function(resolve, reject) {
    let interval = setInterval(checkStatus, 60 * 1000);

    function checkStatus() {
      console.log(`Checking status for session ${sessionId}`);

      fetchStatus().then(status => {
        if (isDone(status)) {
          clearInterval(interval);
          fetchResults()
        }
      })
    }

    function fetchStatus() {
      return client.Sessions.get(sessionId).then(session => session.status)
    }

    function isDone(status) {
      return ['completed', 'failed', 'cancelled'].includes(status);
    }

    function fetchResults() {
      return client.Sessions.results(sessionId)
        .then(results => resolve(results))
    }

  });
}

exports.fetch = fetch
