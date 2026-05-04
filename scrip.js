// ==========================================
// 🌟 1. 引入 Firebase SDK (使用組員的 10.8.0 Firestore 版本)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 使用組員的 Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyA3smEkfryuwXH9h-kIMHd18YLAz2NaM4I",
    authDomain: "mygoodgoodproject.firebaseapp.com",
    projectId: "mygoodgoodproject",
    storageBucket: "mygoodgoodproject.firebasestorage.app",
    messagingSenderId: "133466828365",
    appId: "1:133466828365:web:67039e0aa2fd8012127604",
    measurementId: "G-VP9YCD34SX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ==========================================
// 2. 取得 HTML 元素
// ==========================================
const videoElement = document.getElementById('video');
const canvasElement = document.getElementById('canvas');
const canvasCtx = canvasElement.getContext('2d');
const loadingDiv = document.getElementById('loading');

const statusDisplay = document.getElementById('status-display');
const poseTitle = document.getElementById('pose-title');

// 狀態顯示區塊
const treeInfo = document.getElementById('tree-info');
const squatInfo = document.getElementById('squat-info');
const genericInfo = document.getElementById('generic-info');

// 狀態文字
const armStatusDiv = document.getElementById('arm-status');
const legStatusDiv = document.getElementById('leg-status');
const squatStatusDiv = document.getElementById('squat-status');
const poseResultsDiv = document.getElementById('pose-results');
const saveStatusDiv = document.getElementById('save-status');

// 介面按鈕
const startBtn = document.getElementById('start-btn');
const loginBtn = document.getElementById('login-btn'); 
const logoutBtn = document.getElementById('logout-btn');
const userWelcome = document.getElementById('user-welcome');
const userDisplay = document.getElementById('user-display');

// ==========================================
// 3. 全域變數設定
// ==========================================
let currentMode = 'tree'; 
let currentUser = null; 
let canSave = true; // 來自你的防呆機制 (避免短時間內狂存檔)

// 來自你的寫法：資料驅動的判定規則 (用於戰士一式、平舉)
const YOGA_DATABASE = {
    "warrior": [
        { name: "L_Arm", joints: [11, 13, 15], min: 150, max: 180, msg: "左手請伸直" },
        { name: "R_Arm", joints: [12, 14, 16], min: 150, max: 180, msg: "右手請伸直" },
        { name: "L_Knee", joints: [23, 25, 27], min: 70, max: 110, msg: "前腳請微彎" },
        { name: "R_Knee", joints: [24, 26, 28], min: 150, max: 180, msg: "後腿請打直" }
    ],
    "raise": [
        { name: "L_Arm", joints: [11, 13, 15], min: 150, max: 180, msg: "左手請伸直" },
        { name: "R_Arm", joints: [12, 14, 16], min: 150, max: 180, msg: "右手請伸直" }
    ]
};

// ==========================================
// 🌟 4. Firebase 身份驗證邏輯
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginBtn.style.display = 'none';
        startBtn.style.display = 'inline-block';
        userWelcome.innerText = `準備好了嗎，${user.displayName}？`;
        userDisplay.innerText = `使用者：${user.displayName}`; // 你的顯示功能
    } else {
        currentUser = null;
        loginBtn.style.display = 'inline-block';
        startBtn.style.display = 'none';
        userWelcome.innerText = "請先登入以記錄你的練習";
        
        // 登出後退回首頁
        document.getElementById('landing-page').style.display = 'flex';
        document.getElementById('landing-page').style.opacity = '1';
        document.getElementById('main-app').style.display = 'none';
    }
});

loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((err) => console.error("登入失敗", err));
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

// 開始體驗按鈕 (進入系統並啟動鏡頭)
startBtn.addEventListener('click', () => {
    const landingPage = document.getElementById('landing-page');
    const mainApp = document.getElementById('main-app');
    landingPage.style.opacity = '0';
    setTimeout(() => {
        landingPage.style.display = 'none';
        mainApp.style.display = 'flex';
        camera.start(); 
    }, 500);
});

