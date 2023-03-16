'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdministrativeUnit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Province, District, Ward} = models;

      AdministrativeUnit.hasMany(Province, {
        foreignKey: {name: 'administrative_unit_id'},
        sourceKey: 'id',
        as: 'provinces' 
      })

      AdministrativeUnit.hasMany(District, {
        foreignKey: {name: 'administrative_unit_id'},
        sourceKey: 'id',
        as: 'districts' 
      })

      AdministrativeUnit.hasMany(Ward, {
        foreignKey: {name: 'administrative_unit_id'},
        sourceKey: 'id',
        as: 'wards' 
      })

    }
  }
  AdministrativeUnit.init({
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      unique: true
    },
    full_name :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    full_name_en :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    short_name  :{
      type: DataTypes.STRING,
      allowNull: false,
    },
    short_name_en  :{
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
    modelName: 'AdministrativeUnit',
    tableName: 'administrative_units',
    timestamps: false
  });
  return AdministrativeUnit;
};