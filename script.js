// ==========================================
// 🌟 1. 引入 Firebase SDK
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth,signInWithPopup,GoogleAuthProvider,onAuthStateChanged,signOut} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
const landingPage = document.getElementById("landing-page");
const homeView = document.getElementById("home-view");
const workoutView = document.getElementById("workout-view");
const actionsGrid = document.getElementById("actions-grid");
const btnBackHome = document.getElementById("btn-back-home");

// --- 🌟 新增：左側控制區元素 ---
const quickSwitchSelect = document.getElementById("quick-switch-select");
const btnTutorial = document.getElementById("btn-tutorial");
const tutorialVideoContainer = document.getElementById("tutorial-video-container");
const tutorialVideo = document.getElementById("tutorial-video");
// --------------------------------
const currentWorkoutTitle = document.getElementById("current-workout-title");

const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement?.getContext("2d");
const loadingDiv = document.getElementById("loading");

const statusDisplay = document.getElementById("status-display");
const poseTitle = document.getElementById("pose-title");
const treeInfo = document.getElementById("tree-info");
const squatInfo = document.getElementById("squat-info");
const genericInfo = document.getElementById("generic-info");
const armStatusDiv = document.getElementById("arm-status");
const legStatusDiv = document.getElementById("leg-status");
const squatStatusDiv = document.getElementById("squat-status");
const poseResultsDiv = document.getElementById("pose-results");
const saveStatusDiv = document.getElementById("save-status");

const loginBtn = document.getElementById("login-btn");
const startBtn = document.getElementById("start-btn");
const logoutBtn = document.getElementById("logout-btn");
const userWelcome = document.getElementById("user-welcome");
const userDisplay = document.getElementById("user-display");

// 彈窗相關元素
const introModal = document.getElementById("intro-modal");
const introTitle = document.getElementById("intro-title");
const introVideo = document.getElementById("intro-video");
const introImage = document.getElementById("intro-image");
const introDesc = document.getElementById("intro-desc");
const introTips = document.getElementById("intro-tips");
const introStartBtn = document.getElementById("intro-start-btn");

// 上方抽屜面板元素
const btnProfile = document.getElementById("btn-profile");
const profileContainer = document.getElementById("profile-container");
const toggleFavoritesBtn = document.getElementById("toggle-favorites-btn");
const favoritesContainer = document.getElementById("favorites-container");
const toggleLeaderboardBtn = document.getElementById("toggle-leaderboard-btn");
const leaderboardContainer = document.getElementById("leaderboard-container");

// 設定
const HOLD_MS = 5000;
const SPEECH_MIN_GAP = 2500;
const SPEECH_REPEAT_GAP = 6000;
const COLOR_OK = "var(--success-text, #17a35a)";
const COLOR_ERR = "var(--error-text, #e8435a)";

const AVATAR_FALLBACK =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        "<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'>" +
        "<rect width='80' height='80' fill='#dfe4ea'/>" +
        "<text x='50%' y='60%' font-size='40' text-anchor='middle'>👤</text>" +
        "</svg>"
    );

const RAISE = {
    bothTooLow: 60,
    tooHigh: 115,
    minRaise: 65,
    elbowMin: 140
};


// ==========================================
// 🌟 4. 原本的三個動作資料庫
// ==========================================
const POSE_DATABASE = [
    {
        id: "tree",
        title: "大樹式",
        subtitle: "Tree Pose",
        img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=600&q=80",
        videoUrl: "https://youtube.com/shorts/jMez5L0w4yI?si=EziVERqG7C-uGJfH",
        desc: "大樹式能訓練下肢肌力、單腳平衡感與專注度。",
        tips: [
            "單腳伸直站穩，另一腳曲膝抬起貼於大腿或小腿內側",
            "切勿將腳掌直接壓在支撐腳膝蓋關節上",
            "雙手向上高舉打直伸展，或於胸前合十"
        ]
    },
    {
        id: "squat",
        title: "深蹲",
        subtitle: "Squat",
        img: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=600&q=80",
        videoUrl: "https://youtube.com/shorts/PpP98TMiVKY?si=PIFfjJn1-IQ1KbSX",
        desc: "深蹲能強化臀大肌、股四頭肌與核心穩定度。",
        tips: [
            "雙腳與肩同寬，腳尖微外展 15-30 度",
            "臀部向後坐，下蹲時膝蓋不超過腳尖過多",
            "背部自然打直，胸口向前挺起"
        ]
    },
    {
        id: "Raise",
        title: "平舉",
        subtitle: "Raise",
        img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=80",
        videoUrl: "",
        desc: "平舉能增強肩膀三角肌與上肢控制力。",
        tips: [
            "雙臂向兩側抬起與地面平行",
            "手臂全程伸直勿微彎",
            "放鬆頸部勿過度聳肩"
        ]
    }
];

// 共用工具
function normalizePoseName(name) {
    return name === "側平舉" ? "平舉" : name;
}

function countPerfectPoses(querySnapshot) {
    const poseCounts = POSE_DATABASE.map(({ title }) => ({
        title,
        count: 0
    }));

    querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.status !== "Perfect") return;

        const pose = poseCounts.find(
            item => item.title === normalizePoseName(data.lastPose)
        );

        if (pose) pose.count++;
    });

    return poseCounts;
}

function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[ch]));
}

function withUiTimeout(operation, timeoutMs = 12000) {
    let timer;

    const timeout = new Promise((_, reject) => {
        timer = setTimeout(
            () => reject(new Error("連線逾時，請稍後重試。")),
            timeoutMs
        );
    });

    return Promise.race([operation, timeout])
        .finally(() => clearTimeout(timer));
}

// ==========================================
// 5. 全域狀態變數
// ==========================================
let currentPoseMode = "tree";
let selectedPoseId = "tree";
let currentUser = null;
let canSave = true;
let perfectStartTime = 0;
let hasSavedThisRep = false;
let isIntroActive = false;
let pendingPose = null;
let cameraActive = false;
let countdownTimer = null;

let favoritesChart = null;
let favoritesLoadVersion = 0;

let checkInDates = new Set();
let checkInCalendarMonth = getCheckInDateKey().slice(0, 7);
let checkInLoadState = "idle";
let checkInSaveFailed = false;
let checkInLoadVersion = 0;
const checkInWrites = new Map();

let lastSpeakTime = 0;
const lastSpokenAt = new Map();
let frameHints = [];
let activeUtterance = null;
let speechQueue = [];

let pose = null;
let camera = null;

// 未完成登入或查詢前，也先顯示完整月曆。
renderCheckInCalendar();

