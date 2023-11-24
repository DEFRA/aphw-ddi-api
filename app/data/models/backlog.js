module.exports = (sequelize, DataTypes) => {
  const backlog = sequelize.define('backlog', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    json: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    errors: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    warnings: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'backlog',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: 'backlog_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  return backlog
}
