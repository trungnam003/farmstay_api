'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RentFarmstay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Customer, Farmstay, Invoice} = models;
      // hasOne
      RentFarmstay.hasOne(Invoice, {
        foreignKey: {name: 'rented_farmstay_id'},
        sourceKey: 'id',
        as: 'invoice'
      })
      // hasMany
     
      // belongTo
      RentFarmstay.belongsTo(Farmstay, {
        foreignKey: {name: 'farm_id'},
        targetKey: 'id',
        as: 'farmstay',
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      });
      RentFarmstay.belongsTo(Customer, {
        foreignKey: {name: 'customer_id'},
        targetKey: 'id',
        as: 'customer',
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      });
    }
  }
  RentFarmstay.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    farm_id: {
      allowNull: false,
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true
      
    },
    customer_id: {
      allowNull: false,
      unique: true,
      type: DataTypes.INTEGER.UNSIGNED,
      
    },
    rented_at: {
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    deposit_amount: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER
    },
    is_deposit: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN
    },
    vnp_txnref:{
      allowNull: false,
      type: DataTypes.STRING
    },
    // expiration_date: {
    //   allowNull: false,
    //   type: DataTypes.DATEONLY
    // },
    // total_rental_cost: {
    //   type: DataTypes.INTEGER.UNSIGNED,
    //   allowNull: true,

    // },
    // total_sensor_rental_cost:{
    //   type: DataTypes.INTEGER.UNSIGNED,
    //   allowNull: true,
    // },
    // total_farmstay_rental_cost:{
    //   type: DataTypes.INTEGER.UNSIGNED,
    //   allowNull: true,
    // },
    // paid:{
    //   type: DataTypes.BOOLEAN,
    //   allowNull: false,
    //   defaultValue: false
    // },
    is_rented:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'RentFarmstay',
    tableName: 'rent_farmstays',
  });
  return RentFarmstay;
};