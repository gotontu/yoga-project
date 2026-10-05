// ==========================================
// 🌟 1. 引入 Firebase SDK
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, collection, query, orderBy, limit, getDocs, increment, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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
// 3. 取得 HTML 元素
// ==========================================
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

const btnTree = document.getElementById('btn-tree');
const btnSquat = document.getElementById('btn-squat');
const btnRaise = document.getElementById('btn-raise');
const btnFlow = document.getElementById('btn-flow'); 
const startBtn = document.getElementById('start-btn');
const loginBtn = document.getElementById('login-btn'); 
const logoutBtn = document.getElementById('logout-btn');
const userWelcome = document.getElementById('user-welcome');
const userDisplay = document.getElementById('user-display');

// 🌟 教學彈窗與結算畫面相關元素
const introModal = document.getElementById('intro-modal');
const introTitle = document.getElementById('intro-title');
const introVideo = document.getElementById('intro-video');
const introImage = document.getElementById('intro-image');
const introDesc = document.getElementById('intro-desc');
const introTips = document.getElementById('intro-tips');
const introStartBtn = document.getElementById('intro-start-btn');

const summaryScreen = document.getElementById('summary-screen');
const summaryCloseBtn = document.getElementById('summary-close-btn');

// ==========================================
// 4. 全域變數 & 動作資料庫
// ==========================================
let currentPoseMode = 'tree'; 
let currentUser = null; 
let canSave = true; 

let perfectStartTime = 0;   
let hasSavedThisRep = false;

const yogaRoutine = ['tree', 'squat', 'Raise']; 
let currentRoutineIndex = 0; 
let isRoutineMode = false;   
let isTransitioning = false; 
let routineStartTime = 0;

const POSE_GUIDES = {
    'tree': {
        title: "大樹式 (Tree Pose)",
        type: "image",
        src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80", 
        desc: "大樹式能訓練下肢肌力、單腳平衡感與專注度。",
        tips: [
            "支撐腳請伸直站穩，另一腳曲膝抬起貼於大腿或小腿側",
            "切勿將腳掌直接壓在支撐腳膝蓋關節上",
            "雙手向上高舉伸展，或於胸前合十"
        ]
    },
    'squat': {
        title: "深蹲 (Squat)",
        type: "image",
        src: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80", 
        desc: "深蹲能強化臀腿肌群與核心穩定度。",
        tips: ["雙腳與肩同寬，腳尖微外展", "臀部向後坐，下蹲時膝蓋不超過腳尖過多", "背部自然打直，胸口向前挺起"]
    },
    'Raise': {
        title: "側平舉 (Lateral Raise)",
        type: "video",
        src: "https://www.w3schools.com/html/mov_bbb.mp4", 
        desc: "側平舉能增強肩膀三角肌與上肢控制力。",
        tips: ["雙臂平舉與地面平行", "手臂全程伸直勿微彎", "放鬆頸部勿過度聳肩"]
    }
};

let isIntroActive = false; 
let pendingPose = null;    

const YOGA_DATABASE = {
    "Raise": [
        { name: "L_Arm", joints: [11, 13, 15], min: 150, max: 180, msg: "左手請伸直" },
        { name: "R_Arm", joints: [12, 14, 16], min: 150, max: 180, msg: "右手請伸直" }
    ]
};

// ==========================================
// 🌟 5. Firebase 身份驗證邏輯
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        if(loginBtn) loginBtn.style.display = 'none';
        if(startBtn) startBtn.style.display = 'block';
        if(userWelcome) userWelcome.innerText = `準備好了嗎，${user.displayName}？`;
        if(userDisplay) userDisplay.innerText = `使用者：${user.displayName}`; 
    } else {
        currentUser = null;
        if(loginBtn) loginBtn.style.display = 'block';
        if(startBtn) startBtn.style.display = 'none';
        if(userWelcome) userWelcome.innerText = "請先登入以記錄你的練習";
        
        document.getElementById('landing-page').style.display = 'flex';
        document.getElementById('landing-page').style.opacity = '1';
        document.getElementById('main-app').style.display = 'none';
    }
});

if(loginBtn) {
    loginBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider).catch((err) => console.error("登入失敗", err));
    });
}

if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth);
    });
}

