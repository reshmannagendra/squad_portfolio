window.addEventListener("load", () => {

  const loader = document.querySelector(".loader");
  const hero = document.querySelector(".hero");

  if(sessionStorage.getItem("introPlayed")){

    // skip loader
    loader.classList.add("hide");
    document.body.style.overflow = "auto";

    // skip cloud animation
    hero.classList.add("no-intro");

  }else{

    sessionStorage.setItem("introPlayed","true");

    setTimeout(() => {
      loader.classList.add("hide");
      document.body.style.overflow = "auto";
    },5000);

  }

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

/* 🥷 MENTORS PARALLAX */

const mentorsSection = document.querySelector(".mentors-section");

window.addEventListener("scroll", () => {

  if (!mentorsSection) return;

  const rect = mentorsSection.getBoundingClientRect();
  const offset = rect.top * 0.25; // speed control

  mentorsSection.style.setProperty(
    "--mentor-parallax",
    offset + "px"
  );

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


/* -------------render function-----------*/

const studentsGrid = document.getElementById("studentsGrid");

function getInitials(name){
  return name.split(" ").map(n => n[0]).join("");
}

function getGithubImage(github){

  if(!github) return null;

  const match = github.match(/github\.com\/([^\/\?\s]+)/);

  if(!match) return null;

  const username = match[1];

  return `https://github.com/${username}.png`;
}

function createAvatar(student){

  const nameWithHyphen = student.name.replace(/\s+/g, "-");
  const nameWithSpace = student.name;

const basePath = window.location.hostname.includes("github.io")
  ? "/squad_portfolio"
  : "";

const hyphenPath = `${basePath}/images/students/${nameWithHyphen}.jpg`;
const spacePath = `${basePath}/images/students/${encodeURIComponent(nameWithSpace)}.jpg`;

  const githubImage = getGithubImage(student.github);

  const img = document.createElement("img");
  img.className = "profile-img";

  // 1️⃣ Try hyphen version first
  img.src = hyphenPath;

  img.onerror = () => {

    // 2️⃣ Try space version
    img.src = spacePath;

    img.onerror = () => {

      // 3️⃣ Try GitHub
      if(githubImage){
        img.src = githubImage;

        img.onerror = () => {
          img.replaceWith(createInitialDiv(student.name));
        };

      } else {
        img.replaceWith(createInitialDiv(student.name));
      }

    };

  };

  return img;
}

function createInitialDiv(name){
  const div = document.createElement("div");
  div.className = "profile-fallback";
  div.textContent = getInitials(name).toUpperCase();
  return div;
}

function createStudentCard(student){

  const card = document.createElement("div");
  card.className = "student-card";

  const avatar = createAvatar(student);

  const name = document.createElement("h3");
  name.textContent = student.name;

  const bio = document.createElement("p");
  bio.textContent = student.bio;

  card.appendChild(avatar);
  card.appendChild(name);
  card.appendChild(bio);

  // Click → modal
  card.addEventListener("click", () => openProfile(student));

  return card;
}

function renderStudents(){

  squadMembers.forEach(student=>{
    studentsGrid.appendChild(createStudentCard(student));
  });

}

renderStudents();


/*-----mentor rednering----*/
const mentorsGrid = document.getElementById("mentorsGrid");



function createMentorCard(mentor){

  const avatar = mentor.image
    ? `<img src="${mentor.image}" class="profile-img">`
    : `<div class="profile-fallback">${getInitials(mentor.name)}</div>`;

  const card = document.createElement("div");
  card.className = "student-card";

  card.innerHTML = `
    ${avatar}
    <h3>${mentor.name}</h3>
    <p>${mentor.bio}</p>
  `;

  // ✅ CLICK → OPEN MODAL
  card.addEventListener("click", () => openProfile(mentor));

  return card;
}

function renderMentors(){

  if(!mentorsGrid) return;

  mentors.forEach(mentor=>{
    mentorsGrid.appendChild(createMentorCard(mentor));
  });

}

document.addEventListener("DOMContentLoaded", renderMentors);

//modal popup

const modal = document.getElementById("profileModal");
const modalBody = document.getElementById("modalBody");
const modalClose = document.getElementById("modalClose");

modalClose.onclick = () => modal.classList.remove("active");

window.onclick = (e)=>{
  if(e.target === modal){
    modal.classList.remove("active");
  }
};

// funftion to open modal

function openProfile(person){

  const profileImage = person.image
    ? `<img src="${person.image}">`
    : `<div class="profile-fallback large">${getInitials(person.name)}</div>`;

  modalBody.innerHTML = `
    ${profileImage}
    <h3>${person.name}</h3>
    <p>${person.bio}</p>

    <div class="modal-links">
      <span>Projects: ${person.projects ?? "—"}</span>
      ${person.email ? `<a href="mailto:${person.email}">📧 ${person.email}</a>` : ""}
      ${person.github ? `<a href="${person.github}" target="_blank">💻 GitHub</a>` : ""}
      ${person.linkedin ? `<a href="${person.linkedin}" target="_blank">🔗 LinkedIn</a>` : ""}
    </div>
  `;

  modal.classList.add("active");
}
