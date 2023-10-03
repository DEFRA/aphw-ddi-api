module.exports = (sequelize, DataTypes) => {
  const title = sequelize.define('title', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(24),
      allowNull: false,
      unique: "title_ukey"
    }
  }, {
    sequelize,
    tableName: 'title',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "title_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "title_ukey",
        unique: true,
        fields: [
          { name: "title" },
        ]
      },
    ]
  });

  title.associate = models => {
    title.hasMany(models.person, {
      as: "people",
      foreignKey: "title_id"
    })
  }

  return title
};
