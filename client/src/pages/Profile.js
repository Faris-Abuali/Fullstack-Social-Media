import React from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import convertDate from '../helpers/DateUTC'
import { AuthContext } from '../helpers/AuthContext';
const config = require('../config/config.json');
let API_URL;
if (process.env.NODE_ENV === 'development') {
    API_URL = config.development.API_URL;
} else {
    API_URL = config.production.API_URL;
}


function Profile() {
    const { authState } = useContext(AuthContext);

    let { userId } = useParams(); // userId
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [registrationDate, setRegistrationDate] = useState("");
    const [listOfUserPosts, setListOfUserPosts] = useState([]);

    useEffect(async () => {
        let userIdExists = true;

        console.log('userId = ' + userId);
        // Get the basic info about this user whose id = userId param:
        await axios
            .get(`${API_URL}/auth/basicInfo/${userId}`)
            .then((response) => {
                try {

                    if (response.data !== null) {
                        setUsername(response.data.username);
                        setRegistrationDate(response.data.createdAt);
                    }
                    else {
                        userIdExists = false;
                        console.log('No such user ID');
                    }
                }
                catch (err) {
                    console.log(err);
                }
            });

        // Get all posts from the posts table that were posted by this user whose id = userId param:
        await axios
            .get(`${API_URL}/posts/byUserId/${userId}`)
            .then((response) => {
                try {
                    setListOfUserPosts(response.data);
                }
                catch (err) {
                    console.log(err);
                }
            });


        if (!userIdExists) {
            navigate('/PageNotFound');
        }
    }, []);

    return (
        <div className='ProfilePageContainer'>
            <div className='basicInfo'>
                <h2>{username}'s Info:</h2>
                {authState.username === username && (
                    <button onClick={() => {
                        navigate('/change-password');
                    }}
                    >
                        Change My Password
                    </button>
                )}
                <table className='styled-table'>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Joined At</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{username}</td>
                            <td>{convertDate(registrationDate)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className='listOfPosts'>
                <h2>{username}'s Posts:</h2>
                {
                    listOfUserPosts.map((value, index) => {
                        return (
                            <div className='post'
                                key={value.id}
                            >
                                <div className='title'>{value.title}</div>
                                <div
                                    className='body'
                                    onClick={() => {
                                        navigate(`/post/${value.id}`);
                                    }}
                                >
                                    {value.postText}
                                </div>
                                <div className='footer'>
                                    <div>{value.username}</div>
                                    <div>{convertDate(value.createdAt)}</div>
                                </div>
                                <div className='actions'>
                                    <label>{value.Likes.length} Likes</label>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default Profile
