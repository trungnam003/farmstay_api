'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ApiEndpoint extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Permission} = models;
      ApiEndpoint.hasMany(Permission, {
        foreignKey: {name: 'api_endpoint_id'},
        sourceKey: 'id',
        as: 'endpoint_permissions'
      });
    }
  }
  ApiEndpoint.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    api_endpoint: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    method:{
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 1,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ApiEndpoint',
    tableName: 'api_endpoints',
    paranoid: true
  });
  return ApiEndpoint;
};