// ==========================================
// 🌟 6. Firebase 身份驗證邏輯
// ==========================================
onAuthStateChanged(auth, user => {
    if (user) {
        const userChanged = currentUser?.uid !== user.uid;
        currentUser = user;

        if (userChanged) {
            closeAllPanels();
            resetCheckInCalendar();
        }

        void recordDailyCheckIn(user);

        if (loginBtn) loginBtn.style.display = "none";
        if (startBtn) startBtn.style.display = "block";

        if (userWelcome) {
            userWelcome.innerText =
                `準備好了嗎，${user.displayName || "瑜珈夥伴"}？`;
        }

        if (userDisplay) {
            userDisplay.innerText =
                `使用者：${user.displayName || "已登入"}`;
        }
    } else {
        currentUser = null;
        closeAllPanels();
        resetCheckInCalendar();

        if (loginBtn) loginBtn.style.display = "block";
        if (startBtn) startBtn.style.display = "none";

        if (userWelcome) {
            userWelcome.innerText = "請先登入以記錄你的練習成果";
        }

        if (landingPage) landingPage.style.display = "flex";
        if (homeView) homeView.style.display = "none";
        if (workoutView) workoutView.style.display = "none";

        leaveWorkoutCleanup();
    }
});

loginBtn?.addEventListener("click", () => {
    signInWithPopup(auth, provider).catch(err => {
        console.error("登入失敗", err);
        alert("登入失敗：" + (err.message || "請檢查網路連線"));
    });
});

startBtn?.addEventListener("click", () => {
    if (landingPage) landingPage.style.display = "none";
    if (homeView) homeView.style.display = "flex";
    renderActionGrid();
});

logoutBtn?.addEventListener("click", () => {
    signOut(auth);
});

// ==========================================
// 7. 首頁動態渲染 3 個動作卡片
// ==========================================
function renderActionGrid() {
    if (!actionsGrid) return;

    actionsGrid.innerHTML = "";

    POSE_DATABASE.forEach(poseItem => {
        const card = document.createElement("div");
        card.className = "action-card";

        card.innerHTML = `
            <div class="card-media">
                <img src="${poseItem.img}" alt="${poseItem.title}" loading="lazy">
            </div>
            <div class="card-body">
                <div>
                    <h4 class="card-title">${poseItem.title}</h4>
                    <span style="font-size: 0.9rem; color: #a4b0be;">
                        ${poseItem.subtitle}
                    </span>
                </div>
                <span class="card-tag">● 開始練習</span>
            </div>
        `;

        card.addEventListener("click", () => enterWorkout(poseItem.id));
        actionsGrid.appendChild(card);
    });
}

function enterWorkout(poseId) {
    closeAllPanels();

    if (homeView) homeView.style.display = "none";
    if (workoutView) workoutView.style.display = "flex";

    selectedPoseId = poseId;

    const poseItem = POSE_DATABASE.find(p => p.id === poseId);

    if (currentWorkoutTitle && poseItem) {
        currentWorkoutTitle.innerText = `${poseItem.title} 練習室`;
    }

    // 🌟   新增：進入練習室時，讓左側下拉選單切換到正確的動作
    // 確保選單 value 與動作 id 的大小寫一致（新版直接使用 Raise）。
    if (quickSwitchSelect) quickSwitchSelect.value = poseId;

    showPoseUI(poseId);
    startCamera();
    openPoseIntro(poseId);
}

btnBackHome?.addEventListener("click", () => {
    if (workoutView) workoutView.style.display = "none";
    if (homeView) homeView.style.display = "flex";
    leaveWorkoutCleanup();
});

function leaveWorkoutCleanup() {
    stopCamera();
    // 新增：返回首頁時，強制關閉並暫停教學影片
    closeTutorial();
    cancelCountdown();

    if (introModal) introModal.style.display = "none";

    isIntroActive = false;
    pendingPose = null;

    stopSpeaking();
    resetHold();
}

