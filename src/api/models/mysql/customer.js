'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {RentFarmstay, User} = models;
      // hasMany
      Customer.hasOne(RentFarmstay, 
        {foreignKey: {name: 'customer_id'},
        sourceKey:'id', 
        as:'rental_info'
      });
      // belongTo
      Customer.belongsTo(User, {
        foreignKey: {name: 'user_id'},
        targetKey: 'id',
        as:'user_customer',
      })
    }
  }
  Customer.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true,
      allowNull: false,
      
    },
    district_code:{
      type: DataTypes.STRING(20),
      allowNull: true,
      
    },
  }, {
    sequelize,
    modelName: 'Customer',
    tableName: "customers",
    paranoid: true,
  });
  return Customer;
};