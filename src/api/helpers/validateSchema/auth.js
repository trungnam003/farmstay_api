const Joi = require('@hapi/joi');
const keys = require('./schemaKeys')
const schema = {
    login: Joi.object().keys({
        login:  keys.login,
        password: keys.password,
    }),

    register: Joi.object().keys({
        email:  keys.email,
        username: keys.username,
        password: keys.password,
    }),
}

module.exports = schema;