// ==========================================
// 12. 初始化 MediaPipe
// ==========================================
// 新版將原第 12 節移至此處，於開啟鏡頭時才初始化模型。
// 鏡頭與模型
function initializePoseTracking() {
    if (pose && camera) return;

    if (typeof Pose !== "function" || typeof Camera !== "function") {
        const error = new Error("姿勢辨識元件尚未載入");
        error.name = "ModelLoadError";
        throw error;
    }

    pose = new Pose({
        locateFile: file =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5/${file}`
    });

    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    pose.onResults(onResults);

    camera = new Camera(videoElement, {
        onFrame: async () => {
            await pose.send({ image: videoElement });
        },
        width: 800,
        height: 450
    });
}

async function startCamera() {
    if (cameraActive) return;

    try {
        initializePoseTracking();
        await camera.start();
        cameraActive = true;
    } catch (err) {
        console.error("無法開啟鏡頭", err);
        cameraActive = false;
        showCameraError(err);
    }
}

function stopCamera() {
    if (!cameraActive) return;
    camera.stop();
    cameraActive = false;
}

function showCameraError(err) {
    let msg = "無法開啟鏡頭，請檢查裝置與瀏覽器設定。";

    if (err?.name === "NotAllowedError") {
        msg = "鏡頭權限被拒絕，請點網址列左邊的鎖頭圖示允許使用鏡頭，然後重新整理頁面。";
    } else if (err?.name === "NotFoundError") {
        msg = "找不到鏡頭裝置，請確認鏡頭已連接。";
    } else if (err?.name === "NotReadableError") {
        msg = "鏡頭可能正被其他程式使用，請關閉後再試一次。";
    } else if (err?.name === "ModelLoadError") {
        msg = "姿勢辨識元件尚未載入，請檢查網路後重新整理頁面。個人中心與我的最愛仍可使用。";
    }

    if (loadingDiv) {
        loadingDiv.innerText = msg;
        loadingDiv.style.display = "";
    } else {
        alert(msg);
    }
}

// ==========================================
// 8.左側控制面板功能：下拉快速切換 & 教學影片
// ==========================================
function closeTutorial() {
    if (tutorialVideoContainer) {
        tutorialVideoContainer.classList.add("hidden-container");
    }

    if (tutorialVideo) tutorialVideo.pause();
}

// 1. 監聽下拉式選單的切換
quickSwitchSelect?.addEventListener("change", e => {
    // 新版直接使用選單值；HTML option value 須與資料庫 id 的大小寫一致。
    const poseId = e.target.value;
    selectedPoseId = poseId;

    // 更新上方的標題
    const poseItem = POSE_DATABASE.find(p => p.id === poseId);
    if (currentWorkoutTitle && poseItem) {
        currentWorkoutTitle.innerText = `${poseItem.title} 練習室`;
    }

    // 如果教學影片正在播，切換動作時自動關閉
    closeTutorial();
    showPoseUI(poseId);
    // 重新呼叫倒數 3 秒的引導畫面，並進行切換
    openPoseIntro(poseId);
});

// 2. 監聽「教學」按鈕的點擊
btnTutorial?.addEventListener("click", () => {
    if (!tutorialVideoContainer || !tutorialVideo) return;

    // 檢查目前影片區塊是隱藏還是顯示狀態
    const isHidden =
        tutorialVideoContainer.classList.contains("hidden-container");

    if (!isHidden) {
        // 如果原本已經是開啟狀態，再次點擊就會隱藏並暫停影片
        closeTutorial();
        return;
    }

    // 從資料庫找出目前的動作，並取得你設定的影片網址
    const poseItem = POSE_DATABASE.find(p => p.id === selectedPoseId);

    if (!poseItem?.videoUrl) {
        alert("這個動作尚未設定教學影片");
        return;
    }

    if (tutorialVideo.getAttribute("src") !== poseItem.videoUrl) {
        tutorialVideo.src = poseItem.videoUrl;
    }

    // 顯示影片並自動播放
    tutorialVideoContainer.classList.remove("hidden-container");

    tutorialVideo.play().catch(err => {
        console.warn("教學影片無法自動播放", err);
    });
});

// ==========================================
// 9. 彈窗與 3 秒倒數計時
// ==========================================
// 動作介紹與倒數
function openPoseIntro(poseKey) {
    stopSpeaking();
    cancelCountdown();

    const guide = POSE_DATABASE.find(p => p.id === poseKey);

    if (!guide || !introModal) {
        startCountdownForPose(poseKey);
        return;
    }

    pendingPose = poseKey;
    isIntroActive = true;
    resetHold();

    if (introTitle) {
        introTitle.innerText = `${guide.title} (${guide.subtitle})`;
    }

    if (introDesc) introDesc.innerText = guide.desc;

    if (introTips) {
        introTips.innerHTML = guide.tips
            .map(tip => `<li>${tip}</li>`)
            .join("");
    }

    if (introVideo) introVideo.style.display = "none";

    if (introImage) {
        introImage.src = guide.img;
        introImage.style.display = "block";
    }

    introModal.style.display = "flex";
}

introStartBtn?.addEventListener("click", () => {
    if (introModal) introModal.style.display = "none";
    isIntroActive = false;

    if (pendingPose) startCountdownForPose(pendingPose);
});

function cancelCountdown() {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
    }

    const overlay = document.getElementById("countdown-overlay");
    if (overlay) overlay.style.display = "none";
}

function startCountdownForPose(poseKey) {
    const overlay = document.getElementById("countdown-overlay");
    const numberDiv = document.getElementById("countdown-number");
    const guide = POSE_DATABASE.find(p => p.id === poseKey);

    if (!overlay || !numberDiv) {
        switchPose(poseKey);
        return;
    }

    cancelCountdown();

    overlay.style.display = "flex";
    let count = 3;
    numberDiv.innerText = count;

    speakHint("準備開始", { priority: true });

    countdownTimer = setInterval(() => {
        count--;

        if (count > 0) {
            numberDiv.innerText = count;
        } else {
            cancelCountdown();
            switchPose(poseKey);

            speakHint(
                `開始${guide ? guide.title : poseKey}，請就定位`,
                { priority: true }
            );
        }
    }, 1000);
}

function switchPose(poseName) {
    currentPoseMode = poseName;
    selectedPoseId = currentPoseMode;
    canSave = true;

    resetHold();

    if (saveStatusDiv) saveStatusDiv.innerText = "";
    showPoseUI(currentPoseMode);
}

function showPoseUI(poseId) {
    setStatus("neutral");

    if (treeInfo) {
        treeInfo.style.display = poseId === "tree" ? "block" : "none";
    }

    if (squatInfo) {
        squatInfo.style.display = poseId === "squat" ? "block" : "none";
    }

    if (genericInfo) {
        genericInfo.style.display = poseId === "Raise" ? "block" : "none";
    }

    const poseItem = POSE_DATABASE.find(p => p.id === poseId);

    if (poseTitle) {
        poseTitle.innerText =
            `${poseItem ? poseItem.title : poseId} 偵測`;
    }

    if (poseId === "tree") {
        setText(armStatusDiv, "手部請舉過頭頂，或於胸前合十", "");
        setText(legStatusDiv, "請單腳站穩，另一腳曲膝抬高貼於腿側", "");
    } else if (poseId === "squat") {
        setText(squatStatusDiv, "請開始深蹲", "");
    } else if (poseId === "Raise") {
        setText(poseResultsDiv, "請將雙臂向兩側抬起至肩膀高度", "");
    }
}

// ==========================================
// 10. 幾何運算與語音提示
// ==========================================
// 幾何運算
function calculateAngle(a, b, c) {
    const W = canvasElement?.width || 800;
    const H = canvasElement?.height || 450;

    const ax = a.x * W;
    const ay = a.y * H;
    const bx = b.x * W;
    const by = b.y * H;
    const cx = c.x * W;
    const cy = c.y * H;

    const radians =
        Math.atan2(cy - by, cx - bx) -
        Math.atan2(ay - by, ax - bx);

    let angle = Math.abs(radians * 180 / Math.PI);
    if (angle > 180) angle = 360 - angle;

    return angle;
}

// 語音：完整唸完一句，才播放下一句。
function stopSpeaking() {
    // 🌟 關鍵修正：離開練習室或切換引導畫面時，清除語音與佇列，避免殘留播放狀態。
    activeUtterance = null;
    speechQueue = [];
    frameHints = [];
    lastSpeakTime = 0;
    lastSpokenAt.clear();

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}

function speakNow(text) {
    if (!("speechSynthesis" in window) || activeUtterance) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-TW";
    utterance.rate = 1.1;

    activeUtterance = utterance;

    const finishSpeaking = () => {
        if (activeUtterance !== utterance) return;

        activeUtterance = null;

        if (speechQueue.length > 0) {
            speakNow(speechQueue.shift());
        }
    };

    utterance.onend = finishSpeaking;
    utterance.onerror = finishSpeaking;

    const now = Date.now();
    lastSpeakTime = now;
    lastSpokenAt.set(text, now);

    window.speechSynthesis.speak(utterance);
}

function speakHint(text, { priority = false } = {}) {
    if (!("speechSynthesis" in window)) return;

    if (activeUtterance?.text === text || speechQueue.includes(text)) {
        return;
    }

    // 檢查冷卻時間，避免同時間狂念
    if (!priority) {
        const now = Date.now();

        if (now - lastSpeakTime < SPEECH_MIN_GAP) return;

        if (
            now - (lastSpokenAt.get(text) || 0) <
            SPEECH_REPEAT_GAP
        ) {
            return;
        }
    }

    if (activeUtterance) {
        speechQueue.push(text);
        return;
    }

    speakNow(text);
}

function queueHint(text) {
    if (!frameHints.includes(text)) frameHints.push(text);
}

function flushHints() {
    const hints = frameHints;
    frameHints = [];

    if (hints.length === 0 || activeUtterance) return;

    const now = Date.now();
    if (now - lastSpeakTime < SPEECH_MIN_GAP) return;

    const candidates = hints
        .filter(text =>
            now - (lastSpokenAt.get(text) || 0) >= SPEECH_REPEAT_GAP
        )
        .sort((a, b) =>
            (lastSpokenAt.get(a) || 0) -
            (lastSpokenAt.get(b) || 0)
        );

    if (candidates.length > 0) speakNow(candidates[0]);
}

// 狀態與保持時間
function setStatus(state) {
    statusDisplay?.classList.toggle("error", state === "error");
    statusDisplay?.classList.toggle("perfect", state === "perfect");
}

function setText(el, text, color) {
    if (!el) return;

    el.innerText = text;
    if (color !== undefined) el.style.color = color;
}

function resetHold() {
    perfectStartTime = 0;
    hasSavedThisRep = false;
}

function updateHold(isPerfect, poseNameChinese) {
    if (!isPerfect) {
        resetHold();
        return null;
    }

    if (perfectStartTime === 0) {
        perfectStartTime = Date.now();
        speakHint("很好，請保持"); // 🌟 補上這行語音
    }

    const held = Date.now() - perfectStartTime;

    if (held >= HOLD_MS) {
        if (!hasSavedThisRep) handlePoseSuccess(poseNameChinese);
        return 0;
    }

    return Math.ceil((HOLD_MS - held) / 1000);
}

// ==========================================
// 11. AI 偵測主邏輯
// ==========================================
// === 大樹式 ===
function analyzeTree(lm) {
    const shoulderL = lm[11];
    const elbowL = lm[13];
    const wristL = lm[15];

    const shoulderR = lm[12];
    const elbowR = lm[14];
    const wristR = lm[16];

    const hipL = lm[23];
    const kneeL = lm[25];
    const ankleL = lm[27];

    const hipR = lm[24];
    const kneeR = lm[26];
    const ankleR = lm[28];

    let isArmError = false;
    let isLegError = false;

    const leftKneeAngle = calculateAngle(hipL, kneeL, ankleL);
    const rightKneeAngle = calculateAngle(hipR, kneeR, ankleR);

    const isRightLegLifted =
        ankleR.y < ankleL.y - 0.05 &&
        rightKneeAngle < 145;

    const isLeftLegLifted =
        ankleL.y < ankleR.y - 0.05 &&
        leftKneeAngle < 145;

    if (isRightLegLifted || isLeftLegLifted) {
        const supportName = isRightLegLifted ? "左" : "右";
        const liftName = isRightLegLifted ? "右" : "左";

        const supportAngle =
            isRightLegLifted ? leftKneeAngle : rightKneeAngle;

        if (supportAngle < 150) {
            setText(
                legStatusDiv,
                `錯誤：支撐腳（${supportName}腳）請伸直！`,
                COLOR_ERR
            );

            isLegError = true;
            queueHint("支撐腳請伸直"); // 🌟 補上這行語音
        } else {
            setText(
                legStatusDiv,
                `腿部 PERFECT！(${supportName}腳站穩，${liftName}腳抬起)`,
                COLOR_OK
            );
        }
    } else {
        setText(
            legStatusDiv,
            "請單腳站穩，另一腳曲膝抬高貼於腿側",
            COLOR_ERR
        );

        isLegError = true;
        queueHint("請單腳站立，另一腳曲膝貼於腿側"); // 🌟 補上這行語音
    }

    const leftElbowAngle =
        calculateAngle(shoulderL, elbowL, wristL);

    const rightElbowAngle =
        calculateAngle(shoulderR, elbowR, wristR);

    const isOverhead =
        wristL.y < shoulderL.y &&
        wristR.y < shoulderR.y;

    const isPraying =
        Math.abs(wristL.x - wristR.x) < 0.15 &&
        Math.abs(wristL.y - wristR.y) < 0.15 &&
        wristL.y < hipL.y &&
        wristL.y > shoulderL.y - 0.05;

    if (isOverhead) {
        if (leftElbowAngle < 125 || rightElbowAngle < 125) {
            setText(
                armStatusDiv,
                "錯誤：雙手高舉時請伸直手肘！",
                COLOR_ERR
            );

            isArmError = true;
            queueHint("雙手高舉時手肘請打直"); // 🌟 補上這行語音
        } else {
            setText(
                armStatusDiv,
                "手臂 PERFECT！(高舉伸展)",
                COLOR_OK
            );
        }
    } else if (isPraying) {
        setText(
            armStatusDiv,
            "手臂 PERFECT！(胸前合十)",
            COLOR_OK
        );
    } else {
        setText(
            armStatusDiv,
            "手部請舉過頭頂，或於胸前合十",
            COLOR_ERR
        );

        isArmError = true;
        queueHint("手部請舉過頭頂，或於胸前合十"); // 🌟 補上這行語音
    }

    const isPerfect = !isArmError && !isLegError;
    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, "大樹式");

    if (secondsLeft > 0) {
        setText(
            armStatusDiv,
            `PERFECT! 請維持平衡 ${secondsLeft} 秒...`,
            COLOR_OK
        );
    }
}

// === 深蹲 ===
// 🌟 避免單側被鏡頭遮擋：新版依關節可見度，選擇較清楚的一側。
function pickBodySide(lm) {
    const visibility = indexes => indexes.reduce(
        (sum, index) => sum + (lm[index]?.visibility ?? 0),
        0
    );

    return visibility([12, 24, 26, 28]) >=
        visibility([11, 23, 25, 27]) ? "R" : "L";
}

function analyzeSquat(lm) {
    const side = pickBodySide(lm);

    const indexes = side === "R"
        ? [12, 24, 26, 28]
        : [11, 23, 25, 27];

    const [shoulder, hip, knee, ankle] =
        indexes.map(index => lm[index]);

    const hipAngle = calculateAngle(shoulder, hip, knee);
    const kneeAngle = calculateAngle(hip, knee, ankle);

    let message = "請開始深蹲";
    let color = ""; // 預設沿用 CSS 文字色。
    let state = "neutral";
    let isPerfect = false;

    // 🌟 偵測門檻：膝蓋角度小於 140 度時開始回饋（維持新版設定）。
    if (kneeAngle < 140) {
        if (kneeAngle > 110) {
            message = "再蹲低一點！";
            // 🌟 使用警告文字色；未設定時採用 #c27803 暖色。
            color = "var(--warn-text, #c27803)";
            queueHint("再蹲低一點");
        } else if (hipAngle > 120) {
            message = "錯誤：屁股要翹高，身體不要太直！";
            color = COLOR_ERR;
            state = "error";
            queueHint("屁股要翹高，身體不要太直");
        } else {
            message = "標準深蹲！繼續保持！";
            color = COLOR_OK;
            state = "perfect";
            isPerfect = true;
        }
    }

    setText(squatStatusDiv, message, color);
    setStatus(state);

    const secondsLeft = updateHold(isPerfect, "深蹲");

    if (secondsLeft > 0) {
        setText(
            squatStatusDiv,
            `HOLD 住了！維持 ${secondsLeft} 秒...`,
            COLOR_OK
        );
    }
}

// ==================== [3] 平舉 ====================
function analyzeRaise(lm) {
    const shoulderL = lm[11];
    const elbowL = lm[13];
    const wristL = lm[15];

    const shoulderR = lm[12];
    const elbowR = lm[14];
    const wristR = lm[16];

    const hipL = lm[23];
    const hipR = lm[24];

    // 1. 手肘伸直角度 (左 11-13-15, 右 12-14-16)
    const leftElbowAngle =
        calculateAngle(shoulderL, elbowL, wristL);

    const rightElbowAngle =
        calculateAngle(shoulderR, elbowR, wristR);

    // 2. 手臂與軀幹抬起夾角 (左 23-11-13, 右 24-12-14)
    const leftArmRaise =
        calculateAngle(hipL, shoulderL, elbowL);

    const rightArmRaise =
        calculateAngle(hipR, shoulderR, elbowR);

    const messages = [];

    // 檢測雙臂是否抬至肩膀高度（新版以 RAISE 設定判斷：65° ~ 115°）。
    if (
        leftArmRaise < RAISE.bothTooLow &&
        rightArmRaise < RAISE.bothTooLow
    ) {
        messages.push("請將雙臂向兩側抬起至肩膀高度");
    } else if (
        leftArmRaise > RAISE.tooHigh ||
        rightArmRaise > RAISE.tooHigh
    ) {
        messages.push("手臂抬太高囉，與肩膀平行即可");
    } else {
        if (leftArmRaise < RAISE.minRaise) {
            messages.push("左手請再抬高一些");
        }

        if (rightArmRaise < RAISE.minRaise) {
            messages.push("右手請再抬高一些");
        }
    }

    // 檢測手肘是否打直
    if (messages.length === 0) {
        if (leftElbowAngle < RAISE.elbowMin) {
            messages.push("左手手肘請盡量打直");
        }

        if (rightElbowAngle < RAISE.elbowMin) {
            messages.push("右手手肘請盡量打直");
        }
    }

    // 狀態判斷與語音回饋
    const isPerfect = messages.length === 0;

    if (!isPerfect) {
        if (poseResultsDiv) {
            poseResultsDiv.innerHTML = messages
                .map(message => `
                    <span style="color: var(--error-text, #e8435a);">
                        ${message}
                    </span>
                `)
                .join("<br>");
        }

        // 新版將錯誤訊息交由語音佇列，依冷卻時間與最近播放時間選擇提示。
        messages.forEach(queueHint);
    }

    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, "平舉");

    // 雙臂達到標準
    if (isPerfect && poseResultsDiv) {
        poseResultsDiv.innerHTML = secondsLeft > 0
            ? `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 手臂維持平舉 ${secondsLeft} 秒...</span>`
            : `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 完成！</span>`;
    }
}

// AI 偵測主迴圈
function onResults(results) {
    if (loadingDiv && loadingDiv.style.display !== "none") {
        loadingDiv.style.display = "none";
    }

    if (!canvasCtx || !canvasElement) return;

    canvasCtx.save();
    canvasCtx.clearRect(
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
    );

    const countdownOverlay =
        document.getElementById("countdown-overlay");

    const isCountdownActive =
        countdownOverlay &&
        countdownOverlay.style.display === "flex";

    if (isIntroActive || isCountdownActive) {
        frameHints = [];

        if (results.poseLandmarks) {
            drawConnectors(
                canvasCtx,
                results.poseLandmarks,
                POSE_CONNECTIONS,
                { color: "#7f8c8d", lineWidth: 2 }
            );

            drawLandmarks(
                canvasCtx,
                results.poseLandmarks,
                { color: "#bdc3c7", lineWidth: 1 }
            );
        }

        canvasCtx.restore();
        return;
    }

    if (results.poseLandmarks) {
        drawConnectors(
            canvasCtx,
            results.poseLandmarks,
            POSE_CONNECTIONS,
            { color: "#00FF00", lineWidth: 4 }
        );

        drawLandmarks(
            canvasCtx,
            results.poseLandmarks,
            { color: "#FF0000", lineWidth: 2 }
        );

        try {
            const landmarks = results.poseLandmarks;

            switch (currentPoseMode) {
                case "tree":
                    analyzeTree(landmarks);
                    break;
                case "squat":
                    analyzeSquat(landmarks);
                    break;
                case "Raise":
                    analyzeRaise(landmarks);
                    break;
            }
        } catch (error) {
            console.warn("Pose processing error:", error);
        }
    } else {
        resetHold();
        setStatus("neutral");
    }

    flushHints();
    canvasCtx.restore();
}

function handlePoseSuccess(poseNameChinese) {
    saveDailyRecord(poseNameChinese, "Perfect");
    hasSavedThisRep = true;

    if (saveStatusDiv) {
        saveStatusDiv.innerText =
            `🌟 完美${poseNameChinese}！已記錄！`;

        saveStatusDiv.style.color = COLOR_OK;
    }

    speakHint(
        `太棒了！${poseNameChinese}完成！`,
        { priority: true }
    );
}

// ==========================================
// 13. 資料庫儲存與查詢核心
// ==========================================
// 練習紀錄與積分
async function saveDailyRecord(poseType, status) {
    if (!currentUser || !canSave) return;

    canSave = false;

    const today = new Date()
        .toLocaleDateString("zh-TW")
        .replace(/\//g, "-");

    const historyCol = collection(
        db,
        "users",
        currentUser.uid,
        "history"
    );

    try {
        await addDoc(historyCol, {
            date: today,
            lastPose: poseType,
            status,
            timestamp: new Date()
        });

        uploadScore(10);

        setTimeout(() => {
            canSave = true;
        }, 5000);
    } catch (error) {
        console.error("儲存紀錄失敗", error);
        canSave = true;
    }
}

async function uploadScore(points) {
    if (!currentUser) return;

    const userLeaderboardRef = doc(
        db,
        "leaderboard",
        currentUser.uid
    );

    try {
        await setDoc(userLeaderboardRef, {
            name: currentUser.displayName,
            score: increment(points),
            lastUpdate: new Date()
        }, { merge: true });
    } catch (error) {
        console.error("更新排行榜分數失敗", error);
    }
}

// 個人中心與面板
// 關閉所有抽屜面板
function closeAllPanels() {
    if (profileContainer) profileContainer.style.display = "none";
    if (favoritesContainer) favoritesContainer.style.display = "none";
    if (leaderboardContainer) leaderboardContainer.style.display = "none";

    [btnProfile, toggleFavoritesBtn, toggleLeaderboardBtn]
        .forEach(button => {
            button?.setAttribute?.("aria-expanded", "false");
        });
}

function toggleDashboardPanel(panel, button, loadData) {
    if (!panel) return;

    const wasVisible = panel.style.display === "block";
    closeAllPanels();

    if (wasVisible) return;

    panel.style.display = "block";
    button?.setAttribute?.("aria-expanded", "true");

    const navbarHeight =
        document.querySelector?.(".top-navbar")
            ?.getBoundingClientRect?.().height || 0;

    panel.style.scrollMarginTop = `${navbarHeight + 16}px`;

    panel.scrollIntoView?.({
        behavior: "auto",
        block: "start"
    });

    void loadData();
}

// ==========================================
// 14. 個人中心資料讀取（段位與練習統計）
// ==========================================
async function loadProfileData() {
    if (!currentUser) return;

    const profileUser = currentUser;

    void loadCheckInCalendar();

    const nameEl = document.getElementById("profile-name");
    const avatarEl = document.getElementById("profile-avatar");
    const rankEl = document.getElementById("profile-rank");
    const totalScoreEl = document.getElementById("profile-total-score");
    const daysCountEl = document.getElementById("profile-days-count");
    const perfectCountEl = document.getElementById("profile-perfect-count");

    if (nameEl) {
        nameEl.innerText = profileUser.displayName || "瑜珈夥伴";
    }

    if (avatarEl) {
        avatarEl.onerror = () => {
            avatarEl.onerror = null;
            avatarEl.src = AVATAR_FALLBACK;
        };

        avatarEl.src = profileUser.photoURL || AVATAR_FALLBACK;
    }

    // 1. 讀取總積分與段位
    try {
        const userLeaderboardRef = doc(
            db,
            "leaderboard",
            profileUser.uid
        );

        const docSnap = await getDoc(userLeaderboardRef);

        if (currentUser?.uid !== profileUser.uid) return;

        let currentScore = 0;

        if (docSnap.exists()) {
            currentScore = docSnap.data().score || 0;
        }

        if (totalScoreEl) {
            totalScoreEl.innerText = currentScore;
        }

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
    } catch (error) {
        if (currentUser?.uid !== profileUser.uid) return;

        console.error("讀取個人積分失敗", error);
        if (rankEl) rankEl.innerText = "🌱 瑜珈新手";
    }

    // 2. 讀取練習天數、Perfect次數（新版動作偏好統計改由「我的最愛」長條圖顯示）
    try {
        const historyRef = collection(
            db,
            "users",
            profileUser.uid,
            "history"
        );

        const querySnapshot = await getDocs(historyRef);

        if (currentUser?.uid !== profileUser.uid) return;

        const uniqueDates = new Set();
        const poseCounts = countPerfectPoses(querySnapshot);

        if (perfectCountEl) {
            perfectCountEl.innerText = poseCounts.reduce(
                (total, item) => total + item.count,
                0
            );
        }

        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();

            if (data.status === "Perfect" && data.date) {
                uniqueDates.add(data.date);
            }
        });

        if (daysCountEl) {
            daysCountEl.innerText = uniqueDates.size;
        }
    } catch (error) {
        console.error("讀取歷史分析失敗", error);
    }
}

// 每日登入簽到
function getCheckInDateKey(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const value = type =>
        parts.find(part => part.type === type).value;

    return `${value("year")}-${value("month")}-${value("day")}`;
}

function isValidCheckInDateKey(dateKey) {
    if (
        typeof dateKey !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)
    ) {
        return false;
    }

    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day;
}

function resetCheckInCalendar() {
    checkInDates = new Set();
    checkInCalendarMonth = getCheckInDateKey().slice(0, 7);
    checkInLoadState = "idle";
    checkInSaveFailed = false;
    checkInLoadVersion++;

    renderCheckInCalendar();
}

function recordDailyCheckIn(user = currentUser) {
    if (!user) return Promise.resolve(false);

    const userId = user.uid;
    const dateKey = getCheckInDateKey();
    const writeKey = `${userId}/${dateKey}`;

    if (checkInWrites.has(writeKey)) {
        return checkInWrites.get(writeKey);
    }

    if (
        currentUser?.uid === userId &&
        checkInDates.has(dateKey)
    ) {
        return Promise.resolve(true);
    }

    const saveTask = Promise.resolve().then(async () => {
        try {
            await withUiTimeout(setDoc(
                doc(db, "users", userId, "checkins", dateKey),
                {
                    date: dateKey,
                    timeZone: "Asia/Taipei"
                },
                { merge: true }
            ));

            if (currentUser?.uid === userId) {
                checkInDates.add(dateKey);
                checkInSaveFailed = false;
                renderCheckInCalendar();
            }

            return true;
        } catch (error) {
            console.error("儲存登入簽到失敗", error);

            if (currentUser?.uid === userId) {
                checkInSaveFailed = true;
                renderCheckInCalendar();
            }

            return false;
        } finally {
            checkInWrites.delete(writeKey);
        }
    });

    checkInWrites.set(writeKey, saveTask);
    return saveTask;
}

async function loadCheckInCalendar() {
    if (!currentUser) return;

    const user = currentUser;
    const loadVersion = ++checkInLoadVersion;

    const isCurrentRequest = () =>
        currentUser?.uid === user.uid &&
        loadVersion === checkInLoadVersion;

    checkInLoadState = "loading";
    renderCheckInCalendar();

    await recordDailyCheckIn(user);

    if (!isCurrentRequest()) return;

    try {
        const snapshot = await withUiTimeout(getDocs(
            collection(db, "users", user.uid, "checkins")
        ));

        if (!isCurrentRequest()) return;

        const dates = new Set();

        snapshot.forEach(docSnap => {
            const dateKey = docSnap.data().date;

            if (isValidCheckInDateKey(dateKey)) {
                dates.add(dateKey);
            }
        });

        const today = getCheckInDateKey();

        if (checkInDates.has(today)) dates.add(today);

        checkInDates = dates;
        checkInLoadState = "ready";
    } catch (error) {
        if (!isCurrentRequest()) return;

        console.error("讀取簽到紀錄失敗", error);
        checkInLoadState = "error";
    }

    renderCheckInCalendar();
}

function changeCheckInMonth(offset) {
    const [year, month] =
        checkInCalendarMonth.split("-").map(Number);

    const date = new Date(year, month - 1 + offset, 1);

    checkInCalendarMonth =
        `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    renderCheckInCalendar();
}

function renderCheckInCalendar() {
    const grid = document.getElementById("checkin-calendar-grid");
    const monthLabel = document.getElementById("checkin-month-label");
    const monthCount = document.getElementById("checkin-month-count");
    const status = document.getElementById("checkin-status");
    const badge = document.getElementById("checkin-badge");

    if (!grid) return;

    const [year, month] =
        checkInCalendarMonth.split("-").map(Number);

    const today = getCheckInDateKey();
    const firstWeekday = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    if (monthLabel) {
        monthLabel.textContent = `${year} 年 ${month} 月`;
    }

    const cells = Array.from(
        { length: firstWeekday },
        () => '<div class="checkin-day-empty" aria-hidden="true"></div>'
    );

    let signedDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey =
            `${checkInCalendarMonth}-${String(day).padStart(2, "0")}`;

        const checkedIn = checkInDates.has(dateKey);
        const isToday = dateKey === today;

        if (checkedIn) signedDays++;

        const classes = [
            "checkin-day",
            checkedIn ? "is-checked-in" : "",
            isToday ? "is-today" : ""
        ].filter(Boolean).join(" ");

        const label =
            `${year}年${month}月${day}日` +
            `${isToday ? "，今天" : ""}，` +
            `${checkedIn ? "已簽到" : "未簽到"}`;

        cells.push(`
            <div class="${classes}"
                 data-date="${dateKey}"
                 role="listitem"
                 aria-label="${label}"
                 ${isToday ? 'aria-current="date"' : ""}>
                <span>${day}</span>
                ${checkedIn
                    ? '<span class="checkin-dot" aria-hidden="true">●</span>'
                    : ""}
            </div>
        `);
    }

    grid.innerHTML = cells.join("");

    if (monthCount) {
        monthCount.textContent =
            checkInLoadState === "ready" ? signedDays : "—";
    }

    if (status) {
        if (checkInLoadState === "loading") {
            status.textContent = "正在載入簽到紀錄…";
        } else if (checkInLoadState === "error") {
            status.textContent =
                "無法載入簽到紀錄，請按「重新整理」重試。";
        } else if (checkInSaveFailed) {
            status.textContent =
                "今日簽到尚未儲存，請按「重新整理」重試。";
        } else if (checkInDates.has(today)) {
            status.textContent = "今天已自動簽到！";
        } else {
            status.textContent = "登入後自動簽到。";
        }

        const state =
            checkInLoadState === "error" || checkInSaveFailed
                ? "error"
                : checkInDates.has(today)
                    ? "success"
                    : checkInLoadState;

        status.setAttribute("data-state", state);
    }

    if (badge) {
        const checkedIn = checkInDates.has(today);

        badge.textContent = checkedIn
            ? "✓ 今日已簽到"
            : checkInSaveFailed
                ? "簽到待重試"
                : "登入自動簽到";

        badge.setAttribute(
            "data-state",
            checkedIn ? "success" : checkInSaveFailed ? "error" : "idle"
        );
    }
}

document.getElementById("checkin-prev-month")
    ?.addEventListener("click", () => changeCheckInMonth(-1));

document.getElementById("checkin-next-month")
    ?.addEventListener("click", () => changeCheckInMonth(1));

document.getElementById("checkin-current-month")
    ?.addEventListener("click", () => {
        checkInCalendarMonth = getCheckInDateKey().slice(0, 7);
        renderCheckInCalendar();
    });

document.getElementById("checkin-refresh-btn")
    ?.addEventListener("click", () => {
        void loadCheckInCalendar();
    });

// ==========================================
// 15. 我的最愛與排行榜資料讀取
// ==========================================
// 我的最愛
async function loadFavoritesData() {
    const summary = document.getElementById("favorites-summary");
    const listContainer = document.getElementById("favorites-list");
    const chartCard = document.getElementById("favorites-chart-card");

    if (!currentUser) {
        if (summary) {
            summary.textContent = "請先登入，查看你的動作累計次數。";
        }

        return;
    }

    const userId = currentUser.uid;
    const loadVersion = ++favoritesLoadVersion;

    const isCurrentRequest = () =>
        currentUser?.uid === userId &&
        loadVersion === favoritesLoadVersion;

    const historyRef = collection(
        db,
        "users",
        userId,
        "history"
    );

    if (summary) {
        summary.textContent = "正在統計你的 Perfect 紀錄…";
    }

    if (listContainer) listContainer.innerHTML = "";
    if (chartCard) chartCard.hidden = true;

    if (favoritesChart) {
        favoritesChart.destroy();
        favoritesChart = null;
    }

    try {
        const querySnapshot = await withUiTimeout(
            getDocs(historyRef)
        );

        if (!isCurrentRequest()) return;

        const poseCounts = countPerfectPoses(querySnapshot)
            .sort((a, b) => b.count - a.count);

        const highestCount = poseCounts[0].count;

        const favorites = poseCounts.filter(
            item => item.count === highestCount
        );

        if (summary) {
            if (highestCount === 0) {
                summary.textContent =
                    "尚無 Perfect 紀錄，完成任一動作並維持 5 秒後，就會開始累計。";
            } else if (favorites.length === 1) {
                summary.textContent =
                    `最常完成：${favorites[0].title}（${highestCount} 次 Perfect）`;
            } else {
                summary.textContent =
                    `並列最愛：${favorites.map(item => item.title).join("、")}` +
                    `（各 ${highestCount} 次 Perfect）`;
            }
        }

        if (listContainer) {
            listContainer.innerHTML = poseCounts.map((item, index) => `
                <li>
                    <span>${index + 1}. ${escapeHtml(item.title)}</span>
                    <strong>${item.count} 次 Perfect</strong>
                </li>
            `).join("");
        }

        try {
            renderFavoritesChart(poseCounts);
        } catch (error) {
            console.warn(
                "圖表暫時無法顯示，仍可查看動作次數",
                error
            );

            if (chartCard) chartCard.hidden = true;
        }
    } catch (error) {
        console.error("讀取我的最愛失敗", error);

        if (!isCurrentRequest()) return;

        if (summary) {
            summary.textContent =
                "暫時無法載入我的最愛，請按「重新整理」重試。";
        }
    }
}

function renderFavoritesChart(poseCounts) {
    const chartElem = document.getElementById("favoritesChart");
    const chartCard = document.getElementById("favorites-chart-card");

    if (!chartElem || typeof Chart !== "function") {
        if (chartCard) chartCard.hidden = true;
        return;
    }

    if (chartCard) chartCard.hidden = false;

    const ctx = chartElem.getContext("2d");

    if (favoritesChart) favoritesChart.destroy();

    // 淺紫、淺天藍、薄荷青
    const colors = {
        "大樹式": "#a29bfe",
        "深蹲": "#74b9ff",
        "平舉": "#81ecec"
    };

    favoritesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: poseCounts.map(item => item.title),
            datasets: [{
                label: "Perfect 次數",
                data: poseCounts.map(item => item.count),
                backgroundColor: poseCounts.map(
                    item => colors[item.title]
                ),
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context =>
                            `${context.parsed.y} 次 Perfect`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 1,
                    ticks: {
                        precision: 0
                    },
                    title: {
                        display: true,
                        text: "Perfect 次數"
                    }
                }
            }
        }
    });
}

