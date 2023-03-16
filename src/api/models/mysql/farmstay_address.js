'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FarmstayAddress extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {Farmstay, Ward} = models;
      FarmstayAddress.belongsTo(Farmstay, 
        {foreignKey: {name: 'farm_id'},
        targetKey:'id', 
        as:'address_of',
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE'
      });

      FarmstayAddress.belongsTo(Ward, 
        {foreignKey: {name: 'code_ward'},
        targetKey:'code', 
        as:'ward'
      });
    }
  }
  FarmstayAddress.init({
    farm_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      allowNull: false,
    },
    
    // code_ward:{
    //   type: DataTypes.STRING(20),
    //   allowNull: true,
      
    // },
    latitude:{
      type: DataTypes.DECIMAL(8,6),
      allowNull: true,
    },
    longitude:{
      type: DataTypes.DECIMAL(9,6),
      allowNull: true,
    },
    specific_address:{
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    embedded_link:{
      type: DataTypes.STRING(2048),
      allowNull: false,
    },
    link:{
      type: DataTypes.STRING(512),
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'FarmstayAddress',
    tableName: 'farmstay_addresses',
    timestamps: false,
  });
  return FarmstayAddress;
};