import React, { Component } from 'react';
import {
  ScrollView,
  View,
  StyleSheet
} from 'react-native';
import MoviePoster from './MoviePoster';
import MoviePopup from './MoviePopup';
import { movies } from './data';

export default class Movies extends Component {
  state = {
    popupIsOpen: false,
    chosenDay: 0,         // day chosen by user, choose first day by default.
    chosenTime: null,     // time chosen by user
  }

  openMovie = (movie) => {
    this.setState({
      popupIsOpen: true,
      movie,
    });
  }

  closeMovie = () => {
    this.setState({
      popupIsOpen: false,
      chosenDay: 0,
      chosenTime: null,
    });
  }

  chooseDay = (day) => {
    this.setState({
      chosenDay: day,
    });
  }

  chooseTime = (time) => {
    this.setState({
      chosenTime: time,
    });
  }

  bookTicket = () => {
    if (!this.state.chosenTime) {         // make sure user selected time
      alert('Please select show time');
    } else {
      this.closeMovie();                  // Close popup
      this.props.navigator.push({         // navigating to confirmation route
        name: 'confirmation',
        code: Math.random().toString(36).substring(6).toUpperCase(), // generate a random string
      });
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
        >
          {movies.map((movie, index) =>
            <MoviePoster movie={movie} onOpen={this.openMovie} key={index} />)
          }
        </ScrollView>

        <MoviePopup
          movie={this.state.movie}
          isOpen={this.state.popupIsOpen}
          onClose={this.closeMovie}
          chosenDay={this.state.chosenDay}
          chosenTime={this.state.chosenTime}
          onChooseDay={this.chooseDay}
          onChooseTime={this.chooseTime}
          onBook={this.bookTicket}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
});
