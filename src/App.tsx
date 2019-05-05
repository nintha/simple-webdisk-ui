import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import MainLayout from './component/MainLayout';
import LoginPage from './component/LoginPage';

const App: React.FC = () => {


  return (
    <div className="App">
      <Router>
        <Switch>
          <Route exact path="/" component={LoginPage} />
          <Route path="/main" component={MainLayout} />
        </Switch>
      </Router>
    </div>
  );
}

export default App;