// 排行榜
async function loadLeaderboardData() {
    const leaderboardCol = collection(db, "leaderboard");

    const leaderboardQuery = query(
        leaderboardCol,
        orderBy("score", "desc"),
        limit(10)
    );

    try {
        const querySnapshot = await getDocs(leaderboardQuery);
        const listElement = document.getElementById("leaderboard-list");

        if (!listElement) return;

        listElement.innerHTML = "";
        let rank = 1;

        querySnapshot.forEach(docSnap => {
            const data = docSnap.data();

            const medal = rank === 1
                ? "🥇"
                : rank === 2
                    ? "🥈"
                    : rank === 3
                        ? "🥉"
                        : `🏅 ${rank}.`;

            const li = document.createElement("li");

            const medalEl = document.createElement("strong");
            medalEl.textContent = medal;

            const nameNode = document.createTextNode(
                ` ${data.name || "瑜珈同好"} `
            );

            const scoreEl = document.createElement("span");
            scoreEl.style.cssText =
                "float:right; color:#ff9800; font-weight:bold;";

            scoreEl.textContent = `${Number(data.score) || 0} 分`;

            li.append(medalEl, nameNode, scoreEl);
            listElement.appendChild(li);

            rank++;
        });

        if (rank === 1) {
            listElement.innerHTML =
                '<li style="text-align: center; color: gray;">尚無排行榜資料</li>';
        }
    } catch (error) {
        console.error("讀取排行榜失敗", error);
    }
}

