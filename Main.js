var addToListBtns = document.getElementsByClassName('addToList');
var numCheckOut = 0;
const cartCount = document.getElementById('cartCount');
const listBtn = document.getElementById('listBtn');

var list = {}

//function add/updates number of items to cart (doesn't fully add to cart yet)
for (var btn of addToListBtns) {

  btn.addEventListener('click', (event) => {

    var currentProduct = event.target.closest('.product-details');
    var name = currentProduct.children[0].innerHTML;
    
    var inList = false;
    for(var item in list) {
      if(name === item) {inList = true;}
    }

    if(!inList) {
      list[name] = 1
    } else {
      list[name]++;
    }
    
    console.log(list);
    numCheckOut++;
    cartCount.textContent = numCheckOut;
  });
   
}

listBtn.addEventListener('click') = function() {
  for(item in list) {

  }
};


/* Search Bar Mechanisim */
// Note: this is only currently working for the tournamentItems.html page
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('q');
  // event listener for users input
  if (searchInput) {
    searchInput.addEventListener('keyup', filterProducts);
  }
  // function to filter products based on user input
  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const products = document.querySelectorAll('.product-item');

    // looping through each product for user input match if corresponds
    // too h3 value
    products.forEach((product) => {
      const productText = product.querySelector('h3').textContent.toLowerCase();

      if (productText.includes(searchTerm)) {
        product.style.display = 'block'; // shows the product
      } else {
        product.style.display = 'none'; // hides the product
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const saved = JSON.parse(localStorage.getItem('pdga_user') || 'null');
    const userInfo = document.getElementById('userInfo');
    const guestInfo = document.getElementById('guestInfo');

    if (saved && saved.username) {
      userInfo.hidden = false;
      document.getElementById('userName').textContent = saved.name || saved.username;
      document.getElementById('userTier').textContent = saved.tier || '';

      document.getElementById('logoutInline').addEventListener('click', () => {
        localStorage.removeItem('pdga_user');
        location.reload();
      });
    } else {
      guestInfo.hidden = false;
    }
    // function to filter products based on user input
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const products = document.querySelectorAll('.product-item');

        // looping through each product for user input match if corresponds
        // too h3 value
        products.forEach(product => {
            const productText = product.querySelector('h3').textContent.toLowerCase();

            if (productText.includes(searchTerm)) {
                product.style.display = 'block'; // shows the product
            } else {
                product.style.display = 'none'; // hides the product
            }
        });
    }
}); 

});