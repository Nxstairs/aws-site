const SUPABASE_URL =
  "https://rqtpqlknlrznxfbzeuja.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_N6sa5ldpyoxtllYu4YkPgA__uvO8aEr";


const supabaseClient =
  supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );


// =========================
// 履歴ページ
// =========================

let currentHistoryPage = 1;

const historyPerPage = 1;

let kycApproved = false;

// =========================
// ログイン確認
// =========================

async function checkLogin() {

  const {
    data: { session }
  } =
    await supabaseClient.auth.getSession();


  // ログインしていなければ
  // ログインページへ

  if (!session) {

    window.location.href =
      "login.html";

    return;
  }


  const user =
    session.user;


  // =========================
  // アカウント情報
  // =========================

  const accountName =
    document.getElementById(
      "accountName"
    );

  const accountEmail =
    document.getElementById(
      "accountEmail"
    );


  if (accountName) {

    accountName.textContent =
      user.user_metadata?.name || "-";

  }


  if (accountEmail) {

    accountEmail.textContent =
      user.email || "-";

  }

  // KYC情報取得

  loadKycStatus(user.id);

  // レンディング情報取得

  loadLendingData(user.id);

}


checkLogin();


// =========================
// KYCステータス取得
// =========================

async function loadKycStatus(userId) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("kyc_applications")
      .select("status")
      .eq("user_id", userId)
      .order("created_at", {
        ascending: false
      })
      .limit(1);


  if (error) {

    console.error(error);

    return;
  }


  const kycStatus =
    document.getElementById(
      "kycStatus"
    );

  const kycButton =
    document.getElementById(
      "kycButton"
    );


  if (!kycStatus || !kycButton) {
    return;
  }


  // =========================
  // 未提出
  // =========================

  if (!data || data.length === 0) {

    kycApproved = false;

    kycStatus.textContent =
      "未提出";

    kycButton.textContent =
      "本人確認を進める";

    kycButton.href =
      "kyc.html";

    kycButton.classList.remove(
      "disabled"
    );

    updateLendingButton();

    return;
  }


  const status =
    data[0].status;


  kycStatus.textContent =
    status;


  // =========================
  // 審査中
  // =========================

  if (status === "審査中") {

    kycApproved = false;

    kycButton.textContent =
      "審査中";

    kycButton.removeAttribute(
      "href"
    );

    kycButton.classList.add(
      "disabled"
    );

    updateLendingButton();

    return;
  }


  // =========================
  // 本人確認済み
  // =========================

  if (status === "本人確認済み") {

    kycApproved = true;

    kycButton.textContent =
      "本人確認済み";

    kycButton.removeAttribute(
      "href"
    );

    kycButton.classList.add(
      "disabled"
    );

    updateLendingButton();

    return;
  }


  // =========================
  // 再提出
  // =========================

  if (status === "再提出") {

    kycApproved = false;

    kycButton.textContent =
      "再提出する";

    kycButton.href =
      "kyc.html";

    kycButton.classList.remove(
      "disabled"
    );

    updateLendingButton();

  }

}

// =========================
// レンディング情報取得
// =========================

