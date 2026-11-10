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
const landingPage = document.getElementById("landing-page");
const homeView = document.getElementById("home-view");
const workoutView = document.getElementById("workout-view");
const actionsGrid = document.getElementById("actions-grid");
const btnBackHome = document.getElementById("btn-back-home");

// --- 左側控制區元素 ---
const quickSwitchSelect = document.getElementById("quick-switch-select");
const btnTutorial = document.getElementById("btn-tutorial");
const tutorialVideoContainer = document.getElementById("tutorial-video-container");
const tutorialVideo = document.getElementById("tutorial-video");

const currentWorkoutTitle = document.getElementById("current-workout-title");

const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement?.getContext("2d");
const loadingDiv = document.getElementById("loading");

const statusDisplay = document.getElementById("status-display");
const poseTitle = document.getElementById("pose-title");
const treeInfo = document.getElementById("tree-info");
const squatInfo = document.getElementById("squat-info");
const raiseInfo = document.getElementById("raise-info");
const sideStretchInfo = document.getElementById("side-stretch-info");
const dancerInfo = document.getElementById("dancer-info"); 
const triangleInfo = document.getElementById("triangle-info");
const warrior2Info = document.getElementById("warrior2-info");

const armStatusDiv = document.getElementById("arm-status");
const legStatusDiv = document.getElementById("leg-status");
const squatStatusDiv = document.getElementById("squat-status");
const raiseStatusDiv = document.getElementById("raise-status");
const sideStretchStatusDiv = document.getElementById("side-stretch-status");
const dancerStatusDiv = document.getElementById("dancer-status");
const triangleStatusDiv = document.getElementById("triangle-status");
const sideLungeInfo = document.getElementById("side-lunge-info");
const sideLungeStatusDiv = document.getElementById("side-lunge-status");
const crossArmStretchInfo = document.getElementById("cross-arm-stretch-info");
const crossArmStretchStatusDiv = document.getElementById("cross-arm-stretch-status");
const warrior2StatusDiv = document.getElementById("warrior2-status");

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
// 🌟 4. 動作資料庫
// ==========================================
const POSE_DATABASE = [
    {
        id: "tree",
        title: "大樹式",
        subtitle: "Tree Pose",
        img: "image/tree.png",
        videoUrl: "https://www.youtube.com/embed/jMez5L0w4yI",
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
        img: "image/squat.png",
        videoUrl: "https://www.youtube.com/embed/PpP98TMiVKY",
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
        img: "image/raise.png",
        videoUrl: "",
        desc: "平舉能增強肩膀三角肌與上肢控制力。",
        tips: [
            "雙臂向兩側抬起與地面平行",
            "手臂全程伸直勿微彎",
            "放鬆頸部勿過度聳肩"
        ]
    },
    {
        id: "sideStretch",
        title: "側腰拉伸",
        subtitle: "Standing Side Stretch",
        img: "image/sidelength.png",
        videoUrl: "",
        desc: "站姿側腰拉伸：單手向上延伸，身體緩慢向另一側側彎。",
        tips: [
            "正面朝向鏡頭，讓雙手、髖部及雙腳完整入鏡",
            "雙腳站穩、膝蓋自然伸直，單手向上延伸",
            "向舉高手臂的另一側側彎，在舒適範圍內停留"
        ]
    },
    {
        id: "dancer",
        title: "舞王式",
        subtitle: "Dancer Pose",
        img: "image/dance.png",
        videoUrl: "",
        desc: "舞王式能深度延展胸腔與肩膀、伸展大腿前側，並大幅增強單腳平衡感與核心力量。",
        tips: [
            "單腳站穩伸直，另一腳曲膝向後上方抬起",
            "同側手向後握住腳背或腳踝，另一手向前平舉延展",
            "上半身自然前傾微挺胸，維持骨盆穩定不翻轉"
        ]
    },
    {
        id: "triangle",
        title: "三角式",
        subtitle: "Triangle Pose",
        img: "image/triangle.png",
        videoUrl: "",
        desc: "三角式能強化腿部與核心肌群，開展胸腔與髖關節，並深度延展大腿後側。",
        tips: [
            "雙腳張開約兩倍肩寬，雙腿膝蓋保持伸直不微彎",
            "上半身向一側側傾，一手下放輕觸小腿或腳踝",
            "另一手筆直向上延伸，雙臂展開呈一直線"
        ]
    },
    {
        id: "sideLunge",
        title: "側弓箭步",
        subtitle: "Side Lunge",
        img: "image/sidelunge.png",
        videoUrl: "",
        desc: "雙腳向左右分開，一側屈膝，另一側腿伸直，重心移向屈膝側。",
        tips: [
            "正面朝向鏡頭，讓肩膀、髖部、膝蓋與雙腳完整入鏡",
            "雙腳向左右分開，一側屈膝，另一側腿自然伸直",
            "雙手可於胸前合十，上半身保持穩定",
            "在舒適範圍內維持姿勢，左右兩側皆可練習"
        ]
    },
    {
        id: "crossArmStretch",
        title: "站立十字臂拉伸",
        subtitle: "Standing Cross-Body Shoulder Stretch",
        img: "image/cross-arm-stretch.png",
        videoUrl: "",
        desc: "站姿將一隻手臂橫跨胸前，另一手彎曲扶住上臂或手肘附近。",
        tips: [
            "正面朝向鏡頭，讓雙肩、手肘與手腕完整入鏡",
            "將一隻手臂橫跨胸前，手肘自然伸直",
            "另一手彎曲，扶住被拉伸手臂的上臂或手肘附近",
            "上半身保持直立，在舒適範圍內維持姿勢"
        ]
    },
    {
        id: "warrior2",
        title: "英雄二式",
        subtitle: "Warrior II",
        img: "image/hero.png",
        videoUrl: "",
        desc: "英雄二式能強化下肢與核心力量，開展骨盆與胸腔，並增強專注力與身體平衡感。",
        tips: [
            "雙腳大步張開，前腳屈膝約 90 度，後腳保持自然打直",
            "上半身維持垂直地面不前傾，骨盆擺正",
            "雙手向前後平行地面伸直，頭轉向看向前手方向"
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
let sideLungeHoldSide = null;
let crossArmStretchHoldSide = null;

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
// 7. 首頁動態渲染動作卡片
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

    const poseItem = POSE_DATABASE.find(p => p.id.toLowerCase() === poseId.toLowerCase());

    if (currentWorkoutTitle && poseItem) {
        currentWorkoutTitle.innerText = `${poseItem.title} 練習室`;
    }

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
// 8. 教學影片
// ==========================================
function isTutorialVisible() {
    return !!tutorialVideoContainer &&
        !tutorialVideoContainer.classList.contains("hidden-container");
}

function closeTutorial() {
    const wasVisible = isTutorialVisible();

    if (tutorialVideoContainer) {
        tutorialVideoContainer.classList.add("hidden-container");
    }

    if (tutorialVideo) {
        tutorialVideo.removeAttribute("src");
    }

    if (btnTutorial) btnTutorial.textContent = "教學";

    if (wasVisible) {
        stopSpeaking();
        resetHold();

        if (saveStatusDiv) saveStatusDiv.innerText = "";

        showPoseUI(selectedPoseId);
    }
}

quickSwitchSelect?.addEventListener("change", e => {
    const poseId = e.target.value;
    selectedPoseId = poseId;

    const poseItem = POSE_DATABASE.find(p => p.id.toLowerCase() === poseId.toLowerCase());
    if (currentWorkoutTitle && poseItem) {
        currentWorkoutTitle.innerText = `${poseItem.title} 練習室`;
    }

    closeTutorial();
    showPoseUI(poseId);
    openPoseIntro(poseId);
});

btnTutorial?.addEventListener("click", () => {
    if (!tutorialVideoContainer || !tutorialVideo) return;

    if (isTutorialVisible()) {
        closeTutorial();
        return;
    }

    const poseItem = POSE_DATABASE.find(
        p => p.id.toLowerCase() === selectedPoseId.toLowerCase()
    );

    if (!poseItem?.videoUrl) {
        alert("這個動作尚未設定教學影片");
        return;
    }

    const embedUrl = new URL(poseItem.videoUrl);
    embedUrl.searchParams.set("autoplay", "1");
    embedUrl.searchParams.set("playsinline", "1");
    embedUrl.searchParams.set("rel", "0");

    tutorialVideoContainer.classList.remove("hidden-container");

    stopSpeaking();
    resetHold();
    setStatus("neutral");

    btnTutorial.textContent = "關閉教學";

    if (saveStatusDiv) {
        saveStatusDiv.innerText =
            "觀看教學中，語音提示與計時已暫停";
    }

    tutorialVideo.src = embedUrl.toString();
});

// ==========================================
// 9. 彈窗與 3 秒倒數計時
// ==========================================
function openPoseIntro(poseKey) {
    stopSpeaking();
    cancelCountdown();

    const guide = POSE_DATABASE.find(p => p.id.toLowerCase() === poseKey.toLowerCase());

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
    const guide = POSE_DATABASE.find(p => p.id.toLowerCase() === poseKey.toLowerCase());

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
    const norm = poseId.toLowerCase();

    if (treeInfo) treeInfo.style.display = norm === "tree" ? "block" : "none";
    if (squatInfo) squatInfo.style.display = norm === "squat" ? "block" : "none";
    if (raiseInfo) raiseInfo.style.display = norm === "raise" ? "block" : "none";
    if (sideStretchInfo) sideStretchInfo.style.display = norm === "sidestretch" ? "block" : "none";
    if (dancerInfo) dancerInfo.style.display = norm === "dancer" ? "block" : "none";
    if (triangleInfo) triangleInfo.style.display = norm === "triangle" ? "block" : "none";
    if (sideLungeInfo) {sideLungeInfo.style.display = norm === "sidelunge" ? "block" : "none";}
    if (crossArmStretchInfo) {crossArmStretchInfo.style.display =norm === "crossarmstretch" ? "block" : "none";}
    if (warrior2Info) {warrior2Info.style.display = norm === "warrior2" ? "block" : "none";}

    
    const poseItem = POSE_DATABASE.find(p => p.id.toLowerCase() === norm);

    if (poseTitle) {
        poseTitle.innerText = `${poseItem ? poseItem.title : poseId} 偵測`;
    }

    if (norm === "tree") {
        setText(armStatusDiv, "手部請舉過頭頂，或於胸前合十", "");
        setText(legStatusDiv, "請單腳站穩，另一腳曲膝抬高貼於腿側", "");
    } else if (norm === "squat") {
        setText(squatStatusDiv, "請開始深蹲", "");
    } else if (norm === "raise") {
        setText(raiseStatusDiv, "請將雙臂向兩側抬起至肩膀高度", "");
    } else if (norm === "sidestretch") {
        setText(sideStretchStatusDiv, "請正面站立，單手上舉，向另一側緩慢側彎", "");
    } else if (norm === "dancer") {
        setText(dancerStatusDiv, "請站穩支撐腳，另一腳曲膝向後上方抬起並伸展前臂", "");
    }else if (norm === "triangle") {
        setText(triangleStatusDiv, "請雙腳張開打直，單手向下輕觸腳踝，另一手筆直上舉", "");
    }else if (norm === "sidelunge") {
        setText(sideLungeStatusDiv,"請正面站立，雙腳向左右分開，一側屈膝、另一側腿伸直","");
    }else if (norm === "crossarmstretch") {
        setText(crossArmStretchStatusDiv,"請將一手橫跨胸前，另一手彎曲扶住上臂附近","");
    }else if (norm === "warrior2") {
        setText(warrior2StatusDiv, "請雙腳大跨步，前膝彎曲、後腿打直，雙臂向兩側水平展開", "");
    }
}

// ==========================================
// 10. 幾何運算與語音提示
// ==========================================
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

function stopSpeaking() {
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
    if (isTutorialVisible()) return;
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
    if (isTutorialVisible()) return;
    if (!("speechSynthesis" in window)) return;

    if (activeUtterance?.text === text || speechQueue.includes(text)) {
        return;
    }

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
    sideLungeHoldSide = null;
    crossArmStretchHoldSide = null;
}

function updateHold(isPerfect, poseNameChinese) {
    if (!isPerfect) {
        resetHold();
        return null;
    }

    if (perfectStartTime === 0) {
        perfectStartTime = Date.now();
        speakHint("很好，請保持");
    }

    const held = Date.now() - perfectStartTime;

    if (held >= HOLD_MS) {
        if (!hasSavedThisRep) handlePoseSuccess(poseNameChinese);
        return 0;
    }

    return Math.ceil((HOLD_MS - held) / 1000);
}

// ==========================================
// 11. AI 動作分析演算
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
            queueHint("支撐腳請伸直");
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
            "請單腳站立，另一腳曲膝抬高貼於腿側",
            COLOR_ERR
        );

        isLegError = true;
        queueHint("請單腳站立，另一腳曲膝抬高貼於腿側");
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
                "雙手高舉時手肘請打直！",
                COLOR_ERR
            );

            isArmError = true;
            queueHint("雙手高舉時手肘請打直");
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
        queueHint("手部請舉過頭頂，或於胸前合十");
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
    let color = COLOR_ERR;
    let state = "neutral";
    let isPerfect = false;

    if (kneeAngle >= 140) {
        message = "臀部向後坐，慢慢開始深蹲";
        queueHint(message);
    }

    if (kneeAngle < 140) {
        if (kneeAngle > 110) {
            message = "再蹲低一點！";
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

// === 平舉 ===
function analyzeRaise(lm) {
    const shoulderL = lm[11];
    const elbowL = lm[13];
    const wristL = lm[15];

    const shoulderR = lm[12];
    const elbowR = lm[14];
    const wristR = lm[16];

    const hipL = lm[23];
    const hipR = lm[24];

    const leftElbowAngle = calculateAngle(shoulderL, elbowL, wristL);
    const rightElbowAngle = calculateAngle(shoulderR, elbowR, wristR);

    const leftArmRaise = calculateAngle(hipL, shoulderL, elbowL);
    const rightArmRaise = calculateAngle(hipR, shoulderR, elbowR);

    const messages = [];

    if (
        leftArmRaise < RAISE.bothTooLow &&
        rightArmRaise < RAISE.bothTooLow
    ) {
        messages.push("請將雙臂向兩側抬起至肩膀高度");
    } else if (
        leftArmRaise > RAISE.tooHigh ||
        rightArmRaise > RAISE.tooHigh
    ) {
        messages.push("手臂抬太高了，與肩膀平行即可");
    } else {
        if (leftArmRaise < RAISE.minRaise) {
            messages.push("左手請再抬高一些");
        }

        if (rightArmRaise < RAISE.minRaise) {
            messages.push("右手請再抬高一些");
        }
    }

    if (messages.length === 0) {
        if (leftElbowAngle < RAISE.elbowMin) {
            messages.push("左手手肘請盡量打直");
        }

        if (rightElbowAngle < RAISE.elbowMin) {
            messages.push("右手手肘請盡量打直");
        }
    }

    const isPerfect = messages.length === 0;

    if (!isPerfect) {
        if (raiseStatusDiv) {
            raiseStatusDiv.innerHTML = messages
                .map(message => `
                    <span style="color: var(--error-text, #e8435a);">
                        ${message}
                    </span>
                `)
                .join("<br>");
        }
        messages.forEach(queueHint);
    }

    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, "平舉");

    if (isPerfect && raiseStatusDiv) {
        raiseStatusDiv.innerHTML = secondsLeft > 0
            ? `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 手臂維持平舉 ${secondsLeft} 秒...</span>`
            : `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 完成！</span>`;
    }
}

// === 側腰拉伸 ===
function analyzeSideStretch(lm) {
    const visible = indexes => indexes.every(i => {
        const p = lm[i];
        return p && Number.isFinite(p.x) && Number.isFinite(p.y)
            && (p.visibility ?? 0) >= 0.5;
    });

    const requiredPoints = [
        [11, "左肩"], [12, "右肩"],
        [23, "左髖"], [24, "右髖"],
        [25, "左膝"], [26, "右膝"],
        [27, "左腳踝"], [28, "右腳踝"]
    ];

    const missingParts = requiredPoints
        .filter(([index]) => !visible([index]))
        .map(([, name]) => name);

    if (missingParts.length > 0) {
        setText(
            sideStretchStatusDiv,
            `請往後退，讓${missingParts.join("、")}完整入鏡`,
            COLOR_ERR
        );

        setStatus("neutral");
        updateHold(false, "側腰拉伸");

        queueHint("請往後退，讓肩膀、髖部、膝蓋與雙腳完整入鏡");
        return;
    }

    const midpoint = (a, b) => ({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    });

    const shoulders = midpoint(lm[11], lm[12]);
    const hips = midpoint(lm[23], lm[24]);
    const ankles = midpoint(lm[27], lm[28]);

    const bendAngle = 180 - calculateAngle(shoulders, hips, ankles);
    const bendX = shoulders.x - hips.x;

    const raisedOuterArm = (s, e, w, h) => {
        if (!visible([s, e, w, h])) return false;

        return (lm[s].x - shoulders.x) * bendX < 0
            && lm[w].y < lm[s].y
            && calculateAngle(lm[h], lm[s], lm[e]) >= 140
            && calculateAngle(lm[s], lm[e], lm[w]) >= 145;
    };

    const messages = [];

    if (shoulders.y >= hips.y || hips.y >= ankles.y) {
        messages.push("請正面站立，讓全身完整入鏡");
    }

    if (calculateAngle(lm[23], lm[25], lm[27]) < 150 ||
        calculateAngle(lm[24], lm[26], lm[28]) < 150) {
        messages.push("請站穩，雙膝自然伸直");
    }

    if (bendAngle < 25) {
        messages.push("請在舒適範圍內緩慢向側邊伸展");
    } else if (bendAngle > 55) {
        messages.push("請稍微回正一些");
    }

    if (!raisedOuterArm(11, 13, 15, 23) &&
        !raisedOuterArm(12, 14, 16, 24)) {
        messages.push("請將側彎相反側的手臂向上伸直");
    }

    const isPerfect = messages.length === 0;
    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, "側腰拉伸");

    if (isPerfect) {
        setText(
            sideStretchStatusDiv,
            secondsLeft > 0
                ? `PERFECT！請維持 ${secondsLeft} 秒...`
                : "PERFECT！側腰拉伸完成！",
            COLOR_OK
        );
    } else {
        setText(sideStretchStatusDiv, messages.join("\n"), COLOR_ERR);
        messages.forEach(queueHint);
    }
}

// === 🌟 舞王式 (Dancer Pose) ===
function analyzeDancer(lm) {
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

    const leftKneeAngle = calculateAngle(hipL, kneeL, ankleL);
    const rightKneeAngle = calculateAngle(hipR, kneeR, ankleR);

    // 辨識向後上方曲膝抬起之腳（膝角彎曲 < 135°，腳踝高度接近膝蓋或更高）
    const isRightLegLifted = (rightKneeAngle < 135) && (ankleR.y < kneeR.y + 0.12);
    const isLeftLegLifted = (leftKneeAngle < 135) && (ankleL.y < kneeL.y + 0.12);

    const messages = [];

    if (isRightLegLifted) {
        // 右腳後抬 -> 左腳為支撐腳
        if (leftKneeAngle < 150) {
            messages.push("支撐腳（左腳）請打直站穩");
        }
        // 前手檢測：左臂向前延展
        const leftArmStraight = calculateAngle(shoulderL, elbowL, wristL);
        const leftArmRaise = calculateAngle(hipL, shoulderL, elbowL);
        if (leftArmStraight < 135 || leftArmRaise < 45) {
            messages.push("前手請向前上方延伸打直");
        }
    } else if (isLeftLegLifted) {
        // 左腳後抬 -> 右腳為支撐腳
        if (rightKneeAngle < 150) {
            messages.push("支撐腳（右腳）請打直站穩");
        }
        // 前手檢測：右臂向前延展
        const rightArmStraight = calculateAngle(shoulderR, elbowR, wristR);
        const rightArmRaise = calculateAngle(hipR, shoulderR, elbowR);
        if (rightArmStraight < 135 || rightArmRaise < 45) {
            messages.push("前手請向前上方延伸打直");
        }
    } else {
        messages.push("請單腳站穩，另一腳曲膝向後上方抬起");
    }

    const isPerfect = messages.length === 0;

    if (!isPerfect) {
        if (dancerStatusDiv) {
            dancerStatusDiv.innerHTML = messages
                .map(msg => `<span style="color: var(--error-text, #e8435a);">${msg}</span>`)
                .join("<br>");
        }
        messages.forEach(queueHint);
    }

    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, "舞王式");

    if (isPerfect && dancerStatusDiv) {
        dancerStatusDiv.innerHTML = secondsLeft > 0
            ? `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 維持優美舞王式 ${secondsLeft} 秒...</span>`
            : `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 舞王式完成！</span>`;
    }
}
// ===  三角式 (Triangle Pose) ===
function analyzeTriangle(lm) {
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

    const leftKneeAngle = calculateAngle(hipL, kneeL, ankleL);
    const rightKneeAngle = calculateAngle(hipR, kneeR, ankleR);

    const messages = [];

    // 1. 檢測雙腿是否打直（膝蓋夾角需大於 150 度）
    if (leftKneeAngle < 150 || rightKneeAngle < 150) {
        messages.push("雙腿膝蓋請盡量打直勿微彎");
    }

    // 2. 檢測身體是否側傾（雙肩高度差需明顯，下壓手腕低於臀部）
    const isLeaningLeft = wristL.y > hipL.y && wristR.y < shoulderR.y;
    const isLeaningRight = wristR.y > hipR.y && wristL.y < shoulderL.y;

    if (!isLeaningLeft && !isLeaningRight) {
        messages.push("請將上半身側傾，單手向下靠近腳踝，另一手向上延伸");
    } else {
        // 3. 檢測手臂是否伸展（檢查向上那隻手的手肘是否打直）
        const upElbowAngle = isLeaningLeft 
            ? calculateAngle(shoulderR, elbowR, wristR)
            : calculateAngle(shoulderL, elbowL, wristL);

        if (upElbowAngle < 140) {
            messages.push("上方手臂請筆直向上伸展打直");
        }
    }

    const isPerfect = messages.length === 0;

    if (!isPerfect) {
        if (triangleStatusDiv) {
            triangleStatusDiv.innerHTML = messages
                .map(msg => `<span style="color: var(--error-text, #e8435a);">${msg}</span>`)
                .join("<br>");
        }
        messages.forEach(queueHint);
    }

    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, "三角式");

    if (isPerfect && triangleStatusDiv) {
        triangleStatusDiv.innerHTML = secondsLeft > 0
            ? `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 保持三角式伸展 ${secondsLeft} 秒...</span>`
            : `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 三角式完成！</span>`;
    }
}
    