// 面板按鈕
// 抽屜按鈕切換事件綁定
btnProfile?.addEventListener("click", () => {
    toggleDashboardPanel(
        profileContainer,
        btnProfile,
        loadProfileData // 🌟 點開時立刻向 Firebase 撈取數據
    );
});

toggleFavoritesBtn?.addEventListener("click", () => {
    toggleDashboardPanel(
        favoritesContainer,
        toggleFavoritesBtn,
        loadFavoritesData // 🌟 點開時加載「我的最愛」的歷史累計紀錄
    );
});

toggleLeaderboardBtn?.addEventListener("click", () => {
    toggleDashboardPanel(
        leaderboardContainer,
        toggleLeaderboardBtn,
        loadLeaderboardData // 🌟 點開時加載排行榜
    );
});

document.getElementById("favorites-close-btn")
    ?.addEventListener("click", closeAllPanels);

document.getElementById("favorites-refresh-btn")
    ?.addEventListener("click", () => {
        void loadFavoritesData();
    });
// ==========================================
// 🌟 16. 郵件提醒功能模組 (EmailJS)
// ==========================================

// ⚠️ 請填入你從 EmailJS 複製的三個代碼：
const EMAILJS_PUBLIC_KEY = "xfPxgJEpZ-Ur7Tq7e";
const EMAILJS_SERVICE_ID = "service_k67ijnj";
const EMAILJS_TEMPLATE_ID = "template_he8ob63";

