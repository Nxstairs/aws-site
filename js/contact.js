const contactForm =
  document.getElementById(
    "contactForm"
  );

const contactSubmitButton =
  document.getElementById(
    "contactSubmitButton"
  );


function updateContactButton() {

  if (
    !contactForm ||
    !contactSubmitButton
  ) {
    return;
  }


  contactSubmitButton.disabled =
    !contactForm.checkValidity();

}


if (
  contactForm &&
  contactSubmitButton
) {

  contactForm.addEventListener(
    "input",
    updateContactButton
  );

  contactForm.addEventListener(
    "change",
    updateContactButton
  );

  updateContactButton();

}