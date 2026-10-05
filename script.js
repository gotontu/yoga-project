// ==========================================
// 🌟 1. 引入 Firebase SDK
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, collection, query, orderBy, limit, getDocs, increment, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 🌟 2. Firebase 配置 
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCstuIQhwz_Oxc6Q7T_9rbve8AcR6y276w",
    authDomain: "ourgoodgoodproject.firebaseapp.com",
    projectId: "ourgoodgoodproject",
    storageBucket: "ourgoodgoodproject.firebasestorage.app",
    messagingSenderId: "174602665216",
    appId: "1:174602665216:web:335339073c8d5a00efc7e5",
    measurementId: "G-2Y3VQZJRCC"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 3. 取得 DOM 元素
// ==========================================
const landingPage = document.getElementById('landing-page');
const homeView = document.getElementById('home-view');
const workoutView = document.getElementById('workout-view');
const actionsGrid = document.getElementById('actions-grid');
const btnBackHome = document.getElementById('btn-back-home');
const currentWorkoutTitle = document.getElementById('current-workout-title');

const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement?.getContext('2d');
const loadingDiv = document.getElementById('loading');

const statusDisplay = document.getElementById('status-display');
const poseTitle = document.getElementById('pose-title');
const treeInfo = document.getElementById('tree-info');
const squatInfo = document.getElementById('squat-info');
const genericInfo = document.getElementById('generic-info');
const armStatusDiv = document.getElementById('arm-status');
const legStatusDiv = document.getElementById('leg-status');
const squatStatusDiv = document.getElementById('squat-status');
const poseResultsDiv = document.getElementById('pose-results');
const saveStatusDiv = document.getElementById('save-status');

const loginBtn = document.getElementById('login-btn'); 
const startBtn = document.getElementById('start-btn');
const logoutBtn = document.getElementById('logout-btn');
const userWelcome = document.getElementById('user-welcome');
const userDisplay = document.getElementById('user-display');

// 彈窗相關元素
const introModal = document.getElementById('intro-modal');
const introTitle = document.getElementById('intro-title');
const introVideo = document.getElementById('intro-video');
const introImage = document.getElementById('intro-image');
const introDesc = document.getElementById('intro-desc');
const introTips = document.getElementById('intro-tips');
const introStartBtn = document.getElementById('intro-start-btn');

// 上方抽屜面板元素
const btnProfile = document.getElementById('btn-profile');
const profileContainer = document.getElementById('profile-container');
const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const historyContainer = document.getElementById('history-container');
const toggleLeaderboardBtn = document.getElementById('toggle-leaderboard-btn');
const leaderboardContainer = document.getElementById('leaderboard-container');

let myChart = null;
let preferenceChart = null;

// ==========================================
// 🌟 4. 原本的三個動作資料庫
// ==========================================
const POSE_DATABASE = [
    {
        id: 'tree',
        title: "大樹式",
        subtitle: "Tree Pose",
        img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
        desc: "大樹式能訓練下肢肌力、單腳平衡感與專注度。",
        tips: [
            "單腳伸直站穩，另一腳曲膝抬起貼於大腿或小腿內側",
            "切勿將腳掌直接壓在支撐腳膝蓋關節上",
            "雙手向上高舉打直伸展，或於胸前合十"
        ]
    },
    {
        id: 'squat',
        title: "深蹲",
        subtitle: "Squat",
        img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80",
        desc: "深蹲能強化臀大肌、股四頭肌與核心穩定度。",
        tips: [
            "雙腳與肩同寬，腳尖微外展 15-30 度",
            "臀部向後坐，下蹲時膝蓋不超過腳尖過多",
            "背部自然打直，胸口向前挺起"
        ]
    },
    {
        id: 'Raise',
        title: "側平舉",
        subtitle: "Lateral Raise",
        img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
        desc: "側平舉能增強肩膀三角肌與上肢控制力。",
        tips: [
            "雙臂向兩側抬起與地面平行",
            "手臂全程伸直勿微彎",
            "放鬆頸部勿過度聳肩"
        ]
    }
];

