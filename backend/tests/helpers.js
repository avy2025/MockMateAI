const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Creates a test user in the database and returns a valid JWT token.
 * @param {object} overrides - Field overrides for the User model.
 * @returns {{ user: object, token: string }}
 */
async function createAuthenticatedUser(overrides = {}) {
  const userData = {
    name: 'Test User',
    email: `testuser-${Date.now()}@test.com`,
    password: 'password123',
    role: 'candidate',
    ...overrides,
  };

  const user = await User.create(userData);

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  return { user, token };
}

/**
 * Creates a recruiter user with appropriate role.
 */
async function createRecruiterUser(overrides = {}) {
  return createAuthenticatedUser({
    name: 'Test Recruiter',
    email: `recruiter-${Date.now()}@test.com`,
    role: 'recruiter',
    ...overrides,
  });
}

module.exports = {
  createAuthenticatedUser,
  createRecruiterUser,
};
