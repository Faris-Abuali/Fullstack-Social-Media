import React, { useContext, useEffect } from 'react'
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik'; // form validation
// allow you to create forms without using the HTML <form> tag and validate them easily
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../helpers/AuthContext';
const config = require('../config/config.json');
let API_URL;
if (process.env.NODE_ENV === 'development') {
    API_URL = config.development.API_URL;
} else {
    API_URL = config.production.API_URL;
}



function CreatePost() {

    const { authState } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        // if (!authState.status) {
        //     // then the user is not logged in, so redirect him to the login page
        //     navigate('/login')
        // }
        if (!localStorage.getItem("accessToken")) {
            // then the user is not logged in. So redirect the user to login page
            navigate('/login')
        }
    }, [])

    const initialValues = {
        title: '',
        postText: '',
        // username: ''
    }
    const validationSchema = Yup.object().shape({
        title: Yup.string().required(),
        postText: Yup.string().required(),
        // username: Yup.string().min(3).max(25).required()
    });

    const handleSubmit = (data) => {
        console.log(data); //data attributes are: title, postText

        axios.post(`${API_URL}/posts`,
            data,
            {
                headers: {
                    accessToken: localStorage.getItem('accessToken')
                }
            }
        )
            .then((response) => {
                //console.log(response.data);
                if (response.data.error) {
                    alert("You must be logged in to be able to create a post");
                }
                else {
                    alert('Posted Successfully');
                    navigate('/'); // return to homepage
                }
            });
    };

    return (
        <div className="createPostPage">
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validationSchema={validationSchema}
            >
                <Form className="formContainer">
                    <label>Title: </label>
                    <ErrorMessage name='title' component='span' />
                    <Field
                        id='inputCreatePost'
                        name='title'
                        placeholder='(Ex. Title)'
                    />
                    <label>Post: </label>
                    <ErrorMessage name='postText' component='span' />
                    <Field
                        as='textarea'
                        className='create-post-textarea'
                        name='postText'
                        placeholder='(Ex. Post)'
                    />
                    {/* <label>Username: </label>
                    <ErrorMessage name='username' component='span' />
                    <Field
                        id='inputCreatePost'
                        name='username'
                        placeholder='(Ex. John123)'
                    /> */}
                    <button type='submit'>Create Post</button>
                </Form>
            </Formik>
        </div>
    )
}

export default CreatePost;