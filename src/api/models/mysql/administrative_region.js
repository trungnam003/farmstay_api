'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdministrativeRegion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Province} = models;

      AdministrativeRegion.hasMany(Province, {
        foreignKey: {name: 'administrative_region_id'},
        sourceKey: 'id',
        as: 'provinces'
      })
    }
  }
  AdministrativeRegion.init({
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_en:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    code_name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    code_name_en:{
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'AdministrativeRegion',
    tableName: 'administrative_regions',
    timestamps: false
  });
  return AdministrativeRegion;
};