const YOGA_DATABASE = {
    "Raise": [
        { name: "L_Arm", joints: [11, 13, 15], min: 150, max: 180, msg: "左手請伸直" },
        { name: "R_Arm", joints: [12, 14, 16], min: 150, max: 180, msg: "右手請伸直" }
    ]
};

// ==========================================
// 5. 全域狀態變數
// ==========================================
let currentPoseMode = 'tree'; 
let currentUser = null; 
let canSave = true; 
let perfectStartTime = 0;   
let hasSavedThisRep = false;
let isIntroActive = false;
let pendingPose = null;
let cameraActive = false;

// ==========================================
// 🌟 6. Firebase 身份驗證邏輯
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        if (loginBtn) loginBtn.style.display = 'none';
        if (startBtn) startBtn.style.display = 'block';
        if (userWelcome) userWelcome.innerText = `準備好了嗎，${user.displayName || '瑜珈夥伴'}？`;
        if (userDisplay) userDisplay.innerText = `使用者：${user.displayName || '已登入'}`;
    } else {
        currentUser = null;
        if (loginBtn) loginBtn.style.display = 'block';
        if (startBtn) startBtn.style.display = 'none';
        if (userWelcome) userWelcome.innerText = "請先登入以記錄你的練習成果";
        if (landingPage) landingPage.style.display = 'flex';
        if (homeView) homeView.style.display = 'none';
        if (workoutView) workoutView.style.display = 'none';
        if (cameraActive) { camera.stop(); cameraActive = false; }
    }
});

loginBtn?.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch(err => {
        console.error("登入失敗", err);
        alert("登入失敗：" + (err.message || "請檢查網路連線"));
    });
});

startBtn?.addEventListener('click', () => {
    if (landingPage) landingPage.style.display = 'none';
    if (homeView) homeView.style.display = 'flex';
    renderActionGrid();
});

logoutBtn?.addEventListener('click', () => {
    signOut(auth);
});

// ==========================================
// 7. 首頁動態渲染 3 個動作卡片
// ==========================================
function renderActionGrid() {
    if (!actionsGrid) return;
    actionsGrid.innerHTML = '';
    POSE_DATABASE.forEach(pose => {
        const card = document.createElement('div');
        card.className = 'action-card';
        card.innerHTML = `
            <div class="card-media">
                <img src="${pose.img}" alt="${pose.title}" loading="lazy">
            </div>
            <div class="card-body">
                <div>
                    <h4 class="card-title">${pose.title}</h4>
                    <span style="font-size: 0.9rem; color: #a4b0be;">${pose.subtitle}</span>
                </div>
                <span class="card-tag">● 開始練習</span>
            </div>
        `;
        card.addEventListener('click', () => {
            enterWorkout(pose.id);
        });
        actionsGrid.appendChild(card);
    });
}

function enterWorkout(poseId) {
    closeAllPanels();
    if (homeView) homeView.style.display = 'none';
    if (workoutView) workoutView.style.display = 'flex';
    
    const poseItem = POSE_DATABASE.find(p => p.id === poseId);
    if (currentWorkoutTitle && poseItem) {
        currentWorkoutTitle.innerText = `${poseItem.title} 練習室`;
    }
    
    if (!cameraActive) {
        camera.start();
        cameraActive = true;
    }

    openPoseIntro(poseId);
}

btnBackHome?.addEventListener('click', () => {
    if (workoutView) workoutView.style.display = 'none';
    if (homeView) homeView.style.display = 'flex';

    if (cameraActive) {
        camera.stop();
        cameraActive = false;
    }
    
    perfectStartTime = 0;
    hasSavedThisRep = false;
});

// ==========================================
// 8. 彈窗與 3 秒倒數計時
// ==========================================
function openPoseIntro(poseKey) {
    const guide = POSE_DATABASE.find(p => p.id === poseKey);
    if (!guide || !introModal) {
        startCountdownForPose(poseKey);
        return;
    }

    pendingPose = poseKey;
    isIntroActive = true;

    if (introTitle) introTitle.innerText = `${guide.title} (${guide.subtitle})`;
    if (introDesc) introDesc.innerText = guide.desc;
    if (introTips) introTips.innerHTML = guide.tips.map(tip => `<li>${tip}</li>`).join('');

    if (introVideo) introVideo.style.display = 'none';
    if (introImage) {
        introImage.src = guide.img;
        introImage.style.display = 'block';
    }

    introModal.style.display = 'flex';
}

