document.addEventListener("DOMContentLoaded", () => {
    const imageArea = document.getElementById("selectedImageArea");
    const selectedImages = JSON.parse(localStorage.getItem("selectedImages") || "[]");
    const filterMode = localStorage.getItem("filterMode") || "color";

    if (selectedImages.length !== 2) {
        imageArea.innerHTML = "<p>선택된 이미지가 없습니다.</p>";
        return;
    }

    selectedImages.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Selected Image";
        img.classList.add("sticker-img");
        if (filterMode === "gray") {
            img.classList.add("gray");
        }
        imageArea.appendChild(img);
    });
});
