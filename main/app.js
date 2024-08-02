//declarations
const headerEl = document.querySelector(".header");
const headercontEl = document.querySelector(".header-content");

//event listeners
window.addEventListener("scroll", fixNav);

//functions

function fixNav() {
  if (window.scrollY > 50) {
    document.body.classList.add("fixed-nav");
    headercontEl.style.width = "100%";
  } else {
    document.body.classList.remove("fixed-nav");
    headercontEl.style.width = "calc(100% - 40px)";
  }
}

window.onload = () => {
  const popupBtns = document.querySelectorAll(".popup-button");
  popupBtns.forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target.dataset.target;
      const popupEl = document.querySelector(target);
      if (popupEl !== null) {
        popupEl.classList.toggle("is-active");
        document.body.classList.toggle("overflow");
      }
    });
  });
};
