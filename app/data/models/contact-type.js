module.exports = (sequelize, DataTypes) => {
  const contactType = sequelize.define('contact_type', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    contact_type: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: 'contact_type_ukey'
    }
  }, {
    sequelize,
    tableName: 'contact_type',
    timestamps: false,
    indexes: [
      {
        name: 'contact_type_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'contact_type_ukey',
        unique: true,
        fields: [
          { name: 'contact_type' }
        ]
      }
    ]
  })

  contactType.associate = models => {
    contactType.hasMany(models.contact, {
      as: 'contacts',
      foreignKey: 'contact_type_id'
    })
  }

  return contactType
}
