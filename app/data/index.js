const fs = require('fs')
const path = require('path')
const sequelize = require('../config/db')
const { DataTypes } = require('sequelize')
const modelPath = path.join(__dirname, 'models')

const initModels = () => {
  fs.readdirSync(modelPath)
    .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
    .forEach(file => require(path.join(modelPath, file))(sequelize, DataTypes))

  const models = sequelize.models

  Object.keys(models).forEach(modelName => models[modelName].associate?.(models))

  return {
    ...models
  }
}

module.exports = initModels()
