'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FarmstayArea extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {FarmstayEquipment} = models;
      // hasMany
      FarmstayArea.hasMany(FarmstayEquipment, 
        {foreignKey: {name: 'area_id'},
        sourceKey:'id', 
        as:'equipments'
      });
    }
  }
  FarmstayArea.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_en:{
      type: DataTypes.STRING,
      defaultValue: 'farm',
      allowNull: false,
    },
    slug_en: {
      type: DataTypes.STRING,
      defaultValue: 'farm',
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'FarmstayArea',
    tableName: 'farmstay_areas',
    timestamps: false
  });
  return FarmstayArea;
};