
const TYPE = 'auth'
const AUTHENTICATE = {
    BASE:{
        type: TYPE,
        slug: 'authenticate_error',
        message: 'Authentication failed',
        code: '001',
    },
    ACCOUNT_NOT_EXIST: {
        type: TYPE,
        slug: 'account_not_exist',
        message: 'Account does not exist',
        code: '002'
    },
    WRONG_PASSWORD: {
        type: TYPE,
        slug: 'wrong_password',
        message: 'Wrong password',
        code: '003'
    },
    HEADER_NO_TOKEN: {
        type: TYPE,
        slug: 'header_no_token',
        message: 'Header does not contain authenticate token',
        code: '004'
    },
    TOKEN_LOGGED_OUT:{
        type: TYPE,
        slug: 'token_logged_out',
        message: 'Token has been logged out',
        code: '005'
    },
    TOKEN_IS_OLD:{
        type: TYPE,
        slug: 'token_is_old',
        message: 'This token is old, you have changed the password',
        code: '006'
    },
    TOKEN_EXPIRED:{
        type: TYPE,
        slug: 'token_expired',
        message: 'Token expired',
        code: '007'
    },
    TOKEN_INVALID:{
        type: TYPE,
        slug: 'token_invalid',
        message: 'Token invalid',
        code: '008'
    }
}

module.exports = AUTHENTICATE






