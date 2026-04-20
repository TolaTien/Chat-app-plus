import { BrowserRouter, Routes } from "react-router-dom";
import { getRoutes } from "./routes";

export default function App() {

    return (
        <>
         <BrowserRouter>
            <Routes>
                
            </Routes>
         </BrowserRouter>
        </>
    )

}










// import React, { useEffect } from "react";
// import {
//  BrowserRouter,
//  Routes,
//  Route
// } from "react-router-dom";

// import { getRoutes } from "./routes/routes";
// import { useAuthStore } from "./store/useAuthStore";

// import { Toaster } from "react-hot-toast";

// export default function App(){

//  const {
//    checkAuth,
//    isCheckingAuth,
//    authUser
//  } = useAuthStore();

//  useEffect(()=>{
//    checkAuth();
//  },[checkAuth]);

//  if(isCheckingAuth){
//    return <div>Loading...</div>
//  }

//  const routes = getRoutes(authUser);

//  return(
//  <>
//   <BrowserRouter>
//    <Routes>
//     {routes.map((route: any)=>(
//       <Route
//        key={route.path}
//        path={route.path}
//        element={route.element}
//       />
//     ))}
//    </Routes>
//   </BrowserRouter>

//   <Toaster position="top-center"/>
//  </>
//  )
// } 