import styles from './Chat.module.css'
import { useState, useContext, useEffect } from 'react'
import { Stack } from '@fluentui/react'
import { ShieldLockRegular } from '@fluentui/react-icons'

import ctctlogo from "../../assets/logo.png";
import { AppStateContext } from '../../state/AppProvider'

const ImageGenerator = () => {
  const [showAuthMessage, setShowAuthMessage] = useState<boolean | undefined>()
  const [keyword, setKeyWord] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [images, setImages] = useState<string[]>([])
  const [count, setCount] = useState(0)
  const [currentProvider, setCurrentProvider] = useState<string>("")
  const [providersStatus, setProvidersStatus] = useState<any[]>([])
  
  const onChangedKeyword = (event: React.ChangeEvent<HTMLInputElement>) => setKeyWord(event.target.value)
  const appStateContext = useContext(AppStateContext)
  const ui = appStateContext?.state.frontendSettings?.ui

  // プロバイダー状態を取得
  useEffect(() => {
    const fetchProvidersStatus = async () => {
      try {
        const response = await fetch('/image_providers_status')
        if (response.ok) {
          const data = await response.json()
          setProvidersStatus(data.providers || [])
        }
      } catch (error) {
        console.error('プロバイダー状態取得エラー:', error)
      }
    }

    if (ui?.image_gen_enabled) {
      fetchProvidersStatus()
    }
  }, [ui?.image_gen_enabled])

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

      // 新しい画像生成APIエンドポイントを使用
      const response = await fetch('/generate_image', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "prompt": keyword,
          "n": 1,
          "size": "1024x1024",
          "output_format": "png",
          "quality": "medium"
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      // 使用されたプロバイダー情報を更新
      if (data.provider_used) {
        setCurrentProvider(data.provider_used);
      }

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
      
      // エラーメッセージを表示
      alert(`画像生成に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 画像生成機能が無効な場合
  if (!ui?.image_gen_enabled) {
    return (
      <div className={styles.container} role="main">
        <Stack className={styles.chatEmptyState}>
          <img src={ctctlogo} className={styles.chatIcon} aria-hidden="true" alt="" />
          <h1 className={styles.chatEmptyStateTitle}>画像生成機能が無効です</h1>
          <h2 className={styles.chatEmptyStateSubtitle}>
            画像生成機能を使用するには、環境設定でプロバイダーを設定してください。
          </h2>
        </Stack>
      </div>
    );
  }

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
              
              {/* プロバイダー情報表示 */}
              {/* {providersStatus.length > 0 && (
                <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
                  <p>利用可能なプロバイダー: {providersStatus.length}個</p>
                  {currentProvider && <p>前回使用: {currentProvider}</p>}
                  <p>生成画像数: {count}</p>
                </div>
              )} */}
              
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