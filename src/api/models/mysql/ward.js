'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ward extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {AdministrativeUnit, District,FarmstayAddress} = models

      Ward.belongsTo(AdministrativeUnit, {
        foreignKey:{
          name: "administrative_unit_id"
        },
        targetKey: 'id',
        as: 'administrative_unit'
      });

      Ward.belongsTo(District, {
        foreignKey:{
          name: "district_code"
        },
        targetKey: 'code',
        as: 'district',
      });

      Ward.hasMany(FarmstayAddress, 
        {foreignKey: {name: 'code_ward'},
        sourceKey:'code', 
        as:'farmstays'
      });

    }
  }
  Ward.init({
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
    modelName: 'Ward',
    tableName: 'wards',
    timestamps: false
  });
  return Ward;
};