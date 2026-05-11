// 🌟 1. 引入 Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, collection, query, orderBy, limit, getDocs, increment, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 🌟 2. Firebase 配置 
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
// 1. 取得 HTML 元素
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

// ==========================================
// 全域變數 & 瑜珈資料庫
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

const YOGA_DATABASE = {
    "Raise": [
        { name: "L_Arm", joints: [11, 13, 15], min: 150, max: 180, msg: "左手請伸直" },
        { name: "R_Arm", joints: [12, 14, 16], min: 150, max: 180, msg: "右手請伸直" }
    ]
};

// ==========================================
// 🌟 Firebase 身份驗證邏輯
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
// 資料儲存與歷史紀錄系統
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
        if(listItems.length > 0) {
            listContainer.innerHTML = listItems.join('');
        }
    } catch (e) { console.error("讀取紀錄失敗", e); }
}

function renderHistoryChart(labels, dataPoints) {
    const ctx = document.getElementById('historyChart').getContext('2d');
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
// 🌟 核心：集中處理動作成功與換場邏輯
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
            // 🌟 新增用語音：延遲 1.5 秒再唸，避免跟成功祝賀語音重疊
            setTimeout(() => {
                speakHint(`完美！休息一下，5秒後進入${nextPoseName}`, 500);
            }, 1500);

            setTimeout(() => {
                switchPose(nextPose);
                if(btnFlow) btnFlow.classList.add('active'); 
                isTransitioning = false; 
                if (saveStatusDiv) {
                    saveStatusDiv.innerText = `👉 請開始動作：${nextPoseName}`;
                    saveStatusDiv.style.color = "#f39c12";
                }
                // 🌟 新增用語音：休息結束，提示開始動作
                speakHint(`請開始動作：${nextPoseName}`, 500);
            }, 5000);
            
        } else {
            if (saveStatusDiv) {
                saveStatusDiv.innerHTML = `🏆 <b>恭喜你！今日瑜珈挑戰全數完成！</b>`;
                saveStatusDiv.style.color = "#ff4757";
            }
            // 🌟 新增用語音：全部通關祝賀
            setTimeout(() => {
                speakHint("恭喜你！今日瑜珈挑戰全數完成！你太棒了！", 500);
            }, 1500);
            isRoutineMode = false;
            isTransitioning = false;
            if(btnFlow) btnFlow.classList.remove('active');
            
            setTimeout(() => { if(!isHistoryVisible && toggleHistoryBtn) toggleHistoryBtn.click(); }, 2000); 
        }
    } else {
        if (saveStatusDiv) {
            saveStatusDiv.innerText = `🌟 完美${poseNameChinese}！已記錄！`;
            saveStatusDiv.style.color = "var(--success-color)";
        }
    }
}

// ==========================================
// 2. 綁定按鈕事件與切換邏輯
// ==========================================
function switchPose(poseName) {
    currentPoseMode = poseName;
    canSave = true; 
    perfectStartTime = 0;
    hasSavedThisRep = false;

    if (saveStatusDiv) saveStatusDiv.innerText = '';

    [btnTree, btnSquat, btnRaise].forEach(btn => btn?.classList.remove('active'));
    if(btnFlow) btnFlow.classList.remove('active');
    statusDisplay.classList.remove('error', 'perfect');

    if (poseName === 'tree') {
        if(btnTree) btnTree.classList.add('active');
        poseTitle.innerText = "大樹式偵測";
        treeInfo.style.display = 'block';
        squatInfo.style.display = 'none';
        genericInfo.style.display = 'none';
    } else if (poseName === 'squat') {
        if(btnSquat) btnSquat.classList.add('active');
        poseTitle.innerText = "深蹲偵測";
        treeInfo.style.display = 'none';
        squatInfo.style.display = 'block';
        genericInfo.style.display = 'none';
    } else if (poseName === 'Raise') {
        if(btnRaise) btnRaise.classList.add('active');
        poseTitle.innerText = "平舉偵測";
        treeInfo.style.display = 'none';
        squatInfo.style.display = 'none';
        genericInfo.style.display = 'block';
    }
}

startBtn.addEventListener('click', startApp);