introStartBtn?.addEventListener('click', () => {
    if (introModal) introModal.style.display = 'none';
    isIntroActive = false;
    if (pendingPose) {
        startCountdownForPose(pendingPose);
    }
});

function startCountdownForPose(poseKey) {
    const overlay = document.getElementById('countdown-overlay');
    const numberDiv = document.getElementById('countdown-number');
    const guide = POSE_DATABASE.find(p => p.id === poseKey);

    if (!overlay || !numberDiv) {
        switchPose(poseKey);
        return;
    }

    overlay.style.display = 'flex';
    let count = 3;
    numberDiv.innerText = count;
    speakHint("準備開始");

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            numberDiv.innerText = count;
        } else {
            clearInterval(timer);
            overlay.style.display = 'none';
            switchPose(poseKey);
            speakHint(`開始${guide ? guide.title : poseKey}，請就定位`, 1000);
        }
    }, 1000);
}

function switchPose(poseName) {
    currentPoseMode = poseName;
    canSave = true; 
    perfectStartTime = 0;
    hasSavedThisRep = false;

    if (saveStatusDiv) saveStatusDiv.innerText = '';
    statusDisplay?.classList.remove('error', 'perfect');

    if (treeInfo) treeInfo.style.display = poseName === 'tree' ? 'block' : 'none';
    if (squatInfo) squatInfo.style.display = poseName === 'squat' ? 'block' : 'none';
    if (genericInfo) genericInfo.style.display = poseName === 'Raise' ? 'block' : 'none';

    const currentObj = POSE_DATABASE.find(p => p.id === poseName);
    if (poseTitle) poseTitle.innerText = `${currentObj ? currentObj.title : poseName} 偵測`;
}

