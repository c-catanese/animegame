import React from 'react';
import styles from "./LoadingScreen.module.scss"

function LoadingScreen(){
  return (
    <div className={styles.loadingScreen}>
      <img className={styles.loadingLogo} src="/weebleLogo.png" alt="error"/>
      <p>Loading</p>
    </div>
  )
}

export default LoadingScreen