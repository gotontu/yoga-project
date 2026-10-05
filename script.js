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
const canvasCtx = canvasElement.getContext('2d');
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

// ==========================================
// 🌟 4. 原本的三個動作資料庫 (可替換本機圖片如 "./images/tree.jpg")
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
// 6. 首頁動態渲染 3 個動作卡片
// ==========================================
function renderActionGrid() {
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

// 點擊卡片：進入偵測室、開啟相機、跳出介紹彈窗
function enterWorkout(poseId) {
    closeAllPanels();
    homeView.style.display = 'none';
    workoutView.style.display = 'flex';
    
    const poseItem = POSE_DATABASE.find(p => p.id === poseId);
    currentWorkoutTitle.innerText = `${poseItem.title} 練習室`;
    
    if (!cameraActive) {
        camera.start();
        cameraActive = true;
    }

    openPoseIntro(poseId);
}

// 點擊返回：關閉訓練室與相機，回到首頁大廳
btnBackHome.addEventListener('click', () => {
    workoutView.style.display = 'none';
    homeView.style.display = 'flex';

    if (cameraActive) {
        camera.stop();
        cameraActive = false;
    }
    
    perfectStartTime = 0;
    hasSavedThisRep = false;
});

// ==========================================
// 7. 彈窗與 3 秒倒數計時
// ==========================================
function openPoseIntro(poseKey) {
    const guide = POSE_DATABASE.find(p => p.id === poseKey);
    if (!guide || !introModal) {
        startCountdownForPose(poseKey);
        return;
    }

    pendingPose = poseKey;
    isIntroActive = true;

    introTitle.innerText = `${guide.title} (${guide.subtitle})`;
    introDesc.innerText = guide.desc;
    introTips.innerHTML = guide.tips.map(tip => `<li>${tip}</li>`).join('');

    introVideo.style.display = 'none';
    introImage.src = guide.img;
    introImage.style.display = 'block';

    introModal.style.display = 'flex';
}

introStartBtn.addEventListener('click', () => {
    introModal.style.display = 'none';
    isIntroActive = false;
    if (pendingPose) {
        startCountdownForPose(pendingPose);
    }
});

function startCountdownForPose(poseKey) {
    const overlay = document.getElementById('countdown-overlay');
    const numberDiv = document.getElementById('countdown-number');
    const guide = POSE_DATABASE.find(p => p.id === poseKey);

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

    treeInfo.style.display = poseName === 'tree' ? 'block' : 'none';
    squatInfo.style.display = poseName === 'squat' ? 'block' : 'none';
    genericInfo.style.display = poseName === 'Raise' ? 'block' : 'none';

    const currentObj = POSE_DATABASE.find(p => p.id === poseName);
    poseTitle.innerText = `${currentObj ? currentObj.title : poseName} 偵測`;
}

// ==========================================
// 8. Firebase 身份驗證
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        landingPage.style.display = 'none';
        homeView.style.display = 'flex';
        userDisplay.innerText = `使用者：${user.displayName}`;
        renderActionGrid();
    } else {
        currentUser = null;
        landingPage.style.display = 'flex';
        homeView.style.display = 'none';
        workoutView.style.display = 'none';
        if (cameraActive) { camera.stop(); cameraActive = false; }
    }
});

