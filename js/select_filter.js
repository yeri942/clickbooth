// 선택된 이미지들을 저장하는 배열
let selectedImages = [];

function loadImages() {
    const photoGallery = document.getElementById("photoGallery");
    const storedImages = localStorage.getItem("capturedImages");

    if (storedImages && storedImages !== "null") {
        const images = JSON.parse(storedImages);

        if (images.length > 0) {
            images.forEach((src, index) => {
                const photoDiv = document.createElement("div");
                photoDiv.classList.add("photo");

                const imgElement = document.createElement("img");
                imgElement.src = src;
                imgElement.alt = `Captured Photo ${index + 1}`;
                imgElement.dataset.index = index;

                // 클릭 시 선택/해제
                imgElement.addEventListener("click", () => toggleSelection(imgElement));

                photoDiv.appendChild(imgElement);
                photoGallery.appendChild(photoDiv);
            });
        }
    }
}

function toggleSelection(imgElement) {
    const parent = imgElement.closest(".photo");
    const src = imgElement.src;

    if (parent.classList.contains("selected")) {
        parent.classList.remove("selected");
        selectedImages = selectedImages.filter((item) => item !== src);
    } else {
        if (selectedImages.length >= 2) {
            alert("2장까지만 선택할 수 있어요!");
            return;
        }
        parent.classList.add("selected");
        selectedImages.push(src);
    }

    // 선택 개수 텍스트 업데이트
    const countDisplay = document.getElementById("imageCount");
    countDisplay.textContent = `${selectedImages.length}/2`;

    // Next 버튼 상태 및 클래스 토글
    const nextBtn = document.getElementById("nextBtn");

    if (selectedImages.length === 2) {
        nextBtn.classList.add("ready");
    } else {
        nextBtn.classList.remove("ready");
    }
}

function setupFilterButtons() {
    const gallery = document.getElementById("photoGallery");
    document.querySelector(".graybtn").addEventListener("click", () => {
        gallery.classList.add("gray");
    });
    document.querySelector(".colorbtn").addEventListener("click", () => {
        gallery.classList.remove("gray");
    });
}

function setupNextButton() {
    const nextBtn = document.getElementById("nextBtn");
    nextBtn.addEventListener("click", () => {
        if (selectedImages.length === 2) {
            // ✅ 원래 전체 이미지 순서
            const allImages = JSON.parse(localStorage.getItem("capturedImages") || "[]");

            // ✅ 선택된 이미지만 원래 순서대로 정렬
            const sortedSelected = allImages.filter((src) => selectedImages.includes(src));

            // 저장
            localStorage.setItem("selectedImages", JSON.stringify(sortedSelected));

            // 필터 상태 저장
            const isGray = document.getElementById("photoGallery").classList.contains("gray");
            localStorage.setItem("filterMode", isGray ? "gray" : "color");

            window.location.href = "select_sticker.html";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadImages();
    setupFilterButtons();
    setupNextButton();
});