// ==========================================
// 9. 幾何運算與語音提示
// ==========================================
function calculateAngle(a, b, c) {
    let radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

let lastSpeakTime = 0; 
function speakHint(text, cooldown = 3000) {
    const currentTime = Date.now();
    if (window.speechSynthesis.speaking || currentTime - lastSpeakTime < cooldown) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW'; 
    utterance.rate = 1.2;     
    window.speechSynthesis.speak(utterance);
    lastSpeakTime = currentTime; 
}

// ==========================================
// 🌟 10. AI 偵測主邏輯
// ==========================================
function onResults(results) {
    if (loadingDiv && loadingDiv.style.display !== 'none') {
        loadingDiv.style.display = 'none';
    }

    if (!canvasCtx || !canvasElement) return;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    const countdownOverlay = document.getElementById('countdown-overlay');
    const isCountdownActive = countdownOverlay && countdownOverlay.style.display === 'flex';

    if (isIntroActive || isCountdownActive) {
        if (results.poseLandmarks) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#7f8c8d', lineWidth: 2});
            drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#bdc3c7', lineWidth: 1});
        }
        canvasCtx.restore();
        return; 
    }

    if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});

        try {
            const lm = results.poseLandmarks;
            const shoulderL = lm[11]; const elbowL = lm[13]; const wristL = lm[15];
            const shoulderR = lm[12]; const elbowR = lm[14]; const wristR = lm[16];
            const hipL = lm[23]; const kneeL = lm[25]; const ankleL = lm[27];
            const hipR = lm[24]; const kneeR = lm[26]; const ankleR = lm[28];

            if (shoulderL && shoulderR && hipL && hipR && kneeL && kneeR && ankleL && ankleR) {

                // === 大樹式 ===
                if (currentPoseMode === 'tree') {
                    let isArmError = false;
                    let isLegError = false;

                    const leftKneeAngle = calculateAngle(hipL, kneeL, ankleL);
                    const rightKneeAngle = calculateAngle(hipR, kneeR, ankleR);

                    const isRightLegLifted = (ankleR.y < ankleL.y - 0.05) && (rightKneeAngle < 145);
                    const isLeftLegLifted = (ankleL.y < ankleR.y - 0.05) && (leftKneeAngle < 145);

                    if (isRightLegLifted) {
                        if (leftKneeAngle < 150) {
                            if (legStatusDiv) { legStatusDiv.innerText = "錯誤：支撐腳（左腳）請伸直！"; legStatusDiv.style.color = "var(--error-color)"; }
                            isLegError = true;
                        } else {
                            if (legStatusDiv) { legStatusDiv.innerText = "腿部 PERFECT！(左腳站穩，右腳抬起)"; legStatusDiv.style.color = "var(--success-color)"; }
                        }
                    } else if (isLeftLegLifted) {
                        if (rightKneeAngle < 150) {
                            if (legStatusDiv) { legStatusDiv.innerText = "錯誤：支撐腳（右腳）請伸直！"; legStatusDiv.style.color = "var(--error-color)"; }
                            isLegError = true;
                        } else {
                            if (legStatusDiv) { legStatusDiv.innerText = "腿部 PERFECT！(右腳站穩，左腳抬起)"; legStatusDiv.style.color = "var(--success-color)"; }
                        }
                    } else {
                        if (legStatusDiv) { legStatusDiv.innerText = "請單腳站穩，另一腳曲膝抬高貼於腿側"; legStatusDiv.style.color = "var(--error-color)"; }
                        isLegError = true;
                    }

                    const leftElbowAngle = calculateAngle(shoulderL, elbowL, wristL);
                    const rightElbowAngle = calculateAngle(shoulderR, elbowR, wristR);
                    const isOverhead = (wristL.y < shoulderL.y) && (wristR.y < shoulderR.y);
                    const isPraying = (Math.abs(wristL.x - wristR.x) < 0.15) && 
                                      (Math.abs(wristL.y - wristR.y) < 0.15) && 
                                      (wristL.y < hipL.y) && (wristL.y > shoulderL.y - 0.05);

                    if (isOverhead) {
                        if (leftElbowAngle < 125 || rightElbowAngle < 125) {
                            if (armStatusDiv) { armStatusDiv.innerText = "錯誤：雙手高舉時請伸直手肘！"; armStatusDiv.style.color = "var(--error-color)"; }
                            isArmError = true;
                        } else {
                            if (armStatusDiv) { armStatusDiv.innerText = "手臂 PERFECT！(高舉伸展)"; armStatusDiv.style.color = "var(--success-color)"; }
                        }
                    } else if (isPraying) {
                        if (armStatusDiv) { armStatusDiv.innerText = "手臂 PERFECT！(胸前合十)"; armStatusDiv.style.color = "var(--success-color)"; }
                    } else {
                        if (armStatusDiv) { armStatusDiv.innerText = "手部請舉過頭頂，或於胸前合十"; armStatusDiv.style.color = "var(--error-color)"; }
                        isArmError = true;
                    }

                    if (isArmError || isLegError) {
                        statusDisplay?.classList.add('error');
                        statusDisplay?.classList.remove('perfect');
                        perfectStartTime = 0;
                        hasSavedThisRep = false;
                    } else {
                        statusDisplay?.classList.remove('error');
                        statusDisplay?.classList.add('perfect');
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;

                        if (holdDuration >= 5000) {
                            if (!hasSavedThisRep) handlePoseSuccess('大樹式');
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            if (armStatusDiv) {
                                armStatusDiv.innerText = `PERFECT! 請維持平衡 ${secondsLeft} 秒...`;
                                armStatusDiv.style.color = "var(--success-color)";
                            }
                        }
                    }

                // === 深蹲 ===
                } else if (currentPoseMode === 'squat') {
                    const squatHipAngle = calculateAngle(shoulderR, hipR, kneeR);   
                    const squatKneeAngle = calculateAngle(hipR, kneeR, ankleR);    
                    let squatStatus = "請開始深蹲";
                    let squatColor = "white";

                    if (squatKneeAngle < 140) {
                        if (squatKneeAngle > 110) {
                            squatStatus = "再蹲低一點！"; squatColor = "yellow"; 
                            speakHint("再蹲低一點"); 
                        } else if (squatHipAngle > 120) {
                            squatStatus = "錯誤：屁股要翹高，身體不要太直！"; squatColor = "var(--error-color)";
                            speakHint("屁股要翹高，身體不要太直"); 
                        } else {
                            squatStatus = "標準深蹲！繼續保持！"; squatColor = "var(--success-color)";
                            speakHint("標準深蹲！繼續保持！"); 
                        }
                    }

                    if (squatStatusDiv) {
                        squatStatusDiv.innerText = squatStatus;
                        squatStatusDiv.style.color = squatColor;
                    }

                    if (squatColor === 'var(--success-color)') {
                        statusDisplay?.classList.remove('error');
                        statusDisplay?.classList.add('perfect');
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;
                        if (holdDuration >= 5000) {
                            if (!hasSavedThisRep) handlePoseSuccess('深蹲');
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            if (squatStatusDiv) squatStatusDiv.innerText = `HOLD 住了！維持 ${secondsLeft} 秒...`;
                        }
                    } else {
                        statusDisplay?.classList.remove('perfect');
                        perfectStartTime = 0;
                    }

                // === 側平舉 ===
                } else if (currentPoseMode === 'Raise') {
                    const rules = YOGA_DATABASE[currentPoseMode];
                    let perfectCount = 0;
                    let errors = [];

                    rules.forEach(rule => {
                        const p1 = lm[rule.joints[0]];
                        const p2 = lm[rule.joints[1]];
                        const p3 = lm[rule.joints[2]];
                        if(p1 && p2 && p3) {
                            const angle = calculateAngle(p1, p2, p3);
                            if (angle < rule.min || angle > rule.max) errors.push(rule.msg);
                            else perfectCount++;
                        }
                    });

                    if (perfectCount === rules.length) {
                        statusDisplay?.classList.add('perfect');
                        statusDisplay?.classList.remove('error');
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;

                        if (holdDuration >= 5000) { 
                            if (!hasSavedThisRep) handlePoseSuccess('平舉');
                            speakHint("平舉完成，太棒了！", 1000);
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            if (poseResultsDiv) poseResultsDiv.innerHTML = `<span style="color: var(--success-color); font-weight: bold;">PERFECT! 請維持 ${secondsLeft} 秒...</span>`;
                        }
                    } else {
                        if (poseResultsDiv) poseResultsDiv.innerHTML = errors.map(e => `<div style="color: var(--error-color); margin-bottom: 5px;">${e}</div>`).join('');
                        statusDisplay?.classList.add('error');
                        statusDisplay?.classList.remove('perfect');
                        perfectStartTime = 0;
                    }
                }
            }
        } catch (e) {}
    }
    canvasCtx.restore();
}

