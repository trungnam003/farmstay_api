'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Employee, Customer, Role} = models
      // hasOne
      User.hasOne(Employee, {
        foreignKey: {name: 'user_id'},
        sourceKey: 'id',
        as: 'user_employee'
      });
      User.hasOne(Customer, {
        foreignKey: {name: 'user_id',},
        sourceKey: 'id',
        as: 'user_customer'
      })
      User.belongsTo(Role, {
        foreignKey: {name: 'role_id', allowNull: true},
        targetKey: 'id',
        as: 'role'
      })
    }
  }
  User.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    username: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    hashed_password: {
      type: DataTypes.CHAR(64),
      allowNull: false,
    },
    phone:{
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
    },
    gender:{
      type: DataTypes.ENUM('male', 'female', 'orther'),
      allowNull: true,
    },
    is_active:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    role_id:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      
    },
    user_type: {
      type: DataTypes.ENUM('customer', 'employee'),
      allowNull: false,
    },
    changed_password_at:{
      type: DataTypes.DATE,
      allowNull: true,
    }
    
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    paranoid: true
  });
  return User;
};