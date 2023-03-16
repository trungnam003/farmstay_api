'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RoleHasPermission extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Role, Permission}= models;
      RoleHasPermission.belongsTo(Role, {
        foreignKey: {name: 'role_id'},
        targetKey: 'id',
        as: 'belong_to_role'
      });
      RoleHasPermission.belongsTo(Permission, {
        foreignKey: {name: 'permission_id'},
        targetKey: 'id',
        as: 'belong_to_permission'
      })
    }
  }
  RoleHasPermission.init({
    role_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
     
    },
    permission_id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
      
    },
  }, {
    sequelize,
    modelName: 'RoleHasPermission',
    tableName: 'role_has_permissions',
    timestamps: false
  });
  return RoleHasPermission;
};