// ==========================================
// 6. 資料儲存與歷史紀錄系統
// ==========================================
async function saveDailyRecord(poseType, status) {
    if (!currentUser || !canSave) return;
    canSave = false; 

    const today = new Date().toLocaleDateString('zh-TW').replace(/\//g, '-');
    const historyCol = collection(db, "users", currentUser.uid, "history");
    
    try {
        await addDoc(historyCol, {
            date: today,
            lastPose: poseType,
            status: status,
            timestamp: new Date()
        });
        
        if(saveStatusDiv && !isRoutineMode) saveStatusDiv.innerText = `✅ ${poseType} 已自動存檔 (${new Date().toLocaleTimeString()})`;
        
        loadHistoryData(); 
        uploadScore(10); 

        setTimeout(() => { 
            canSave = true; 
            if(saveStatusDiv && !isTransitioning && !isRoutineMode) saveStatusDiv.innerText = ''; 
        }, 5000); 

    } catch (e) { console.error("雲端存檔失敗", e); }
}

const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const historyContainer = document.getElementById('history-container');
let isHistoryVisible = false; 
let myChart = null; 

if (toggleHistoryBtn) {
    toggleHistoryBtn.addEventListener('click', () => {
        isHistoryVisible = !isHistoryVisible; 
        if (isHistoryVisible) {
            historyContainer.style.display = 'block';
            toggleHistoryBtn.innerText = '隱藏紀錄';
            toggleHistoryBtn.style.backgroundColor = '#ff4757'; 
            loadHistoryData(); 
            historyContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            historyContainer.style.display = 'none';
            toggleHistoryBtn.innerText = '查看歷史紀錄';
            toggleHistoryBtn.style.backgroundColor = '#747d8c'; 
        }
    });
}

async function loadHistoryData() {
    if (!currentUser) return;
    const historyRef = collection(db, "users", currentUser.uid, "history");
    const q = query(historyRef, orderBy("timestamp", "desc"), limit(7));

    try {
        const querySnapshot = await getDocs(q);
        const dates = [];
        const scores = [];
        const listItems = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            dates.push(data.date);
            scores.push(data.status === 'Perfect' ? 100 : 50);
        
            let timeString = "";
            if (data.timestamp) {
                const dateObj = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                timeString = dateObj.toLocaleTimeString('zh-TW', { hour12: false }); 
            }
        
            listItems.push(`<li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                📅 ${data.date} 
                <span style="color: #747d8c; font-size: 0.85em; margin: 0 5px;">[${timeString}]</span> 
                - ${data.lastPose}: <strong style="color: var(--success-color);">${data.status}</strong>
            </li>`);
        });

        renderHistoryChart(dates.reverse(), scores.reverse());
        const listContainer = document.getElementById('history-list');
        if(listContainer && listItems.length > 0) {
            listContainer.innerHTML = listItems.join('');
        }
    } catch (e) { console.error("讀取紀錄失敗", e); }
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

// ==========================================
// 🌟 7. 集中處理動作成功與換場邏輯
// ==========================================
function handlePoseSuccess(poseNameChinese) {
    saveDailyRecord(poseNameChinese, 'Perfect'); 
    hasSavedThisRep = true;

    if (isRoutineMode) {
        isTransitioning = true; 
        currentRoutineIndex++;
        
        if (currentRoutineIndex < yogaRoutine.length) {
            let nextPose = yogaRoutine[currentRoutineIndex];
            let nextPoseName = nextPose === 'tree' ? '大樹式' : (nextPose === 'squat' ? '深蹲' : '平舉');
            
            if (saveStatusDiv) {
                saveStatusDiv.innerHTML = `<span style="font-size: 18px;">🎉 完美！休息一下，<b>5秒</b>後進入：<b>${nextPoseName}</b></span>`;
                saveStatusDiv.style.color = "#3498db";
            }
            setTimeout(() => { speakHint(`完美！休息一下，5秒後進入${nextPoseName}`, 500); }, 1500);

            setTimeout(() => {
                isTransitioning = false;
                openPoseIntro(nextPose);
                if(btnFlow) btnFlow.classList.add('active'); 
            }, 5000);
            
        } else {
            isTransitioning = false;
            showSummaryScreen();
        }
    } else {
        if (saveStatusDiv) {
            saveStatusDiv.innerText = `🌟 完美${poseNameChinese}！已記錄！`;
        }
    }
}

