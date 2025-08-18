let menu = document.querySelector('#menu-bars');
let navbar = document.querySelector('.navbar');
let order = document.querySelector('#Order');

menu.onclick = () =>{
menu.classList.toggle('fa-times');
navbar.classList.toggle('active');
}

Window.onscroll = () =>{
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
}

document.querySelector('#search-icon').onclick = () =>{
    document.querySelector('#search-form').classList.toggle('active');
}

document.querySelector('#close').onclick = () =>{
    document.querySelector('#search-form').classList.remove('active');
}
