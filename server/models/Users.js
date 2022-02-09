// Note: This file represents a DB Table called Users
module.exports = (sequelize, DataTypes) => {
    // define the table as "Users"
    const Users = sequelize.define('Users', {

        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });

    // Grab the model you create above:
    Users.associate = (models) => {
        // models is an argument that has access to all models we have in the project
        
        Users.hasMany(models.Posts, {
             onDelete: 'cascade', // when a user record is deleted from Users table, all posts associated with this user (all posts referencing this user record) will be deleted from the Posts table
        }); 
        
        Users.hasMany(models.Likes, {
            onDelete: 'cascade', // when a user record is deleted from Users table, all likes associated with this user (all likes referencing this user record) will be deleted from the Posts table
       }); 
    };

    return Users;
};