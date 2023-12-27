const User = require('../models/User');

const getUserNameById = async (userId) => {
  try {
    if (!userId) {
      return null;
    }

    const user = await User.findById(userId);

    return user ? `${user.name} ${user.lastname}` : null;
  } catch (error) {
    throw error;
  }
};

module.exports = getUserNameById;
