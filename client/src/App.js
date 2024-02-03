import React, { Fragment } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./output.css"; // Ensure Tailwind CSS is properly imported
import NavBarComp from "./components/NavBarComp";
import icon from "../src/icon.png";

function App() {
  return (
    <Fragment >
      <NavBarComp />
    
      {/* <div className="w-full h-full bg-cover " style={{ backgroundImage: `url(${icon})` }}/>  */}
     
    </Fragment>
  );
}

export default App;
