import styles from './Chat.module.css'
import { useState, useContext } from 'react'
import { Stack } from '@fluentui/react'
import { ShieldLockRegular } from '@fluentui/react-icons'

import ctctlogo from "../../assets/logo.png";
import { AppStateContext } from '../../state/AppProvider'

const ImageGenerator = () => {
  const [showAuthMessage, setShowAuthMessage] = useState<boolean | undefined>()
  const [keyword, setKeyWord] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const onChangedKeyword = (event: React.ChangeEvent<HTMLInputElement>) => setKeyWord(event.target.value)
  const appStateContext = useContext(AppStateContext)
  const ui = appStateContext?.state.frontendSettings?.ui

  const [count, setCount] = useState(0);
  const [apiKey, setApiKey] = useState<string>(ui?.image_gen_apikey ?? "");
  const [images, setImages] = useState<string[]>([]);

  const createImage = async (event: React.FormEvent<HTMLFormElement>) => {
    try {
      // 入力チェック
      if (keyword.trim() === "") {
        return;
      }

      // フォームのデフォルト送信を防ぐ
      event.preventDefault();
      setIsGenerating(true);

      // ローディング画像を追加
      setImages(prevImages => [...prevImages, '/static/loading.png']);

      const response = await fetch(
        ui?.image_gen_url ?? "",
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
            "output_format": "png",
            "quality": "medium"
          })
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Base64データをData URLに変換
      if (data.data && data.data[0] && data.data[0].b64_json) {
        const base64Data = data.data[0].b64_json;
        const outputFormat = data.output_format || 'png';
        const imageDataUrl = `data:image/${outputFormat};base64,${base64Data}`;

        // ローディング画像を生成された画像に置換
        setImages(prevImages => {
          const newImages = [...prevImages];
          newImages[newImages.length - 1] = imageDataUrl;
          return newImages;
        });
        
        setCount(prevCount => prevCount + 1);
      } else {
        throw new Error('Invalid response format: missing image data');
      }

    } catch (error) {
      console.error('Image generation error:', error);
      
      // エラー時はローディング画像を削除
      setImages(prevImages => {
        const newImages = [...prevImages];
        newImages.pop();
        return newImages;
      });
      
      // エラーメッセージを表示（必要に応じて）
      alert(`画像生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsGenerating(false);
    }
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
            <a href="https://portal.azure.com/" target="_blank" rel="noopener noreferrer">
              Azure Portal
            </a>
            and following{' '}
            <a
              href="https://learn.microsoft.com/en-us/azure/app-service/scenario-secure-app-authentication-app-service#3-configure-authentication-and-authorization"
              target="_blank"
              rel="noopener noreferrer">
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
              <img src={ctctlogo} className={styles.chatIcon} aria-hidden="true" alt="" />
              <h1 className={styles.chatEmptyStateTitle}>AI Image Generator</h1>
              <h2 className={styles.chatEmptyStateSubtitle}>AIを使って画像を生成します</h2>
              <form action="#" method="POST" onSubmit={createImage}>
                <input 
                  id="prompt" 
                  type="text" 
                  className="imageGenKeyword imageGenText" 
                  name="prompt" 
                  placeholder="作成するイメージを説明してください。例: &quot;シアトルの地平線の水彩画&quot;" 
                  value={keyword} 
                  onChange={onChangedKeyword} 
                  disabled={isGenerating}
                  required 
                />
                <button 
                  id="createImg" 
                  type="submit" 
                  className="createButton" 
                  disabled={isGenerating || !keyword.trim()}
                >
                  {isGenerating ? '生成中...' : '画像生成'}
                </button>
              </form>
              <div id="dispImg">
                {images.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    className={image === '/static/loading.png' ? 'imgStyle loadAnime' : 'imgStyle'} 
                    alt={image === '/static/loading.png' ? '画像生成中...' : `Generated image ${index + 1}`}
                  />
                ))}
              </div>
            </Stack>
          </div>
        </Stack>
      )}
    </div>
  )
}

export default ImageGenerator