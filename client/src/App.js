import './App.css';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import Post from './pages/Post';
import Registration from './pages/Registration';
import Login from './pages/Login';
import PageNotFound from './pages/PageNotFound';
import Profile from './pages/Profile';  
import ChangePassword from './pages/ChangePassword';  
import { AuthContext } from './helpers/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
const config = require('./config/config.json');
let API_URL;
if (process.env.NODE_ENV === 'development') {
  API_URL = config.development.API_URL;
} else {
  API_URL = config.production.API_URL;
}

function App() {
  // a boolean state to check if you are logged in or not 
  const [authState, setAuthState] = useState({
    username: '',
    id: 0, // user id
    status: false, // false means the user is not logged in (not authenticated)
  });

  useEffect(() => {
    // console.log(process.env.REACT_APP_API_URL);
    // When the page reloads, check if the accessToken stored in the localStorage is verified or not, if verified, this means the user is logged in, so don't allow the autState to initialize to false.
    axios.
      get(`${API_URL}/auth/auth`,
        {
          // pass the accessToken in the request's header
          headers: {
            //accessToken: sessionStorage.getItem('accessToken')
            accessToken: localStorage.getItem('accessToken')
          }
        }
      )
      .then((response) => {
        if (response.data.error) {
          // the user is not logged in (his accessToken is either null or not valid)
          setAuthState({ ...authState, status: false });
        }
        else {
          console.log(response.data);
          // the user is logged in (his accessToken is verified)
          setAuthState({
            username: response.data.username,
            id: response.data.id,
            status: true, // true means the user is logged in
          });
        }
      })
  }, []);

  const logout = () => {
    // Step#1: remove the accessToken from the localStorage
    localStorage.removeItem('accessToken');
    // Step#2: change the state object (authState)
    setAuthState({
      username: '',
      id: 0,
      status: false, // false means the user is not logged in
    });
    // the user is not logged in anymore
  }

  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <BrowserRouter>
          <div className="navbar">

            {
              !authState.status ? (
                <>
                  <Link to='/login'>Login</Link>
                  <Link to='/registration'>Register</Link>
                </>
              ) : (
                <>
                  <Link to='/'>Homepage</Link>
                  <Link to='/create-post'>Create a Post</Link>
                  <div className="loggedInContainer">
                    <span id='loggedInUsername'>{authState.username}</span>
                    <button id='btn-logout' onClick={logout}> Logout</button>
                  </div>
                </>
              )
            }
            {/* <div className="loggedInContainer">
              <span id='loggedInUsername'>{authState.username}</span>
              {authState.status && <button id='btn-logout' onClick={logout}> Logout</button>}
            </div> */}
          </div>
          <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/create-post" exact element={<CreatePost />} />
            <Route path="/post/:id" exact element={<Post />} />
            <Route path="/login" exact element={<Login />} />
            <Route path="/registration" exact element={<Registration />} />
            <Route path="/profile/:userId" exact element={<Profile />} />
            <Route path="/change-password" exact element={<ChangePassword />} />
            <Route path="*" exact element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
