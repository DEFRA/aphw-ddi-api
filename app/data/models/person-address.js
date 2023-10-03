module.exports = (sequelize, DataTypes) => {
  const personAddress = sequelize.define('person_address', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    address_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'person_address',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "person_address_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  personAddress.associate = models => {
    personAddress.belongsTo(models.address, {
      as: "address",
      foreignKey: "address_id"
    })
    
    personAddress.belongsTo(models.person, {
      as: "person",
      foreignKey: "person_id"
    })
  }

  return personAddress
};
