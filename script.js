window.addEventListener("load", () => {
  setTimeout(() => {
    document.querySelector(".loader").classList.add("hide");
    document.body.style.overflow = "auto";
  }, 5000);
});


/* 🏯 DOJO PARALLAX */

const hero = document.querySelector(".hero");
let ticking = false;

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      hero.style.setProperty("--parallax", scrollY * 0.25 + "px");
      ticking = false;
    });
    ticking = true;
  }
});

//navbar

document.addEventListener("DOMContentLoaded", () => {

  const links = document.querySelectorAll(".nav-links a");
  const indicator = document.querySelector(".nav-indicator");
  const nav = document.querySelector(".nav-links");
  const sections = document.querySelectorAll("section");

  if (!indicator || !nav || links.length === 0) return;

  let activeLink = links[0];

  function moveIndicator(el){
    const linkRect = el.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    indicator.style.width = `${linkRect.width}px`;
    indicator.style.left = `${linkRect.left - navRect.left}px`;
  }

  /* DEFAULT POSITION */
  moveIndicator(activeLink);

  /* HOVER EFFECT */
  links.forEach(link => {

    link.addEventListener("mouseenter", () => moveIndicator(link));

    link.addEventListener("click", () => {
      activeLink = link;
    });

  });

  nav.addEventListener("mouseleave", () => {
    moveIndicator(activeLink);
  });

  /* SCROLL ACTIVE SECTION */
  window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;

      if (pageYOffset >= sectionTop &&
          pageYOffset < sectionTop + sectionHeight) {

        current = section.getAttribute("id");

      }

    });

    if (!current) return;

    links.forEach(link => {

      if (link.dataset.section === current){
        activeLink = link;
        moveIndicator(link);
      }

    });

  });

});


const timelineItems = document.querySelectorAll(".timeline-item");

const revealTimeline = () => {

  const triggerBottom = window.innerHeight * 0.85;

  timelineItems.forEach(item => {

    const itemTop = item.getBoundingClientRect().top;

    if(itemTop < triggerBottom){
      item.classList.add("show");
    }

  });

};

window.addEventListener("scroll", revealTimeline);
revealTimeline();