/**
 * @typedef {Object<string, any>} Registration
 * @property {number} id
 * @property {number} dog_id
 * @property {number} status_id
 * @property {number} police_force_id
 * @property {number} court_id
 * @property {number} exemption_order_id
 * @property {Date} created_on
 * @property {Date} cdo_issued
 * @property {Date} cdo_expiry
 * @property {Date} time_limit
 * @property {Date} certificate_issued
 * @property {number} legislation_officer
 * @property {Date} application_fee_paid
 * @property {Date} neutering_confirmation
 * @property {Date} microchip_verification
 * @property {Date} joined_exemption_scheme
 * @property {Date} withdrawn
 * @property {Date} typed_by_dlo
 * @property {Date} microchip_deadline
 * @property {Date} neutering_deadline
 * @property {Date} removed_from_cdo_process
 * @property {Comment[]} comments
 * @property {Document[]} documents
 * @property {Notification[]} notifications
 * @property {Dog} dog
 * @property {PoliceForce} police_force
 * @property {Court} court
 * @property {ExemptionOrder} exemption_order
 * @property {Status} status
 */
/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {Registration}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {Registration}
   */
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
    exemption_order_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'exemption_order',
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
    removed_from_cdo_process: {
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
