import React, {Fragment} from 'react';
import './App.css';

//components


import ListHomicides from './components/ListHomicides';
import InputHomicide from './components/InputHomicide';


function App() {
  return (
    <Fragment>
      <div className='container'>
        <InputHomicide/>
        <ListHomicides/>
        </div>

    </Fragment>
  );
}

export default App;
