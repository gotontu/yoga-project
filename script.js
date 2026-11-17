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
// 🌟 4. 動作資料庫（已包含全部 9 支自錄教學影片）
// ==========================================
const POSE_DATABASE = [
    {
        id: "tree",
        title: "大樹式",
        subtitle: "Tree Pose",
        img: "image/tree.png",
        videoUrl: "https://www.youtube.com/embed/jCRAZC-yYKQ",
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
        videoUrl: "https://www.youtube.com/embed/CQNHqvFjljs",
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
        videoUrl: "https://www.youtube.com/embed/ASEIOoRLi6k",
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
        videoUrl: "https://www.youtube.com/embed/1b55p0FsTg0",
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
        videoUrl: "https://www.youtube.com/embed/R7HMp_LOZ3M",
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
        videoUrl: "https://www.youtube.com/embed/VfVqvCF_seE",
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
        videoUrl: "https://www.youtube.com/embed/KZdrZjsht7M",
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
        videoUrl: "https://www.youtube.com/embed/wSDwXhJz8DI",
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
        videoUrl: "https://www.youtube.com/embed/rikZSIladqw",
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

renderCheckInCalendar();

// ==========================================
// 網頁導覽：支援瀏覽器的返回與前進箭頭
// ==========================================
history.replaceState({
    yogaPage: "landing",
    poseId: null
}, "");

function navigatePage(page, {
    poseId = null,
    replace = false,
    fromHistory = false
} = {}) {
    if (!["landing", "home", "workout"].includes(page)) {
        page = "landing";
    }

    if (!currentUser && page !== "landing") {
        page = "landing";
    }

    const poseItem = page === "workout"
        ? POSE_DATABASE.find(
            p => p.id.toLowerCase() === String(poseId).toLowerCase()
        )
        : null;

    if (page === "workout" && !poseItem) {
        page = "home";
    }

    const state = {
        yogaPage: page,
        poseId: page === "workout" ? poseItem.id : null
    };

    const sameState =
        history.state?.yogaPage === state.yogaPage
        && history.state?.poseId === state.poseId;

    if (fromHistory) {
        if (!sameState) {
            history.replaceState(state, "");
        }
    } else if (replace) {
        history.replaceState(state, "");
    } else if (!sameState) {
        history.pushState(state, "");
    }

    closeAllPanels();
    leaveWorkoutCleanup();

    if (landingPage) {
        landingPage.style.display =
            page === "landing" ? "flex" : "none";
    }

    if (homeView) {
        homeView.style.display =
            page === "home" ? "flex" : "none";
    }

    if (workoutView) {
        workoutView.style.display =
            page === "workout" ? "flex" : "none";
    }

    if (page === "home") {
        renderActionGrid();
    } else if (page === "workout") {
        selectedPoseId = poseItem.id;

        if (currentWorkoutTitle) {
            currentWorkoutTitle.innerText =
                `${poseItem.title} 練習室`;
        }

        if (quickSwitchSelect) {
            quickSwitchSelect.value = poseItem.id;
        }

        showPoseUI(poseItem.id);
        startCamera();
        openPoseIntro(poseItem.id);
    }

    window.scrollTo(0, 0);
}

window.addEventListener("popstate", event => {
    navigatePage(event.state?.yogaPage ?? "landing", {
        poseId: event.state?.poseId ?? null,
        fromHistory: true
    });
});

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
        navigatePage("landing", { replace: true });
    }
});

loginBtn?.addEventListener("click", () => {
    signInWithPopup(auth, provider).catch(err => {
        console.error("登入失敗", err);
        alert("登入失敗：" + (err.message || "請檢查網路連線"));
    });
});

