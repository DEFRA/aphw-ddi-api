module.exports = (sequelize, DataTypes) => {
  const contact = sequelize.define('contact', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    contact: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'contact_ukey'
    },
    contact_type_id: {
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
    tableName: 'contact',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'contact_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'contact_ukey',
        unique: true,
        fields: [
          { name: 'contact' }
        ]
      }
    ]
  })

  contact.associate = models => {
    contact.hasMany(models.person_contact, {
      as: 'person_contacts',
      foreignKey: 'contact_id'
    })

    contact.belongsTo(models.contact_type, {
      as: 'contact_type',
      foreignKey: 'contact_type_id'
    })
  }

  return contact
}