// === 側弓箭步：正面站姿，左右皆可 ===
function analyzeSideLunge(lm) {
    const requiredPoints = [
        [11, "左肩"], [12, "右肩"],
        [23, "左髖"], [24, "右髖"],
        [25, "左膝"], [26, "右膝"],
        [27, "左腳踝"], [28, "右腳踝"]
    ];

    const missingParts = requiredPoints
        .filter(([i]) => {
            const p = lm[i];

            return !p
                || !Number.isFinite(p.x)
                || !Number.isFinite(p.y)
                || p.x < 0 || p.x > 1
                || p.y < 0 || p.y > 1
                || (p.visibility ?? 0) < 0.5;
        })
        .map(([, name]) => name);

    if (missingParts.length > 0) {
        setText(
            sideLungeStatusDiv,
            `請往後退，讓${missingParts.join("、")}完整入鏡`,
            COLOR_ERR
        );

        setStatus("neutral");
        updateHold(false, "側弓箭步");

        queueHint("請讓肩膀、髖部、膝蓋與雙腳完整入鏡");
        return;
    }

    const W = canvasElement?.width || 800;
    const H = canvasElement?.height || 450;

    const midpoint = (a, b) => ({
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2
    });

    const distance = (a, b) =>
        Math.hypot(
            (a.x - b.x) * W,
            (a.y - b.y) * H
        );

    const shoulders = midpoint(lm[11], lm[12]);
    const hips = midpoint(lm[23], lm[24]);
    const ankles = midpoint(lm[27], lm[28]);

    const leftKneeAngle =
        calculateAngle(lm[23], lm[25], lm[27]);

    const rightKneeAngle =
        calculateAngle(lm[24], lm[26], lm[28]);

    // 膝蓋角度較小的一側，視為屈膝側。
    const leftBent = leftKneeAngle <= rightKneeAngle;
    const bentSide = leftBent ? "左" : "右";

    const bentAngle =
        leftBent ? leftKneeAngle : rightKneeAngle;

    const straightAngle =
        leftBent ? rightKneeAngle : leftKneeAngle;

    const bentAnkle = leftBent ? lm[27] : lm[28];

    // 以平均腿長校正站距，減少離鏡頭遠近的影響。
    const legLength = (
        distance(lm[23], lm[25]) +
        distance(lm[25], lm[27]) +
        distance(lm[24], lm[26]) +
        distance(lm[26], lm[28])
    ) / 2;

    const stanceWidth =
        Math.abs(lm[27].x - lm[28].x) * W;

    // 正值表示髖部朝屈膝側移動。
    const hipShiftRatio =
        (hips.x - ankles.x) * W *
        Math.sign(bentAnkle.x - ankles.x) /
        Math.max(stanceWidth, 1);

    // 上半身相對畫面垂直方向的側傾角度。
    const torsoTilt = Math.atan2(
        Math.abs(shoulders.x - hips.x) * W,
        (hips.y - shoulders.y) * H
    ) * 180 / Math.PI;

    const messages = [];

    if (shoulders.y >= hips.y || hips.y >= ankles.y) {
        messages.push("請正面站立，讓全身完整入鏡");
    }

    if (stanceWidth < legLength * 0.85) {
        messages.push("請將雙腳向左右分開一些");
    }

    if (
        Math.abs(lm[27].y - lm[28].y) * H >
        legLength * 0.2
    ) {
        messages.push("請正面朝向鏡頭，讓雙腳都站在地面");
    }

    // 屈膝側的辨識範圍：110°～145°。
    if (bentAngle > 145) {
        messages.push("請在舒適範圍內，將一側膝蓋再彎一些");
    } else if (bentAngle < 110) {
        messages.push("請稍微抬高臀部，減少屈膝幅度");
    }

    // 另一側腿的膝蓋角度至少 155°。
    if (straightAngle < 155) {
        messages.push("請將另一側腿自然伸直");
    }

    if (hipShiftRatio < 0.08) {
        messages.push("請將重心移向屈膝側");
    }

    if (torsoTilt > 35) {
        messages.push("請保持上半身穩定，避免過度向側邊歪斜");
    }

    const isPerfect = messages.length === 0;

    // 換邊時重新計時，避免左右兩側的秒數相加。
    if (isPerfect && sideLungeHoldSide !== bentSide) {
        resetHold();
        sideLungeHoldSide = bentSide;
    }

    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, "側弓箭步");

    if (isPerfect) {
        setText(
            sideLungeStatusDiv,
            secondsLeft > 0
                ? `PERFECT！${bentSide}腿屈膝，請維持 ${secondsLeft} 秒...`
                : "PERFECT！側弓箭步完成！",
            COLOR_OK
        );
    } else {
        setText(
            sideLungeStatusDiv,
            messages.join("\n"),
            COLOR_ERR
        );

        messages.forEach(queueHint);
    }
}

