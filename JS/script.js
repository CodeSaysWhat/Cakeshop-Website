let menu = document.querySelector('#menu-bars');
let navbar = document.querySelector('.navbar');
let order = document.querySelector('#Order');

menu.onclick = () =>{
menu.classList.toggle('fa-times');
navbar.classList.toggle('active');
}

window.onscroll = () =>{
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
}

document.querySelector('#search-icon').onclick = () =>{
    document.querySelector('#search-form').classList.toggle('active');
}

document.querySelector('#close').onclick = () =>{
    document.querySelector('#search-form').classList.remove('active');
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' // For smooth scrolling animation
  });
}

async function loadComponent(id, file) {
  try {
    const res = await fetch(file);
    if (!res.ok) throw new Error(`Failed to load ${file}`);
    document.getElementById(id).innerHTML = await res.text();
  } catch (err) {
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "partials/header.html");
  loadComponent("footer", "partials/footer.html");
});
