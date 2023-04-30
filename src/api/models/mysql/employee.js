'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Job, Farmstay, Salary,AttendanceEmployee, User} = models;
      // belongTo
      Employee.belongsTo(Job, {
        foreignKey: {name: 'job_id', allowNull: true},
        targetKey: 'id',
        as: 'job_of_employee',
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      });
      // Employee.belongsTo(Farmstay, {
      //   foreignKey: {name: 'farm_id', allowNull: true},
      //   targetKey: 'id',
      //   as: 'work_at_farmstay',
      //   onDelete: "SET NULL",
      //   onUpdate: "CASCADE"
      // })
      // Employee.belongsTo(Employee, {
      //   foreignKey: {name: 'manager_id', allowNull: true},
      //   targetKey: 'id',
      //   as:'managed_by',
      //   onDelete: "SET NULL",
      //   onUpdate: "CASCADE"
      // })
      Employee.belongsTo(User, {
        foreignKey: {name: 'user_id'},
        targetKey: 'id',
        as:'user_employee',
      })
      // hasMany
      // Employee.hasMany(Employee, {
      //   foreignKey: {name: 'manager_id', allowNull: true},
      //   sourceKey: 'id',
      //   as:'manage_employees'
      // });
      Employee.hasMany(AttendanceEmployee, {
        foreignKey: {name: 'employee_id', },
        sourceKey: 'id',
        as: 'attendances_of_employee',
      })
      // hasOne
      Employee.hasOne(Salary, {
        foreignKey: {name: 'employee_id', },
        sourceKey: 'id',
        as: 'salary_of_employee',
      })
      // Employee.hasOne(Farmstay, {
      //   foreignKey: {name: 'manager_id', allowNull: true},
      //   sourceKey: 'id',
      //   as: 'manage_farmstay',
      // })
    }
  }
  Employee.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      unique: true,
      allowNull: false,
    },
    // district_code:{
    //   type: DataTypes.STRING(20),
    //   allowNull: true,
      
    // },

    job_id: {
      allowNull: true,
      type: DataTypes.INTEGER.UNSIGNED,
     
    },
    // farm_id: {
    //   allowNull: true,
    //   type: DataTypes.INTEGER.UNSIGNED,
     
    // },
    // manager_id: {
    //   allowNull: true,
    //   type: DataTypes.INTEGER.UNSIGNED,
      
    // },
  }, {
    sequelize,
    modelName: 'Employee',
    tableName: 'employees',
  });
  return Employee;
};