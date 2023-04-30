const TYPE = 'auth'
const AUTHORIZATION = {
    BASE:{
        type: TYPE,
        slug: 'authorization_error',
        message: 'Authorization failed',
        code: '001',
    },
    USER_NOT_ACTIVED: {
        type: TYPE,
        slug: 'user_not_actived',
        message: 'Account must be activated',
        code: '002'
    },
    MUST_BE_CUSTOMER: {
        type: TYPE,
        slug: 'must_be_customer',
        message: 'Must be a customer user',
        code: '003'
    },
    MUST_BE_EMPLOYEE: {
        type: TYPE,
        slug: 'must_be_employee',
        message: 'Must be a employee user',
        code: '004'
    },
}

module.exports = AUTHORIZATION;