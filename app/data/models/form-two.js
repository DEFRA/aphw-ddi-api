module.exports = (sequelize, DataTypes) => {
  const formTwo = sequelize.define('form_two', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    registration_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'registration',
        key: 'id'
      }
    },
    form_two_submitted: {
      type: DataTypes.DATE,
      allowNull: true
    },
    submitted_by: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'form_two',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'form_two_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      },
      {
        name: 'form_two_registration_ukey',
        unique: true,
        fields: [
          { name: 'registration_id' }
        ]
      }
    ]
  })

  formTwo.associate = models => {
    formTwo.belongsTo(models.registration, {
      as: 'registration',
      foreignKey: 'registration_id'
    })
  }

  return formTwo
}
