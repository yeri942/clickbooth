document.addEventListener("DOMContentLoaded", () => {
    const imageArea = document.getElementById("selectedImageArea");
    const selectedImages = JSON.parse(localStorage.getItem("selectedImages") || "[]");
    const filterMode = localStorage.getItem("filterMode") || "color";

    if (selectedImages.length !== 2) {
        imageArea.innerHTML = "<p>선택된 이미지가 없습니다.</p>";
        return;
    }

    selectedImages.forEach((src, index) => {
        const container = document.createElement("div");
        container.classList.add("photo-container");

        const img = document.createElement("img");
        img.src = src;
        img.alt = "Selected Image";
        img.classList.add("sticker-img");
        if (filterMode === "gray") {
            img.classList.add("gray");
        }

        container.appendChild(img);
        imageArea.appendChild(container);
    });

    document.querySelectorAll(".sticker_area .sticker img").forEach((sticker) => {
        sticker.addEventListener("click", () => {
            const newSticker = document.createElement("div");
            newSticker.classList.add("placed-sticker");

            newSticker.style.left = "10%";
            newSticker.style.top = "10%";
            newSticker.style.width = "20%";
            newSticker.style.height = "auto";

            const stickerImg = document.createElement("img");
            stickerImg.src = sticker.src.replace("_s.png", ".png");
            stickerImg.style.width = "100%";
            stickerImg.style.height = "100%";
            stickerImg.style.objectFit = "contain";

            const closeBtn = document.createElement("button");
            closeBtn.classList.add("close-btn");
            closeBtn.textContent = "×";

            const resizeHandle = document.createElement("div");
            resizeHandle.classList.add("resize-handle");
            resizeHandle.innerHTML = '<i class="fas fa-up-right-and-down-left-from-center"></i>';

            const rotateHandle = document.createElement("div");
            rotateHandle.classList.add("rotate-handle");
            rotateHandle.innerHTML = '<i class="fas fa-rotate"></i>';

            newSticker.appendChild(stickerImg);
            newSticker.appendChild(closeBtn);
            newSticker.appendChild(resizeHandle);
            newSticker.appendChild(rotateHandle);

            const targetPhoto = document.getElementById("selectedImageArea");
            targetPhoto.appendChild(newSticker);

            makeStickerInteractive(newSticker, resizeHandle, rotateHandle);

            document.querySelectorAll(".placed-sticker").forEach((sticker) => {
                sticker.classList.remove("selected");
                sticker.querySelector(".close-btn").style.display = "none";
                sticker.querySelector(".resize-handle").style.display = "none";
                sticker.querySelector(".rotate-handle").style.display = "none";
            });

            newSticker.classList.add("selected");
            closeBtn.style.display = "block";
            resizeHandle.style.display = "flex";
            rotateHandle.style.display = "flex";

            newSticker.addEventListener("mousedown", () => {
                document.querySelectorAll(".placed-sticker").forEach((sticker) => {
                    sticker.classList.remove("selected");
                    sticker.querySelector(".close-btn").style.display = "none";
                    sticker.querySelector(".resize-handle").style.display = "none";
                    sticker.querySelector(".rotate-handle").style.display = "none";
                });
                newSticker.classList.add("selected");
                closeBtn.style.display = "block";
                resizeHandle.style.display = "flex";
                rotateHandle.style.display = "flex";
            });

            closeBtn.addEventListener("click", () => newSticker.remove());
        });
    });

    // 🔥 부모 영역 크기를 저장하는 변수
    let originalWidth = imageArea.clientWidth;
    let originalHeight = imageArea.clientHeight;

    function updateStickerScale() {
        const selectedImageArea = document.getElementById("selectedImageArea");
        const currentWidth = selectedImageArea.clientWidth;
        const currentHeight = selectedImageArea.clientHeight;

        selectedImageArea.querySelectorAll(".placed-sticker").forEach((sticker) => {
            const parentRect = selectedImageArea.getBoundingClientRect();

            if (!sticker.dataset.originalWidth) {
                const rect = sticker.getBoundingClientRect();
                sticker.dataset.originalWidth = (rect.width / parentRect.width) * 100;
                sticker.dataset.originalHeight = (rect.height / parentRect.height) * 100;

                sticker.dataset.originalX = ((rect.left - parentRect.left) / parentRect.width) * 100;
                sticker.dataset.originalY = ((rect.top - parentRect.top) / parentRect.height) * 100;

                sticker.dataset.originalRotation = parseFloat(sticker.getAttribute("data-rotation")) || 0;
            }

            const originalXPercent = parseFloat(sticker.dataset.originalX);
            const originalYPercent = parseFloat(sticker.dataset.originalY);
            const originalWidthPercent = parseFloat(sticker.dataset.originalWidth);
            const originalHeightPercent = parseFloat(sticker.dataset.originalHeight);
            const originalRotation = parseFloat(sticker.dataset.originalRotation) || 0;

            // ✅ 부모 크기에 따른 위치와 크기 다시 계산
            const newX = (originalXPercent / 100) * currentWidth;
            const newY = (originalYPercent / 100) * currentHeight;
            const newWidth = (originalWidthPercent / 100) * currentWidth;
            const newHeight = (originalHeightPercent / 100) * currentHeight;

            // ✅ 스티커 스타일 업데이트
            sticker.style.width = `${newWidth}px`;
            sticker.style.height = `${newHeight}px`;

            // ✅ 정확한 위치 적용 (기존 data-x, data-y 사용하지 않음)
            sticker.style.transform = `translate(${newX}px, ${newY}px) rotate(${originalRotation}deg)`;
        });

        originalWidth = currentWidth;
        originalHeight = currentHeight;
    }

    // 🔥 초기 스케일 업데이트
    updateStickerScale();

    // 🔥 윈도우 리사이즈 시 스케일 업데이트
    window.addEventListener("resize", updateStickerScale);
});

