// =========================
// 生年月日の表示
// =========================

const birthDate =
  document.getElementById("birthDate");

const birthDateText =
  document.getElementById("birthDateText");

function updateBirthDate() {

  if (!birthDate || !birthDateText) return;

  if (!birthDate.value) {
    birthDateText.textContent = "生年月日を選択";
    return;
  }

  const [year, month, day] =
    birthDate.value.split("-");

  birthDateText.textContent =
    `${year}/${month}/${day}`;
}

// 日付を変更したとき
birthDate.addEventListener("change", updateBirthDate);

// 入力状態が変わったとき
birthDate.addEventListener("input", updateBirthDate);

// ページ読み込み時
updateBirthDate();