startBtn?.addEventListener("click", () => {
    navigatePage("home");
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
    navigatePage("workout", { poseId });
}

btnBackHome?.addEventListener("click", () => {
    history.back();
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
// 8. 教學影片（靜音、無限重播、同步偵測）
// ==========================================
function isTutorialVisible() {
    return !!tutorialVideoContainer &&
        !tutorialVideoContainer.classList.contains("hidden-container");
}

function closeTutorial() {
    if (tutorialVideoContainer) {
        tutorialVideoContainer.classList.add("hidden-container");
    }

    if (tutorialVideo) {
        tutorialVideo.removeAttribute("src");
    }

    if (btnTutorial) btnTutorial.textContent = "教學";
}

function updateTutorialVideoSrc(poseId) {
    if (!tutorialVideo) return;
    const poseItem = POSE_DATABASE.find(
        p => p.id.toLowerCase() === poseId.toLowerCase()
    );

    if (poseItem?.videoUrl) {
        const embedUrl = new URL(poseItem.videoUrl);
        const videoId = embedUrl.pathname.split("/").pop();

        embedUrl.searchParams.set("autoplay", "1");
        embedUrl.searchParams.set("mute", "1");
        embedUrl.searchParams.set("playsinline", "1");
        embedUrl.searchParams.set("rel", "0");
        // 🌟 啟動無限循環重播
        embedUrl.searchParams.set("loop", "1");
        if (videoId) {
            embedUrl.searchParams.set("playlist", videoId);
        }

        tutorialVideo.src = embedUrl.toString();
    } else {
        tutorialVideo.removeAttribute("src");
    }
}

quickSwitchSelect?.addEventListener("change", e => {
    const poseId = e.target.value;
    selectedPoseId = poseId;

    const poseItem = POSE_DATABASE.find(p => p.id.toLowerCase() === poseId.toLowerCase());
    if (currentWorkoutTitle && poseItem) {
        currentWorkoutTitle.innerText = `${poseItem.title} 練習室`;
    }

    if (isTutorialVisible()) {
        updateTutorialVideoSrc(poseId);
    }

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

    updateTutorialVideoSrc(selectedPoseId);
    tutorialVideoContainer.classList.remove("hidden-container");
    btnTutorial.textContent = "關閉教學";
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
    if (crossArmStretchInfo) {crossArmStretchInfo.style.display = norm === "crossarmstretch" ? "block" : "none";}
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
    } else if (norm === "triangle") {
        setText(triangleStatusDiv, "請雙腳張開打直，單手向下輕觸腳踝，另一手筆直上舉", "");
    } else if (norm === "sidelunge") {
        setText(sideLungeStatusDiv,"請正面站立，雙腳向左右分開，一側屈膝、另一側腿伸直","");
    } else if (norm === "crossarmstretch") {
        setText(crossArmStretchStatusDiv,"請將一手橫跨胸前，另一手彎曲扶住上臂附近","");
    } else if (norm === "warrior2") {
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

    const isRightLegLifted = (rightKneeAngle < 135) && (ankleR.y < kneeR.y + 0.12);
    const isLeftLegLifted = (leftKneeAngle < 135) && (ankleL.y < kneeL.y + 0.12);

    const messages = [];

    if (isRightLegLifted) {
        if (leftKneeAngle < 150) {
            messages.push("支撐腳（左腳）請打直站穩");
        }
        const leftArmStraight = calculateAngle(shoulderL, elbowL, wristL);
        const leftArmRaise = calculateAngle(hipL, shoulderL, elbowL);
        if (leftArmStraight < 135 || leftArmRaise < 45) {
            messages.push("前手請向前上方延伸打直");
        }
    } else if (isLeftLegLifted) {
        if (rightKneeAngle < 150) {
            messages.push("支撐腳（右腳）請打直站穩");
        }
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

// === 三角式 (Triangle Pose) ===
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

    if (leftKneeAngle < 150 || rightKneeAngle < 150) {
        messages.push("雙腿膝蓋請盡量打直勿微彎");
    }

    const isLeaningLeft = wristL.y > hipL.y && wristR.y < shoulderR.y;
    const isLeaningRight = wristR.y > hipR.y && wristL.y < shoulderL.y;

    if (!isLeaningLeft && !isLeaningRight) {
        messages.push("請將上半身側傾，單手向下靠近腳踝，另一手向上延伸");
    } else {
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

    const missingParts =
