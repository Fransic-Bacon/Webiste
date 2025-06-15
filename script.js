document.addEventListener("DOMContentLoaded", () => {
  const fadeText = document.getElementsByClassName("myfade-in");

  setTimeout(() => {
    for (let i = 0; i < fadeText.length; i++) {
      fadeText[i].classList.add("fade-in");
    }
  }, 250);
});

// föpr vänster fad in
function handleScroll() {
  const fadeElements = document.querySelectorAll(".fade-in-left");

  fadeElements.forEach((element) => {
    if (element.getBoundingClientRect().top <= window.innerHeight / 3) {
      element.classList.add("active");
    } else {
      element.classList.remove("active");
    }
  });
}

window.addEventListener("scroll", handleScroll);

// *för höger fade in
function handleScrollRight() {
  const fadeElements = document.querySelectorAll(".fade-in-right");

  fadeElements.forEach((element) => {
    if (element.getBoundingClientRect().top <= window.innerHeight / 3.5) {
      element.classList.add("is-visible");
    } else {
      element.classList.remove("is-visible");
    }
  });
}

window.addEventListener("scroll", handleScrollRight);

let main;

function header() {
   main = document.getElementById("main");

  let start = document.getElementById("Start");
  let contact = document.getElementById("Contact");
  let exem = document.getElementById("Exempels");

  if (main.getBoundingClientRect().top <= window.innerHeight / 2) {
    start.classList.remove("navigation");
     start.classList.remove("selected");
    start.classList.add("navigation2");
    start.classList.add("selected2");

     contact.classList.remove("navigation");
     contact.classList.add("navigation2");

     exem.classList.remove("navigation");
     exem.classList.add("navigation2");
     
  }
  else{
     start.classList.remove("navigation2");
    start.classList.add("navigation");
        start.classList.remove("selected2");
    start.classList.add("selected");

     contact.classList.remove("navigation2");
     contact.classList.add("navigation");

     exem.classList.remove("navigation2");
     exem.classList.add("navigation");
  }
}

setInterval(header,500);

  document.addEventListener('DOMContentLoaded', () => {
            const mainSection = document.querySelector('#main2');
            const elements = document.querySelectorAll('#main2 .fade-in');
            let isFading = false;

            async function fadeInElements() {
                if (isFading) return; // Prevent multiple triggers
                isFading = true;

                for (let i = 0; i < elements.length; i++) {
                    elements[i].classList.add('visible');
                    await new Promise(resolve => setTimeout(resolve, 100)); // 0.1-second delay
                }

                isFading = false;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        fadeInElements();
                        observer.unobserve(mainSection); // Stop observing after triggering
                    }
                });
            }, {
                threshold: 0.1, // Trigger when 10% of the section is visible
                rootMargin: '0px 0px -10% 0px' // Adjust to trigger slightly before fully in view
            });

            if (mainSection) {
                observer.observe(mainSection);
            } else {
                console.error('Element with ID "main2" not found');
            }
        });

