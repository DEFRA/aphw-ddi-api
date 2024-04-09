module.exports = (sequelize, DataTypes) => {
  const organisation = sequelize.define('organisation', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    organisation_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: 'organisation_name_ukey'
    }
  }, {
    sequelize,
    tableName: 'organisation',
    timestamps: false,
    indexes: [
      {
        name: 'organisation_name_ukey',
        unique: true,
        fields: [
          { name: 'organisation' }
        ]
      },
      {
        name: 'organisation_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  organisation.associate = models => {
    organisation.hasMany(models.person, {
      as: 'person',
      foreignKey: 'organisation_id'
    })
  }

  return organisation
}
