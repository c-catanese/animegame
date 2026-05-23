import React, { forwardRef } from 'react';
import styles from './VideoComponent.module.scss';

const VideoComponent = forwardRef(({ answerVideo, height, width, controls }, ref) => {
  return (
    <div className={styles.videoContainer}>
      <video
        className={styles.videoPlayer}
        src={answerVideo}
        ref={ref}
        autoPlay={false}
        loop
        preload="auto"
        controls={controls}
        width={width}
        height={height}
      />
    </div>
  );
})

export default VideoComponent;
