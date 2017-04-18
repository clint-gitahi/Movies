import React, { Component, PropTypes } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
  LayoutAnimation,
  PanResponder,
  TouchableHighlight,
} from 'react-native';
import { defaultStyles } from './styles';
import Options from './Options';

const { width, height } = Dimensions.get('window');

const defaultHeight = height * 0.67; // setting default height to 67% of the screeen height.

export default class MoviePopup extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    movie: PropTypes.object,            // contains title, genre, poster, days and times
    chosenDay: PropTypes.number,        // index of the chosen day
    chosenTime: PropTypes.number,       // index of the chosen show time
    onChooseDay: PropTypes.func,        // called when use choosed time
    onChooseTime: PropTypes.func,       // gets called when user chooses time
    onBook: PropTypes.func,             // called when user books their ticket
    onClose: PropTypes.func             // when popup is closed.
  }

  state = {
    position: new Animated.Value(this.props.isOpen ? 0 : height),
    visible: this.props.isOpen,
    opacity: new Animated.Value(0),
    height: defaultHeight,
    expanded: false,
  };

  componentWillMount() {
    // Initialize PanResponder to handle move gestures
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // ignore taps
        if (dx !== 0 && dy === 0) {
          return true;
        }
        return false;
      },

      onPanResponderGrant: (evt, gestureState) => {
        // store previous height before user changed it
        this._previousHeight = this.state.height;
      },
      onPanResponderMove: (evt, gestureState) => {
        // pull delta and velocity values for y axis from gestureState
        const { dy, vy } = gestureState;

        // Subtract delta y from previous height to get new height
        let newHeight = this._previousHeight - dy;

        // animate height chage so it looks smooth
        LayoutAnimation.easeInEaseOut();

        // switch to expanded mode if popup pulled up above 80% mark
        if (newHeight > height - height / 5) {
          this.setState({ expanded: true });
        } else {
          this.setState({ expanded: false });
        }

        // Expand to full height if pulled up rapidly
        if (vy < -0.75) {
          this.setState({
            expanded: true,
            height
          });
        }

        // Close if pulled down rapidly
        else if (vy > 0.75) {
          this.props.onClose();
        } else if (newHeight < defaultHeight * 0.75) { // Close if pulled below 75% mark of default height
          this.props.onClose();
        }
        // Limit max height to screen height
        else if (newHeight > height) {
          this.setState({ height: height });
        } else {
          this.setState({ height: newHeight });
        }
      },

      onPanResponderTerminationRequest: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dy } = gestureState;
        const newHeight = this._previousHeight - dy;

        // Close if pulled below default height
        if (newHeight < defaultHeight) {
          this.props.onClose();
        }

        // Update previous height
        this._previousHeight = this.state.height;
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      },
    });
  }

  // handles isOpen changes to either open or close popup.
  componentWillReceiveProps(nextProps) {
    // isOpen prop changed to true from false we run the function animateOpen().
    if (!this.props.isOpen && nextProps.isOpen) {
      this.animateOpen();
    }
    // isOpen prop changed to false from true we run animateClose().
    else if (this.props.isOpen && !nextProps.isOpen) {
      this.animateClose();
    }
  }

  // dynamic styles that depend on state
  getStyles = () => {
    return {
      imageContainer: this.state.expanded ? {
        width: width / 2,        // half of screen width
      } : {
        maxWidth: 110,            // limit width
        marginRight: 10,
      },
      movieContianer: this.state.expanded ? {
        flexDirection: 'column',  // arrange image and move infor in a column
        alignItems: 'center',     // and center them
      } : {
        flexDirection: 'row',     // arrange image and movie ifor in a row.
      },
      movieInfo: this.state.expanded ? {
        flex: 0,
        alignItems: 'center',     // center horizontally
        paddingTop: 20,
      } : {
        flex: 1,
        justifyContent: 'center', // center vertically
      },
      title: this.state.expanded ? {
        textAlign: 'center',
      } : {},
    };
  }

  animateOpen() {                               // open popup
    this.setState({ visible: true }, () => {    // Update state first
      Animated.parallel([
        // animate opacity
        Animated.timing(
          this.state.opacity, { toValue: 0.5 }  // Semi-transparent
        ),
        Animated.timing(                          // And slide up
          this.state.position, { toValue: 0 }     // top of the screen
        ),
      ]).start();
    });
  }

  // Close popup
  animateClose() {
    Animated.parallel([
      // Animate opacity
      Animated.timing(
        this.state.opacity, { toValue: 0 } // transparent
      ),
      // Slide down
      Animated.timing(
        this.state.position, { toValue: height } // bottom of the screen
      ),
    ]).start(() => this.setState({
      // Reset to default values
      height: defaultHeight,
      expanded: false,
      visible: false,
    }));
  }

  // When user starts pulling popup previous height gets stored here
  // to help us calculate new height value during and after pulling
  _previousHeight = 0;

  render() {
    const {
      movie,
      chosenDay,
      chosenTime,
      onChooseDay,
      onChooseTime,
      onBook
    } = this.props;
    // Pull out movie data
    const { title, genre, poster, days, times } = movie || {};

    if (!this.state.visible) {                   // render nothing if not visible
      return null;
    }

    return (
      <View style={styles.container}>
      {/* closes the popup if the user taps on Semi-transparent backdrop */}
        <TouchableWithoutFeedback onPress={this.props.onClose}>
          <Animated.View style={[styles.backdrop, { opacity: this.state.opacity }]} />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[styles.modal, {
            // animate height
            height: this.state.height,
            // animates position on the screen
            transform: [{ translateY: this.state.position }, { translateX: 0 }]
          }]}
        >
          {/* content */}
          <View style={styles.content}>
            {/* movie poster title and genre */}
            <View
              style={[styles.movieContainer, this.getStyles().movieContainer]}
              {...this._panResponder.panHandlers}
            >
              {/* Poster */}
              <View style={[styles.imageContainer, this.getStyles().imageContainer]}>
                <Image source={{ uri: poster }} style={styles.image} />
              </View>
              {/* Title and genre */}
              <View style={[styles.movieInfo, this.getStyles().movieInfo]}>
                <Text style={[styles.title, this.getStyles().title]}>{title}</Text>
                <Text style={styles.genre}>{genre}</Text>
              </View>
            </View>

            {/* Showtimes */}
            <View>
              {/* Day */}
              <Text style={styles.sectionHeader}>Day</Text>
              {/* TODO: Add day options here */}
              <Options
                values={days}
                chosen={chosenDay}
                onChoose={onChooseDay}
              />
              {/* Time */}
              <Text style={styles.sectionHeader}>Showtime</Text>
              {/* TODO: Add show time options here */}
              <Options
                values={times}
                chosen={chosenTime}
                onChoose={onChooseTime}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableHighlight
              underlayColor="#9575CD"
              style={styles.buttonContainer}
              onPress={onBook}
            >
              <Text style={styles.button}>Book My Tickets</Text>
            </TouchableHighlight>
          </View>

        </Animated.View>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  // main container
  container: {
    ...StyleSheet.absoluteFillObject,          // fill up all screen
    justifyContent: 'flex-end',                // align popup at at the bottom
    backgroundColor: 'transparent',            // transparent background.
  },
  // Semi-transparent background below popup
  backdrop: {
    ...StyleSheet.absoluteFillObject,          // fill up all screen
    backgroundColor: 'black',
  },
  // popup
  modal: {
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    margin: 20,
    marginBottom: 0,
  },
  // Movie container
  movieContainer: {
    flex: 1,                            // take up all available space
    marginBottom: 20,
  },
  imageContainer: {
    flex: 1,                            // take up all available space
  },
  image: {
    borderRadius: 10,                   // rounded corners
    ...StyleSheet.absoluteFillObject,   // fill up all space in a container
  },
  movieInfo: {
    backgroundColor: 'transparent',     // looks nicier when switching to/from expanded mode
  },
  title: {
    ...defaultStyles.text,
    fontSize: 20,
  },
  genre: {
    ...defaultStyles.text,
    color: '#BBBBBB',
    fontSize: 14,
  },
  sectionHeader: {
    ...defaultStyles.text,
    color: '#AAAAAA',
  },
  // Footer
  footer: {
    padding: 20,
  },
  buttonContainer: {
    backgroundColor: '#673AB7',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  button: {
    ...defaultStyles.text,
    color: '#FFFFFF',
    fontSize: 18,
  },
});
