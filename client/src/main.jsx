import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Fight from "./components/fight.jsx"
import Header from './components/header.jsx'
import Sesion from './components/sesion.jsx'

import { createBrowserRouter, RouterProvider} from "react-router-dom"

import { MyProvider } from './components/variablesGlobal.jsx'













const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        
        <Header />
        <App />
      </>
      
    ),
  },
  {
    path: "/login",
    element: <Sesion />
  },
  {
    path: "/rooms/*",
    element: 
    <>
        <Header />
        <Fight />
    </>
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MyProvider>
      <RouterProvider router={router} />
    </MyProvider>
  </StrictMode>,
);

/*
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
*/
