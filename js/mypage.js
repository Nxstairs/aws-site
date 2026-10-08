const SUPABASE_URL = "https://rqtpqlknlrznxfbzeuja.supabase.co";
const SUPABASE_KEY = "sb_publishable_N6sa5ldpyoxtllYu4YkPgA__uvO8aEr";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function checkLogin() {

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  // ログインしていなければログインページへ
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const user = session.user;

  const accountName =
    document.getElementById("accountName");

  const accountEmail =
    document.getElementById("accountEmail");

  if (accountName) {
    accountName.textContent =
      user.user_metadata?.name || "-";
  }

  if (accountEmail) {
    accountEmail.textContent =
      user.email || "-";
  }

  loadLendingData(user.id);

}

checkLogin();


async function loadLendingData(userId) {

  const { data, error } =
    await supabaseClient
      .from("lendings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      })
      .limit(1);

  if (error) {
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    return;
  }

  const lending = data[0];


  // 上の3カード

  document.getElementById("totalAsset").textContent =
    lending.asset || "-";

  document.getElementById("currentRate").textContent =
    lending.rate
      ? lending.rate + "%"
      : "-";

  document.getElementById("lendingStatus").textContent =
    lending.status || "-";


  // レンディング状況

  const lendingEmpty =
    document.querySelector(".lending-empty");

  if (lendingEmpty) {

    const date =
      new Date(lending.created_at);

    const formattedDate =
      date.toLocaleDateString("ja-JP");

    const planName =
      lending.plan === "premium"
        ? "PREMIUM"
        : "STANDARD";

    lendingEmpty.innerHTML = `
      <div class="lending-data-row">
        <span>対象資産</span>
        <strong>${lending.asset}</strong>
      </div>

      <div class="lending-data-row">
        <span>貸出プラン</span>
        <strong>${planName}</strong>
      </div>

      <div class="lending-data-row">
        <span>年利</span>
        <strong>${lending.rate}%</strong>
      </div>

      <div class="lending-data-row">
        <span>申込日時</span>
        <strong>${formattedDate}</strong>
      </div>

      <div class="lending-data-row">
        <span>ステータス</span>
        <strong>${lending.status}</strong>
      </div>
    `;
  }

}


const planCards =
  document.querySelectorAll(".mypage-plan-card");

const assetCards =
  document.querySelectorAll(".asset-select");

const lendingButton =
  document.querySelector(".lending-start-button");

let selectedPlan = null;
let selectedAsset = null;


function updateLendingButton() {

  lendingButton.disabled =
    !(selectedPlan && selectedAsset);

}


// プラン選択

planCards.forEach(card => {

  card.addEventListener("click", () => {

    planCards.forEach(item => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");

    selectedPlan =
      card.dataset.plan;

    updateLendingButton();

  });

});


// 暗号資産選択

assetCards.forEach(card => {

  card.addEventListener("click", () => {

    assetCards.forEach(item => {
      item.classList.remove("selected");
    });

    card.classList.add("selected");

    selectedAsset =
      card.querySelector("span").textContent;

    updateLendingButton();

  });

});


updateLendingButton();


lendingButton.addEventListener("click", async () => {

  if (!selectedPlan || !selectedAsset) {
    return;
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const user = session.user;

  let rate = null;

  if (selectedPlan === "standard") {
    rate = 10;
  }

  if (selectedPlan === "premium") {
    rate = 14;
  }

  const { error } =
    await supabaseClient
      .from("lendings")
      .insert({
        user_id: user.id,
        plan: selectedPlan,
        rate: rate,
        asset: selectedAsset,
        status: "申込受付中"
      });

  if (error) {
    alert(
      "お申し込みできませんでした。\n" +
      error.message
    );
    return;
  }

  alert(
    "レンディングのお申し込みを受け付けました。"
  );

  loadLendingData(user.id);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

});


// ログアウト

const logoutButton =
  document.querySelector(".logout-button");

logoutButton.addEventListener(
  "click",
  async () => {

    await supabaseClient.auth.signOut();

    window.location.href = "login.html";
  }
);