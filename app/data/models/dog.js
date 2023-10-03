module.exports = (sequelize, DataTypes) => {
  const dog = sequelize.define('dog', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
    insurance_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'insurance',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tattoo: {
      type: DataTypes.STRING(32),
      allowNull: true
    },
    microchip_number: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    microchip_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'microchip_type',
        key: 'id'
      }
    },
    colour: {
      type: DataTypes.STRING(16),
      allowNull: false
    },
    sex: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    exported: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'dog',
    schema: 'public',
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

    dog.belongsTo(models.insurance, {
      as: 'insurance',
      foreignKey: 'insurance_id'
    })

    dog.belongsTo(models.microchip_type, {
      as: 'microchip_type',
      foreignKey: 'microchip_type_id'
    })

    dog.belongsTo(models.status, {
      as: 'status',
      foreignKey: 'status_id'
    })
  }

  return dog
}