function handlePoseSuccess(poseNameChinese) {
    saveDailyRecord(poseNameChinese, 'Perfect'); 
    hasSavedThisRep = true;
    if (saveStatusDiv) {
        saveStatusDiv.innerText = `🌟 完美${poseNameChinese}！已記錄！`;
        saveStatusDiv.style.color = "var(--success-color)";
    }
    speakHint(`太棒了！${poseNameChinese}完成！`);
}

// ==========================================
// 11. 初始化 MediaPipe
// ==========================================
const pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await pose.send({image: videoElement}); },
    width: 640, height: 480
});

// ==========================================
// 🌟 12. 資料庫儲存與查詢核心
// ==========================================
async function saveDailyRecord(poseType, status) {
    if (!currentUser || !canSave) return;
    canSave = false; 
    const today = new Date().toLocaleDateString('zh-TW').replace(/\//g, '-');
    const historyCol = collection(db, "users", currentUser.uid, "history");
    try {
        await addDoc(historyCol, { date: today, lastPose: poseType, status: status, timestamp: new Date() });
        uploadScore(10);
        setTimeout(() => { canSave = true; }, 5000);
    } catch (e) { console.error(e); }
}

async function uploadScore(points) {
    if (!currentUser) return;
    const userLeaderboardRef = doc(db, "leaderboard", currentUser.uid);
    try {
        await setDoc(userLeaderboardRef, { name: currentUser.displayName, score: increment(points), lastUpdate: new Date() }, { merge: true });
    } catch (e) {}
}

// 關閉所有抽屜面板
function closeAllPanels() {
    if(profileContainer) profileContainer.style.display = 'none';
    if(historyContainer) historyContainer.style.display = 'none';
    if(leaderboardContainer) leaderboardContainer.style.display = 'none';
}

// ==========================================
// 🌟 13. 個人中心資料讀取（修復段位與圓餅圖）
// ==========================================
async function loadProfileData() {
    if (!currentUser) return;

    const nameEl = document.getElementById('profile-name');
    const avatarEl = document.getElementById('profile-avatar');
    const rankEl = document.getElementById('profile-rank');
    const totalScoreEl = document.getElementById('profile-total-score');
    const daysCountEl = document.getElementById('profile-days-count');
    const perfectCountEl = document.getElementById('profile-perfect-count');

    if (nameEl) nameEl.innerText = currentUser.displayName || '瑜珈夥伴';
    if (avatarEl) avatarEl.src = currentUser.photoURL || 'https://via.placeholder.com/80?text=User';

    // 1. 讀取總積分與段位
    try {
        const userLeaderboardRef = doc(db, "leaderboard", currentUser.uid);
        const docSnap = await getDoc(userLeaderboardRef);
        let currentScore = 0;
        if (docSnap.exists()) {
            currentScore = docSnap.data().score || 0;
        }
        if (totalScoreEl) totalScoreEl.innerText = currentScore;

        if (rankEl) {
            if (currentScore < 50) {
                rankEl.innerText = "🌱 瑜珈新手";
                rankEl.style.background = "#bdc3c7";
                rankEl.style.color = "#2f3542";
            } else if (currentScore < 200) {
                rankEl.innerText = "🧘‍♂️ 瑜珈學徒";
                rankEl.style.background = "#3498db";
                rankEl.style.color = "white";
            } else if (currentScore < 500) {
                rankEl.innerText = "🔥 瑜珈達人";
                rankEl.style.background = "#e67e22";
                rankEl.style.color = "white";
            } else {
                rankEl.innerText = "👑 瑜珈大師";
                rankEl.style.background = "#f1c40f";
                rankEl.style.color = "#c0392b";
            }
        }
    } catch (e) {
        console.error("讀取個人積分失敗", e);
        if (rankEl) rankEl.innerText = "🌱 瑜珈新手";
    }

    // 2. 讀取練習天數、Perfect次數、動作偏好圓餅圖
    try {
        const historyRef = collection(db, "users", currentUser.uid, "history");
        const querySnapshot = await getDocs(historyRef);
        let uniqueDates = new Set();
        let poseCounts = { '大樹式': 0, '深蹲': 0, '平舉': 0 };

        if (perfectCountEl) perfectCountEl.innerText = querySnapshot.size;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.date) uniqueDates.add(data.date);
            const p = data.lastPose;
            if (poseCounts[p] !== undefined) {
                poseCounts[p]++;
            } else if (p === '側平舉') {
                poseCounts['平舉']++;
            }
        });

        if (daysCountEl) daysCountEl.innerText = uniqueDates.size;
        drawPreferenceChart([poseCounts['大樹式'], poseCounts['深蹲'], poseCounts['平舉']]);

    } catch (e) {
        console.error("讀取歷史分析失敗", e);
    }
}

