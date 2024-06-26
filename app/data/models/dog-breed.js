module.exports = (sequelize, DataTypes) => {
  const dogBreed = sequelize.define('dog_breed', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    breed: {
      type: DataTypes.STRING(32),
      allowNull: false,
      unique: 'breed_name_ukey'
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    display_order: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'dog_breed',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'breed_name_ukey',
        unique: true,
        fields: [
          { name: 'breed' }
        ]
      },
      {
        name: 'breed_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  dogBreed.associate = models => {
    dogBreed.hasMany(models.dog, {
      as: 'dogs',
      foreignKey: 'dog_breed_id'
    })
  }

  return dogBreed
}
