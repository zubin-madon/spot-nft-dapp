import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {MoralisProvider} from "react-moralis";

ReactDOM.render(
  <MoralisProvider appId={process.env.REACT_APP_MORALIS_APPLICATION_ID} serverUrl={process.env.REACT_APP_MORALIS_SERVER_URL}>
  <App />
</MoralisProvider>,
  document.getElementById('root')
);

reportWebVitals();