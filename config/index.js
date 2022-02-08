// reassign databaseName
const databaseName = 'hotdog'

module.exports = async function syncDB() {
  require('mongoose').connect(process.env.MONGODB_URI || `mongodb://localhost/${databaseName}`)
}
