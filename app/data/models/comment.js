module.exports = (sequelize, DataTypes) => {
  const comment = sequelize.define('comment', {
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
    comment: {
      type: DataTypes.TEXT,
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
    tableName: 'comment',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'comment_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  comment.associate = models => {
    comment.belongsTo(models.registration, {
      as: 'registration',
      foreignKey: 'registration_id'
    })
  }

  return comment
}
