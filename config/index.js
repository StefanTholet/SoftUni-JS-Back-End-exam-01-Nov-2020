const connection = require('../credentials');
module.exports = {
        PORT: 3000,
        DB_CONNECTION: connection,
        SALT_ROUNDS: 10,
        SECRET: 'bigSecret',
        COOKIE_NAME: 'USER_SESSION',
};