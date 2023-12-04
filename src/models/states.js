const mongoose = require('mongoose');

// Define the schema for a state
const stateSchema = new mongoose.Schema({
  id: Number,
  name: String,
});

// Create a model based on the schema
const State = mongoose.model('State', stateSchema);

module.exports = State;