btnTree?.addEventListener('click', () => { isRoutineMode = false; switchPose('tree'); });
btnSquat?.addEventListener('click', () => { isRoutineMode = false; switchPose('squat'); });
btnRaise?.addEventListener('click', () => { isRoutineMode = false; switchPose('Raise'); });

if (btnFlow) {
    btnFlow.addEventListener('click', () => {
        isRoutineMode = true;
        currentRoutineIndex = 0; 
        isTransitioning = false;
        
        switchPose(yogaRoutine[currentRoutineIndex]); 
        btnFlow.classList.add('active'); 
        
        setTimeout(() => {
            if (saveStatusDiv) {
                saveStatusDiv.innerText = "🧘‍♀️ 瑜珈挑戰開始！請準備第一個動作";
                saveStatusDiv.style.color = "#f39c12";
            }
            // 🌟 新增用語音：宣告挑戰開始
            speakHint("瑜珈挑戰開始！請準備第一個動作", 500);
        }, 100);
    });
}

// ==========================================
// 3. 核心功能函式與語音
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
    landingPage.style.opacity = '0';
    setTimeout(() => {
        landingPage.style.display = 'none';
        mainApp.style.display = 'flex';
        camera.start(); 
    }, 500);
}

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
// 4. AI 偵測邏輯
// ==========================================
function onResults(results) {
    if (loadingDiv.style.display !== 'none') {
        loadingDiv.style.display = 'none';
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

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
            const landmarks = results.poseLandmarks;
            const shoulder = landmarks[12]; const elbow = landmarks[14]; const wrist = landmarks[16];    
            const hip = landmarks[24]; const knee = landmarks[26]; const ankle = landmarks[28];    

            if (shoulder && elbow && wrist && hip && knee && ankle) {
                const elbowAngle = calculateAngle(shoulder, elbow, wrist); 
                const shoulderAngle = calculateAngle(hip, shoulder, elbow); 
                const kneeAngle = calculateAngle(hip, knee, ankle);        
                const legAngle = calculateAngle(shoulder, hip, knee);      

                // === 大樹式 ===
                if (currentPoseMode === 'tree') {
                    let isArmError = false; let isLegError = false;

                    if (elbowAngle < 160) {
                        armStatusDiv.innerText = "錯誤：手肘彎曲了！請伸直。"; armStatusDiv.style.color = "var(--error-color)"; isArmError = true;
                    } else if (shoulderAngle < 75) {
                        armStatusDiv.innerText = "錯誤：手臂掉下來了！請抬高。"; armStatusDiv.style.color = "var(--error-color)"; isArmError = true;
                    } else if (shoulderAngle > 105) {
                        armStatusDiv.innerText = "錯誤：手臂舉太高了！請放平。"; armStatusDiv.style.color = "var(--error-color)"; isArmError = true;
                    } else {
                        armStatusDiv.innerText = "手臂 PERFECT！"; armStatusDiv.style.color = "var(--success-color)";
                    }

                    if (legAngle > 110) {
                        legStatusDiv.innerText = "錯誤：再抬高腿！"; legStatusDiv.style.color = "var(--error-color)"; isLegError = true;
                    } else if (legAngle < 75) {
                        legStatusDiv.innerText = "錯誤：腳低一點！"; legStatusDiv.style.color = "var(--error-color)"; isLegError = true;
                    } else if (kneeAngle < 160) {
                        legStatusDiv.innerText = "錯誤：請把腳伸直！"; legStatusDiv.style.color = "var(--error-color)"; isLegError = true;
                    } else {
                        legStatusDiv.innerText = "完美抬腿！"; legStatusDiv.style.color = "var(--success-color)";
                    }

                    if (isArmError || isLegError) {
                        statusDisplay.classList.add('error'); statusDisplay.classList.remove('perfect');
                        perfectStartTime = 0; hasSavedThisRep = false; 
                    } else {
                        statusDisplay.classList.remove('error'); statusDisplay.classList.add('perfect');
                        
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;

                        if (holdDuration >= 5000) {
                            if (!hasSavedThisRep) handlePoseSuccess('大樹式');
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            armStatusDiv.innerText = `PERFECT! 請維持 ${secondsLeft} 秒...`; 
                            armStatusDiv.style.color = "var(--success-color)";
                        }
                    }

                // === 深蹲 ===
                } else if (currentPoseMode === 'squat') {
                    const squatHipAngle = calculateAngle(shoulder, hip, knee);   
                    const squatKneeAngle = calculateAngle(hip, knee, ankle);    
                    
                    let squatStatus = "請開始深蹲"; let squatColor = "white";

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

                    if (squatColor === 'var(--error-color)') {
                        squatStatusDiv.innerText = squatStatus; squatStatusDiv.style.color = squatColor;
                        statusDisplay.classList.add('error'); statusDisplay.classList.remove('perfect');
                        perfectStartTime = 0; hasSavedThisRep = false;
                    } else if (squatColor === 'var(--success-color)') {
                        statusDisplay.classList.remove('error'); statusDisplay.classList.add('perfect');
                        
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;

                        if (holdDuration >= 5000) {
                            if (!hasSavedThisRep) handlePoseSuccess('深蹲');
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            squatStatusDiv.innerText = `HOLD 住了！請維持 ${secondsLeft} 秒...`;
                            squatStatusDiv.style.color = squatColor;
                        }
                    } else {
                        squatStatusDiv.innerText = squatStatus; squatStatusDiv.style.color = squatColor;
                        statusDisplay.classList.remove('error', 'perfect');
                        perfectStartTime = 0; hasSavedThisRep = false;
                    }

                // === 平舉 ===
                } else if (currentPoseMode === 'Raise') {
                    const rules = YOGA_DATABASE[currentPoseMode];
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
                        statusDisplay.classList.add('perfect'); statusDisplay.classList.remove('error');
                        
                        if (perfectStartTime === 0) perfectStartTime = Date.now();
                        const holdDuration = Date.now() - perfectStartTime;

                        if (holdDuration >= 5000) { 
                            if (!hasSavedThisRep) handlePoseSuccess('平舉');
                            speakHint("平舉完成，太棒了！", 1000);
                        } else {
                            const secondsLeft = Math.ceil((5000 - holdDuration) / 1000);
                            poseResultsDiv.innerHTML = `<span style="color: var(--success-color); font-weight: bold;">PERFECT! 請維持 ${secondsLeft} 秒...</span>`;
                            speakHint("平舉姿勢完美，請撐住"); 
                        }
                    } else {
                        poseResultsDiv.innerHTML = errors.map(e => `<div style="color: var(--error-color); margin-bottom: 5px;">${e}</div>`).join('');
                        statusDisplay.classList.add('error'); statusDisplay.classList.remove('perfect');
                        perfectStartTime = 0; hasSavedThisRep = false;

                        if (errors.length > 0) speakHint(errors[0]); 
                    }
                }
            }
        } catch (e) {}
    }
    canvasCtx.restore();
}

// ==========================================
// 5. 初始化 MediaPipe 與相機
// ==========================================
const pose = new Pose({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
}});
pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
pose.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => { await pose.send({image: videoElement}); },
    width: 640, height: 480
});

// ==========================================
// 🏆 排行榜系統
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
// 👤 個人中心與數據視覺化系統 (改為底部展開面板)
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
            // 顯示介面
            profileContainer.style.display = 'block';
            btnProfile.innerText = '隱藏個人中心';
            btnProfile.style.backgroundColor = '#ff4757';
            profileContainer.scrollIntoView({ behavior: 'smooth' });
            
            // 1. 載入基本資料
            profileName.innerText = currentUser.displayName || '瑜珈達人';
            profileAvatar.src = currentUser.photoURL || 'https://via.placeholder.com/80?text=User';

            // 2. 讀取積分與段位
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

            // 3. 讀取歷史分析
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
            // 隱藏介面
            profileContainer.style.display = 'none';
            btnProfile.innerText = '👤 個人中心';
            btnProfile.style.backgroundColor = '#9b59b6';
        }
    });
}

function drawPreferenceChart(dataPoints) {
    const ctx = document.getElementById('posePreferenceChart').getContext('2d');
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
