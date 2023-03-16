'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FarmstayEquipment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Farmstay,Equipment,FarmstayEquipmentDetail, FarmstayArea} = models;
      
      FarmstayEquipment.belongsTo(Farmstay, 
        {foreignKey: {name: 'farm_id'}, 
        targetKey:'id', 
        as:'used_by', 
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE'
      });

      FarmstayEquipment.belongsTo(Equipment, 
        {foreignKey: {name: 'equipment_id'},
        targetKey:'id', 
        as:'is_equipment', 
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE'
      });

      FarmstayEquipment.hasMany(FarmstayEquipmentDetail, {
        foreignKey: {name: 'farmstay_equipment_id'},
        sourceKey: 'id',
        as: 'details',
      })
      FarmstayEquipment.belongsTo(FarmstayArea, 
        {
          foreignKey: {name: 'area_id'}, 
          targetKey:'id', 
          as:'area', 
          onDelete: 'SET NULL', 
          onUpdate: 'CASCADE'
        }
      )
      
    }
  }
  FarmstayEquipment.init({
    id: {
      primaryKey: true,
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    have_data:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    number_of_field:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'FarmstayEquipment',
    tableName: 'farmstay_equipments',
    timestamps: false
  });
  return FarmstayEquipment;
};