// === 站立十字臂拉伸：僅判定上半身 ===
function analyzeCrossArmStretch(lm) {
    const poseName = "站立十字臂拉伸";

    const visible = i => {
        const p = lm?.[i];

        return p
            && Number.isFinite(p.x)
            && Number.isFinite(p.y)
            && p.x >= 0 && p.x <= 1
            && p.y >= 0 && p.y <= 1
            && (p.visibility ?? 0) >= 0.5;
    };

    const pauseDetection = message => {
        setText(crossArmStretchStatusDiv, message, COLOR_ERR);
        setStatus("neutral");
        updateHold(false, poseName);
        queueHint(message);
    };

    // 雙肩用來判斷左右方向。
    // 不再要求六個關節全部同時可見。
    if (!visible(11) || !visible(12)) {
        pauseDetection("請讓雙肩清楚入鏡");
        return;
    }

    const W = canvasElement?.width || 800;
    const shoulderDelta = lm[12].x - lm[11].x;

    if (Math.abs(shoulderDelta) * W < 1) {
        pauseDetection("請正面朝向鏡頭，讓雙肩清楚分開");
        return;
    }

    // 左肩指向右肩的水平方向。
    // 使用肩膀座標決定方向，避免鏡像時判斷顛倒。
    const leftToRight = Math.sign(shoulderDelta);

    // 左臂判定只需要：左手腕 15、右手肘 14。
    const leftDetectable = visible(15) && visible(14);

    // 右臂判定只需要：右手腕 16、左手肘 13。
    const rightDetectable = visible(16) && visible(13);

    if (!leftDetectable && !rightDetectable) {
        pauseDetection(
            "請讓左手腕與右手肘，或右手腕與左手肘清楚入鏡"
        );
        return;
    }

    // 條件 1：
    // 左手腕沿跨胸方向，比右手肘更外面。
    const leftCorrect = leftDetectable
        && (lm[15].x - lm[14].x) * leftToRight > 0;

    // 條件 2：
    // 右手腕沿跨胸方向，比左手肘更外面。
    const rightCorrect = rightDetectable
        && (lm[16].x - lm[13].x) * -leftToRight > 0;

    // 任一條件成立即可。
    const correctSides = [];

    if (leftCorrect) correctSides.push("左");
    if (rightCorrect) correctSides.push("右");

    // 若兩側同時成立，優先維持目前計時的側別，
    // 避免側別切換造成計時反覆重設。
    const selectedSide = correctSides.includes(
        crossArmStretchHoldSide
    )
        ? crossArmStretchHoldSide
        : correctSides[0];

    const isPerfect = Boolean(selectedSide);

    // 換手時重新計時。
    if (
        isPerfect
        && crossArmStretchHoldSide !== selectedSide
    ) {
        resetHold();
        crossArmStretchHoldSide = selectedSide;
    }

    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, poseName);

    if (isPerfect) {
        setText(
            crossArmStretchStatusDiv,
            secondsLeft > 0
                ? `PERFECT！拉伸${selectedSide}臂，請維持 ${secondsLeft} 秒...`
                : "PERFECT！站立十字臂拉伸完成！",
            COLOR_OK
        );
    } else {
        const message =
            "請將左手腕伸過右手肘外側，或將右手腕伸過左手肘外側";

        setText(
            crossArmStretchStatusDiv,
            message,
            COLOR_ERR
        );

        queueHint(message);
    }
}

