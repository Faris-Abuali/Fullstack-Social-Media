const express = require('express');
const router = express.Router();
const { Comments } = require('../models'); // instance of the model: Comments
// Our middleware function:
const { validateToken } = require('../middleware/AuthMiddleware');

router.get('/', async (req, res) => {
    const listOfComments = await Comments.findAll();// SELECT * FROM `posts`
    res.json(listOfComments);
});

router.get('/:postId', async (req, res) => {
    try {
        const postId = req.params.postId; // get the id from the url param

        // SELECT * FROM `Comments` WHERE `PostId` = postId
        const comments = await Comments.findAll({
            where: {
                PostId: postId
            }
        }); // findByPrimaryKey

        // if the passed postId doesn't match any posts, then the response is empty array
        res.json(comments);
    }
    catch(err) {
        res.json(err);
    }
   
});

router.post('/', validateToken, async (req, res) => {
    // Now if the next() function is called inside the validateToken() middleware function, then that means the request is sent with a valid token (the user who is trying to comment is logged in), so now it's time to add the comment to the database:
    const comment = req.body; // commentBody, PostId

    // ==== req.user is the decoded payload received from verifying the token in the middleware ===
    const username = req.user.username;
    // Now add the field 'username' to the 'comment' object:
    comment.username = username;
    // Now the 'comment' is an object with the fields: commentBody, username

    const insertedComment = await Comments.create(comment); // INSERT INTO comments (commentBody, PostID, username) VALUES(...)
    // wait for the data to be inserted before moving forward with the request or anything else.

    // IMPORTANT: I really need to return all the inserted row as a response, all the attributes of this row are necessary for the front-end, because if I want to delete a comment immediately after I have added it, I must have its id known in the front-end.
    //Also if I want to display the date (createdAt, updatedAt), now it is possible:
    res.json(insertedComment);
});

router.delete('/:commentId', validateToken, async (req, res) => {
    const commentId = req.params.commentId;

    // DELETE FROM `Comments` Where id = commentId
    await Comments.destroy({
        where: {
            id: commentId
        }
    });

    res.json("Comment Deleted Successfully");
});

module.exports = router;

// Fares Abuali :)