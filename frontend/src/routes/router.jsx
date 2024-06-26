import React from 'react'
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layout/MainLayout'
import Home from '../pages/Home/Home'
import  Instructors  from '../pages/instructors/instructors';
import Classes from '../pages/Classes/Classes';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout/>,
    children: [
        {
            path: '/',
            element: <Home/>
        },
        {
            path: 'Instructor',
            element: <Instructors/>
        },
        {
            path: "classes",
            element: <Classes/>
        }
    ]
}
]);

