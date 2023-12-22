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
    court_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'court',
        key: 'id'
      }
    },
    created_on: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    cdo_issued: {
      type: DataTypes.DATE,
      allowNull: false
    },
    cdo_expiry: {
      type: DataTypes.DATE,
      allowNull: false
    },
    time_limit: {
      type: DataTypes.DATE,
      allowNull: true
    },
    legislation_officer: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    application_fee_paid_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    neutering_confirmation_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    microchip_verification_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    joined_exemption_scheme_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'registration',
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

    registration.belongsTo(models.court, {
      as: 'court',
      foreignKey: 'court_id'
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
