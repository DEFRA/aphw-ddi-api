module.exports = (sequelize, DataTypes) => {
  const person = sequelize.define('person', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    person_reference: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    organisation_id: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    tableName: 'person',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'person_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  person.associate = models => {
    person.hasMany(models.person_address, {
      as: 'addresses',
      foreignKey: 'person_id'
    })

    person.hasMany(models.person_contact, {
      as: 'person_contacts',
      foreignKey: 'person_id'
    })

    person.hasMany(models.registered_person, {
      as: 'registered_people',
      foreignKey: 'person_id'
    })

    person.belongsTo(models.organisation, {
      as: 'organisation',
      foreignKey: 'organisation_id'
    })
  }

  return person
}
