// Note: This file represents a DB Table called Likes
module.exports = (sequelize, DataTypes) => {
    // define the table as "Posts"
    const Likes = sequelize.define('Likes');

    return Likes;
};