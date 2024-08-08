//declarations
const headerEl = document.querySelector(".header");
const headercontEl = document.querySelector(".header-content");
const accordionContent1 = document.querySelectorAll(".b-inner1-cont");
const accordionContent2 = document.querySelectorAll(".b-inner2-cont");

//event listeners
window.addEventListener("scroll", fixNav);
window.addEventListener("DOMContentLoaded", changeRadioBg);

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
        document.documentElement.classList.toggle("no-scroll");
      }
    });
  });
};

function changeRadioBg() {
  const Infocontainers = document.querySelectorAll(".main");

  Infocontainers.forEach((container) => {
    const radioButtons = container.querySelectorAll(".radioBtn");
    const manualBtns = container.querySelectorAll(".manual-btn");
    if (manualBtns.length > 0) {
      manualBtns[0].style.backgroundColor = "#ccc";
    }
    radioButtons.forEach((radioBtn, index) => {
      radioBtn.addEventListener("change", () => {
        // Reset background color
        manualBtns.forEach((btn) => {
          btn.style.backgroundColor = "";
        });
        if (radioBtn.checked) {
          manualBtns[index].style.backgroundColor = "#ccc";
        }
      });
    });
  });
}

function accordionFuntion(accordion) {
  accordion.forEach((item, index) => {
    let header = item.querySelector("header");
    header.addEventListener("click", () => {
      item.classList.toggle("open");
      if (item.classList.contains("second")) {
        let information2 = item.querySelector(".information2");
        if (item.classList.contains("open")) {
          information2.style.height = `${information2.scrollHeight}px`;
          item
            .querySelector("i")
            .classList.replace("ri-add-circle-fill", "ri-close-circle-fill");
        } else {
          information2.style.height = "0px";
          item
            .querySelector("i")
            .classList.replace("ri-close-circle-fill", "ri-add-circle-fill");
        }
      } else {
        let information = item.querySelector(".information");
        if (item.classList.contains("open")) {
          information.style.height = `${information.scrollHeight}px`;
          item
            .querySelector("i")
            .classList.replace("ri-add-circle-fill", "ri-close-circle-fill");
        } else {
          information.style.height = "0px";
          item
            .querySelector("i")
            .classList.replace("ri-close-circle-fill", "ri-add-circle-fill");
        }
      }
      removeOpen(index, accordion);
    });
  });
}

function removeOpen(index1, accordion) {
  accordion.forEach((item2, index2) => {
    if (item2.classList.contains("second")) {
      if (index1 !== index2) {
        item2.classList.remove("open");
        let info2 = item2.querySelector(".information2");
        info2.style.height = "0px";
        item2
          .querySelector("i")
          .classList.replace("ri-close-circle-fill", "ri-add-circle-fill");
      }
    } else {
      if (index1 !== index2) {
        item2.classList.remove("open");
        let info1 = item2.querySelector(".information");
        info1.style.height = "0px";
        item2
          .querySelector("i")
          .classList.replace("ri-close-circle-fill", "ri-add-circle-fill");
      }
    }
  });
}
accordionFuntion(accordionContent1);
accordionFuntion(accordionContent2);