async function loadLendingData(userId) {

  const { data, error } =
    await supabaseClient
      .from("lendings")
      .select("*")
      .eq("user_id", userId)
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(error);

    return;
  }


  const activeLendingArea =
    document.getElementById(
      "activeLendingArea"
    );


  const lendingEmpty =
    document.querySelector(
      ".lending-empty"
    );


  // =========================
  // データがない場合
  // =========================

  if (!data || data.length === 0) {

    if (activeLendingArea) {

      activeLendingArea.innerHTML = `

        <div class="mypage-grid">

          <div class="mypage-card">

            <p>
              貸出中の資産
            </p>

            <strong>
              -
            </strong>

          </div>


          <div class="mypage-card">

            <p>
              適用年利
            </p>

            <strong>
              -
            </strong>

          </div>


          <div class="mypage-card">

            <p>
              運用状況
            </p>

            <strong>
              未運用
            </strong>

          </div>

        </div>

      `;

    }


    if (lendingEmpty) {

      lendingEmpty.innerHTML = `

        <p>
          現在表示できるレンディング情報はありません。
        </p>

      `;

    }


    return;
  }


  // =========================
  // 運用中だけ上に表示
  // =========================

  const activeLendings =
    data.filter(
      lending =>
        lending.status === "運用中"
    );


  if (activeLendingArea) {

    if (activeLendings.length > 0) {

      let activeHtml = "";


      activeLendings.forEach(
        lending => {

const now =
  new Date();

const unlockDate =
  lending.unlock_date
    ? new Date(lending.unlock_date)
    : null;

const canReturn =
  unlockDate &&
  now >= unlockDate;

          activeHtml += `

          <div class="active-lending-card">

            <div class="active-lending-data">

              <div class="active-lending-item">

                <p>
                  貸出中の資産
                </p>

                <strong>
                  ${lending.amount} ${lending.asset}
                </strong>

              </div>


              <div class="active-lending-item">

                <p>
                  適用年利
                </p>

                <strong>
                  ${lending.rate}%
                </strong>

              </div>


              <div class="active-lending-item">

                <p>
                  運用状況
                </p>

                <strong>
                  ${lending.status}
                </strong>

              </div>


              <div class="active-lending-item active-lending-action">

                <p>
                  返還申請：
                  ${
                    unlockDate
                      ? unlockDate.toLocaleDateString("ja-JP")
                      : "未設定"
                  }
                </p>

                <button
                  type="button"
                  class="return-request-button"
                  data-id="${lending.id}"
                  ${canReturn ? "" : "disabled"}
                >
                  ${
                    canReturn
                      ? "返還申請"
                      : "ロック期間中"
                  }
                 </button>

              </div>

            </div>
          
          </div>

          `;

        }
      );


      activeLendingArea.innerHTML =
        activeHtml;

    } else {

      activeLendingArea.innerHTML = `

        <div class="mypage-grid">

          <div class="mypage-card">

            <p>
              貸出中の資産
            </p>

            <strong>
              -
            </strong>

          </div>


          <div class="mypage-card">

            <p>
              適用年利
            </p>

            <strong>
              -
            </strong>

          </div>


          <div class="mypage-card">

            <p>
              運用状況
            </p>

            <strong>
              未運用
            </strong>

          </div>

        </div>

      `;

    }

  }


  // =========================
  // 申込み履歴
  // =========================

  renderLendingHistory(data);

}


// =========================
// 申込み履歴を1件ずつ表示
// =========================

function renderLendingHistory(data) {

  const lendingEmpty =
    document.querySelector(
      ".lending-empty"
    );


  if (!lendingEmpty) {
    return;
  }


  const totalPages =
    Math.ceil(
      data.length /
      historyPerPage
    );


  // ページ範囲チェック

  if (
    currentHistoryPage >
    totalPages
  ) {

    currentHistoryPage =
      totalPages;

  }


  if (
    currentHistoryPage < 1
  ) {

    currentHistoryPage = 1;

  }


  const start =
    (
      currentHistoryPage - 1
    ) * historyPerPage;


  const pageData =
    data.slice(
      start,
      start +
      historyPerPage
    );


  let historyHtml = "";


  pageData.forEach(
    (lending, index) => {

      const date =
        new Date(
          lending.created_at
        );


      const formattedDate =
        date.toLocaleDateString(
          "ja-JP"
        );


      const planName =
        lending.plan === "premium"
          ? "PREMIUM"
          : "STANDARD";


      // 最新が
      // 5件なら 5 / 5

      const historyNumber =
        data.length -
        (
          start +
          index
        );


      historyHtml += `

        <div class="lending-history">

          <div class="lending-history-head">

            <span>
              ${historyNumber} / ${data.length}
            </span>

            <strong>
              ${lending.status}
            </strong>

          </div>


          <div class="lending-data-row">

            <span>
              対象資産
            </span>

            <strong>
              ${lending.asset}
            </strong>

          </div>


          <div class="lending-data-row">

            <span>
              貸出プラン
            </span>

            <strong>
              ${planName}
            </strong>

          </div>


          <div class="lending-data-row">

            <span>
              年利
            </span>

            <strong>
              ${lending.rate}%
            </strong>

          </div>


          <div class="lending-data-row">

            <span>
              貸出数量
            </span>

            <strong>
              ${lending.amount} ${lending.asset}
            </strong>

          </div>


          <div class="lending-data-row">

            <span>
              申込日時
            </span>

            <strong>
              ${formattedDate}
            </strong>

          </div>


          <div class="lending-data-row">

            <span>
              ステータス
            </span>

            <strong>
              ${lending.status}
            </strong>

          </div>

        </div>


        <div class="history-pagination">

          <button
            type="button"
            id="historyPrev"
            ${
              currentHistoryPage === 1
                ? "disabled"
                : ""
            }
          >
            ‹
          </button>


          <span>
            ${historyNumber} / ${data.length}
          </span>


          <button
            type="button"
            id="historyNext"
            ${
              currentHistoryPage ===
              totalPages
                ? "disabled"
                : ""
            }
          >
            ›
          </button>

        </div>

      `;

    }
  );


  lendingEmpty.innerHTML =
    historyHtml;


  const prevButton =
    document.getElementById(
      "historyPrev"
    );


  const nextButton =
    document.getElementById(
      "historyNext"
    );


  // 前の履歴

  prevButton?.addEventListener(
    "click",
    () => {

      currentHistoryPage--;

      renderLendingHistory(
        data
      );

    }
  );


  // 次の履歴

  nextButton?.addEventListener(
    "click",
    () => {

      currentHistoryPage++;

      renderLendingHistory(
        data
      );

    }
  );

}


