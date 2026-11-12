import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

interface QuestionItem {
  line: string;
  real: string;
  fakes: [string, string, string];
}

interface ActiveQuestion {
  line: string;
  choices: string[]; // 0:上, 1:右, 2:下, 3:左
  correctIndex: number;
}

// 関東主要路線（山手線・埼京線・京王線・西武線・東武東上線など）全100問データ
const STATION_DATA: QuestionItem[] = [
  // 山手線 (20)
  { line: 'JR山手線', real: '高輪ゲートウェイ', fakes: ['芝浦ゲートウェイ', '品川ベイサイド', '泉岳寺ターミナル'] },
  { line: 'JR山手線', real: '新大久保', fakes: ['南大久保', '東百人町', '西大久保'] },
  { line: 'JR山手線', real: '鶯谷', fakes: ['鶴谷', '鳩ヶ谷本町', '鷺谷'] },
  { line: 'JR山手線', real: '日暮里', fakes: ['夕暮里', '朝暮里', '東日暮里'] },
  { line: 'JR山手線', real: '西日暮里', fakes: ['北日暮里', '新日暮里', '上日暮里'] },
  { line: 'JR山手線', real: '御徒町', fakes: ['御殿町', 'お徒士町', '新御徒町北'] },
  { line: 'JR山手線', real: '有楽町', fakes: ['無楽町', '新有楽町', '日比谷有楽'] },
  { line: 'JR山手線', real: '浜松町', fakes: ['大門浜松', '芝浜松', '新浜松町'] },
  { line: 'JR山手線', real: '五反田', fakes: ['四反田', '六反田', '三反田'] },
  { line: 'JR山手線', real: '目白', fakes: ['目赤', '目青', '目黄'] },
  { line: 'JR山手線', real: '高田馬場', fakes: ['高田牧場', '早稲田馬場', '上田馬場'] },
  { line: 'JR山手線', real: '駒込', fakes: ['馬込中央', '巣鴨駒込', '新駒込'] },
  { line: 'JR山手線', real: '田端', fakes: ['田端新町', '上田端', '東田端'] },
  { line: 'JR山手線', real: '大崎', fakes: ['小崎', '南品川大崎', '西大崎'] },
  { line: 'JR山手線', real: '恵比寿', fakes: ['大黒天', '弁財天', '布袋尊'] },
  { line: 'JR山手線', real: '代々木', fakes: ['代々幡', '千駄木代々木', '新代々木'] },
  { line: 'JR山手線', real: '巣鴨', fakes: ['雛鴨', '親鴨', '鶴鴨'] },
  { line: 'JR山手線', real: '大塚', fakes: ['小塚', '南大塚', '北大塚'] },
  { line: 'JR山手線', real: '神田', fakes: ['仏田', '宮田', '新神田'] },
  { line: 'JR山手線', real: '新橋', fakes: ['古橋', '汐留新橋', '京橋新橋'] },

  // 埼京線 (20)
  { line: 'JR埼京線', real: '十条', fakes: ['九条', '十一条', '十二条'] },
  { line: 'JR埼京線', real: '板橋', fakes: ['木橋', '鉄橋', '新板橋本町'] },
  { line: 'JR埼京線', real: '浮間舟渡', fakes: ['浮間船着', '舟渡公園', '荒川舟渡'] },
  { line: 'JR埼京線', real: '戸田公園', fakes: ['戸田競艇場', '戸田遊園', '新戸田公園'] },
  { line: 'JR埼京線', real: '北戸田', fakes: ['南戸田', '西戸田', '東戸田'] },
  { line: 'JR埼京線', real: '武蔵浦和', fakes: ['相模浦和', '下総浦和', '上総浦和'] },
  { line: 'JR埼京線', real: '中浦和', fakes: ['新浦和', '上浦和', '奥浦和'] },
  { line: 'JR埼京線', real: '南与野', fakes: ['東与野', '西与野', '上与野'] },
  { line: 'JR埼京線', real: '与野本町', fakes: ['与野新町', '与野中央', '大宮与野'] },
  { line: 'JR埼京線', real: '北与野', fakes: ['新与野', '与野北口', '奥与野'] },
  { line: 'JR埼京線', real: '指扇', fakes: ['団扇', '扇子', '舞扇'] },
  { line: 'JR埼京線', real: '日進', fakes: ['月進', '年進', '新日進'] },
  { line: 'JR埼京線', real: '西大宮', fakes: ['東大宮西', '南大宮', '新大宮'] },
  { line: 'JR埼京線', real: '南古谷', fakes: ['北古谷', '東古谷', '西古谷'] },
  { line: 'JR埼京線', real: '北赤羽', fakes: ['南赤羽', '西赤羽', '東赤羽'] },
  { line: 'JR埼京線', real: '戸田', fakes: ['上戸田', '下戸田', '新戸田'] },
  { line: 'JR埼京線', real: '大崎', fakes: ['品川大崎', '東大崎', '北大崎'] },
  { line: 'JR埼京線', real: '赤羽', fakes: ['白羽', '黒羽', '青羽'] },
  { line: 'JR埼京線', real: '池袋', fakes: ['沼袋', '池上', '大袋'] },
  { line: 'JR埼京線', real: '新宿', fakes: ['古宿', '元宿', '大宿'] },

  // 京王線 (20)
  { line: '京王線', real: '笹塚', fakes: ['竹塚', '松塚', '梅塚'] },
  { line: '京王線', real: '代田橋', fakes: ['世田谷橋', '和田橋', '新代田橋'] },
  { line: '京王線', real: '明大前', fakes: ['法大前', '早大前', '立大前'] },
  { line: '京王線', real: '下高井戸', fakes: ['中高井戸', '新高井戸', '東高井戸'] },
  { line: '京王線', real: '桜上水', fakes: ['梅上水', '桃上水', '藤上水'] },
  { line: '京王線', real: '上北沢', fakes: ['下北沢西', '中北沢', '新北沢'] },
  { line: '京王線', real: '八幡山', fakes: ['九幡山', '七幡山', '神幡山'] },
  { line: '京王線', real: '芦花公園', fakes: ['蘆花庭園', '千歳芦花', '粕谷公園'] },
  { line: '京王線', real: '千歳烏山', fakes: ['万歳烏山', '百歳烏山', '千歳雀山'] },
  { line: '京王線', real: '仙川', fakes: ['神川', '鬼川', '竜川'] },
  { line: '京王線', real: 'つつじヶ丘', fakes: ['あじさいヶ丘', 'ひまわりヶ丘', 'すずらんヶ丘'] },
  { line: '京王線', real: '柴崎', fakes: ['犬崎', '猫崎', '狐崎'] },
  { line: '京王線', real: '国領', fakes: ['県領', '都領', '府領'] },
  { line: '京王線', real: '布田', fakes: ['絹田', '綿田', '麻田'] },
  { line: '京王線', real: '飛田給', fakes: ['飛田郷', '飛田原', '飛田谷'] },
  { line: '京王線', real: '武蔵野台', fakes: ['武蔵野丘', '武蔵野原', '武蔵野坂'] },
  { line: '京王線', real: '多磨霊園', fakes: ['多摩墓園', '府中霊園', '武蔵霊園'] },
  { line: '京王線', real: '分倍河原', fakes: ['三倍河原', '四倍河原', '倍増河原'] },
  { line: '京王線', real: '百草園', fakes: ['千草園', '万草園', '十草園'] },
  { line: '京王線', real: '聖蹟桜ヶ丘', fakes: ['聖跡梅ヶ丘', '聖蹟桃ヶ丘', '多摩桜ヶ丘'] },

  // 西武線 (20)
  { line: '西武池袋線', real: '椎名町', fakes: ['杉名町', '桧名町', '楠名町'] },
  { line: '西武池袋線', real: '東長崎', fakes: ['西長崎', '南長崎', '北長崎'] },
  { line: '西武池袋線', real: '江古田', fakes: ['新江古田北', '上江古田', '下江古田'] },
  { line: '西武池袋線', real: '桜台', fakes: ['梅台', '桃台', '杏台'] },
  { line: '西武池袋線', real: '中村橋', fakes: ['田中橋', '佐藤橋', '鈴木橋'] },
  { line: '西武池袋線', real: '富士見台', fakes: ['筑波見台', '浅間見台', '丹沢見台'] },
  { line: '西武池袋線', real: '練馬高野台', fakes: ['練馬比叡台', '練馬高尾台', '新練馬台'] },
  { line: '西武池袋線', real: '石神井公園', fakes: ['石神井庭園', '上石神井公園', '三宝寺公園'] },
  { line: '西武池袋線', real: '大泉学園', fakes: ['小泉学園', '中泉学園', '新泉学園'] },
  { line: '西武池袋線', real: '保谷', fakes: ['新保谷', '上保谷', '下保谷'] },
  { line: '西武池袋線', real: 'ひばりヶ丘', fakes: ['うぐいすヶ丘', 'つばめヶ丘', 'すずめヶ丘'] },
  { line: '西武池袋線', real: '東久留米', fakes: ['西久留米', '南久留米', '北久留米'] },
  { line: '西武池袋線', real: '清瀬', fakes: ['濁瀬', '澄瀬', '新清瀬'] },
  { line: '西武池袋線', real: '秋津', fakes: ['春津', '夏津', '冬津'] },
  { line: '西武新宿線', real: '下落合', fakes: ['上落合', '中落合', '新落合'] },
  { line: '西武新宿線', real: '中井', fakes: ['上井', '下井', '新井'] },
  { line: '西武新宿線', real: '新井薬師前', fakes: ['新井大師前', '薬師寺前', '中野薬師前'] },
  { line: '西武新宿線', real: '沼袋', fakes: ['池袋', '湖袋', '川袋'] },
  { line: '西武新宿線', real: '野方', fakes: ['山方', '川方', '海方'] },
  { line: '西武新宿線', real: '鷺ノ宮', fakes: ['鶴ノ宮', '鷹ノ宮', '鳩ノ宮'] },

  // 東武東上線 (20)
  { line: '東武東上線', real: '北池袋', fakes: ['南池袋', '西池袋', '東池袋北'] },
  { line: '東武東上線', real: '下板橋', fakes: ['上板橋東', '中板橋北', '元板橋'] },
  { line: '東武東上線', real: '大山', fakes: ['小山', '中山', '新大山'] },
  { line: '東武東上線', real: '中板橋', fakes: ['西板橋', '東板橋', '奥板橋'] },
  { line: '東武東上線', real: 'ときわ台', fakes: ['わかば台', 'あおば台', 'みどり台'] },
  { line: '東武東上線', real: '上板橋', fakes: ['新上板橋', '北上板橋', '上板橋本町'] },
  { line: '東武東上線', real: '東武練馬', fakes: ['西武練馬', '京王練馬', '東武板橋'] },
  { line: '東武東上線', real: '下赤塚', fakes: ['上赤塚', '中赤塚', '新赤塚'] },
  { line: '東武東上線', real: '成増', fakes: ['栄増', '福増', '富増'] },
  { line: '東武東上線', real: '和光市', fakes: ['平和市', '光和市', '新和光'] },
  { line: '東武東上線', real: '朝霞', fakes: ['夕霞', '夜霞', '春霞'] },
  { line: '東武東上線', real: '朝霞台', fakes: ['朝霞丘', '朝霞原', '朝霞公園'] },
  { line: '東武東上線', real: '志木', fakes: ['新志木', '上志木', '志木本町'] },
  { line: '東武東上線', real: '柳瀬川', fakes: ['桜瀬川', '梅瀬川', '楓瀬川'] },
  { line: '東武東上線', real: 'みずほ台', fakes: ['いなほ台', 'こがね台', 'みのり台'] },
  { line: '東武東上線', real: '鶴瀬', fakes: ['亀瀬', '鷺瀬', '鳩瀬'] },
  { line: '東武東上線', real: 'ふじみ野', fakes: ['さくら野', 'かすみ野', 'ひかり野'] },
  { line: '東武東上線', real: '上福岡', fakes: ['下福岡', '中福岡', '新福岡'] },
  { line: '東武東上線', real: '新河岸', fakes: ['旧河岸', '上河岸', '本河岸'] },
  { line: '東武東上線', real: '霞ヶ関', fakes: ['霧ヶ関', '雲ヶ関', '雨ヶ関'] },
];