// 初始化套件
if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

// 取得彈窗與按鈕元素
const btnEmailRemind = document.getElementById('btn-email-remind');
const emailModal = document.getElementById('email-modal');
const btnCloseEmailModal = document.getElementById('btn-close-email-modal');
const remindEmailInput = document.getElementById('remind-email-input');
const remindTimeInput = document.getElementById('remind-time-input');
const btnSendTestEmail = document.getElementById('btn-send-test-email');
const btnSaveRemind = document.getElementById('btn-save-remind');

// 1. 點擊導覽列「✉️ 提醒信」按鈕打開彈窗
btnEmailRemind?.addEventListener('click', async () => {
    if (!currentUser) {
        alert("請先登入帳號！");
        return;
    }

    if (remindEmailInput) remindEmailInput.value = currentUser.email || "";

    // 嘗試從 Firebase 讀取之前設定過的時間
    try {
        const userPrefRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userPrefRef);
        if (docSnap.exists() && docSnap.data().remindTime) {
            remindTimeInput.value = docSnap.data().remindTime;
        }
    } catch (e) {
        console.warn("讀取時間偏好失敗:", e);
    }

    if (emailModal) emailModal.style.display = 'flex';
});

// 2. 點擊「關閉」隱藏彈窗
btnCloseEmailModal?.addEventListener('click', () => {
    if (emailModal) emailModal.style.display = 'none';
});

