import React, { Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./output.css"; // Ensure Tailwind CSS is properly imported
import NavBarComp from "./components/NavBarComp";


function App() {
  return (
    <Fragment  >
      <NavBarComp />
    
   <div className="bg-gradient-to-b from-gray-200 to-gray-600 min-h-screen"/>
     
    </Fragment>
  );
}

export default App;
