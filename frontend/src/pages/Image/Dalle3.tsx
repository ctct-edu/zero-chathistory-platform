import styles from './Chat.module.css'
import { useRef, useState, useEffect, useContext, useLayoutEffect } from 'react'
import { CommandBarButton, IconButton, Dialog, DialogType, Stack } from '@fluentui/react'
import { SquareRegular, ShieldLockRegular, ErrorCircleRegular } from '@fluentui/react-icons'

import ctctlogo from "../../assets/logo.png";
import { AppStateContext } from '../../state/AppProvider'

const Dalle3 = () => {
  const [showAuthMessage, setShowAuthMessage] = useState<boolean | undefined>()
  const [keyword, setKeyWord] = useState<string>("")
  const onChangedKeyword = (event:React.ChangeEvent<HTMLInputElement>) => setKeyWord(event.target.value)
  const appStateContext = useContext(AppStateContext)
  const ui = appStateContext?.state.frontendSettings?.ui

  const [count, setCount] = useState(0);
  const [apiKey, setApiKey] = useState<string>(ui?.dalle_apikey ?? "");
  const [images, setImages] = useState<string[]>([]);
  const [imgSrc, setImgSrc] = useState('/static/loading.png');
  

  const createImage = async (event:React.FormEvent<HTMLFormElement>) => {
    // Loading用画像追加
    try {
        // API実行
        if (keyword.trim() === "") {
          return true;
        }

        // formのイベント解除（送信されないように）
        event.preventDefault();

        setImages([...images, '/static/loading.png']);

        const response = await fetch(
          ui?.dalle_url ?? "",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "API-key": apiKey
                },
                body: JSON.stringify({
                    "prompt": keyword,
                    "n": 1,
                    "size": "1024x1024",
                    "style": "vivid",
                    "quality": "standard"
                })
            }
        );

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // 成功時の処理
        const newImages = [...images];
        newImages[count] = data.data[0]["url"];
        setImages(newImages);
        setCount(count + 1);

        return false;

    } catch (error) {
        // error時の処理は後回し
        console.error(error);
    }
    return false;

};


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
              <form action="#" method="POST" onSubmit={createImage}>
                <input id="prompt" type="text" className="dalleKeyword dalleText" name="prompt" placeholder="作成するイメージを説明します。例: &quot;シアトルの地平線の水彩画&quot;" 
                    value={keyword} onChange={onChangedKeyword} required />
                <button id="createImg" type="submit" value="画像生成" className="createButton" >画像生成</button>
              </form>
	            <div id="dispImg">
              {images.map((images, index) => (
                <img key={index} src={images} className={images === '/static/loading.png' ? 'imgStyle loadAnime' : 'imgStyle'} />
            ))}
              </div>


            </Stack>
            
          </div>
        </Stack>
      )}
    </div>
  )
}

export default Dalle3