function makeStickerInteractive(stickerEl, resizeHandle, rotateHandle) {
    interact(stickerEl).draggable({
        onmove: dragMoveListener,
    });

    interact(resizeHandle).draggable({
        listeners: {
            start(event) {
                const target = event.target.parentElement;
                const style = window.getComputedStyle(target);

                const width = parseFloat(style.width);
                const height = parseFloat(style.height);

                target.dataset.startWidth = width;
                target.dataset.startHeight = height;
                target.dataset.startX = event.client.x;
                target.dataset.startY = event.client.y;
            },
            move(event) {
                const target = event.target.parentElement;

                const startWidth = parseFloat(target.dataset.startWidth);
                const startHeight = parseFloat(target.dataset.startHeight);
                const startX = parseFloat(target.dataset.startX);
                const startY = parseFloat(target.dataset.startY);

                const dx = event.client.x - startX;
                const dy = event.client.y - startY;

                const distance = Math.sqrt(dx * dx + dy * dy);
                const direction = dx + dy > 0 ? 1 : -1;
                const sizeChange = direction * distance;

                const newSize = Math.max(20, startWidth + sizeChange);
                target.style.width = `${newSize}px`;
                target.style.height = `${newSize}px`;
            },
        },
    });

    // 🔥 회전 핸들 기능 추가 (여기 아래에 넣어야 함)
    interact(rotateHandle).draggable({
        listeners: {
            start(event) {
                const sticker = event.target.parentElement;
                const rect = sticker.getBoundingClientRect();

                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                sticker.dataset.centerX = centerX;
                sticker.dataset.centerY = centerY;

                const dx = event.client.x - centerX;
                const dy = event.client.y - centerY;
                sticker.dataset.startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

                sticker.dataset.startRotation = parseFloat(sticker.getAttribute("data-rotation")) || 0;
            },
            move(event) {
                const target = event.target.parentElement;
                const centerX = parseFloat(target.dataset.centerX);
                const centerY = parseFloat(target.dataset.centerY);

                const dx = event.client.x - centerX;
                const dy = event.client.y - centerY;
                const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

                const startAngle = parseFloat(target.dataset.startAngle);
                const startRotation = parseFloat(target.dataset.startRotation);

                const deltaAngle = currentAngle - startAngle;
                const newRotation = startRotation + deltaAngle;

                const x = parseFloat(target.getAttribute("data-x")) || 0;
                const y = parseFloat(target.getAttribute("data-y")) || 0;

                // 🔥 회전값을 포함해서 transform 설정
                target.style.transform = `translate(${x}px, ${y}px) rotate(${newRotation}deg)`;
                target.setAttribute("data-rotation", newRotation);
            },
        },
    });
}
function dragMoveListener(event) {
    const target = event.target;
    const selectedImageArea = document.getElementById("selectedImageArea");
    const parentRect = selectedImageArea.getBoundingClientRect();

    // 현재 드래그 중인 위치 값 계산
    let x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx;
    let y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    // 현재 위치를 translate로 이동시키기
    const rotation = parseFloat(target.getAttribute("data-rotation")) || 0;
    target.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

    // 새로운 위치를 저장 (px 단위)
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);

    // 🔥 부모 요소 기준으로 % 단위로 다시 계산해서 저장 (여기가 핵심!)
    const currentRect = target.getBoundingClientRect();
    const newXPercent = ((currentRect.left - parentRect.left) / parentRect.width) * 100;
    const newYPercent = ((currentRect.top - parentRect.top) / parentRect.height) * 100;

    // ❗ 중요한 부분! 최신 위치를 %로 저장해 둠
    target.dataset.originalX = newXPercent;
    target.dataset.originalY = newYPercent;
}

interact(rotateHandle).draggable({
    listeners: {
        start(event) {
            const sticker = event.target.parentElement;
            const rect = sticker.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            sticker.dataset.centerX = centerX;
            sticker.dataset.centerY = centerY;

            const dx = event.client.x - centerX;
            const dy = event.client.y - centerY;
            sticker.dataset.startAngle = Math.atan2(dy, dx) * (180 / Math.PI);

            sticker.dataset.startRotation = parseFloat(sticker.getAttribute("data-rotation")) || 0;
        },
        move(event) {
            const target = event.target.parentElement;
            const centerX = parseFloat(target.dataset.centerX);
            const centerY = parseFloat(target.dataset.centerY);

            const dx = event.client.x - centerX;
            const dy = event.client.y - centerY;
            const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

            const startAngle = parseFloat(target.dataset.startAngle);
            const startRotation = parseFloat(target.dataset.startRotation);

            const deltaAngle = currentAngle - startAngle;
            const newRotation = startRotation + deltaAngle;

            // 🔥 회전 값 유지
            const x = parseFloat(target.getAttribute("data-x")) || 0;
            const y = parseFloat(target.getAttribute("data-y")) || 0;

            target.style.transform = `translate(${x}px, ${y}px) rotate(${newRotation}deg)`;
            target.setAttribute("data-rotation", newRotation);
        },
    },
});
