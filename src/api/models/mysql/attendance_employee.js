'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AttendanceEmployee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Employee} = models;
      // belongTo
      AttendanceEmployee.belongsTo(Employee, {
        foreignKey: {name: 'employee_id', },
        targetKey: 'id',
        as: 'attendance_of',
        onDelete: "CASCADE",
        onUpdate: 'CASCADE'
      })
    }
  }
  AttendanceEmployee.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    time_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    time_end:{
      type: DataTypes.DATE,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'AttendanceEmployee',
    tableName: 'attendance_employees',
    timestamps: false,
  });
  return AttendanceEmployee;
};