const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./server/db.json')
const lowdb = low(adapter)

// [START firestore_quickstart]
const { Firestore } = require('@google-cloud/firestore')
// Create a new client
const firestore = new Firestore()

async function main () {
  // Obtain a document reference.
  const freeflows = lowdb.get('freeflows').value()
  let f
  while ((f = freeflows.shift())) {
    const [startGentryId, endGentryId, timestamp] = f.key.split(',')

    if (timestamp === '2019-12-14 15:00') {
      const doc = firestore.doc('freeflows/' + f.key)

      await doc.set({
        startGentryId,
        endGentryId,
        timestamp,
        data: f.data
      })

      console.log(startGentryId, endGentryId, timestamp, 'seted')
    }
  }

  // Read the document.
  // const doc = await document.get()
}
main()
// [END firestore_quickstart]
