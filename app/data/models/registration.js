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
    exemption_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'exemption_order',
        key: 'id'
      }
    },
    cdo_issued: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cdo_expiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    time_limit: {
      type: DataTypes.DATE,
      allowNull: true
    },
    certificate_issued: {
      type: DataTypes.DATE,
      allowNull: true
    },
    legislation_officer: {
      type: DataTypes.STRING(64),
      allowNull: true
    },
    application_fee_paid: {
      type: DataTypes.DATE,
      allowNull: true
    },
    neutering_confirmation: {
      type: DataTypes.DATE,
      allowNull: true
    },
    microchip_verification: {
      type: DataTypes.DATE,
      allowNull: true
    },
    joined_exemption_scheme: {
      type: DataTypes.DATE,
      allowNull: true
    },
    withdrawn: {
      type: DataTypes.DATE,
      allowNull: true
    },
    typed_by_dlo: {
      type: DataTypes.DATE,
      allowNull: true
    },
    microchip_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    neutering_deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    non_compliance_letter_sent: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'registration',
    paranoid: true,
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'registration_dog_ukey',
        unique: true,
        fields: [
          { name: 'dog_id' },
          { name: 'deletedAt' }
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

    registration.belongsTo(models.exemption_order, {
      as: 'exemption_order',
      foreignKey: 'exemption_order_id'
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
