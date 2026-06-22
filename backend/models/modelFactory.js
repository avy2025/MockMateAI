const mongoose = require('mongoose');
const MockModel = require('./mockModel');

const createModel = (name, schema) => {
  if (process.env.USE_LOCAL_STORAGE === 'true') {
    return new MockModel(name, schema);
  }
  return mongoose.model(name, schema);
};

module.exports = createModel;
