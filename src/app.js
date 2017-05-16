import React, { Component } from 'react';
import {
  Navigator,
} from 'react-native';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { apiMiddleware, reducer } from './redux';
import Movies from './Movies';
import Confirmation from './Confirmation';

const store = createStore(reducer, {}, applyMiddleware(apiMiddleware));

// fetch movie data
store.dispatch({ type: 'GET_MOVIE_DATA' });

const RouteMapper = (route, navigator) => {
  if (route.name === 'movies') {
    return <Movies navigator={navigator} />;
  } else if (route.name === 'confirmation') {
    return (
      <Confirmation code={route.code} navigator={navigator} />
    );
  }
};

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Navigator
          initialRoute={{ name: 'movies' }}
          configureScene={(route, routeStack) => Navigator.SceneConfigs.FloatFromBottom}
          renderScene={RouteMapper}
        />
      </Provider>
    );
  }
}
