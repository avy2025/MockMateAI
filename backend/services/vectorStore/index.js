/**
 * Vector store facade — in-memory today; replace with Pinecone adapter later.
 */
const inMemoryVectorStore = require('./inMemoryVectorStore');

module.exports = {
  search: inMemoryVectorStore.search,
};
