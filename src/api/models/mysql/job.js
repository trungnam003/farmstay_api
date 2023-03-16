'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Employee} = models;
      // hasMany
      Job.hasMany(Employee, {
        foreignKey: {name: 'job_id', allowNull: true},
        sourceKey: 'id',
        as: 'employees_of_job',
      });
    }
  }
  Job.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    salary_per_hour: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false
    },
    overtime_percent: {
      type: DataTypes.DECIMAL(4,1).UNSIGNED,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'Job',
    tableName: 'jobs',
    paranoid: true,
  });
  return Job;
};