
// =========================
// Supabase設定
// =========================

const SUPABASE_URL =
  "https://rqtpqlknlrznxfbzeuja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_N6sa5ldpyoxtllYu4YkPgA__uvO8aEr";

const kycSupabase = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);


// =========================
// HTML要素
// =========================

const birthDate =
  document.getElementById("birthDate");

const birthDateText =
  document.getElementById("birthDateText");

const kycForm =
  document.getElementById("kycForm");

const kycSubmitButton =
  document.getElementById("kycSubmitButton");

let isSubmitting = false;
let alreadySubmitted = false;


// =========================
// 生年月日の表示
// =========================

function updateBirthDate() {

  if (!birthDate || !birthDateText) return;

  if (!birthDate.value) {
    birthDateText.textContent =
      "\u751F\u5E74\u6708\u65E5\u3092\u9078\u629E";
    return;
  }

  const [year, month, day] =
    birthDate.value.split("-");

  birthDateText.textContent =
    `${year}/${month}/${day}`;

}

if (birthDate && birthDateText) {

  birthDate.addEventListener(
    "change", updateBirthDate
  );

  birthDate.addEventListener(
    "input", updateBirthDate
  );

  updateBirthDate();

}


// =========================
// 申請ボタンの有効・無効
// =========================

function updateKycSubmitButton() {

  if (!kycForm || !kycSubmitButton) return;

  kycSubmitButton.disabled =
    isSubmitting ||
    alreadySubmitted ||
    !kycForm.checkValidity();

}


// =========================
// ファイルチェック
// =========================

function validateFile(file) {

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/heic"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "JPEG・PNG・HEIC形式の画像を選択してください。"
    );
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error(
      "画像は10MB以下にしてください。"
    );
  }

}


// =========================
// 画像アップロード
// =========================

async function uploadKycImage(userId, file, side) {

  validateFile(file);

  if (!file) return null;

  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/heic": "heic"
  };

  const extension = extensions[file.type];

  const fileName =
    `${side}-${crypto.randomUUID()}.${extension}`;

  const filePath =
    `${userId}/${fileName}`;

  const { error } =
    await kycSupabase.storage
      .from("kyc-documents")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

  if (error) throw error;

  return filePath;

}


// =========================
// 本人確認申請
// =========================

async function submitKyc(event) {

  event.preventDefault();

  if (
    isSubmitting ||
    alreadySubmitted ||
    !kycForm.checkValidity()
  ) return;

  isSubmitting = true;

  kycSubmitButton.disabled = true;
  kycSubmitButton.textContent = "申請中...";

  try {

    // ログインユーザー確認

    const {
      data: { user },
      error: userError
    } = await kycSupabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "ログイン後に申請してください。"
      );
    }


    // 二重申請チェック

    const {
      data: existing,
      error: checkError
    } = await kycSupabase
      .from("kyc_applications")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      alreadySubmitted = true;
      throw new Error(
        "本人確認はすでに申請されています。"
      );
    }


    // フォーム情報取得

    const fullName =
      document.getElementById("fullName").value.trim();

    const postalCode =
      document.getElementById("postalCode").value.trim();

    const address =
      document.getElementById("address").value.trim();

    const phone =
      document.getElementById("phone").value.trim();

    const documentType =
      document.getElementById("documentType").value;

    const frontFile =
      document.getElementById("documentFront").files[0];

    const backFile =
      document.getElementById("documentBack").files[0];


    // 画像の事前チェック

    validateFile(frontFile);
    validateFile(backFile);


    // 表面をアップロード

    const frontPath = await uploadKycImage(
      user.id,
      frontFile,
      "front"
    );


    // 裏面をアップロード

    const backPath = backFile
      ? await uploadKycImage(
          user.id,
          backFile,
          "back"
        )
      : null;


    // データベースに保存

    const { error: insertError } =
      await kycSupabase
        .from("kyc_applications")
        .insert({

          user_id: user.id,

          full_name: fullName,
          birth_date: birthDate.value,
          postal_code: postalCode,
          address: address,
          phone: phone,

          document_type: documentType,

          document_front_path: frontPath,
          document_back_path: backPath,

          status: "審査中"

        });

    if (insertError) throw insertError;


    // 申請成功

    alreadySubmitted = true;

    alert(
      "本人確認の申請が完了しました。審査完了までお待ちください。"
    );

    kycSubmitButton.textContent = "申請済み";

  } catch (error) {

    console.error("KYC申請エラー:", error);

    alert(
      error.message ||
      "申請に失敗しました。もう一度お試しください。"
    );

  } finally {

    isSubmitting = false;

    if (!alreadySubmitted) {
      kycSubmitButton.textContent =
        "本人確認を申請する";
    }

    updateKycSubmitButton();

  }

}


// =========================
// イベント設定
// =========================

if (kycForm && kycSubmitButton) {

  kycForm.addEventListener(
    "input", updateKycSubmitButton
  );

  kycForm.addEventListener(
    "change", updateKycSubmitButton
  );

  kycForm.addEventListener(
    "submit", submitKyc
  );

  updateKycSubmitButton();

}

