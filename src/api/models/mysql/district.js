'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class District extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {AdministrativeUnit, Province, Ward} = models
      District.belongsTo(AdministrativeUnit, {
        foreignKey:{
          name: "administrative_unit_id",
        },
        targetKey: 'id',
        as: 'administrative_unit'
      });
      District.belongsTo(Province, {
        foreignKey:{
          name: "province_code"
        },
        targetKey: 'code',
        as: 'province',
      });

      District.hasMany(Ward, {
        foreignKey:{
          name: "district_code"
        },
        sourceKey: 'code',
        as: 'wards',
      });

    }
  }
  District.init({
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
    modelName: 'District',
    tableName: 'districts',
    timestamps: false
  });
  return District;
};