'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {RoleHasPermission, ApiEndpoint} = models;
      Permission.hasMany(RoleHasPermission, {
        foreignKey: {name: 'permission_id'},
        sourceKey: 'id',
        as: 'permission_has_roles'
      });
      Permission.belongsTo(ApiEndpoint, {
        foreignKey: {name: 'api_endpoint_id'},
        targetKey: 'id',
        as: 'api_endpoint',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
    }
  }
  Permission.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    method:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue:1,
     
    },
    api_endpoint_id:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      
    },
  }, {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    paranoid: true
  });
  return Permission;
};