module.exports = (sequelize, DataTypes) => {
  const registration = sequelize.define('registration', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    dog_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'dog',
        key: 'id'
      },
      unique: 'registration_dog_ukey'
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'status',
        key: 'id'
      }
    },
    police_force_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'police_force',
        key: 'id'
      }
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    time_limit: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'registration',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'registration_dog_ukey',
        unique: true,
        fields: [
          { name: 'dog_id' }
        ]
      },
      {
        name: 'registration_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  registration.associate = models => {
    registration.belongsTo(models.dog, {
      as: 'dog',
      foreignKey: 'dog_id'
    })

    registration.belongsTo(models.police_force, {
      as: 'police_force',
      foreignKey: 'police_force_id'
    })

    registration.hasMany(models.comment, {
      as: 'comments',
      foreignKey: 'registration_id'
    })

    registration.hasMany(models.document, {
      as: 'documents',
      foreignKey: 'registration_id'
    })

    registration.hasMany(models.notification, {
      as: 'notifications',
      foreignKey: 'registration_id'
    })

    registration.belongsTo(models.status, {
      as: 'status',
      foreignKey: 'status_id'
    })
  }

  return registration
}