function showSummaryScreen() {
    if (!summaryScreen) return;
    const timeDiffMs = Date.now() - routineStartTime;
    const minutes = Math.max(1, Math.floor(timeDiffMs / 60000));

    const actElem = document.getElementById('summary-actions');
    const timeElem = document.getElementById('summary-time');
    const calElem = document.getElementById('summary-cal');
    const daysElem = document.getElementById('summary-days');

    if (actElem) actElem.innerText = yogaRoutine.length;
    if (timeElem) timeElem.innerText = minutes;
    if (calElem) calElem.innerText = calories;
    if (daysElem) daysElem.innerText = "1"; 

    summaryScreen.style.display = 'flex';
    speakHint("恭喜你！今日瑜珈挑戰全數完成！");

    isRoutineMode = false;
    if(btnFlow) btnFlow.classList.remove('active'); 
}

if (summaryCloseBtn) {
    summaryCloseBtn.addEventListener('click', () => {
        if (summaryScreen) summaryScreen.style.display = 'none';
        if(!isHistoryVisible && toggleHistoryBtn) toggleHistoryBtn.click();
    });
}

// ==========================================
// 🌟 8. 動作介紹彈窗、倒數計時與切換邏輯
// ==========================================
function openPoseIntro(poseKey) {
    const guide = POSE_GUIDES[poseKey];
    if (!guide || !introModal) {
        startCountdownForPose(poseKey);
        return;
    }

    pendingPose = poseKey;
    isIntroActive = true;

    if (introTitle) introTitle.innerText = guide.title;
    if (introDesc) introDesc.innerText = guide.desc;
    if (introTips) introTips.innerHTML = guide.tips.map(tip => `<li>${tip}</li>`).join('');

    if (guide.type === 'video') {
        if (introImage) introImage.style.display = 'none';
        if (introVideo) {
            introVideo.src = guide.src;
            introVideo.style.display = 'block';
            introVideo.currentTime = 0;
            introVideo.play().catch(() => {});
        }
    } else {
        if (introVideo) {
            introVideo.pause();
            introVideo.style.display = 'none';
        }
        if (introImage) {
            introImage.src = guide.src;
            introImage.style.display = 'block';
        }
    }

    introModal.style.display = 'flex';
}

if (introStartBtn) {
    introStartBtn.addEventListener('click', () => {
        if (introModal) introModal.style.display = 'none';
        if (introVideo) introVideo.pause();

        isIntroActive = false;
        if (pendingPose) {
            startCountdownForPose(pendingPose);
        }
    });
}

function startCountdownForPose(poseKey) {
    const overlay = document.getElementById('countdown-overlay');
    const numberDiv = document.getElementById('countdown-number');
    const guide = POSE_GUIDES[poseKey];

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

    [btnTree, btnSquat, btnRaise].forEach(btn => btn?.classList.remove('active'));
    if(btnFlow && !isRoutineMode) btnFlow.classList.remove('active');
    statusDisplay?.classList.remove('error', 'perfect');

    if (poseName === 'tree') {
        if(btnTree) btnTree.classList.add('active');
        if(poseTitle) poseTitle.innerText = "大樹式偵測";
        if(treeInfo) treeInfo.style.display = 'block';
        if(squatInfo) squatInfo.style.display = 'none';
        if(genericInfo) genericInfo.style.display = 'none';
    } else if (poseName === 'squat') {
        if(btnSquat) btnSquat.classList.add('active');
        if(poseTitle) poseTitle.innerText = "深蹲偵測";
        if(treeInfo) treeInfo.style.display = 'none';
        if(squatInfo) squatInfo.style.display = 'block';
        if(genericInfo) genericInfo.style.display = 'none';
    } else if (poseName === 'Raise') {
        if(btnRaise) btnRaise.classList.add('active');
        if(poseTitle) poseTitle.innerText = "平舉偵測";
        if(treeInfo) treeInfo.style.display = 'none';
        if(squatInfo) squatInfo.style.display = 'none';
        if(genericInfo) genericInfo.style.display = 'block';
    }
}

btnTree?.addEventListener('click', () => { isRoutineMode = false; openPoseIntro('tree'); });
btnSquat?.addEventListener('click', () => { isRoutineMode = false; openPoseIntro('squat'); });
btnRaise?.addEventListener('click', () => { isRoutineMode = false; openPoseIntro('Raise'); });

if (btnFlow) {
    btnFlow.addEventListener('click', () => {
        isRoutineMode = true;
        currentRoutineIndex = 0; 
        isTransitioning = false; 
        routineStartTime = Date.now(); 
        btnFlow.classList.add('active'); 
        
        openPoseIntro(yogaRoutine[currentRoutineIndex]); 
        
        setTimeout(() => {
            if (saveStatusDiv) {
                saveStatusDiv.innerText = "🧘‍♀️ 瑜珈挑戰開始！請準備第一個動作";
            }
        }, 100);
    });
}

