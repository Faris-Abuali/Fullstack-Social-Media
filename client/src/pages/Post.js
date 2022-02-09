import React from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../helpers/AuthContext';
import convertDate from '../helpers/DateUTC'
const config = require('../config/config.json');
let API_URL;
if (process.env.NODE_ENV === 'development') {
    API_URL = config.development.API_URL;
} else {
    API_URL = config.production.API_URL;
}


function Post() {
    const { authState } = useContext(AuthContext);

    let { id } = useParams(); // postId
    const [postObject, setPostObject] = useState({});
    const [comments, setComments] = useState([]); // keep list of all comments to this post
    const [newComment, setNewComment] = useState(''); // keep the new comment the user may add 

    const navigate = useNavigate();

    useEffect(async () => {
        let postNotFound = false;

        // Get the post whose id is: id
        await axios.get(`${API_URL}/posts/byId/${id}`)
            .then((response) => {
                // console.log(response.data);
                if (response.data === null) {
                    postNotFound = true;
                    //navigate('/PageNotFound');
                }
                else {
                    setPostObject(response.data);
                }
            });

        // Now another get request to get all comments that follow this post whose id is: id
        await axios.get(`${API_URL}/comments/${id}`)
            .then((response) => {
                // console.log(response.data);
                setComments(response.data);
            });


        if (postNotFound) {
            // No such post with the passed PostId param exists in the database
            navigate('/PageNotFound');
        }
    }, []);



    const addComment = () => {

        if (newComment === '') {
            alert('Please write your comment first');
            return;
        }
        // axios.post(url, dataObject, configObject)
        axios
            .post(`${API_URL}/comments`,
                {
                    commentBody: newComment,
                    PostId: id,
                },
                {
                    headers: {
                        //accessToken: sessionStorage.getItem('accessToken')
                        accessToken: localStorage.getItem('accessToken')
                    }
                }
            )
            .then((response) => {
                // If user is not logged in, or the token is not valid, the middleware function will return an error 
                if (response.data.error) {
                    // console.log(response.data.error);
                    // alert(`Not Allowed to Comment: 
                    // - Either you are not logged in,
                    // - or WRONG TOKEN`);
                    navigate('/login');
                }
                else {
                    console.log(response.data)
                    // add the comment 
                    // Now update the state listOfComments:
                    const commentToAdd = response.data;
                    // remember that the middleware decoded the accessToken and extracted the
                    // username of the user who is currently logged in and who commented.
                    // So the returned response will be the object which was added to the
                    // database, whose attributes are: commentBody, PostId, username

                    setComments([...comments, commentToAdd]); // update listOfComments
                    // This setComments will automatically re-renders the page.
                }

                // Now Clear the Input Field:
                setNewComment('');
                //alert('You Added New Comment');
                //navigate('/'); // return to homepage
            });
    };

    const deleteComment = (id) => {
        axios
            .delete(`${API_URL}/comments/${id}`, {
                headers: {
                    //accessToken: sessionStorage.getItem('accessToken')
                    accessToken: localStorage.getItem('accessToken')
                }
            })
            .then((response) => {
                //console.log(response.data);
                //filter method returns only the comments whose id != the passed id
                //So it will return array of all the comments except the deleted one:
                setComments(comments.filter((value) => value.id !== id))
            })
    };

    const deletePost = (postId) => {

        const deletionConfirmed =
            window.confirm('Are you sure you want to delete this post?');

        console.log(deletionConfirmed);
        if (deletionConfirmed) {
            axios.
                delete(`${API_URL}/posts/${postId}`, {
                    headers: {
                        //accessToken: sessionStorage.getItem('accessToken')
                        accessToken: localStorage.getItem('accessToken')
                    }
                })
                .then((response) => {
                    console.log(response.data.deletePost);
                    alert('Post has been deleted');
                    navigate('/');
                });
        }
    };

    const editPost = (option) => {
        let toBeEdited, newTitle, newPostBody;

        if (option === 'title') {
            newTitle = window.prompt("Enter New Title");
            toBeEdited = 'Title';
        }
        else {
            //option = body
            newPostBody = window.prompt("Edit the Post Body");
            toBeEdited = 'Body';
        }
        console.log(newTitle);

        if (
            (toBeEdited === 'Title' && newTitle !== null && newTitle !== '') ||
            (toBeEdited === 'Body' && newPostBody !== null && newPostBody !== '')
        ) {
            let endpoint = toBeEdited.toLowerCase();
            axios.put(`${API_URL}/posts/${endpoint}`,
                {
                    [`new${toBeEdited}`]: toBeEdited === 'Title' ? newTitle : newPostBody,
                    postId: id
                },
                {
                    headers: {
                        accessToken: localStorage.getItem('accessToken')
                    }
                });

            // ==== Now Update the UI (Rerender) =====
            if (toBeEdited === 'Title') {
                setPostObject({ ...postObject, title: newTitle })
            }
            else {
                //toBeEdited === 'Body'
                setPostObject({ ...postObject, postText: newPostBody })
            }
        }
    };

    return (
        <div className='postPage' >
            <div className='leftSide'>
                <div className='post' id='individual'>
                    <div className='title'
                        onClick={() => {
                            if (authState.username === postObject.username) {
                                editPost('title');
                            }
                        }}
                        title={authState.username === postObject.username
                            ? "Click to edit the post's title" : ""}
                    >
                        {postObject.title}
                    </div>
                    <div className='body'
                        onClick={() => {
                            if (authState.username === postObject.username) {
                                editPost('body');
                            }
                        }}
                        title={authState.username === postObject.username
                            ? "Click to edit the post's body" : ""}
                    >
                        {postObject.postText}
                    </div>
                    <div className='footer'>{postObject.username}</div>
                    <div className='options'>
                        {
                            authState.username === postObject.username && (
                                <button
                                    onClick={() => {
                                        deletePost(postObject.id);
                                    }}
                                >
                                    Delete Post
                                </button>
                            )

                        }
                    </div>
                </div>
            </div>
            <div className='rightSide'>
                <div className='addCommentContainer'>
                    <input
                        type='text'
                        placeholder='Comment Here...'
                        onChange={(event) => setNewComment(event.target.value)}
                        value={newComment}
                    />
                    <button onClick={addComment}>Add Comment</button>
                </div>
                <div className='listOfComments'>
                    {
                        comments.map((comment, key) => {
                            return (
                                <div className='comment' key={key}>
                                    <div className='username'>
                                        {comment.username}
                                    </div>
                                    {comment.commentBody}
                                    <div className='created-at'>createdAt: {convertDate(comment.createdAt)}</div>
                                    <div className='options'>
                                        {
                                            (authState.username.toLowerCase()) === (comment.username.toLowerCase())
                                            &&
                                            (
                                                <button
                                                    onClick={() => {
                                                        deleteComment(comment.id)
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div >
    )
}

export default Post
