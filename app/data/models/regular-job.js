module.exports = (sequelize, DataTypes) => {
  const regularJob = sequelize.define('regular_job', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    run_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    result: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('now')
    }
  }, {
    sequelize,
    tableName: 'regular_job',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        name: 'regular_job_run_date_key',
        unique: false,
        fields: [
          { name: 'run_date' }
        ]
      },
      {
        name: 'regular_job_pkey',
        unique: true,
        fields: [
          { name: 'id' }
        ]
      }
    ]
  })

  return regularJob
}
