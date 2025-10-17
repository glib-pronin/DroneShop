document.addEventListener("DOMContentLoaded", () => {
  const modalContainers = document.getElementsByClassName("modal-container");
  const passwordContainers = document.getElementsByClassName("password-container");
  const authContainer = document.getElementById("auth-container")

  function showPassword(input, hider, shower) {
    hider.classList.add("hide");
    shower.classList.remove("hide");
    input.type = "text";
  }

  function hidePassword(input, hider, shower) {
    shower.classList.add("hide");
    hider.classList.remove("hide");
    input.type = "password";
  }

  function getPasswordContainerElement(passwordContainer) {
    const input = passwordContainer.getElementsByTagName("input")[0];
    const passwordHider = passwordContainer.querySelector(".hide-password");
    const passwordShower = passwordContainer.querySelector(".show-password");
    return [input, passwordHider, passwordShower]
  }

  for (const container of modalContainers) {
    const closeBtns = container.querySelectorAll(".close-btn");
    closeBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        const pcs = container.querySelectorAll(".password-container");
        if (pcs.length > 0) {
          pcs.forEach((pc) => {
            const [input, passwordHider, passwordShower] = getPasswordContainerElement(pc)
            passwordShower.classList.contains("hide") ? null : hidePassword(input, passwordHider, passwordShower);
          });
        }
        container.querySelectorAll("input").forEach(input => input.value = "")
        container.querySelectorAll(".error-msg").forEach(errorMsg => errorMsg.textContent = "")
        container.classList.remove("show");
        if (container.classList.contains("password-resetting") && btn.classList.contains("cancel-btn")){
          switchModal(container, authContainer)
        }
        if (container.id === "enter-email-container"){
          container.querySelector('#send-email-spinner').classList.remove('show')
          container.querySelector('.buttons').classList.remove('hide')
        }
        document.documentElement.classList.remove('no-scroll')
      });
    });
  }

  for (const passwordContainer of passwordContainers) {
    const [input, passwordHider, passwordShower] = getPasswordContainerElement(passwordContainer)
    passwordHider.addEventListener("click", () =>
      showPassword(input, passwordHider, passwordShower)
    );

    passwordShower.addEventListener("click", () =>
      hidePassword(input, passwordHider, passwordShower)
    );
  }
});