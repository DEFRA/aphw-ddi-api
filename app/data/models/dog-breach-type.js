module.exports = (sequelize, DataTypes) => {
  const dogBreaches = sequelize.define('dog_breach', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dog_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    breach_type_id: {
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
    tableName: 'dog_breach',
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        name: 'dog_breach_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  dogBreaches.associate = models => {
    dogBreaches.belongsTo(models.breach_type, {
      as: 'breach_type',
      foreignKey: 'breach_type_id'
    })
    dogBreaches.belongsTo(models.dog, {
      as: 'dog',
      foreignKey: 'dog_id'
    })
  }

  return dogBreaches
}
