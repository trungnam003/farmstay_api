const {User, Customer} = require('../../models/mysql')
const config = require('../../../config')

/**
 * 
 * @param {object} user
 * @param {string} user.username
 * @param {string} user.email
 * @param {string} user.hashed_password
 * @param {string} user.phone
 * @param {string} user.gender
 * @param {object} user.user_customer
 * 
 */
const createUserCustomer = async (user)=>
{
    return new Promise((resolve, reject)=>{
        (async () =>{
            try {
                const {username, email, hashed_password, 
                    phone, gender, user_customer} = user;
                const userType = config.user.customer;
                
                await User.create({
                    username, email, hashed_password, phone, gender,
                    user_type: userType,
                    user_customer
                }, {
                    include: [
                        {
                            model: Customer,
                            as: 'user_customer',
                            
                        }
                    ]
                })
                resolve(true)
            } catch (error) {
                reject(error)
            }
        })();
    })
}

module.exports = {
    createUserCustomer
}