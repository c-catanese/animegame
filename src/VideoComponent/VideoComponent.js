import React, { forwardRef } from 'react';
import styles from './VideoComponent.module.scss'; // Assuming you have styles

const VideoComponent = forwardRef(({ isPlaying, onTogglePlay, onRestartVideo, answerVideo, height, width, controls }, ref) => {
  return (
    <div className={styles.videoContainer}>
      <video
        className={styles.videoPlayer}
        src={answerVideo}
        ref={ref}
        autoPlay={false}
        loop
        controls={controls}
        width={width}
        height={height}
      >
      </video>
    </div>
  );
})

export default VideoComponent;