// =========================
// プラン・資産選択
// =========================

const planCards =
  document.querySelectorAll(
    ".mypage-plan-card"
  );


const assetCards =
  document.querySelectorAll(
    ".asset-select"
  );


const lendingButton =
  document.querySelector(
    ".lending-start-button"
  );


let selectedPlan = null;

let selectedAsset = null;

const lendingAmount =
  document.getElementById(
    "lendingAmount"
  );

const amountUnit =
  document.getElementById(
    "amountUnit"
  );

const amountNote =
  document.getElementById(
    "amountNote"
  );

const amountError =
  document.getElementById(
    "amountError"
  );

let amountValid = false;

// =========================
// 申込みボタン制御
// =========================

function updateLendingButton() {

  if (!lendingButton) {
    return;
  }


  const lendingKycMessage =
    document.getElementById(
      "lendingKycMessage"
    );


  lendingButton.disabled =
    !(
      selectedPlan &&
      selectedAsset &&
      amountValid &&
      kycApproved
    );


  if (lendingKycMessage) {

    if (kycApproved) {

      lendingKycMessage.style.display =
        "none";

    } else {

      lendingKycMessage.style.display =
        "block";

    }

  }

}


// =========================
// プラン選択
// =========================

planCards.forEach(
  card => {

    card.addEventListener(
      "click",
      () => {

        planCards.forEach(
          item => {

            item.classList.remove(
              "selected"
            );

          }
        );


        card.classList.add(
          "selected"
        );


        selectedPlan =
          card.dataset.plan;


        updateLendingButton();

      }
    );

  }
);


// =========================
// 暗号資産選択
// =========================

assetCards.forEach(
  card => {

    card.addEventListener(
      "click",
      () => {

        assetCards.forEach(
          item => {

            item.classList.remove(
              "selected"
            );

          }
        );


        card.classList.add(
          "selected"
        );


        selectedAsset =
          card
            .querySelector("span")
            .textContent
            .trim();


        lendingAmount.disabled =
          false;

        lendingAmount.value =
          "";

        amountUnit.textContent =
          selectedAsset;

        amountError.textContent =
          "";

        amountValid =
          false;


        // BTC

        if (
          selectedAsset === "BTC"
        ) {

          lendingAmount.min =
            "0.0008";

          lendingAmount.step =
            "0.0001";

          lendingAmount.placeholder =
            "0.0008";

          amountNote.textContent =
            "最低貸出数量：0.0008 BTC（小数4桁まで）";

        }


        // ETH

        if (
          selectedAsset === "ETH"
        ) {

          lendingAmount.min =
            "0.03";

          lendingAmount.step =
            "0.01";

          lendingAmount.placeholder =
            "0.03";

          amountNote.textContent =
            "最低貸出数量：0.03 ETH（小数2桁まで）";

        }


        // USDT

        if (
          selectedAsset === "USDT"
        ) {

          lendingAmount.min =
            "65";

          lendingAmount.step =
            "1";

          lendingAmount.placeholder =
            "65";

          amountNote.textContent =
            "最低貸出数量：65 USDT（整数のみ）";

        }


        // USDC

        if (
          selectedAsset === "USDC"
        ) {

          lendingAmount.min =
            "65";

          lendingAmount.step =
            "1";

          lendingAmount.placeholder =
            "65";

          amountNote.textContent =
            "最低貸出数量：65 USDC（整数のみ）";

        }


        updateLendingButton();

      }
    );

  }
);