// 3. 發送信件核心函式
async function sendWorkoutReminder(targetEmail, userName) {
    try {
        const templateParams = {
            to_email: targetEmail,
            user_name: userName || "瑜珈夥伴",
            message: "今天還沒練習瑜珈喔！打開鏡頭練習 5 分鐘，保持身心平衡吧！"
        };

        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        return true;
    } catch (error) {
        console.error("寄送信件失敗:", error);
        return false;
    }
}

// 4. 點擊「立即寄送測試信」按鈕
btnSendTestEmail?.addEventListener('click', async () => {
    if (!currentUser || !currentUser.email) {
        alert("無法讀取信箱，請確認是否已登入！");
        return;
    }

    btnSendTestEmail.innerText = "寄送中...";
    btnSendTestEmail.disabled = true;

    const isSuccess = await sendWorkoutReminder(currentUser.email, currentUser.displayName);

    btnSendTestEmail.innerText = "立即寄送測試信";
    btnSendTestEmail.disabled = false;

    if (isSuccess) {
        alert("測試信已寄出！請至信箱確認（若沒看到可檢查垃圾郵件匣）。");
    } else {
        alert("寄送失敗，請確認你的 EmailJS 三個金鑰是否填寫正確！");
    }
});

// 5. 點擊「儲存設定」按鈕（記錄到 Firebase）
btnSaveRemind?.addEventListener('click', async () => {
    if (!currentUser) return;

    const timeValue = remindTimeInput.value;
    try {
        const userPrefRef = doc(db, "users", currentUser.uid);
        await setDoc(userPrefRef, {
            email: currentUser.email,
            remindTime: timeValue,
            lastUpdated: new Date()
        }, { merge: true });

        alert(`已設定完成！每日 ${timeValue} 將作為你的提醒時間。`);
        if (emailModal) emailModal.style.display = 'none';
    } catch (e) {
        console.error("儲存偏好失敗:", e);
        alert("儲存設定失敗，請稍後再試。");
    }
});

// 6. 前端定時檢查（若網頁開著，時間到自動寄信）
setInterval(() => {
    if (!currentUser || !remindTimeInput) return;

    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    const todayStr = now.toLocaleDateString();
    const lastSentDay = localStorage.getItem('lastReminderSentDate');

    if (currentTimeStr === remindTimeInput.value && lastSentDay !== todayStr) {
        sendWorkoutReminder(currentUser.email, currentUser.displayName);
        localStorage.setItem('lastReminderSentDate', todayStr);
    }
}, 60000);
