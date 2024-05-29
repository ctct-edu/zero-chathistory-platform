import styles from './Chat.module.css'
import { useRef, useState, useEffect, useContext, useLayoutEffect } from 'react'
import { CommandBarButton, IconButton, Dialog, DialogType, Stack } from '@fluentui/react'
import { SquareRegular, ShieldLockRegular, ErrorCircleRegular } from '@fluentui/react-icons'

import ctctlogo from "../../assets/logo.png";

const Dalle3 = () => {
  const [showAuthMessage, setShowAuthMessage] = useState<boolean | undefined>()
  const [val, setVal] = useState<string>("")
  const onChangedKey = (event:React.ChangeEvent<HTMLInputElement>) => setVal(event.target.value)
  const [keyword, setKeyWord] = useState<string>("")
  const onChangedKeyword = (event:React.ChangeEvent<HTMLInputElement>) => setKeyWord(event.target.value)
  

  return (
    <div className={styles.container} role="main">
      {showAuthMessage ? (
        <Stack className={styles.chatEmptyState}>
          <ShieldLockRegular
            className={styles.chatIcon}
            style={{ color: 'darkorange', height: '200px', width: '200px' }}
          />
          <h1 className={styles.chatEmptyStateTitle}>Authentication Not Configured</h1>
          <h2 className={styles.chatEmptyStateSubtitle}>
            This app does not have authentication configured. Please add an identity provider by finding your app in the{' '}
            <a href="https://portal.azure.com/" target="_blank">
              Azure Portal
            </a>
            and following{' '}
            <a
              href="https://learn.microsoft.com/en-us/azure/app-service/scenario-secure-app-authentication-app-service#3-configure-authentication-and-authorization"
              target="_blank">
              these instructions
            </a>
            .
          </h2>
          <h2 className={styles.chatEmptyStateSubtitle} style={{ fontSize: '20px' }}>
            <strong>Authentication configuration takes a few minutes to apply. </strong>
          </h2>
          <h2 className={styles.chatEmptyStateSubtitle} style={{ fontSize: '20px' }}>
            <strong>If you deployed in the last 10 minutes, please wait and reload the page after 10 minutes.</strong>
          </h2>
        </Stack>
      ) : (
        <Stack horizontal className={styles.chatRoot}>
          <div className={styles.chatContainer}>
            <Stack className={styles.chatEmptyState}>
              <img src={ctctlogo} className={styles.chatIcon} aria-hidden="true" />
              <h1 className={styles.chatEmptyStateTitle}>Create Image</h1>
              <h2 className={styles.chatEmptyStateSubtitle}></h2>
              <form action="#" method="POST">
                <input type="text" id="apikey" className="dalleApi dalleText" name="apikey" placeholder="API-keyを入力してください"
                    value={val} onChange={onChangedKey} required /><br />
                <input id="prompt" type="text" className="dalleKeyword dalleText" name="prompt" placeholder="作成するイメージを説明します。例: &quot;シアトルの地平線の水彩画&quot;" 
                    value={keyword} onChange={onChangedKeyword} required />
                <button id="createImg" type="submit" value="画像生成" className="createButton" >画像生成</button>
              </form>
	            <div id="dispImg"></div>

            </Stack>
            
          </div>
        </Stack>
      )}
    </div>
  )
}

export default Dalle3
