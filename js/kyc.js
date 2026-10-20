// =========================
// 生年月日の表示
// =========================

const birthDate =
  document.getElementById("birthDate");

const birthDateText =
  document.getElementById("birthDateText");

birthDate.addEventListener("change", () => {

  if (!birthDate.value) {
    birthDateText.textContent = "生年月日を選択";
    return;
  }

  const [year, month, day] =
    birthDate.value.split("-");

  birthDateText.textContent =
    `${year}/${month}/${day}`;

});