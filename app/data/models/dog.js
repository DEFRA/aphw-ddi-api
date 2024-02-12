/**
 * @typedef {Object<string, any>} Dog
 * @property {number} id
 * @property {string} dog_reference
 * @property {string} index_number
 * @property {number} dog_breed_id
 * @property {number} status_id
 * @property {string} name
 * @property {Date} birth_date
 * @property {Date} death_date
 * @property {string} tattoo
 * @property {string} colour
 * @property {string} sex
 * @property {Date} exported_date
 * @property {Date} stolen_date
 * @property {Date} untraceable_date
 * @property {RegisteredPerson} registered_person
 * @property {Registration} registration
 * @property {Insurance[]} insurance
 * @property {DogMicrochip[]} dog_microchips
 * @property {DogBreed} dog_breed
 * @property {Status} status
 */

/**
 *
 * @param sequelize
 * @param DataTypes
 * @returns {Dog}
 */
module.exports = (sequelize, DataTypes) => {
  /**
   * @type {Dog}
   */
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
