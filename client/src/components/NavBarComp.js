import React from "react";
import { Routes, Route, Link, BrowserRouter } from "react-router-dom";
import Home from './Home';
import InputHomicide from "./InputHomicide";
import ListHomicides from "./ListHomicides";
import DataAnalysis from "./DataAnalysis";
import ImportExport from "./ImportExport";
import "../output.css"; 

const NavBarComp = () => {
  return (
    <BrowserRouter>
      <div className="bg-gray-800 text-white">
        <div className="max-w-screen-xl flex items-center justify-between mx-auto p-3">
          <Link to="/Home" className="text-3xl font-bold">
            Homicide Tracker
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
            <Link
              to="/DataAnalysis"
              className="hover:bg-gray-700 py-2 px-3  text-xl rounded transition duration-300"
            >
              Data Analysis
            </Link>
          </div>
        </div>

        <Routes>
          <Route path="/Home" element={<Home />} />
          <Route path="/InputHomicide" element={<InputHomicide />} />
          <Route path="/ListHomicides" element={<ListHomicides />} />
          <Route path="/ImportExport" element={<ImportExport />} />
          <Route path="/DataAnalysis" element={<DataAnalysis />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default NavBarComp;
