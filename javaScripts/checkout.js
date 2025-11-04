//recommendation arrows function
const list = document.getElementById('items');

function scrollLeftBtn() {
    list.scrollBy({left: -250, behavior: 'smooth'});
}

function scrollRightBtn() {
    list.scrollBy({left: 250, behavior: 'smooth'});
}