// ==========================================
// 🌟 5. 存檔與歷史紀錄邏輯 (整合雙方特點)
// ==========================================
async function saveDailyRecord(poseType, status) {
    // 加上你的 canSave 防呆機制
    if (!currentUser || !canSave) return;
    canSave = false; 

    const today = new Date().toLocaleDateString('zh-TW').replace(/\//g, '-');
    const userRef = doc(db, "users", currentUser.uid, "history", today); // 組員的 Firestore 路徑
    
    try {
        await setDoc(userRef, {
            date: today,
            lastPose: poseType,
            status: status,
            timestamp: new Date()
        }, { merge: true });
        
        // 你的存檔成功 UI 提示
        saveStatusDiv.innerText = `✅ ${poseType} 已自動存檔 (${new Date().toLocaleTimeString()})`;
        
        loadHistoryData(); // 更新圖表
        
        // 5 秒冷卻時間，並清空提示文字
        setTimeout(() => { 
            canSave = true; 
            saveStatusDiv.innerText = ''; 
        }, 5000); 
    } catch (e) { 
        console.error("雲端存檔失敗", e); 
    }
}

// 歷史紀錄圖表顯示 (組員原封不動)
const toggleHistoryBtn = document.getElementById('toggle-history-btn');
const historyContainer = document.getElementById('history-container');
let isHistoryVisible = false; 
let myChart = null; 

toggleHistoryBtn.addEventListener('click', () => {
    isHistoryVisible = !isHistoryVisible;
    if (isHistoryVisible) {
        historyContainer.style.display = 'block';
        toggleHistoryBtn.innerText = '關閉紀錄';
        toggleHistoryBtn.style.backgroundColor = '#ff4757'; 
        loadHistoryData(); 
        historyContainer.scrollIntoView({ behavior: 'smooth' });
    } else {
        historyContainer.style.display = 'none';
        toggleHistoryBtn.innerText = '查看歷史紀錄';
        toggleHistoryBtn.style.backgroundColor = '#747d8c'; 
    }
});

async function loadHistoryData() {
    if (!currentUser) return;
    const historyRef = collection(db, "users", currentUser.uid, "history");
    const q = query(historyRef, orderBy("timestamp", "desc"), limit(7));

    try {
        const querySnapshot = await getDocs(q);
        const dates = []; const scores = []; const listItems = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            dates.push(data.date);
            scores.push(data.status === 'Perfect' ? 100 : 50);
            listItems.push(`<li style="padding: 5px 0; border-bottom: 1px solid #eee;">📅 ${data.date} - ${data.lastPose}: <strong>${data.status}</strong></li>`);
        });

        renderHistoryChart(dates.reverse(), scores.reverse());
        const listContainer = document.getElementById('history-list');
        if(listItems.length > 0) listContainer.innerHTML = listItems.join('');
    } catch (e) { console.error("讀取紀錄失敗", e); }
}

function renderHistoryChart(labels, dataPoints) {
    const ctx = document.getElementById('historyChart').getContext('2d');
    if (myChart) { myChart.destroy(); } 
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{ label: '練習品質 (100=完美)', data: dataPoints, borderColor: '#4e73df', backgroundColor: 'rgba(78, 115, 223, 0.1)', tension: 0.3, fill: true }]
        },
        options: { scales: { y: { min: 0, max: 100 } } }
    });
}

