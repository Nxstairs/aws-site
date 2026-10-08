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

}

checkLogin();


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