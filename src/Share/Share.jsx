import React from 'react';
import styles from "./Share.module.scss"

function Share({status}){


  return (
    <div className={styles.blurBackground}>
      <div className={styles.container}>
        {status && <p>Your score has been copied to your clipboard!</p>}
        {!status && <p>There was an error copying your score. Try again.</p>}
      </div>
    </div>
  )
}

export default Share