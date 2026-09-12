(() => {
    const $ = mdui.$;

    // Put your own voice files in static/audio/ and change this list.
    // The first file is played on the first click; after that, playback is
    // weighted so "kuru kuru" (kuru2) comes up roughly 3x as often as
    // "kururin" (kuru1) or the other clip (kuruto).
    const audioList = [
        { url: "audio/ja/kuru1.mp3", weight: 1 },  // "kururin"
        { url: "audio/ja/kuru2.mp3", weight: 3 },  // "kuru kuru"
        { url: "audio/ja/kuruto.mp3", weight: 1 }
    ];

    const counterButton = document.querySelector('#counter-button');
    const localCounter = document.querySelector('#local-counter');

    let localCount = Number(localStorage.getItem('count-v2') || 0);
    let firstSquish = true;

    localCounter.textContent = localCount.toLocaleString('en-US');

    function randomChoice(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function weightedChoice(items) {
        const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
        let roll = Math.random() * totalWeight;
        for (const item of items) {
            if (roll < item.weight) return item.url;
            roll -= item.weight;
        }
        return items[items.length - 1].url;
    }

    function playKuru() {
        if (!audioList.length) return;

        const audioUrl = firstSquish ? audioList[0].url : weightedChoice(audioList);
        firstSquish = false;

        const audio = new Audio("static/" + audioUrl);
        audio.play().catch(error => console.error("Audio playback failed:", error));
    }


    // Show the Kuru Kuru girl and move her across the screen.
    // The GIF itself contains the spinning animation.
    function animateKuru() {
        const elem = document.createElement("img");
        elem.src = "static/img/kurukuru.gif";
        elem.alt = "Kuru Kuru";
        elem.style.position = "fixed";
        elem.style.width = "250px";
        elem.style.height = "250px";
        elem.style.objectFit = "contain";
        elem.style.pointerEvents = "none";
        elem.style.zIndex = "1000";

        const buttonRect = counterButton.getBoundingClientRect();
        const maxTop = Math.max(10, window.innerHeight - 250);
        elem.style.top = Math.min(
            maxTop,
            Math.max(10, buttonRect.top - 125)
        ) + "px";
        elem.style.left = "-280px";

        document.body.appendChild(elem);

        let x = -280;
        const end = window.innerWidth + 280;
        const speed = Math.max(5, window.innerWidth / 180);

        function move() {
            x += speed;
            elem.style.left = x + "px";

            if (x < end) {
                requestAnimationFrame(move);
            } else {
                elem.remove();
            }
        }

        requestAnimationFrame(move);
    }

    function triggerRipple(e) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.left = e.clientX + 'px';
        ripple.style.top = e.clientY + 'px';
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    }

    counterButton.addEventListener('click', (e) => {
        localCount++;
        localCounter.textContent = localCount.toLocaleString('en-US');
        localStorage.setItem('count-v2', localCount);
        triggerRipple(e);
        playKuru();
        animateKuru();
    });

    const loading = document.getElementById('loading');
    if (loading) loading.remove();

    // ---- Webcam face-detection meme trigger ----

    const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
    // Repeats while a face is detected, picking a random clip each time.
    const MEME_SOUNDS = [
        "audio/meme/face-detected.mp3",
        "audio/meme/kurrip.mp3",
        "audio/meme/botham.mp3"
    ];
    const MEME_REPEAT_MS = 3000; // minimum gap between repeats while a face stays in frame

    const webcamButton = document.getElementById('webcam-button');
    const webcamContainer = document.getElementById('webcam-container');
    const webcamVideo = document.getElementById('webcam-video');
    const webcamCanvas = document.getElementById('webcam-canvas');
    const webcamStatus = document.getElementById('webcam-status');
    const webcamClose = document.getElementById('webcam-close');

    let modelsLoaded = false;
    let modelsLoading = null;
    let detectionLoopHandle = null;
    let mediaStream = null;
    let lastMemeSoundTime = 0;

    function playMemeSound() {
        const url = randomChoice(MEME_SOUNDS);
        const audio = new Audio("static/" + url);
        audio.play().catch(error => console.error("Meme audio playback failed:", error));
    }

    async function loadFaceModels() {
        if (modelsLoaded) return;
        if (modelsLoading) return modelsLoading;

        modelsLoading = faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
            .then(() => {
                modelsLoaded = true;
            })
            .catch((error) => {
                console.error("Failed to load face detection model:", error);
                webcamStatus.textContent = "Couldn't load face detector. Check your connection.";
                throw error;
            });

        return modelsLoading;
    }

    async function startWebcam() {
        webcamContainer.classList.remove('hidden');
        webcamStatus.textContent = "Requesting camera access…";

        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } catch (error) {
            console.error("Webcam access failed:", error);
            webcamStatus.textContent = "Camera access denied or unavailable.";
            return;
        }

        webcamVideo.srcObject = mediaStream;
        await new Promise((resolve) => {
            webcamVideo.onloadedmetadata = resolve;
        });

        webcamCanvas.width = webcamVideo.videoWidth;
        webcamCanvas.height = webcamVideo.videoHeight;

        webcamStatus.textContent = "Loading face detector…";

        try {
            await loadFaceModels();
        } catch {
            return;
        }

        webcamStatus.textContent = "Looking for a face…";
        lastMemeSoundTime = 0;
        runDetectionLoop();
    }

    function stopWebcam() {
        if (detectionLoopHandle) {
            clearTimeout(detectionLoopHandle);
            detectionLoopHandle = null;
        }
        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
            mediaStream = null;
        }
        webcamVideo.srcObject = null;
        const ctx = webcamCanvas.getContext('2d');
        ctx.clearRect(0, 0, webcamCanvas.width, webcamCanvas.height);
        webcamContainer.classList.add('hidden');
    }

    async function runDetectionLoop() {
        if (!mediaStream) return;

        const detections = await faceapi.detectAllFaces(
            webcamVideo,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
        );

        drawDetections(detections);

        const facePresent = detections.length > 0;

        if (facePresent) {
            webcamStatus.textContent = `Face detected (${detections.length})!`;
            const now = performance.now();
            if (now - lastMemeSoundTime > MEME_REPEAT_MS) {
                lastMemeSoundTime = now;
                playMemeSound();
            }
        } else {
            webcamStatus.textContent = "Looking for a face…";
        }

        detectionLoopHandle = setTimeout(runDetectionLoop, 300);
    }

    function drawDetections(detections) {
        const ctx = webcamCanvas.getContext('2d');
        ctx.clearRect(0, 0, webcamCanvas.width, webcamCanvas.height);
        ctx.save();
        // Mirror to match the mirrored video preview.
        ctx.translate(webcamCanvas.width, 0);
        ctx.scale(-1, 1);
        ctx.strokeStyle = "#8affc1";
        ctx.lineWidth = 3;
        detections.forEach((det) => {
            const { x, y, width, height } = det.box;
            ctx.strokeRect(x, y, width, height);
        });
        ctx.restore();
    }

    if (webcamButton) {
        webcamButton.addEventListener('click', startWebcam);
    }
    if (webcamClose) {
        webcamClose.addEventListener('click', stopWebcam);
    }
})();
