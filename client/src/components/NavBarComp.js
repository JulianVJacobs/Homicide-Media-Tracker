import React from "react";
import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
import Home from './Home';
import InputHomicide from "./InputHomicide";
import ListHomicides from "./ListHomicides";
// import DataAnalysis from "./DataAnalysis";
import ImportExport from "./ImportExport";
import SearchDatabase from "./SearchDatabase";
import CheckArchive from "./CheckArchive";
import CheckForDuplicates from "./CheckForDuplicates";
import "../output.css"; 
//this is the navbar component, as you can see, the data analysis component has been commented out until it works properly 
const NavBarComp = () => {
  
  return (
    <BrowserRouter>
      <div className="bg-gray-800 text-white">
        <div className="max-w-screen-xl flex items-center justify-between mx-auto p-3">
          <Link to="/Home" className="text-3xl font-bold mr-auto ">
            Homicide Media Tracker
          </Link>
          <div className="hidden md:flex md:space-x-8">
            <Link
              to="/Home"
              className="hover:bg-gray-700 py-2 px-3 text-xl rounded transition duration-300"
            >
              Home
            </Link>
            <Link
              to="/InputHomicide"
              className="hover:bg-gray-700 py-2 px-3 text-xl rounded transition duration-300"
            >
              Add Homicides 
            </Link>
            <Link
              to="/ListHomicides"
              className="hover:bg-gray-700 py-2 px-3  text-xl rounded transition duration-300"
            >
              List Homicides
            </Link>
            <Link
              to="/ImportExport"
              className="hover:bg-gray-700 py-2 px-3  text-xl rounded transition duration-300"
            >
              Import Export 
            </Link>
            {/* <Link
              to="/DataAnalysis"
              className="hover:bg-gray-700 py-2 px-3  text-xl rounded transition duration-300"
            >
              Data Analysis
            </Link> */}
            <Link
              to="/SearchDatabase"
              className="hover:bg-gray-700 py-2 px-3  text-xl rounded transition duration-300"
            >
              Search Database
            </Link>
            <Link
            to= "/CheckArchive"
            className="hover:bg-gray-700 py-2 px-3  text-xl rounded transition duration-300">
            Check Archive Status
            </Link>
            <Link
            to= "/CheckForDuplicates"
            className="hover:bg-gray-700 py-2 px-3  text-xl rounded transition duration-300">
            Check for duplicates
            </Link>
          </div>
        </div>

        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/InputHomicide" element={<InputHomicide />} />
          <Route path="/ListHomicides" element={<ListHomicides />} />
          <Route path="/ImportExport" element={<ImportExport />} />
          {/* <Route path="/DataAnalysis" element={<DataAnalysis />} /> */}
          <Route path="/SearchDatabase" element={<SearchDatabase />} />
          <Route path = "/CheckArchive" element={<CheckArchive/>}/>
          <Route path = "CheckForDuplicates" element={<CheckForDuplicates/>}/>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default NavBarComp;
