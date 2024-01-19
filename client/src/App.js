import React, { Fragment } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './output.css'; // Ensure Tailwind CSS is properly imported
import NavBarComp from './components/NavBarComp';

function App() {
  return (
    <Fragment>
      <NavBarComp />
    </Fragment>
  );
}

export default App;