loginBtn?.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch(err => console.error("登入失敗", err));
});
logoutBtn?.addEventListener('click', () => signOut(auth));

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
// 🌟 10. AI 偵測主邏輯 (含已修正的大樹式)
// ==========================================
function onResults(results) {
    if (loadingDiv && loadingDiv.style.display !== 'none') {
        loadingDiv.style.display = 'none';
    }

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

                // ==========================================
                // 🌟 大樹式 (修正：左右腿自動辨識 + 雙手過頭/合十)
                // ==========================================
                if (currentPoseMode === 'tree') {
                    let isArmError = false;
                    let isLegError = false;

                    const leftKneeAngle = calculateAngle(hipL, kneeL, ankleL);
                    const rightKneeAngle = calculateAngle(hipR, kneeR, ankleR);

                    const isRightLegLifted = (ankleR.y < ankleL.y - 0.05) && (rightKneeAngle < 145);
                    const isLeftLegLifted = (ankleL.y < ankleR.y - 0.05) && (leftKneeAngle < 145);

                    if (isRightLegLifted) {
                        if (leftKneeAngle < 150) {
                            legStatusDiv.innerText = "錯誤：支撐腳（左腳）請伸直！";
                            legStatusDiv.style.color = "var(--error-color)";
                            isLegError = true;
                        } else {
                            legStatusDiv.innerText = "腿部 PERFECT！(左腳站穩，右腳抬起)";
                            legStatusDiv.style.color = "var(--success-color)";
                        }
                    } else if (isLeftLegLifted) {
                        if (rightKneeAngle < 150) {
                            legStatusDiv.innerText = "錯誤：支撐腳（右腳）請伸直！";
                            legStatusDiv.style.color = "var(--error-color)";
                            isLegError = true;
                        } else {
                            legStatusDiv.innerText = "腿部 PERFECT！(右腳站穩，左腳抬起)";
                            legStatusDiv.style.color = "var(--success-color)";
                        }
                    } else {
                        legStatusDiv.innerText = "請單腳站穩，另一腳曲膝抬高貼於腿側";
                        legStatusDiv.style.color = "var(--error-color)";
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
                            armStatusDiv.innerText = "錯誤：雙手高舉時請伸直手肘！";
                            armStatusDiv.style.color = "var(--error-color)";
                            isArmError = true;
                        } else {
                            armStatusDiv.innerText = "手臂 PERFECT！(高舉伸展)";
                            armStatusDiv.style.color = "var(--success-color)";
                        }
                    } else if (isPraying) {
                        armStatusDiv.innerText = "手臂 PERFECT！(胸前合十)";
                        armStatusDiv.style.color = "var(--success-color)";
                    } else {
                        armStatusDiv.innerText = "手部請舉過頭頂，或於胸前合十";
                        armStatusDiv.style.color = "var(--error-color)";
                        isArmError = true;
                    }

                    if (isArmError || isLegError) {
                        statusDisplay.classList.add('error');
                        statusDisplay.classList.remove('perfect');
                        perfectStartTime = 0;
                        hasSavedThisRep = false;
                    } else {
                        statusDisplay.classList.remove('error');
                        statusDisplay.classList.add('perfect');
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;

                        if (holdDuration >= 5000) {
                            if (!hasSavedThisRep) handlePoseSuccess('大樹式');
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            armStatusDiv.innerText = `PERFECT! 請維持平衡 ${secondsLeft} 秒...`;
                            armStatusDiv.style.color = "var(--success-color)";
                        }
                    }

                // ==========================================
                // 🌟 深蹲 (Squat)
                // ==========================================
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

                    squatStatusDiv.innerText = squatStatus;
                    squatStatusDiv.style.color = squatColor;

                    if (squatColor === 'var(--success-color)') {
                        statusDisplay.classList.remove('error');
                        statusDisplay.classList.add('perfect');
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;
                        if (holdDuration >= 5000) {
                            if (!hasSavedThisRep) handlePoseSuccess('深蹲');
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            squatStatusDiv.innerText = `HOLD 住了！維持 ${secondsLeft} 秒...`;
                        }
                    } else {
                        statusDisplay.classList.remove('perfect');
                        perfectStartTime = 0;
                    }

                // ==========================================
                // 🌟 側平舉 (Raise)
                // ==========================================
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
                        statusDisplay.classList.add('perfect');
                        statusDisplay.classList.remove('error');
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;

                        if (holdDuration >= 5000) { 
                            if (!hasSavedThisRep) handlePoseSuccess('平舉');
                            speakHint("平舉完成，太棒了！", 1000);
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            poseResultsDiv.innerHTML = `<span style="color: var(--success-color); font-weight: bold;">PERFECT! 請維持 ${secondsLeft} 秒...</span>`;
                        }
                    } else {
                        poseResultsDiv.innerHTML = errors.map(e => `<div style="color: var(--error-color); margin-bottom: 5px;">${e}</div>`).join('');
                        statusDisplay.classList.add('error');
                        statusDisplay.classList.remove('perfect');
                        perfectStartTime = 0;
                    }
                }
            }
        } catch (e) {}
    }
    canvasCtx.restore();
}

// 成功儲存
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
// 12. 資料庫儲存與導覽列抽屜管理
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

const btnProfile = document.getElementById('btn-profile');
const profileContainer = document.getElementById('profile-container');
const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const historyContainer = document.getElementById('history-container');
const toggleLeaderboardBtn = document.getElementById('toggle-leaderboard-btn');
const leaderboardContainer = document.getElementById('leaderboard-container');

function closeAllPanels() {
    if(profileContainer) profileContainer.style.display = 'none';
    if(historyContainer) historyContainer.style.display = 'none';
    if(leaderboardContainer) leaderboardContainer.style.display = 'none';
}

btnProfile?.addEventListener('click', () => {
    const isVisible = profileContainer.style.display === 'block';
    closeAllPanels();
    if (!isVisible) {
        profileContainer.style.display = 'block';
        document.getElementById('profile-name').innerText = currentUser.displayName;
        document.getElementById('profile-avatar').src = currentUser.photoURL || '';
    }
});

toggleHistoryBtn?.addEventListener('click', () => {
    const isVisible = historyContainer.style.display === 'block';
    closeAllPanels();
    if (!isVisible) historyContainer.style.display = 'block';
});

toggleLeaderboardBtn?.addEventListener('click', () => {
    const isVisible = leaderboardContainer.style.display === 'block';
    closeAllPanels();
    if (!isVisible) leaderboardContainer.style.display = 'block';
});
