let stream = null; // 웹캠 스트림 저장 변수
const maxImages = 4; // 최대 이미지 개수

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

// 플래시 효과 함수
function triggerFlashEffect() {
    const flash = document.getElementById("flashEffect");
    if (!flash) return;
    flash.style.animation = "none"; // 애니메이션 초기화
    void flash.offsetWidth; // 리플로우 트리거 (애니메이션 리셋)
    flash.style.animation = "flash 0.1s ease-out"; // 플래시 애니메이션 실행
}

// 현재 이미지 개수 업데이트 함수
function updateImageCount() {
    const capturedList = document.getElementById("capturedList");
    const imageCount = capturedList.children.length; // 현재 이미지 개수
    const countDisplay = document.getElementById("imageCount");
    const captureButton = document.getElementById("capturebtn");

    countDisplay.textContent = `${imageCount}/${maxImages}`; // 개수 표시

    if (imageCount >= maxImages) {
        captureButton.disabled = true;
        captureButton.style.opacity = "0.5"; // 비활성화 스타일 추가
        saveImagesToLocalStorage(); // 촬영된 이미지 저장
        showOverlayAndRedirect(); // 오버레이 표시 후 페이지 이동
    }
}

// 사진을 로컬 스토리지에 저장하는 함수
function saveImagesToLocalStorage() {
    const capturedList = document.getElementById("capturedList").children;
    let images = [];

    for (let i = 0; i < capturedList.length; i++) {
        images.push(capturedList[i].src); // 이미지 데이터를 배열에 저장
    }

    localStorage.setItem("capturedImages", JSON.stringify(images)); // 로컬 스토리지에 저장
    console.log("📸 저장된 이미지 데이터:", images); // 저장된 데이터 확인 (디버깅용)
}

// 버튼 클릭 시 플래시 효과 실행 후 페이지 이동
function showOverlayAndRedirect() {
    const overlay = document.getElementById("overlay");
    overlay.classList.add("active"); // 오버레이 표시

    setTimeout(() => {
        window.location.href = "select_filter.html"; // 1초 후 페이지 이동
    }, 1000);
}

// 버튼 연속 클릭 방지 변수
let isCapturing = false;

// 웹캡 캡처 함수 (최대 4장 제한, 추가 캡처 불가)
function capturecam() {
    if (isCapturing) return; // 이미 실행 중이면 다시 실행되지 않도록 방지
    isCapturing = true; // 실행 중 플래그 설정

    const capturedList = document.getElementById("capturedList");

    // 최대 이미지 개수 제한 (더 이상 추가 X)
    if (capturedList.children.length >= maxImages) {
        console.warn("⚠ 최대 이미지 개수(4개)를 초과할 수 없습니다!");
        isCapturing = false; // 실행 중 플래그 해제
        return;
    }

    if (!stream) {
        console.warn("⚠ 웹캠이 활성화되지 않음!");
        isCapturing = false; // 실행 중 플래그 해제
        return;
    }

    triggerFlashEffect(); // 플래시 효과 실행

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

    capturedList.appendChild(newImage);
    updateImageCount(); // 개수 업데이트

    console.log(`📸 웹캠 화면 캡처됨! 해상도: ${videoWidth} x ${videoHeight}`);

    // 일정 시간 후 다시 캡처 가능하도록 설정 (100ms 후 해제)
    setTimeout(() => {
        isCapturing = false;
    }, 100);
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
        const walk = (x - startX) * 2;
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
        const walk = (touchMoveX - touchStartX) * 2;
        slider.scrollLeft = touchScrollLeft - walk;
        e.preventDefault();
    });

    // 마우스 휠 가로 스크롤 지원
    slider.addEventListener("wheel", (e) => {
        e.preventDefault();
        slider.scrollLeft += e.deltaY;
    });
}

// 버튼 클릭 이벤트 리스너 추가 (중복 실행 방지)
document.addEventListener("DOMContentLoaded", () => {
    startWebcam();
    enableHorizontalScroll();
    updateImageCount(); // 초기 카운트 설정

    // 캡처 버튼 클릭 이벤트 (중복 방지 적용)
    document.getElementById("capturebtn").addEventListener("click", capturecam);
});
