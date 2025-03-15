document.addEventListener("DOMContentLoaded", () => {
    // gobtn 버튼 요소 가져오기
    const goButton = document.querySelector(".gobtn");

    // 버튼 클릭 시 페이지 이동
    if (goButton) {
        goButton.addEventListener("click", () => {
            window.location.href = "booth.html";
        });
    }
});
