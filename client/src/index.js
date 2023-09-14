import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import Login from './components/login';

const root = ReactDOM.createRoot(document.getElementById('root'));


const RootEl = () => {
  const [username, setUsername] = useState('');
  return (
    <Router>
    <Routes>
      <Route path='/' element={<Login setUsername={setUsername} />} />
      <Route path='/chat' element={<App username={username}/>} />
    </Routes>
  </Router>
  )
}

root.render(
  <React.StrictMode>
    <RootEl />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