// ==========================================
// 9. 核心功能函式與語音
// ==========================================
function calculateAngle(a, b, c) {
    let radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
}

function startApp() {
    const landingPage = document.getElementById('landing-page');
    const mainApp = document.getElementById('main-app');
    if (landingPage) landingPage.style.opacity = '0';
    setTimeout(() => {
        if (landingPage) landingPage.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';
        camera.start(); 
        openPoseIntro('tree');
    }, 500);
}
startBtn?.addEventListener('click', startApp);

let lastSpeakTime = 0; 
function speakHint(text, cooldown = 3000) {
    const currentTime = Date.now();
    if (window.speechSynthesis.speaking || currentTime - lastSpeakTime < cooldown) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-TW'; 
    utterance.rate = 1.2;     
    utterance.pitch = 1.0;  
    
    window.speechSynthesis.speak(utterance);
    lastSpeakTime = currentTime; 
}

// ==========================================
// 🌟 10. AI 偵測邏輯（配合大字幕優化樣式）
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
        if (isTransitioning) {
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#bdc3c7', lineWidth: 4});
            drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#ffffff', lineWidth: 2});
            canvasCtx.restore();
            return; 
        }

        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2});

        try {
            const lm = results.poseLandmarks;

            // 左右關鍵點
            const shoulderL = lm[11]; const elbowL = lm[13]; const wristL = lm[15];
            const shoulderR = lm[12]; const elbowR = lm[14]; const wristR = lm[16];
            const hipL = lm[23]; const kneeL = lm[25]; const ankleL = lm[27];
            const hipR = lm[24]; const kneeR = lm[26]; const ankleR = lm[28];

            if (shoulderL && shoulderR && hipL && hipR && kneeL && kneeR && ankleL && ankleR) {

                // ========================================================
                // 🌟 大樹式 (Tree Pose) 最佳化邏輯
                // ========================================================
                if (currentPoseMode === 'tree') {
                    let isArmError = false;
                    let isLegError = false;

                    // 1. 計算左右膝蓋伸展角
                    const leftKneeAngle = calculateAngle(hipL, kneeL, ankleL);
                    const rightKneeAngle = calculateAngle(hipR, kneeR, ankleR);

                    // 判斷哪隻腳為抬起腳（高度明顯高於站立腳踝，y 座標越小代表越高）
                    const isRightLegLifted = (ankleR.y < ankleL.y - 0.05) && (rightKneeAngle < 145);
                    const isLeftLegLifted = (ankleL.y < ankleR.y - 0.05) && (leftKneeAngle < 145);

                    if (isRightLegLifted) {
                        // 右腳曲膝抬起 -> 左腳必須伸直支撐
                        if (leftKneeAngle < 150) {
                            legStatusDiv.innerText = "錯誤：支撐腳（左腳）請伸直！";
                            isLegError = true;
                        } else {
                            legStatusDiv.innerText = "腿部 PERFECT！";
                        }
                    } else if (isLeftLegLifted) {
                        // 左腳曲膝抬起 -> 右腳必須伸直支撐
                        if (rightKneeAngle < 150) {
                            legStatusDiv.innerText = "錯誤：支撐腳（右腳）請伸直！";
                            isLegError = true;
                        } else {
                            legStatusDiv.innerText = "腿部 PERFECT！";
                        }
                    } else {
                        legStatusDiv.innerText = "請單腳站穩，另一腳曲膝抬高貼於腿側";
                        isLegError = true;
                    }

                    // 2. 手部判定：同時相容「雙手高舉過頭頂」與「胸前合十」
                    const leftElbowAngle = calculateAngle(shoulderL, elbowL, wristL);
                    const rightElbowAngle = calculateAngle(shoulderR, elbowR, wristR);
                    
                    // 檢查是否高舉過頭頂
                    const isOverhead = (wristL.y < shoulderL.y) && (wristR.y < shoulderR.y);
                    // 檢查是否雙手在胸前合十 (手腕接近、且在胸腹區間)
                    const isPraying = (Math.abs(wristL.x - wristR.x) < 0.15) && 
                                      (Math.abs(wristL.y - wristR.y) < 0.15) && 
                                      (wristL.y < hipL.y) && (wristL.y > shoulderL.y - 0.05);

                    if (isOverhead) {
                        if (leftElbowAngle < 125 || rightElbowAngle < 125) {
                            armStatusDiv.innerText = "錯誤：雙手高舉時請盡量打直手肘！";
                            isArmError = true;
                        } else {
                            armStatusDiv.innerText = "手臂 PERFECT！(高舉伸展)";
                        }
                    } else if (isPraying) {
                        armStatusDiv.innerText = "手臂 PERFECT！(胸前合十)";
                    } else {
                        armStatusDiv.innerText = "手部請向上舉過頭頂，或於胸前合十";
                        isArmError = true;
                    }

                    // 3. 5秒維持判定
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
                            legStatusDiv.innerText = "";
                        }
                    }

                // ========================================================
                // 深蹲 (Squat)
                // ========================================================
                } else if (currentPoseMode === 'squat') {
                    const squatHipAngle = calculateAngle(shoulderR, hipR, kneeR);   
                    const squatKneeAngle = calculateAngle(hipR, kneeR, ankleR);    
                    
                    let squatStatus = "請開始深蹲";
                    let isSquatError = false;
                    let isSquatPerfect = false;

                    if (squatKneeAngle < 140) {
                        if (squatKneeAngle > 110) {
                            squatStatus = "再蹲低一點！";
                            speakHint("再蹲低一點"); 
                        } else if (squatHipAngle > 120) {
                            squatStatus = "錯誤：屁股要翹高，身體不要太直！";
                            isSquatError = true;
                            speakHint("屁股要翹高，身體不要太直"); 
                        } else {
                            squatStatus = "標準深蹲！繼續保持！";
                            isSquatPerfect = true;
                            speakHint("標準深蹲！繼續保持！"); 
                        }
                    }

                    if (isSquatError) {
                        squatStatusDiv.innerText = squatStatus;
                        statusDisplay.classList.add('error');
                        statusDisplay.classList.remove('perfect');
                        perfectStartTime = 0;
                        hasSavedThisRep = false;
                    } else if (isSquatPerfect) {
                        statusDisplay.classList.remove('error');
                        statusDisplay.classList.add('perfect');
                        
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;

                        if (holdDuration >= 5000) {
                            if (!hasSavedThisRep) handlePoseSuccess('深蹲');
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            squatStatusDiv.innerText = `HOLD 住了！請維持 ${secondsLeft} 秒...`;
                        }
                    } else {
                        squatStatusDiv.innerText = squatStatus;
                        statusDisplay.classList.remove('error', 'perfect');
                        perfectStartTime = 0;
                        hasSavedThisRep = false;
                    }

                // ========================================================
                // 平舉 (Raise)
                // ========================================================
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
                            poseResultsDiv.innerText = `PERFECT! 請維持 ${secondsLeft} 秒...`;
                            speakHint("平舉姿勢完美，請撐住"); 
                        }
                    } else {
                        poseResultsDiv.innerHTML = errors.join(' / ');
                        statusDisplay.classList.add('error');
                        statusDisplay.classList.remove('perfect');
                        perfectStartTime = 0;
                        hasSavedThisRep = false;

                        if (errors.length > 0) speakHint(errors[0]); 
                    }
                }
            }
        } catch (e) {}
    }
    canvasCtx.restore();
}

