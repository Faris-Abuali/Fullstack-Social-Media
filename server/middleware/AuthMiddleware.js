const { verify } = require('jsonwebtoken');
// Middleware is just a function that runs before a request and checks if you will continue with request or cancel.

// Grab the token that will be sent from front-end, and validate by using JWT verify() to see if the sent token is valid, if valid, then we will continue with the request and add the comment to the database. Otherwise, we will return error message and cancel the request.

const validateToken = (req, res, next) => {
    // 'next' is a function that you call when you want your request to go forward to its final destincation which is usually the controller (ex: Comments.js)
    const accessToken = req.header("accessToken");
    // Check if a user is trying to add a comment without being logged in
    if (!accessToken) {
        console.log('User not logged in');
        return res.json({ error: 'User not logged in' });
    }

    try {
        // Verify the accessToken received from the request's header
        // Verify it using the SAME secret key which you previously used to generate the token:
        const validToken = verify(accessToken, 'FaresSecret');
        // Now the const 'validToken' is our decoded token payload (username, id)

        // === Here in the middleware function, I can create request variables, such as req.user that will be accessible from any request which we pass the middleware with.
        req.user = validToken; // this will be accessed by all routes that call the validateToken() middleware function
        if (validToken) {
            // move forward with the request
            return next(); // will allow the request to pass to the controller (Comments.js route for example)
        }
        // else {
        //     console.log('Token not valid');
        //     return res.json({ error: 'Token not valid' });
        // }
    }
    catch (err) {
        return res.json({ error: err });
    }
};

// Now export our middleware function:
module.exports = { validateToken };