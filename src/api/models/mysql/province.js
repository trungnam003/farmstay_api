'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Province extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {AdministrativeUnit, AdministrativeRegion, District} = models

      Province.belongsTo(AdministrativeRegion, {
        foreignKey: {name: 'administrative_region_id'}, 
        targetKey: 'id', 
        as: 'administrative_region' 
      });
      Province.belongsTo(AdministrativeUnit, {
        foreignKey: {name: 'administrative_unit_id'},  
        targetKey: 'id',
        as: 'administrative_unit' 
      });
      Province.hasMany(District, {
        foreignKey:{
          name: "province_code"
        },
        sourceKey: 'code',
        as: 'districts',
      });
    }
  }
  Province.init({
    code:{
      type: DataTypes.STRING(20),
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    name  :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    name_en  :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name_en :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    code_name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    
  }, {
    sequelize,
    modelName: 'Province',
    tableName: 'provinces',
    timestamps: false
  });
  return Province;
};