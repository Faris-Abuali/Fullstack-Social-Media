import React from 'react'
import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
//in react-router-dom V6 useHistory() is replaced by useNavigate()
import convertDate from '../helpers/DateUTC';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
const config = require('../config/config.json');
let API_URL;
if (process.env.NODE_ENV === 'development') {
    API_URL = config.development.API_URL;
} else {
    API_URL = config.production.API_URL;
}


function Home() {

    const { authState } = useContext(AuthContext);

    const [listOfPosts, setListOfPosts] = useState([]);
    const [listOfLikedPostsIDs, setListOfLikedPostsIDs] = useState([]);

    const navigate = useNavigate();


    useEffect(() => {

        if (!localStorage.getItem("accessToken")) {
            // then the user is not logged in. SO redirect the user to login page
            navigate('/login')
        }
        else {
            // then the user is logged in
            // Get list of all posts
            axios.get(`${API_URL}/posts`,
                {
                    headers: {
                        accessToken: localStorage.getItem('accessToken')
                    }
                })
                .then((response) => {
                    if (response.data.error) {
                        alert('Invalid Token, please log in');
                        navigate('/login')
                    }
                    else {
                        // console.log(response.data.listOfPosts);
                        setListOfPosts(response.data.listOfPosts);

                        // Return only the IDs of the liked posts:
                        setListOfLikedPostsIDs(
                            response.data.likedPosts.map((like) => {
                                return like.PostId
                            })
                        )
                    }
                });
        }


        // Get list of Liked Posts' IDs (Posts liked by the currently logged in user)
        // axios.get(`${process.env.REACT_APP_API_URL}likes/likedPosts`,
        //     {
        //         // Pass the accessToken of the logged in user whom we want to get his liked posts
        //         headers: {
        //             accessToken: localStorage.getItem('accessToken')
        //         }
        //     })
        //     .then((response) => {
        //         console.log(response.data);
        //         if (response.data.error) {
        //             setListOfLikedPostsIDs([]);
        //         }
        //         else {
        //             setListOfLikedPostsIDs(response.data);
        //         }
        //         //console.log(response.data);
        //     });
    }, []);



    const likeAPost = (postId, event) => {

        axios
            .post(`${API_URL}/likes`,
                {
                    PostId: postId
                },
                {
                    headers: {
                        accessToken: localStorage.getItem('accessToken')
                    }
                })
            .then((response) => {

                // First of all, check that the user who clicked on the like button is logged in:
                if (!response.data.error) {
                    console.log(response.data.action);
                    console.log(response.data.insertedLike);

                    let action = response.data.action; // action is either LIKE, or UNLIKE
                    let insertedLike = response.data.insertedLike; // the record that either was added or removed from the `Likes` table

                    setListOfPosts(
                        listOfPosts.map((post) => {
                            if (post.id === postId) {
                                if (action === 'LIKE') {
                                    // then add the insertedLike to the Likes array of this post
                                    post.Likes.push(insertedLike);
                                }
                                else {
                                    // then the user's action was UNLIKE, so remove the user's like from the Likes array of this post:
                                    post.Likes = post.Likes.filter((value) => value.UserId !== insertedLike.UserId);
                                }
                            }
                            return post;
                        })
                    )

                    // === Now update the list of Liked Posts' IDs ======
                    if (action === 'LIKE') {
                        // then add the newly liked post's id to the list of the user's liked posts's ids
                        setListOfLikedPostsIDs(
                            [...listOfLikedPostsIDs, insertedLike.PostId]
                        )
                    }
                    else {
                        // then remove the newly unliked post's id from the list of the user's liked posts' ids
                        setListOfLikedPostsIDs(
                            listOfLikedPostsIDs.filter((postId) => postId !== insertedLike.PostId)
                        )
                    }
                }
                else {
                    // then the user is not logged in, so he cannot like a post
                    alert('Please Log in to like this post');
                }
            }); // end then
    };

    return (
        <div>
            {
                listOfPosts.map((value, index) => {
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
                                <Link to={`/profile/${value.UserId}`} className='link-to-username'>
                                    <div>{value.username}</div>
                                </Link>
                                <div>{convertDate(value.createdAt)}</div>
                            </div>
                            <div className='actions'>
                                <div
                                    className='material-btn-like'
                                    onClick={(event) => {
                                        likeAPost(value.id, event);
                                    }}
                                >
                                    {
                                        listOfLikedPostsIDs.includes(value.id) ? (
                                            <>
                                                <ThumbUpAltIcon />
                                                Unlike
                                            </>) : (
                                            <>
                                                <ThumbUpAltOutlinedIcon />
                                                Like
                                            </>)
                                    }
                                </div>

                                {/* <button
                                    className='btn-like'
                                    onClick={(event) => {
                                        //event.target.classList.toggle('fas');
                                        likeAPost(value.id, event)
                                    }}
                                >
                                    {
                                        listOfLikedPostsIDs.includes(value.id) ? (
                                            <>
                                                <i className="fas fa-thumbs-up"></i>  Unlike
                                            </>
                                        ) : (
                                            <>
                                                <i className="far fa-thumbs-up"></i>  Like
                                            </>
                                        )
                                    }
                                </button> */}
                                <label>{value.Likes.length}</label>
                            </div>
                        </div>
                    )
                })
            }
        </div >
    )
}

export default Home
