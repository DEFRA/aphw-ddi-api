module.exports = (sequelize, DataTypes) => {
  const userAccount = sequelize.define('user_account', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    police_force_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    telephone: {
      type: DataTypes.STRING(30),
      allowNull: true
    },
    activation_token: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    activation_token_expiry: {
      type: DataTypes.DATE,
      allowNull: true
    },
    activated_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    accepted_terms_and_conds_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    last_login_date: {
      type: DataTypes.DATE,
      allowNull: true
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
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'user_account',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        name: 'user_account_username_ukey',
        unique: true,
        fields: [
          { name: 'username' }
        ]
      },
      {
        name: 'user_account_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  userAccount.associate = models => {
    userAccount.belongsTo(models.police_force, {
      as: 'police_force',
      foreignKey: 'police_force_id'
    })
  }

  return userAccount
}
