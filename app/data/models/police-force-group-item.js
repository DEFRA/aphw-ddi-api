module.exports = (sequelize, DataTypes) => {
  const policeForceGroupItem = sequelize.define('police_force_group_item', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    police_force_group_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    police_force_id: {
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
    tableName: 'police_force_group_item',
    paranoid: true,
    createdAt: 'created_at',
    deletedAt: 'deleted_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'police_force_group_item_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  policeForceGroupItem.associate = models => {
    policeForceGroupItem.belongsTo(models.police_force_group, {
      as: 'police_force_group',
      foreignKey: 'police_force_group_id'
    })

    policeForceGroupItem.belongsTo(models.police_force, {
      as: 'police_force',
      foreignKey: 'police_force_id'
    })
  }

  return policeForceGroupItem
}