// ===  英雄二式 (Warrior II) ===
function analyzeWarrior2(lm) {
    const hipL = lm[23], kneeL = lm[25], ankleL = lm[27];
    const hipR = lm[24], kneeR = lm[26], ankleR = lm[28];
    const shoulderL = lm[11], elbowL = lm[13], wristL = lm[15];
    const shoulderR = lm[12], elbowR = lm[14], wristR = lm[16];

    const leftKneeAngle = calculateAngle(hipL, kneeL, ankleL);
    const rightKneeAngle = calculateAngle(hipR, kneeR, ankleR);

    // 判斷哪一隻腳是前屈膝腳（膝蓋彎曲在 80° ~ 125° 之間）
    const isLeftFront = leftKneeAngle < 125 && rightKneeAngle > 145;
    const isRightFront = rightKneeAngle < 125 && leftKneeAngle > 145;

    const messages = [];

    // 1. 下肢弓箭步檢測
    if (!isLeftFront && !isRightFront) {
        messages.push("請將雙腳大步跨開：前腳屈膝（約90度）、後腳打直");
    } else {
        const bentAngle = isLeftFront ? leftKneeAngle : rightKneeAngle;
        const straightAngle = isLeftFront ? rightKneeAngle : leftKneeAngle;

        if (bentAngle < 115) {
            messages.push("前膝彎曲過多，請稍微抬高重心避免膝蓋受壓");
        } else if (bentAngle > 140) {
            messages.push("前腳膝蓋請再蹲低一些，靠近 90 度");
        }

        if (straightAngle < 145) {
            messages.push("後腳請盡量伸直打穩");
        }
    }

    // 2. 雙臂水平平舉檢測 (左右手臂上抬角度 70° ~ 115°，手肘打直 > 140°)
    const armRaiseL = calculateAngle(hipL, shoulderL, elbowL);
    const armRaiseR = calculateAngle(hipR, shoulderR, elbowR);
    const elbowStraightL = calculateAngle(shoulderL, elbowL, wristL);
    const elbowStraightR = calculateAngle(shoulderR, elbowR, wristR);

    if (armRaiseL < 65 || armRaiseR < 65) {
        messages.push("雙臂請向前後兩側抬起，與地面平行");
    } else if (armRaiseL > 115 || armRaiseR > 115) {
        messages.push("手臂抬太高了，保持水平即可");
    }

    if (elbowStraightL < 135 || elbowStraightR < 135) {
        messages.push("雙手手肘請盡量打直延伸");
    }

    const isPerfect = messages.length === 0;

    if (!isPerfect) {
        if (warrior2StatusDiv) {
            warrior2StatusDiv.innerHTML = messages
                .map(msg => `<span style="color: var(--error-text, #e8435a);">${msg}</span>`)
                .join("<br>");
        }
        messages.forEach(queueHint);
    }

    setStatus(isPerfect ? "perfect" : "error");

    const secondsLeft = updateHold(isPerfect, "英雄二式");

    if (isPerfect && warrior2StatusDiv) {
        warrior2StatusDiv.innerHTML = secondsLeft > 0
            ? `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 維持穩固英雄二式 ${secondsLeft} 秒...</span>`
            : `<span style="color: var(--success-text, #17a35a); font-weight: bold;">PERFECT! 英雄二式完成！</span>`;
    }
}


