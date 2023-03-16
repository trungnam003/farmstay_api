'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FarmstayEquipmentDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const { FarmstayEquipment} = models;
      
      FarmstayEquipmentDetail.belongsTo(FarmstayEquipment, 
        {
          foreignKey: {name: 'farmstay_equipment_id'}, 
          targetKey:'id', 
          as:'farmstay_equipment', 
          onDelete: 'CASCADE', 
          onUpdate: 'CASCADE'
        }
      )
    }
  }
  FarmstayEquipmentDetail.init({
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.STRING
    },
    field_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mqtt_topic: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
  }, {
    sequelize,
    modelName: 'FarmstayEquipmentDetail',
    tableName: 'farmstay_equipment_details',
    timestamps: false
  });
  return FarmstayEquipmentDetail;
};