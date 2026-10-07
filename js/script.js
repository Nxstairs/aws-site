const menuToggle =
  document.getElementById("menuToggle");

const mobileMenu =
  document.getElementById("mobileMenu");

const menuClose =
  document.getElementById("menuClose");


if (menuToggle && mobileMenu) {

  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("open");
  });

}


if (menuClose && mobileMenu) {

  menuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
  });

}