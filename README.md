# Movies

Movies app react-native with a Mongodb and nodejs [backend](https://github.com/clint-gitahi/filmbackend).

## Demo
![](https://github.com/clint-gitahi/Movies/blob/master/imgs/Screenshot%20from%202017-05-16%2021-32-44.png)
![](https://github.com/clint-gitahi/Movies/blob/master/imgs/vidd.gif)



## Fetching Data With Redux
```js
import { Platform } from 'react-native';

const API = Platform.OS === 'android' ? 'http://10.0.2.2:3000/v1' : 'http://localhost:3000/v1';

export const apiMiddleware = store => next => action => {
  // Pass all actions through by default
  next(action);
  switch (action.type) {
    // In case we receive an action to send an API request
    case 'GET_MOVIE_DATA':
      // Dispatch GET_MOVIE_DATA_LOADING to update loading state
      store.dispatch({ type: 'GET_MOVIE_DATA_LOADING' });
      // Make API call and dispatch appropriate actions when done
      fetch(`${API}/movies.json`)
        .then(response => response.json())
        .then(data => next({
          type: 'GET_MOVIE_DATA_RECEIVED',
          data
        }))
        .catch(error => next({
          type: 'GET_MOVIE_DATA_ERROR',
          error
        }));
      break;
    // Do nothing if the action does not interest us
    default:
      break;
  }
};

export const reducer = (state = { movies: [], loading: true }, action) => {
  switch (action.type) {
    case 'GET_MOVIE_DATA_LOADING':
      return {
        ...state,                     // keep the existing state,
        loading: true,                // loading to true
      };
    case 'GET_MOVIE_DATA_RECEIVED':
      return {
        loading: false,                // set loading to false
        movies: action.data.movies,    // update movies array.
      };
    case 'GET_MOVIE_DATA_ERROR':
      return state;
    default:
      return state;
  }
};
```


