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
}

checkLogin();


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