let stream = null; // 웹캠 스트림 저장 변수

// 웹캠 시작 함수
async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoElement = document.getElementById("cameraview");
        videoElement.srcObject = stream;
        videoElement.style.transform = "scaleX(-1)"; // 좌우 반전 적용
        await videoElement.play();
        console.log("✅ 웹캠 시작됨! (좌우 반전)");
    } catch (err) {
        console.error("❌ 웹캠을 가져오는 데 실패했습니다:", err);
        alert("웹캠 접근이 거부되었거나 사용이 불가능합니다!");
    }
}

// 웹캡 캡처 함수
function capturecam() {
    if (!stream) {
        console.warn("⚠ 웹캠이 활성화되지 않음!");
        return;
    }

    const video = document.getElementById("cameraview");
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const canvas = document.getElementById("captureCanvas");
    const context = canvas.getContext("2d");

    canvas.width = videoWidth;
    canvas.height = videoHeight;

    context.translate(videoWidth, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, videoWidth, videoHeight);

    const newImage = document.createElement("img");
    newImage.src = canvas.toDataURL("image/png");
    newImage.classList.add("captured-img");
    newImage.style.width = "160px";
    newImage.style.height = "120px";
    newImage.style.marginRight = "10px";

    document.getElementById("capturedList").appendChild(newImage);

    console.log(`📸 웹캠 화면 캡처됨! 해상도: ${videoWidth} x ${videoHeight}`);
}

// 가로 스크롤 (휠, 터치, 드래그 지원)
function enableHorizontalScroll() {
    const slider = document.getElementById("capturedList");
    let isDown = false;
    let startX;
    let scrollLeft;

    // 마우스 이벤트 (PC 드래그 지원)
    slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.classList.add("active");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.classList.remove("active");
    });

    slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("active");
    });

    slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; // 이동 속도 조절
        slider.scrollLeft = scrollLeft - walk;
    });

    // 터치 이벤트 (모바일 터치 스크롤 지원)
    let touchStartX = 0;
    let touchScrollLeft = 0;

    slider.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].pageX;
        touchScrollLeft = slider.scrollLeft;
    });

    slider.addEventListener("touchmove", (e) => {
        const touchMoveX = e.touches[0].pageX;
        const walk = (touchMoveX - touchStartX) * 2; // 터치 이동 속도 조절
        slider.scrollLeft = touchScrollLeft - walk;
        e.preventDefault(); // 기본 터치 스크롤 방지
    });

    // 마우스 휠 가로 스크롤 지원
    slider.addEventListener("wheel", (e) => {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
    });
}

// 버튼 클릭 이벤트 리스너 추가
document.addEventListener("DOMContentLoaded", () => {
    startWebcam();
    document.getElementById("capturebtn").addEventListener("click", capturecam);
    enableHorizontalScroll();
});