// ==========================================
// 11. 初始化 MediaPipe 與相機
// ==========================================
const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await pose.send({image: videoElement}); },
    // 🌟 解析度調整：升級為 720p 以配合大鏡頭畫面
    width: 1280, height: 720
});

// ==========================================
// 12. 排行榜系統
// ==========================================
async function uploadScore(points) {
    if (!currentUser) return;
    
    const userLeaderboardRef = doc(db, "leaderboard", currentUser.uid);
    try {
        await setDoc(userLeaderboardRef, {
            name: currentUser.displayName,
            score: increment(points),
            lastUpdate: new Date()
        }, { merge: true });
        
        if (isLeaderboardVisible) loadLeaderboard();
    } catch (e) { console.error("更新分數失敗", e); }
}

const toggleLeaderboardBtn = document.getElementById('toggle-leaderboard-btn');
const leaderboardContainer = document.getElementById('leaderboard-container');
let isLeaderboardVisible = false;

if (toggleLeaderboardBtn) {
    toggleLeaderboardBtn.addEventListener('click', () => {
        isLeaderboardVisible = !isLeaderboardVisible;
        if (isLeaderboardVisible) {
            leaderboardContainer.style.display = 'block';
            toggleLeaderboardBtn.innerText = '隱藏排行榜';
            toggleLeaderboardBtn.style.backgroundColor = '#ff4757';
            loadLeaderboard(); 
            leaderboardContainer.scrollIntoView({ behavior: 'smooth' });
        } else {
            leaderboardContainer.style.display = 'none';
            toggleLeaderboardBtn.innerText = '🏆 查看全球排行榜';
            toggleLeaderboardBtn.style.backgroundColor = '#f39c12';
        }
    });
}

