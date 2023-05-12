const Joi = require('@hapi/joi');

const keys = {}

keys['email'] = Joi.string().lowercase().email().required();
keys['username'] = Joi.string().regex(/^[A-Za-z][A-Za-z0-9]*(?=[a-zA-Z0-9._]{3,120}$)(?!.*[_.]{2})[^_.].*[^_.]$/).required()
.messages({'string.pattern.base': '{{#label}} must be a valid username',});


keys['login'] = Joi.alternatives().try(
        keys.email,
        keys.username,
    ).messages({
        'alternatives.all': '{{#label}} must be a valid email or username',
        'alternatives.any': '{{#label}} must be a valid email or username',
        'alternatives.match': '{{#label}} must be a validemail or username',
        'alternatives.one': '{{#label}} must be a valid email or username',
        'alternatives.types': '{{#label}} must be a valid email or username'
    }).required();

keys['password'] = Joi.string().alphanum().min(3).max(256).required();


module.exports = keys;
