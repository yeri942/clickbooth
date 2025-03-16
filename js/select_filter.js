// 저장된 이미지 불러오기
function loadImages() {
    const photoGallery = document.getElementById("photoGallery");
    const storedImages = localStorage.getItem("capturedImages");

    console.log("📸 불러온 저장 데이터:", storedImages); // 저장된 데이터 확인 (디버깅)

    if (storedImages && storedImages !== "null") {
        const images = JSON.parse(storedImages);

        if (images.length > 0) {
            images.forEach((src) => {
                const imgElement = document.createElement("img");
                imgElement.src = src;
                imgElement.classList.add("photo");
                photoGallery.appendChild(imgElement);
            });
        } else {
            console.log("⚠ 저장된 이미지 데이터가 비어 있음.");
        }
    } else {
        console.log("⚠ 저장된 이미지 없음.");
    }
}

// 페이지 로드 시 이미지 불러오기
document.addEventListener("DOMContentLoaded", loadImages);
