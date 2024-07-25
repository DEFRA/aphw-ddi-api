module.exports = (sequelize, DataTypes) => {
  const personContact = sequelize.define('person_contact', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    person_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    contact_id: {
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
    tableName: 'person_contact',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'person_contact_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  personContact.associate = models => {
    personContact.belongsTo(models.contact, {
      as: 'contact',
      foreignKey: 'contact_id'
    })

    personContact.belongsTo(models.person, {
      as: 'person',
      foreignKey: 'person_id'
    })
  }

  return personContact
}
