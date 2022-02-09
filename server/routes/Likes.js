const express = require('express');
const router = express.Router();
const { Likes } = require('../models'); // instance of the model: Likes
// Our middleware function:
const { validateToken } = require('../middleware/AuthMiddleware');

// Count the number of likes on a post


router.post('/', validateToken, async (req, res) => {

    // remember that the middleware validateToken decodes the token and adds the req.user to the req object, which is (req.user) an object itself which has .username and .id, so we already know the UserId of the user who has made the like:
    const UserId = req.user.id; // this is available from the middleware function
    const { PostId } = req.body; // we need also the PostId

    let action; // either 'like' or 'unlike'
    let insertedLike; // here I store the record that either will be added to thetable (if the user didn't like this post before, or will be deleted from the table (if the user did like this post before))

    // Check if this user has already liked this post previously?:
    const found = await Likes.findOne({
        where: {
            UserId: UserId,
            PostId: PostId
        }
    });
    if (!found) {
        // Then the user did not like this post before
        action = 'LIKE';
        insertedLike = await Likes.create({ PostId: PostId, UserId: UserId })
    }
    else {
        // Then this user did like this post before, so what we want to do is to make him UNLIKE the post: (DELETE FROM `Likes` WHERE PostID = PostId and USerId = UserId)
        action = 'UNLIKE'
        insertedLike = found;
        await Likes.destroy({
            where: {
                UserId: UserId,
                PostId: PostId
            }
        })
    }

    res.json({ 'action': action, insertedLike }); // return the inserted record (object) as a response 
});

router.get('/likedPosts', validateToken, async (req, res) => {
    // This endpoint gets a list of posts liked by user whose userId = req.user.id:

    const UserId = req.user.id; // this is available from the middleware function

    // SELECT `PostId` FROM `Likes` WHERE `UserID` = req.user.id
     const likedPosts = await Likes.findAll({
        //attributes: ['PostId'], // Projection
        where: { // Selection
            UserId: UserId
        }
    })

    // make array of numbers (array of Liked Posts IDs)
    let likedPostsIDs = likedPosts.map((post) => post.PostId)

    res.json(likedPostsIDs);
});
module.exports = router;