// AI 偵測主迴圈
function drawPoseForCurrentMode(lm, preview = false) {
    const upperBodyOnly =
        selectedPoseId.toLowerCase() === "crossarmstretch";

    const connections = upperBodyOnly
        ? [
            [11, 12],
            [11, 13], [13, 15],
            [12, 14], [14, 16]
        ]
        : POSE_CONNECTIONS;

    const points = upperBodyOnly
        ? [11, 12, 13, 14, 15, 16]
            .map(i => lm[i])
            .filter(Boolean)
        : lm;

    drawConnectors(canvasCtx, lm, connections, {
        color: preview ? "#7f8c8d" : "#00FF00",
        lineWidth: preview ? 2 : 4
    });

    drawLandmarks(canvasCtx, points, {
        color: preview ? "#bdc3c7" : "#FF0000",
        lineWidth: preview ? 1 : 2
    });
}

function onResults(results) {
    if (!workoutView || workoutView.style.display === "none") return;

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

    const landmarks = results.poseLandmarks;
    const mode = currentPoseMode.toLowerCase();

    // 十字臂拉伸只顯示肩膀、手肘與手腕。
    const upperBodyOnly =
        selectedPoseId.toLowerCase() === "crossarmstretch";

    const connections = upperBodyOnly
        ? [
            [11, 12],
            [11, 13], [13, 15],
            [12, 14], [14, 16]
        ]
        : POSE_CONNECTIONS;

    const points = upperBodyOnly && landmarks
        ? [11, 12, 13, 14, 15, 16]
            .map(i => landmarks[i])
            .filter(Boolean)
        : landmarks;

    const countdownOverlay =
        document.getElementById("countdown-overlay");

    const isCountdownActive =
        countdownOverlay &&
        countdownOverlay.style.display === "flex";

    // 介紹、倒數或教學期間，暫停姿勢判定。
    if (isIntroActive || isCountdownActive || isTutorialVisible()) {
        frameHints = [];

        if (landmarks) {
            drawConnectors(
                canvasCtx,
                landmarks,
                connections,
                { color: "#7f8c8d", lineWidth: 2 }
            );

            drawLandmarks(
                canvasCtx,
                points,
                { color: "#bdc3c7", lineWidth: 1 }
            );
        }

        canvasCtx.restore();
        return;
    }

    if (landmarks) {
        drawConnectors(
            canvasCtx,
            landmarks,
            connections,
            { color: "#00FF00", lineWidth: 4 }
        );

        drawLandmarks(
            canvasCtx,
            points,
            { color: "#FF0000", lineWidth: 2 }
        );

        try {
            // 傳入原始節點陣列，保留節點編號。
            switch (mode) {
                case "tree":
                    analyzeTree(landmarks);
                    break;

                case "squat":
                    analyzeSquat(landmarks);
                    break;

                case "raise":
                    analyzeRaise(landmarks);
                    break;

                case "sidestretch":
                    analyzeSideStretch(landmarks);
                    break;

                case "sidelunge":
                    analyzeSideLunge(landmarks);
                    break;

                case "crossarmstretch":
                    analyzeCrossArmStretch(landmarks);
                    break;

                case "dancer":
                    analyzeDancer(landmarks);
                    break;
            }
        } catch (error) {
            console.warn("Pose processing error:", error);
        }
    } else {
        resetHold();
        setStatus("neutral");

        const message = mode === "crossarmstretch"
            ? "尚未偵測到上半身，請讓雙肩、手肘與手腕完整入鏡"
            : "尚未偵測到身體，請站到鏡頭中央並讓全身入鏡";

        const outputs = {
            tree: [armStatusDiv, legStatusDiv],
            squat: [squatStatusDiv],
            raise: [raiseStatusDiv],
            sidestretch: [sideStretchStatusDiv],
            sidelunge: [sideLungeStatusDiv],
            crossarmstretch: [crossArmStretchStatusDiv],
            dancer: [dancerStatusDiv]
        };

        (outputs[mode] || []).forEach(el => {
            setText(el, message, "");
        });

        queueHint(message);
    }

    flushHints();
    canvasCtx.restore();
}

