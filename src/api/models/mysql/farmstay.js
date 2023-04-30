'use strict';
const slug = require('slug')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Farmstay extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      const {FarmstayEquipment,FarmstayAddress, Employee, RentFarmstay} = models;
      // belongTo
      // Farmstay.belongsTo(Employee, {
      //   foreignKey: {name: 'manager_id', allowNull: true},
      //   targetKey: 'id',
      //   as: 'management_staff',
      //   onDelete: "SET NULL",
      //   onUpdate: 'CASCADE'
      // })
      // hasOne
      Farmstay.hasOne(FarmstayAddress, 
        {foreignKey: {name: 'farm_id'},
        sourceKey:'id', 
        as:'address_of_farmstay'
      });
      // hasMany
      Farmstay.hasMany(FarmstayEquipment, 
        {foreignKey: {name: 'farm_id'},
        sourceKey:'id', 
        as:'list_equipment'
      });
      // Farmstay.hasMany(Employee, {
      //   foreignKey: {name: 'farm_id', allowNull: true},
      //   sourceKey: 'id',
      //   as: 'employees_work',
      // });
      Farmstay.hasOne(RentFarmstay, 
        {foreignKey: {name: 'farm_id'},
        sourceKey:'id', 
        as:'rental_info'
      });
    }
    
  }
  Farmstay.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug:{
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "",
    },
    rent_cost_per_day:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    manager_id:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    description:{
      type: DataTypes.TEXT,
      allowNull: true
    },
    square_meter:{
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true
    },
    images:{
      type: DataTypes.JSON,
      allowNull: true
    },

  }, {
    sequelize,
    modelName: 'Farmstay',
    tableName: 'farmstays',
    paranoid: true,
    timestamps: true
  });

  Farmstay.prototype.addImageURL= function(url){
    const array = [...this.images, ...url];
    this.images = array;
  }
  Farmstay.addHook('beforeCreate', function(farmstay, options){
    farmstay.slug =  slug(farmstay.name, '_');
  })
  return Farmstay;
};