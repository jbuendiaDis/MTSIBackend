const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  role: {
    type: String ,
    default:"operador"
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
