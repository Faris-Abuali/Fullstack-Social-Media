const express = require('express');
const router = express.Router();
const { Posts, Likes } = require('../models'); // instance of the tables: Posts, Likes
const { validateToken } = require("../middleware/AuthMiddleware");

router.get('/', validateToken, async (req, res) => {
    //const listOfPosts = await Posts.findAll();// SELECT * FROM `posts`

    /*
        Join `Posts` and `Likes` using Sequelize:
        What the include: does is something similar to this query:
        SELECT id, title, postText, username, createdAt, updatedAt, COUNT(*) as Likes
        FROM Posts JOIN Likes on Posts.id = Likes.PostId
        GROUP BY Posts.id
    */
    const listOfPosts = await Posts.findAll({
        include: [Likes] // join Posts, Likes on Posts.id = Likes.PostId 
    });

    // Get the posts which is liked by the currently logged in user
    const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });

    res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
});

// ==== Get a post by its id (by the postID) =====
router.get('/byId/:id', async (req, res) => {
    const id = req.params.id; // get the id from the url param
    const post = await Posts.findByPk(id); // findByPrimaryKey

    // if there's a post whose id = the passed parameter id, then the returned response will be the post object (record) from the database, otherwise, the response will be null.
    res.json(post);
});

// ==== Get a post by its userID  =====
router.get('/byUserId/:id', async (req, res) => {
    const userId = req.params.id; // get the id from the url param
    const listOfUserPosts = await Posts.findAll({
        where: {
            UserId: userId,
        },
        include: [Likes] // join Posts, Likes on Posts.id = Likes.PostId 
    });


    // if there's a post whose id = the passed parameter id, then the returned response will be the post object (record) from the database, otherwise, the response will be null.
    res.json(listOfUserPosts);
});


router.post('/', validateToken, async (req, res) => {
    const post = req.body; // title, postText, username 
    post.username = req.user.username;
    post.UserId = req.user.id;
    await Posts.create(post); // INSERT INTO posts (title, postText, username, UserId) VALUES(...)
    // wait for the data to be inserted before moving forward with the request or anything else.

    res.json(post);
});

router.put('/title', validateToken, async (req, res) => {
    // Edit the post title
    const { newTitle, postId } = req.body;
    // UPDATE `Ppsts` SET `title` = newTitle WHERE `id` = postId
    const updatedPost = await Posts.update({ title: newTitle }, { where: { id: postId } });
    res.json("Post's title updated: " + newTitle);
});

router.put('/body', validateToken, async (req, res) => {
    // Edit the post body
    const { newBody, postId } = req.body;
    // UPDATE `Ppsts` SET `postText` = newBody WHERE `id` = postId
    const updatedPost = await Posts.update({ postText: newBody }, { where: { id: postId } });
    res.json("Post's body updated: " + newBody);

});

router.delete('/:postId', validateToken, async (req, res) => {
    const postId = req.params.postId;

    const deletedPost = await Posts.destroy({
        where: {
            id: postId
        }
    });
    // If the post exists and was deleted, the .destroy() will return 1,
    // otherwise if the post whth id: postId doesn't exits, it will return 0

    res.json({ deletedPost });
});


module.exports = router;