lendingAmount.addEventListener(
  "input",
  () => {

    const value =
      lendingAmount.value;

    const number =
      Number(value);


    amountValid =
      false;

    amountError.textContent =
      "";


    if (!selectedAsset) {

      updateLendingButton();

      return;

    }


    // BTC

    if (
      selectedAsset === "BTC"
    ) {

      const decimalLength =
        value.includes(".")
          ? value.split(".")[1].length
          : 0;


      if (
        number < 0.0008
      ) {

        amountError.textContent =
          "0.0008 BTC以上を入力してください。";

      } else if (
        decimalLength > 4
      ) {

        amountError.textContent =
          "BTCは小数4桁まで入力できます。";

      } else {

        amountValid =
          true;

      }

    }


    // ETH

    if (
      selectedAsset === "ETH"
    ) {

      const decimalLength =
        value.includes(".")
          ? value.split(".")[1].length
          : 0;


      if (
        number < 0.03
      ) {

        amountError.textContent =
          "0.03 ETH以上を入力してください。";

      } else if (
        decimalLength > 2
      ) {

        amountError.textContent =
          "ETHは小数2桁まで入力できます。";

      } else {

        amountValid =
          true;

      }

    }


    // USDT / USDC

    if (
      selectedAsset === "USDT" ||
      selectedAsset === "USDC"
    ) {

      if (
        number < 65
      ) {

        amountError.textContent =
          `65 ${selectedAsset}以上を入力してください。`;

      } else if (
        !Number.isInteger(number)
      ) {

        amountError.textContent =
          `${selectedAsset}は整数で入力してください。`;

      } else {

        amountValid =
          true;

      }

    }


    if (
      value === "" ||
      Number.isNaN(number)
    ) {

      amountValid =
        false;

    }


    updateLendingButton();

  }
);


// =========================
// レンディング申込み
// =========================

if (lendingButton) {

  lendingButton.addEventListener(
    "click",
    async () => {

      if (
        !selectedPlan ||
        !selectedAsset
      ) {

        return;

      }


      const {
        data: { session }
      } =
        await supabaseClient
          .auth
          .getSession();


      if (!session) {

        window.location.href =
          "login.html";

        return;

      }


      const user =
        session.user;


      let rate = null;


      if (
        selectedPlan ===
        "standard"
      ) {

        rate = 10;

      }


      if (
        selectedPlan ===
        "premium"
      ) {

        rate = 14;

      }


      const { error } =
        await supabaseClient
          .from("lendings")
          .insert({

            user_id:
              user.id,

            plan:
              selectedPlan,

            rate:
              rate,

            amount:
              Number(lendingAmount.value),

            asset:
              selectedAsset,

            status:
              "申込受付中"

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


      // 最新履歴へ戻す

      currentHistoryPage = 1;


      // 情報更新

      await loadLendingData(
        user.id
      );


      // 選択状態解除

      selectedPlan = null;

      selectedAsset = null;


      planCards.forEach(
        card => {

          card.classList.remove(
            "selected"
          );

        }
      );


      assetCards.forEach(
        card => {

          card.classList.remove(
            "selected"
          );

        }
      );


      updateLendingButton();


      // ページトップへ

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    }
  );

}


// =========================
// 返還申請
// =========================


document.addEventListener("click", async (event) => {

  if (
    !event.target.classList.contains(
      "return-request-button"
    )
  ) {
    return;
  }

  const lendingId =
    event.target.dataset.id;

  const confirmed =
    confirm(
      "返還申請を行いますか？"
    );

  if (!confirmed) {
    return;
  }

  const { error } =
    await supabaseClient
      .from("lendings")
      .update({
        status: "返還申請中"
      })
      .eq("id", lendingId);

  if (error) {
    alert(
      "返還申請に失敗しました。\n" +
      error.message
    );
    return;
  }

  alert(
    "返還申請を受け付けました。"
  );

  const {
    data: { session }
  } =
    await supabaseClient.auth.getSession();

  if (session) {
    loadLendingData(
      session.user.id
    );
  }

});


// =========================
// ログアウト
// =========================

const logoutButton =
  document.querySelector(
    ".logout-button"
  );


if (logoutButton) {

  logoutButton.addEventListener(
    "click",
    async () => {

      await supabaseClient
        .auth
        .signOut();


      window.location.href =
        "login.html";

    }
  );

}