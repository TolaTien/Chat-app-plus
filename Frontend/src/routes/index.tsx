import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgetPW from "../pages/ForgetPW";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import { Navigate } from "react-router-dom";
export const getRoutes = (authUser:unknown) => [
{
 path:"/login",
 element: !authUser
   ? <Login/>
   : <Navigate to="/home" replace />
},

{
 path:"/register",
 element: !authUser
   ? <Register/>
   : <Navigate to="/home" replace />
},

{
 path:"/forget-password",
 element:<ForgetPW/>
},

{
 path:"/home",
 element: authUser
   ? <Home/>
   : <Navigate to="/login" replace />
},

{
 path:"/profile",
 element: authUser
   ? <Profile/>
   : <Navigate to="/login" replace />
},

{
 path:"/",
 element:(
   <Navigate
    to={authUser ? "/home" : "/login"}
    replace
   />
 )
}
];