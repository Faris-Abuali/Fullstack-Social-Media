// Note: This file represents a DB Table called Posts
module.exports = (sequelize, DataTypes) => {
    // define the table as "Posts"
    const Comments = sequelize.define('Comments', {
        commentBody: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    });

    return Comments;
};