function handlePoseSuccess(poseNameChinese) {
    saveDailyRecord(poseNameChinese, "Perfect");
    hasSavedThisRep = true;

    if (saveStatusDiv) {
        saveStatusDiv.innerText = `🌟 完美${poseNameChinese}！已記錄！`;
        saveStatusDiv.style.color = COLOR_OK;
    }

    speakHint(`太棒了！${poseNameChinese}完成！`, { priority: true });
}

// ==========================================
// 13. 資料庫儲存與查詢核心
// ==========================================
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
        const querySnapshot = await withUiTimeout(getDocs(historyRef));

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
            console.warn("圖表暫時無法顯示，仍可查看動作次數", error);
            if (chartCard) chartCard.hidden = true;
        }
    } catch (error) {
        console.error("讀取我的最愛失敗", error);

        if (!isCurrentRequest()) return;

        if (summary) {
            summary.textContent = "暫時無法載入我的最愛，請按「重新整理」重試。";
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

    const colors = {
        "大樹式": "#a29bfe",
        "深蹲": "#74b9ff",
        "平舉": "#81ecec",
        "側腰拉伸": "#fab1a0",
        "舞王式": "#fd79a8" ,
        "三角式": "#ffeaa7",
        "側弓箭步": "#55efc4",
        "站立十字臂拉伸": "#a3cb38",
        "英雄二式": "#ff7675"
    };

    favoritesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: poseCounts.map(item => item.title),
            datasets: [{
                label: "Perfect 次數",
                data: poseCounts.map(item => item.count),
                backgroundColor: poseCounts.map(
                    item => colors[item.title] || "#a29bfe"
                ),
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => `${context.parsed.y} 次 Perfect`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 1,
                    ticks: { precision: 0 },
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

// 面板按鈕事件綁定
btnProfile?.addEventListener("click", () => {
    toggleDashboardPanel(profileContainer, btnProfile, loadProfileData);
});

toggleFavoritesBtn?.addEventListener("click", () => {
    toggleDashboardPanel(favoritesContainer, toggleFavoritesBtn, loadFavoritesData);
});

toggleLeaderboardBtn?.addEventListener("click", () => {
    toggleDashboardPanel(leaderboardContainer, toggleLeaderboardBtn, loadLeaderboardData);
});

document.getElementById("favorites-close-btn")?.addEventListener("click", closeAllPanels);
document.getElementById("favorites-refresh-btn")?.addEventListener("click", () => {
    void loadFavoritesData();
});

// ==========================================
// 🌟 16. 郵件提醒功能模組 (EmailJS)
// ==========================================
const EMAILJS_PUBLIC_KEY = "xfPxgJEpZ-Ur7Tq7e";
const EMAILJS_SERVICE_ID = "service_k67ijnj";
const EMAILJS_TEMPLATE_ID = "template_he8ob63";

if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
}

const btnEmailRemind = document.getElementById('btn-email-remind');
const emailModal = document.getElementById('email-modal');
const btnCloseEmailModal = document.getElementById('btn-close-email-modal');
const remindEmailInput = document.getElementById('remind-email-input');
const remindTimeInput = document.getElementById('remind-time-input');
const btnSendTestEmail = document.getElementById('btn-send-test-email');
const btnSaveRemind = document.getElementById('btn-save-remind');

btnEmailRemind?.addEventListener('click', async () => {
    if (!currentUser) {
        alert("請先登入帳號！");
        return;
    }

    if (remindEmailInput) remindEmailInput.value = currentUser.email || "";

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

btnCloseEmailModal?.addEventListener('click', () => {
    if (emailModal) emailModal.style.display = 'none';
});

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
