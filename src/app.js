import React, { Component } from 'react';
import {
  Navigator,
} from 'react-native';
import Movies from './Movies';
import Confirmation from './Confirmation';

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
      <Navigator
        initialRoute={{ name: 'movies' }}
        configureScene={(route, routeStack) => Navigator.SceneConfigs.FloatFromBottom}
        renderScene={RouteMapper}
      />
    );
  }
}