async function loadLeaderboard() {
    const leaderboardCol = collection(db, "leaderboard");
    const q = query(leaderboardCol, orderBy("score", "desc"), limit(10));
    
    try {
        const querySnapshot = await getDocs(q);
        const listElement = document.getElementById("leaderboard-list");
        if (!listElement) return;
        
        listElement.innerHTML = ""; 
        let rank = 1;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            let medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `🏅 ${rank}.`;
            
            const li = document.createElement("li");
            li.innerHTML = `<strong>${medal}</strong> ${data.name} <span style="float:right; color:#ff9800; font-weight:bold;">${data.score} 分</span>`;
            li.style.padding = "10px 0";
            li.style.borderBottom = "1px solid #ffe0b2";
            listElement.appendChild(li);
            rank++;
        });
    } catch (e) { console.error("讀取排行榜失敗: ", e); }
}

// ==========================================
// 13. 個人中心與數據視覺化系統
// ==========================================
const btnProfile = document.getElementById('btn-profile');
const profileContainer = document.getElementById('profile-container');

const profileAvatar = document.getElementById('profile-avatar');
const profileName = document.getElementById('profile-name');
const profileRank = document.getElementById('profile-rank');
const profileTotalScore = document.getElementById('profile-total-score');
const profileDaysCount = document.getElementById('profile-days-count');
const profilePerfectCount = document.getElementById('profile-perfect-count');

let preferenceChart = null; 
let isProfileVisible = false;

if (btnProfile) {
    btnProfile.addEventListener('click', async () => {
        if (!currentUser) {
            alert("請先登入喔！");
            return;
        }
        
        isProfileVisible = !isProfileVisible;
        
        if (isProfileVisible) {
            profileContainer.style.display = 'block';
            btnProfile.innerText = '隱藏個人中心';
            btnProfile.style.backgroundColor = '#ff4757';
            profileContainer.scrollIntoView({ behavior: 'smooth' });
            
            profileName.innerText = currentUser.displayName || '瑜珈達人';
            profileAvatar.src = currentUser.photoURL || 'https://via.placeholder.com/80?text=User';

            try {
                const userLeaderboardRef = doc(db, "leaderboard", currentUser.uid);
                const docSnap = await getDoc(userLeaderboardRef);
                
                let currentScore = 0;
                if (docSnap.exists()) {
                    currentScore = docSnap.data().score || 0;
                }
                profileTotalScore.innerText = currentScore;

                if (currentScore < 50) {
                    profileRank.innerText = "🌱 瑜珈新手";
                    profileRank.style.background = "#bdc3c7";
                } else if (currentScore < 200) {
                    profileRank.innerText = "🧘‍♂️ 瑜珈學徒";
                    profileRank.style.background = "#3498db";
                    profileRank.style.color = "white";
                } else if (currentScore < 500) {
                    profileRank.innerText = "🔥 瑜珈達人";
                    profileRank.style.background = "#e67e22";
                    profileRank.style.color = "white";
                } else {
                    profileRank.innerText = "👑 瑜珈大師";
                    profileRank.style.background = "#f1c40f";
                    profileRank.style.color = "#c0392b";
                }
            } catch (e) { console.error("讀取積分失敗", e); }

            try {
                const historyRef = collection(db, "users", currentUser.uid, "history");
                const querySnapshot = await getDocs(historyRef);
                
                let uniqueDates = new Set();
                let poseCounts = { '大樹式': 0, '深蹲': 0, '平舉': 0 };
                
                profilePerfectCount.innerText = querySnapshot.size; 

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.date) uniqueDates.add(data.date);
                    if (poseCounts[data.lastPose] !== undefined) {
                        poseCounts[data.lastPose]++;
                    }
                });

                profileDaysCount.innerText = uniqueDates.size; 
                drawPreferenceChart([poseCounts['大樹式'], poseCounts['深蹲'], poseCounts['平舉']]);

            } catch (e) { console.error("讀取歷史分析失敗", e); }
            
        } else {
            profileContainer.style.display = 'none';
            btnProfile.innerText = '👤 個人中心';
            btnProfile.style.backgroundColor = '#9b59b6';
        }
    });
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
            labels: ['大樹式', '深蹲', '平舉'],
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
