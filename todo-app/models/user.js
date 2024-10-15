'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Todo, {
        foreignKey: 'userId'
      });
    }
  }

  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false, // Ensure firstName is required
      validate: {
        notEmpty: {
          msg: 'First name is required.'
        }
      }
    },
    lastName: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false, // Ensure email is required
      validate: {
        isEmail: {
          msg: 'Must be a valid email address.'
        },
        notEmpty: {
          msg: 'Email is required.'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false, // Optionally, make password required too
      validate: {
        notEmpty: {
          msg: 'Password is required.'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};
