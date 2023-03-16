'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {RentFarmstay} = models;
      // belongTo
      Invoice.belongsTo(RentFarmstay, {
        foreignKey: {name: 'rented_farmstay_id'},
        targetKey: 'id',
        as: 'farmstay_rental_invoice_of',
        
      })
    }
  }
  Invoice.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    rented_farmstay_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    canceled_at: {
      allowNull: false,
      type: DataTypes.DATEONLY
    },
    total_rental_cost: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,

    },
    total_equipment_rental_cost:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    total_farmstay_rental_cost:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    paid:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
  }, {
    sequelize,
    modelName: 'Invoice',
    tableName: 'invoices'
  });
  return Invoice;
};