const TIME_LIMIT = 10;
const TOTAL_QUESTIONS = 10;

// 配列シャッフル関数
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [questions, setQuestions] = useState<ActiveQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_LIMIT);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // フリック操作用座標
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // ゲーム開始処理（100問から10問ランダム抽出）
  const startGame = () => {
    const selectedRaw = shuffle(STATION_DATA).slice(0, TOTAL_QUESTIONS);
    const prepared: ActiveQuestion[] = selectedRaw.map((item) => {
      const allChoices = shuffle([item.real, ...item.fakes]);
      return {
        line: item.line,
        choices: allChoices,
        correctIndex: allChoices.indexOf(item.real),
      };
    });

    setQuestions(prepared);
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setFeedback(null);
    setSelectedIdx(null);
    setGameState('playing');
  };

  // 次の問題へ進む処理
  const goToNext = useCallback(() => {
    setFeedback(null);
    setSelectedIdx(null);
    if (currentIndex + 1 < TOTAL_QUESTIONS) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(TIME_LIMIT);
    } else {
      setGameState('result');
    }
  }, [currentIndex]);

  // 回答判定処理
  const handleAnswer = useCallback(
    (choiceIndex: number | null) => {
      if (feedback !== null || gameState !== 'playing') return;

      setSelectedIdx(choiceIndex);
      const isCorrect =
        choiceIndex !== null && choiceIndex === questions[currentIndex]?.correctIndex;

      if (isCorrect) {
        setScore((prev) => prev + 10);
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }

      // 1.3秒間大きく〇×を表示したあとに次の問題へ
      setTimeout(() => {
        goToNext();
      }, 1300);
    },
    [feedback, gameState, questions, currentIndex, goToNext]
  );

  // 10秒タイマー管理
  useEffect(() => {
    if (gameState !== 'playing' || feedback !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(timer);
          handleAnswer(null); // タイムアップ（不正解）
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => clearInterval(timer);
  }, [gameState, feedback, handleAnswer]);

  // スマホ用フリック検知（上下左右スワイプ）
  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameState !== 'playing' || feedback !== null) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== 'playing' || feedback !== null) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 35; // フリック判定の最小移動距離(px)
    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
      return; // タップの場合はボタン側のonClickに任せる
    }

    // 0:上, 1:右, 2:下, 3:左
    if (Math.abs(dx) > Math.abs(dy)) {
      handleAnswer(dx > 0 ? 1 : 3);
    } else {
      handleAnswer(dy > 0 ? 2 : 0);
    }
  };

  const currentQ = questions[currentIndex];
  const directionArrows = ['▲ 上フリック', '▶ 右フリック', '▼ 下フリック', '◀ 左フリック'];

  return (
    <div
      className="app-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 桃鉄風アニメ背景（空・雲・富士山風・走る電車・線路） */}
      <div className="momotetsu-bg">
        <div className="sun-burst"></div>
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="mountain mt-fuji"></div>
        <div className="mountain mt-sub"></div>
        <div className="hills"></div>

        {/* アニメーション列車 */}
        <div className="train-wrapper">
          <div className="steam-puff p1"></div>
          <div className="steam-puff p2"></div>
          <div className="locomotive">
            <div className="chimney"></div>
            <div className="cabin"></div>
            <div className="boiler"></div>
            <div className="wheel w1"></div>
            <div className="wheel w2"></div>
          </div>
          <div className="carriage c1">
            <div className="window"></div>
            <div className="window"></div>
            <div className="wheel w1"></div>
            <div className="wheel w2"></div>
          </div>
          <div className="carriage c2">
            <div className="window"></div>
            <div className="window"></div>
            <div className="wheel w1"></div>
            <div className="wheel w2"></div>
          </div>
        </div>

        <div className="railway-track"></div>
      </div>

      {/* メインコンテンツ枠 */}
      <main className="game-board">
        {gameState === 'start' && (
          <div className="panel start-panel">
            <div className="badge-ribbon">関東主要路線 100駅収録！</div>
            <h1 className="game-title">
              <span>実在駅名</span>
              <br />
              クイズ電鉄！
            </h1>
            <div className="rule-box">
              <p>🚃 4つの駅名から<strong>「実在する駅」</strong>を1つ当てよう！</p>
              <p>⏱ 制限時間は<strong>1問10秒</strong>（全10問・100点満点）</p>
              <p>👆 スマホは<strong>上下左右のフリック</strong>でも回答OK！</p>
            </div>
            <button className="pop-button start-btn" onClick={startGame}>
              出発進行！！
            </button>
          </div>
        )}

        {gameState === 'playing' && currentQ && (
          <div className="panel quiz-panel">
            {/* ヘッダーステータス */}
            <div className="status-bar">
              <div className="status-pill q-count">
                第 <span>{currentIndex + 1}</span> / {TOTAL_QUESTIONS} 問
              </div>
              <div className="status-pill score-box">
                総資産: <span>{score}</span> 点
              </div>
            </div>

            {/* 10秒タイマーゲージ */}
            <div className="timer-container">
              <div className="timer-label">のこり {Math.ceil(timeLeft)} 秒</div>
              <div className="timer-track">
                <div
                  className={`timer-fill ${timeLeft <= 3 ? 'danger' : ''}`}
                  style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 問題文 */}
            <div className="question-card">
              <span className="line-tag">{currentQ.line}</span>
              <h2 className="question-text">実在する駅名はどれ？</h2>
            </div>

            {/* 十字フリック＆タップ対応 4択エリア */}
            <div className="flick-cross-grid">
              {currentQ.choices.map((station, idx) => {
                let btnStateClass = '';
                if (feedback !== null) {
                  if (idx === currentQ.correctIndex) {
                    btnStateClass = 'is-correct';
                  } else if (idx === selectedIdx) {
                    btnStateClass = 'is-wrong';
                  }
                }
                return (
                  <button
                    key={idx}
                    className={`choice-card pos-${idx} ${btnStateClass}`}
                    onClick={() => handleAnswer(idx)}
                    disabled={feedback !== null}
                  >
                    <span className="flick-hint">{directionArrows[idx]}</span>
                    <span className="station-name">{station}</span>
                  </button>
                );
              })}
              <div className="center-compass">
                <span>フリック</span>
                <small>or タップ</small>
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="panel result-panel">
            <div className="badge-ribbon">終点到着！！</div>
            <h2 className="result-heading">最終成績発表</h2>
            <div className="final-score-box">
              <span className="score-number">{score}</span>
              <span className="score-unit">点 / 100点</span>
            </div>
            <p className="rank-comment">
              {score === 100
                ? '👑 鉄道王の称号を獲得！完璧な駅名マスターです！'
                : score >= 70
                ? '🚅 特急列車級！かなりの関東鉄道マニアですね！'
                : score >= 40
                ? '🚃 各駅停車の旅！次は目指せ70点以上！'
                : '🚶 まずは路線図を片手にぶらり途中下車の旅へ！'}
            </p>
            <button className="pop-button start-btn" onClick={startGame}>
              もういちど遊ぶ！
            </button>
          </div>
        )}

        {/* 正解〇・不正解×の巨大オーバーレイ表示 */}
        {feedback && (
          <div className="feedback-overlay">
            {feedback === 'correct' ? (
              <div className="mark-circle" aria-label="正解">
                〇
                <span className="mark-sub">+10点！</span>
              </div>
            ) : (
              <div className="mark-cross" aria-label="不正解">
                ×
                <span className="mark-sub">
                  正解は「{currentQ?.choices[currentQ.correctIndex]}」
                </span>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}