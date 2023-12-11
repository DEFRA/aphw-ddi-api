module.exports = (sequelize, DataTypes) => {
  const address = sequelize.define('address', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    address_line_1: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    address_line_2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    town: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    postcode: {
      type: DataTypes.STRING(24),
      allowNull: false
    },
    county: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    country_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'address',
    timestamps: false,
    indexes: [
      {
        name: 'address_line_1_ukey',
        unique: true,
        fields: [
          { name: 'address_line_1' }
        ]
      },
      {
        name: 'address_line_2_ukey',
        unique: true,
        fields: [
          { name: 'address_line_2' }
        ]
      },
      {
        name: 'town_ukey',
        unique: true,
        fields: [
          { name: 'town' }
        ]
      },
      {
        name: 'address_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'postcode_ukey',
        unique: true,
        fields: [
          { name: 'postcode' }
        ]
      }
    ]
  })

  address.associate = models => {
    address.hasMany(models.person_address, {
      as: 'person_addresses',
      foreignKey: 'address_id'
    })

    address.belongsTo(models.country, {
      as: 'country',
      foreignKey: 'country_id'
    })
  }

  return address
}