function drawPreferenceChart(dataPoints) {
    const chartElem = document.getElementById('posePreferenceChart');
    if (!chartElem) return;
    const ctx = chartElem.getContext('2d');
    if (preferenceChart) { preferenceChart.destroy(); }

    const isDataEmpty = dataPoints.every(val => val === 0);
    const renderData = isDataEmpty ? [1, 1, 1] : dataPoints;
    const bgColors = isDataEmpty 
        ? ['#ecf0f1', '#ecf0f1', '#ecf0f1'] 
        : ['#1abc9c', '#9b59b6', '#f39c12'];

    preferenceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['大樹式', '深蹲', '側平舉'],
            datasets: [{
                data: renderData,
                backgroundColor: bgColors,
                borderWidth: 2,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } },
                tooltip: { enabled: !isDataEmpty }
            },
            cutout: '60%'
        }
    });
}

// ==========================================
// 🌟 14. 歷史紀錄與排行榜資料讀取
// ==========================================
async function loadHistoryData() {
    if (!currentUser) return;
    const historyRef = collection(db, "users", currentUser.uid, "history");
    const q = query(historyRef, orderBy("timestamp", "desc"), limit(7));

    try {
        const querySnapshot = await getDocs(q);
        const dates = [];
        const scores = [];
        const listItems = [];

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            dates.push(data.date);
            scores.push(data.status === 'Perfect' ? 100 : 50);

            let timeString = "";
            if (data.timestamp) {
                const dateObj = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                timeString = dateObj.toLocaleTimeString('zh-TW', { hour12: false });
            }

            listItems.push(`<li>
                📅 ${data.date} 
                <span style="color: #747d8c; font-size: 0.85em; margin: 0 5px;">[${timeString}]</span> 
                - ${data.lastPose}: <strong style="color: var(--success-color);">${data.status}</strong>
            </li>`);
        });

        renderHistoryChart(dates.reverse(), scores.reverse());
        const listContainer = document.getElementById('history-list');
        if (listContainer) {
            listContainer.innerHTML = listItems.length > 0 ? listItems.join('') : '<li style="color: #999;">尚無練習紀錄</li>';
        }
    } catch (e) {
        console.error("讀取紀錄失敗", e);
    }
}

