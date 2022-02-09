import React from 'react'
import { Link } from 'react-router-dom';


function PageNotFound() {
    return (
        <>
            <h1>Page Not Found :/</h1>
            <h3>Redirect to Homepage: <Link to='/'>Homepage</Link></h3>
        </>
    )
}

export default PageNotFound
