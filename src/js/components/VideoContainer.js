import React, { Component } from 'react';
import PropTypes from 'prop-types';
import YouTube from 'react-youtube';
import Fullscreen from 'react-fullscreen-crossbrowser';

import VideoOverlay from './VideoOverlay';
import renderApp from './renderApp';
import OpeningProvider from './OpeningProvider';
import connectContext from './connectContext';
import LoadingLayer from './LoadingLayer';
import ConfigurationsContext from './ConfigurationsContext';
// import PlayVideoButton from './PlayVideoButton';

class VideoContainer extends Component {
  static propTypes = {
    fullscreen: PropTypes.bool,
    onChangeFullscreen: PropTypes.func,
    configurations: PropTypes.object,
    opening: PropTypes.object,
  }

  static defaultProps = {
    fullscreen: false,
    configurations: {
      texts: [],
    },
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { openingLoaded } = prevState;
    const { opening } = nextProps;

    if (!openingLoaded && opening) {
      const nextState = {
        openingLoaded: true,
      };
      return nextState;
    }

    return null;
  }

  constructor() {
    super();

    this.state = {
      videoReady: false,
      openingLoaded: false,
      videoPlaying: false,
      videoStarted: false,
    };

    this.youtubePlayer = React.createRef();
  }

  componentDidMount() {
    if (!this.props.configurations.overlay) {
      renderApp();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const wasVideoReady = prevState.videoReady && prevState.openingLoaded;
    const isNowVideoReady = this.state.videoReady && this.state.openingLoaded;

    if (!wasVideoReady && isNowVideoReady) {
      this.youtubePlayer.current.internalPlayer.playVideo();
    }
  }

  _onVideoStartPlay = () => {
    this.setState({
      videoPlaying: true,
      videoStarted: true,
    });

    // this.youtubePlayer.current.internalPlayer.setPlaybackRate(0.25);
  }

  _onVideoStateChange = (event) => {
    const state = event.data;
    const isBuffering = YouTube.PlayerState.BUFFERING === state;
    const isPaused = YouTube.PlayerState.PAUSED === state;

    if (isBuffering || isPaused) {
      this.setState({
        videoPlaying: false,
      });
    }
  }

  _onVideoReady = () => {
    this.setState({
      videoReady: true,
    });
  }

  // _handleClickPlay = () => {
  //   this.youtubePlayer.current.internalPlayer.playVideo();
  //   this.setState({
  //     startPlay: true,
  //   });
  // };

  render() {
    const opts = {
      width: '100%',
      height: '100%',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        enablejsapi: 1,
        fs: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
    };

    const { configurations, opening } = this.props;

    const {
      videoPlaying,
      videoReady,
      videoStarted,
      openingLoaded,
    } = this.state;

    const isLoading = !openingLoaded || !videoReady || !videoStarted;

    return (
      <div className="video-container">
        <Fullscreen
          enabled={this.props.fullscreen}
          onChange={this.props.onChangeFullscreen}
        >
          <YouTube
            className="youtube-player"
            videoId="XQhl3Hgu_TU"
            // videoId="elkHuRROPfk"
            onPlay={this._onVideoStartPlay}
            onStateChange={this._onVideoStateChange}
            onReady={this._onVideoReady}
            opts={opts}
            ref={this.youtubePlayer}
          />

          {!!opening &&
            <VideoOverlay
              configurations={configurations}
              playing={videoPlaying}
              playStart={videoStarted}
            />
          }
          {/* <LoadingLayer isLoading={!opening} /> */}
          <LoadingLayer isLoading={isLoading} />
          {/* {!!opening && !startPlay &&
            <PlayVideoButton onClick={this._handleClickPlay} />
          } */}
        </Fullscreen>
      </div>
    );
  }
}

const mapConfigurationsToProps = context => ({
  configurations: context,
});

const mapOpeningProviderToProps = context => ({
  opening: context.opening,
});


const connectConfigurations = connectContext(ConfigurationsContext, mapConfigurationsToProps);
const connectOpeningProvider = connectContext(OpeningProvider, mapOpeningProviderToProps);

export default connectConfigurations(connectOpeningProvider(VideoContainer));
