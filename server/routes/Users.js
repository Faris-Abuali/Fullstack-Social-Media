const express = require('express');
const router = express.Router();
const { Users } = require('../models'); // instance of the model: Users
const bcrypt = require('bcrypt'); // to hash the password
const { sign } = require('jsonwebtoken');
// Our middleware function:
const { validateToken } = require('../middleware/AuthMiddleware');

router.get('/', async (req, res) => {
    res.send('Hello');
});

router.post('/', async (req, res) => {
    // This route is for registration
    const { username, password } = req.body;

    // ========= Check if username is taken ==============
    // SELECT * FROM `Users` WHERE username = `username`
    const user = await Users.findOne({
        where: {
            username: username
        }
    });
    if (user) {
        res.json({
            'error': 'Username already Taken',
        });
    }
    else {

        bcrypt.hash(password, 10).then((hashed) => {
            // 'hashed' is the returned hashed value of the password
            // INSTERT INTO `Users`(username, password) VALUES(username, hashed)
            let obj = {
                username: username,
                password: hashed
            };
            Users.create(obj); // INSERT INTO  `users` (username, password) VALUES(username, password)
            res.json({
                'message': 'Success. User Created',
                obj
            });
        });
    }

});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("Username = " + username);
    // SELECT * FROM `Users` WHERE username = `username`
    const user = await Users.findOne({
        where: {
            username: username
        }
    });

    if (!user) { res.json({ error: 'User doesn\'t exist' }) }

    // Now if we reach here, then the user exist:
    // Compare the password entered by user when login, with the password stored in his record in the database table Users:
    bcrypt.compare(password, user.password)
        .then((match) => {
            if (!match) res.json({ error: 'Wrong Password' });

            //  ===== GENERATE TOKEN ===========
            // sign(payload, secretString)
            const accessToken = sign(
                { username: user.username, id: user.id }, // this is calles payload obj
                "FaresSecret"
            );
            //accessToken now is a string

            // return the token to the front-end in order to use it for session storage:
            res.json({ token: accessToken, username: username, id: user.id });
        });
});

router.get('/auth', validateToken, async (req, res) => {
    // Get info regarding wheter the user is authenticated or not
    console.log(req.user); // this req.user is the result of verify(accessToken, "FaresSecret")from the middleware
    res.json(req.user);
});

router.get('/basicInfo/:userId', async (req, res) => {
    const userId = req.params.userId;

    // Get all attributes of this user except his password:
    const basicInfo = await Users.findByPk(userId, {
        attributes: {
            exclude: ["password"]
        }
    });

    res.json(basicInfo);
});
router.put('/fares', async (req, res) => {
    res.json("Fares");
})
router.put('/change-password', validateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    // SELECT * FROM `Users` WHERE username = `username`
    const user = await Users.findOne({
        where: {
            username: req.user.username //req.user is got from the middleware function
        }
    });

    // Give me the entered oldPassword, I will hash it and see if it matches your old password which is stored in the database:
    bcrypt.compare(oldPassword, user.password).then((match) => {

        if (!match) {
            res.json({ error: 'Wrong Password. Please enter your current password correctly in order to accept the changes' });
        }
        else {
            // Now we will change the password to the new one, but first, we need to hash the new password before storing it in the database:

            bcrypt.hash(newPassword, 10).then((hashed) => {
                // 'hashed' is the returned hashed value of the password

                // UPDATE `Users` SET `password`=newPassword WHERE `username`=req.user.username
                Users.update(
                    { password: hashed },
                    { where: { username: req.user.username } }
                );
                res.json("SUCCESS! Password Changed");
            });


        }
    });
});

module.exports = router;