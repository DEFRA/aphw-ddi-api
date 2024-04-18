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
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'person_address',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'person_address_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  personAddress.associate = models => {
    personAddress.belongsTo(models.address, {
      as: 'address',
      foreignKey: 'address_id'
    })

    personAddress.belongsTo(models.person, {
      as: 'person',
      foreignKey: 'person_id'
    })
  }

  return personAddress
}
