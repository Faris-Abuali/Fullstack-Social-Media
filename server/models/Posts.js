// Note: This file represents a DB Table called Posts
module.exports = (sequelize, DataTypes) => {
    // define the table as "Posts"
    const Posts = sequelize.define('Posts', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        postText: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    // Grab the model you create above:
    Posts.associate = (models) => {
        // models is an argument that has access to all models we have in the project
        Posts.hasMany(models.Comments, {
             onDelete: 'cascade', // when a post record is deleted from Posts table, all comments associated with this post (all comments refrencing this post record) will be deleted from the Comments table
        }); 

        Posts.hasMany(models.Likes, {
             onDelete: 'cascade', // when a post record is deleted from Posts table, all likes associated with this post (all likes refrencing this post record) will be deleted from the Likes table
        }); 
    };

    return Posts;
};