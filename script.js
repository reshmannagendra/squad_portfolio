window.addEventListener("load", () => {

  const loader = document.querySelector(".loader");

  setTimeout(() => {
    loader.classList.add("hide");
    document.body.style.overflow = "auto";
  }, 5200);

});