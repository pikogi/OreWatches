const CONFIG = {
    CONTENTFUL: {
        SPACE_ID: 'd15l6waabt3e',
        ACCESS_TOKEN: 'UbF3-neoqrRAO_e82TJ5Go-bHsybS9c74zCVanGt4ZQ'
    },
    WHATSAPP: {
        PHONE: '3517340111'
    }
};
document.addEventListener("DOMContentLoaded", function() {
    const menuToggle = document.querySelector(".header-menu-toggle");
    const menuClose = document.querySelector(".header-nav__close");
  
    if (menuToggle) {
      menuToggle.addEventListener("click", function(e) {
        e.preventDefault();
        document.body.classList.toggle("menu-is-open");
      });
    }
  
    if (menuClose) {
      menuClose.addEventListener("click", function(e) {
        e.preventDefault();
        document.body.classList.remove("menu-is-open");
      });
    }
  });
  document.addEventListener("DOMContentLoaded", function () {
    let header = document.querySelector(".s-header");
  
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) { // Cuando se haga scroll de más de 50px
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    });
  });
  