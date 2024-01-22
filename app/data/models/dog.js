module.exports = (sequelize, DataTypes) => {
  const dog = sequelize.define('dog', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dog_reference: {
      type: DataTypes.UUID,
      allowNull: true
    },
    index_number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    dog_breed_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dog_breed',
        key: 'id'
      }
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'status',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    death_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    tattoo: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    colour: {
      type: DataTypes.STRING(16),
      allowNull: true
    },
    sex: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    exported_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    stolen_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    untraceable_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'dog',
    timestamps: false,
    indexes: [
      {
        name: 'dog_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  dog.associate = models => {
    dog.hasMany(models.registered_person, {
      as: 'registered_person',
      foreignKey: 'dog_id'
    })

    dog.hasOne(models.registration, {
      as: 'registration',
      foreignKey: 'dog_id'
    })

    dog.belongsTo(models.dog_breed, {
      as: 'dog_breed',
      foreignKey: 'dog_breed_id'
    })

    dog.hasMany(models.insurance, {
      as: 'insurance',
      foreignKey: 'dog_id'
    })

    dog.belongsTo(models.status, {
      as: 'status',
      foreignKey: 'status_id'
    })

    dog.hasMany(models.dog_microchip, {
      as: 'dog_microchips',
      foreignKey: 'dog_id'
    })
  }

  return dog
}
