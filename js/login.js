const SUPABASE_URL = "https://rqtpqlknlrznxfbzeuja.supabase.co";
const SUPABASE_KEY = "sb_publishable_N6sa5ldpyoxtllYu4YkPgA__uvO8aEr";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const form = document.querySelector(".login-form");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const loginButton =
  document.querySelector(".login-button");

function checkForm() {

  const allFilled =
    emailInput.value.trim() !== "" &&
    passwordInput.value !== "";

  loginButton.disabled = !allFilled;
}

emailInput.addEventListener(
  "input",
  checkForm
);

passwordInput.addEventListener(
  "input",
  checkForm
);

checkForm();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  const { data, error } =
    await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

  if (error) {
    alert(
      "ログインできませんでした。\n" +
      error.message
    );
    return;
  }

  window.location.href = "mypage.html";
});