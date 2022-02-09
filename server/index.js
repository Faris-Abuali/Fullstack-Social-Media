const express = require('express'); // instance of the express framework
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3001;

// Parse JSON
app.use(express.json()); // allow express understand the requests that are in json format 
app.use(cors());
// ===== Database ====
const db = require('./models');
const config = require('./config/config.json');
// Routers
const postRouter = require('./routes/Posts');
app.use('/posts', postRouter);
const commentRouter = require('./routes/Comments');
app.use('/comments', commentRouter);
const userRouter = require('./routes/Users');
app.use('/auth', userRouter);
const likesRouter = require('./routes/Likes');
app.use('/likes', likesRouter);


db.sequelize
    .sync()
    .then(() => {
        app.listen(PORT, (req, res) => {
            console.log(`Server running on port ${PORT}`);
            console.log(`connected to Database: ${config.development.database}`);
        });
    })
    .catch(err => {
        console.log(err);
    });
// The above sequelize method means that before you run the server, go
// to the models folder where we store out tables, and check if all tables
// exist in the db, and if not exist, create them then run the server.
// But how does Node know which database we are adding these tables to?
// Answer: in the config/config.json, we write the database name