// ==========================================
// 6. 介面模式切換邏輯
// ==========================================
function switchMode(mode) {
    currentMode = mode;
    canSave = true; // 切換模式時重置存檔冷卻
    
    // 更新按鈕樣式
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn-${mode}`).classList.add('active');

    // 清除邊框顏色
    statusDisplay.classList.remove('error', 'perfect');

    // 控制面板顯示與隱藏
    treeInfo.style.display = (mode === 'tree') ? 'block' : 'none';
    squatInfo.style.display = (mode === 'squat') ? 'block' : 'none';
    genericInfo.style.display = (mode === 'warrior' || mode === 'raise') ? 'block' : 'none';

    // 更新標題
    const modeNames = { 'tree': '大樹式', 'squat': '深蹲', 'warrior': '戰士一式', 'raise': '平舉' };
    poseTitle.innerText = `${modeNames[mode]}偵測`;
}

document.getElementById('btn-tree').addEventListener('click', () => switchMode('tree'));
document.getElementById('btn-squat').addEventListener('click', () => switchMode('squat'));
document.getElementById('btn-warrior').addEventListener('click', () => switchMode('warrior'));
document.getElementById('btn-raise').addEventListener('click', () => switchMode('raise'));

// ==========================================
// 7. MediaPipe 核心邏輯 (計算角度與判斷)
// ==========================================
function calculateAngle(a, b, c) {
    let radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return Math.round(angle);
}

// 動態調整 Canvas 尺寸 (來自你的寫法)
videoElement.onloadedmetadata = () => {
    canvasElement.width = videoElement.videoWidth || 640;
    canvasElement.height = videoElement.videoHeight || 480;
};

function onResults(results) {
    if (loadingDiv.style.display !== 'none') loadingDiv.style.display = 'none';

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks, {color: '#FF0000', lineWidth: 2, radius: 4});

        try {
            const landmarks = results.poseLandmarks;
            const shoulder = landmarks[12]; const elbow = landmarks[14]; const wrist = landmarks[16];   
            const hip = landmarks[24]; const knee = landmarks[26]; const ankle = landmarks[28];   

            if (shoulder && elbow && wrist && hip && knee && ankle) {
                
                // === 模式A：大樹式 (保留組員的詳細判斷) ===
                if (currentMode === 'tree') {
                    const elbowAngle = calculateAngle(shoulder, elbow, wrist); 
                    const shoulderAngle = calculateAngle(hip, shoulder, elbow); 
                    const kneeAngle = calculateAngle(hip, knee, ankle);       
                    const legAngle = calculateAngle(shoulder, hip, knee);     
                    let isArmError = false; let isLegError = false;

                    // 手部判斷
                    if (elbowAngle < 160) { armStatusDiv.innerText = "手肘彎曲了！請伸直。"; armStatusDiv.style.color = "var(--error-color)"; isArmError = true; } 
                    else if (shoulderAngle < 75) { armStatusDiv.innerText = "手臂掉下來了！請抬高。"; armStatusDiv.style.color = "var(--error-color)"; isArmError = true; } 
                    else if (shoulderAngle > 105) { armStatusDiv.innerText = "手臂舉太高了！請放平。"; armStatusDiv.style.color = "var(--error-color)"; isArmError = true; } 
                    else { armStatusDiv.innerText = "手臂 PERFECT！"; armStatusDiv.style.color = "var(--success-color)"; }

                    // 腿部判斷
                    if (legAngle > 110) { legStatusDiv.innerText = "再抬高腿！"; legStatusDiv.style.color = "var(--error-color)"; isLegError = true; } 
                    else if (legAngle < 75) { legStatusDiv.innerText = "腳低一點！"; legStatusDiv.style.color = "var(--error-color)"; isLegError = true; } 
                    else if (kneeAngle < 160) { legStatusDiv.innerText = "請把腳伸直！"; legStatusDiv.style.color = "var(--error-color)"; isLegError = true; } 
                    else { legStatusDiv.innerText = "完美抬腿！"; legStatusDiv.style.color = "var(--success-color)"; }

                    if (isArmError || isLegError) { statusDisplay.classList.add('error'); statusDisplay.classList.remove('perfect'); } 
                    else { statusDisplay.classList.remove('error'); statusDisplay.classList.add('perfect'); saveDailyRecord('大樹式', 'Perfect'); }
                } 
                
                // === 模式B：深蹲 (保留組員的判斷) ===
                else if (currentMode === 'squat') {
                    const squatHipAngle = calculateAngle(shoulder, hip, knee);   
                    const squatKneeAngle = calculateAngle(hip, knee, ankle);    
                    let squatStatus = "請開始深蹲"; let squatColor = "white";

                    if (squatKneeAngle < 140) {
                        if (squatKneeAngle > 110) { squatStatus = "再蹲低一點！"; squatColor = "yellow"; } 
                        else if (squatHipAngle > 120) { squatStatus = "錯誤：屁股要翹高，身體不要太直！"; squatColor = "var(--error-color)"; } 
                        else { squatStatus = "標準深蹲！繼續保持！"; squatColor = "var(--success-color)"; }
                    }
                    squatStatusDiv.innerText = squatStatus; squatStatusDiv.style.color = squatColor;

                    if (squatColor === 'var(--error-color)') { statusDisplay.classList.add('error'); statusDisplay.classList.remove('perfect'); } 
                    else if (squatColor === 'var(--success-color)') { statusDisplay.classList.remove('error'); statusDisplay.classList.add('perfect'); saveDailyRecord('深蹲', 'Perfect'); } 
                    else { statusDisplay.classList.remove('error', 'perfect'); }
                }

                // === 模式C：戰士一式、平舉 (採用你的 YOGA_DATABASE 寫法) ===
                else if (currentMode === 'warrior' || currentMode === 'raise') {
                    const rules = YOGA_DATABASE[currentMode];
                    let perfectCount = 0;
                    let errors = [];

                    rules.forEach(rule => {
                        const p1 = results.poseLandmarks[rule.joints[0]];
                        const p2 = results.poseLandmarks[rule.joints[1]];
                        const p3 = results.poseLandmarks[rule.joints[2]];
                        if(p1 && p2 && p3) {
                            const angle = calculateAngle(p1, p2, p3);
                            if (angle < rule.min || angle > rule.max) errors.push(rule.msg);
                            else perfectCount++;
                        }
                    });

                    if (perfectCount === rules.length) {
                        poseResultsDiv.innerHTML = `<span style="color: var(--success-color); font-weight: bold;">PERFECT!</span>`;
                        statusDisplay.classList.add('perfect'); statusDisplay.classList.remove('error');
                        let poseName = currentMode === 'warrior' ? '戰士一式' : '平舉';
                        saveDailyRecord(poseName, 'Perfect'); 
                    } else {
                        poseResultsDiv.innerHTML = errors.map(e => `<div style="color: var(--error-color);">${e}</div>`).join('');
                        statusDisplay.classList.add('error'); statusDisplay.classList.remove('perfect');
                    }
                }
            }
        } catch (e) {}
    }
    canvasCtx.restore();
}

// 啟動 MediaPipe 相機設定
const pose = new Pose({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`});
pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await pose.send({image: videoElement}); },
    width: undefined, height: undefined
});
