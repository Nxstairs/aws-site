const SUPABASE_URL = "https://rqtpqlknlrznxfbzeuja.supabase.co";
const SUPABASE_KEY = "sb_publishable_N6sa5ldpyoxtllYu4YkPgA__uvO8aEr";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const form = document.querySelector(".signup-form");

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  const name =
    document.getElementById("name").value;

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  const passwordConfirm =
    document.getElementById("password-confirm").value;


  if (password !== passwordConfirm) {
    alert("パスワードが一致していません。");
    return;
  }


  const { data, error } =
    await supabaseClient.auth.signUp({
      email: email,
      password: password,

      options: {
        data: {
          name: name
        }
      }
    });


  if (error) {
    alert(
      "登録できませんでした。\n" +
      error.message
    );

    return;
  }


  alert(
    "登録を受け付けました。\nメールをご確認ください。"
  );

});