function renderHistoryChart(labels, dataPoints) {
    const chartElem = document.getElementById('historyChart');
    if (!chartElem) return;
    const ctx = chartElem.getContext('2d');
    if (myChart) { myChart.destroy(); }
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '練習品質 (100=完美)',
                data: dataPoints,
                borderColor: '#4e73df',
                backgroundColor: 'rgba(78, 115, 223, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: { scales: { y: { min: 0, max: 100 } } }
    });
}

async function loadLeaderboardData() {
    const leaderboardCol = collection(db, "leaderboard");
    const q = query(leaderboardCol, orderBy("score", "desc"), limit(10));

    try {
        const querySnapshot = await getDocs(q);
        const listElement = document.getElementById("leaderboard-list");
        if (!listElement) return;

        listElement.innerHTML = "";
        let rank = 1;

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            let medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `🏅 ${rank}.`;
            const li = document.createElement("li");
            li.innerHTML = `<strong>${medal}</strong> ${data.name || '瑜珈同好'} <span style="float:right; color:#ff9800; font-weight:bold;">${data.score || 0} 分</span>`;
            listElement.appendChild(li);
            rank++;
        });

        if (rank === 1) {
            listElement.innerHTML = '<li style="text-align: center; color: gray;">尚無排行榜資料</li>';
        }
    } catch (e) {
        console.error("讀取排行榜失敗", e);
    }
}

// 抽屜按鈕切換事件綁定
btnProfile?.addEventListener('click', () => {
    const isVisible = profileContainer?.style.display === 'block';
    closeAllPanels();
    if (!isVisible && profileContainer) {
        profileContainer.style.display = 'block';
        loadProfileData(); // 🌟 點開時立刻向 Firebase 撈取數據
    }
});

toggleHistoryBtn?.addEventListener('click', () => {
    const isVisible = historyContainer?.style.display === 'block';
    closeAllPanels();
    if (!isVisible && historyContainer) {
        historyContainer.style.display = 'block';
        loadHistoryData(); // 🌟 點開時加載歷史紀錄
    }
});

toggleLeaderboardBtn?.addEventListener('click', () => {
    const isVisible = leaderboardContainer?.style.display === 'block';
    closeAllPanels();
    if (!isVisible && leaderboardContainer) {
        leaderboardContainer.style.display = 'block';
        loadLeaderboardData(); // 🌟 點開時加載排行榜
    }
});
