module.exports = (sequelize, DataTypes) => {
  const person = sequelize.define('person', {
    id: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    title_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    first_name: {
      type: DataTypes.STRING(24),
      allowNull: true
    },
    last_name: {
      type: DataTypes.STRING(24),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'person',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "person_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });

  person.associate = models => {
    person.hasMany(models.person_address, {
      as: "person_addresses",
      foreignKey: "person_id"
    })

    person.hasMany(models.person_contact, {
      as: "person_contacts",
      foreignKey: "person_id"
    })

    person.hasMany(models.registered_person, {
      as: "registered_people",
      foreignKey: "person_id"
    })

    person.belongsTo(models.title, {
      as: "title",
      foreignKey: "title_id"
    })
  }

  return person
};
