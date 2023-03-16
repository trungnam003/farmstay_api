'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Salary extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Employee} = models;
      // belongTo
      Salary.belongsTo(Employee, {
        foreignKey: {name: 'employee_id', },
        targetKey: 'id',
        as: 'salary_of',
        onDelete: "CASCADE",
        onUpdate: 'CASCADE'
      })
    }
  }
  Salary.init({
    employee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    total_salary:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    bonus: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    monetary_fine: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'Salary',
    tableName: 'salaries',
    paranoid: true,
  });
  return Salary;
};