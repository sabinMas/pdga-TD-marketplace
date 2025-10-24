var addToListBtns = document.getElementsByClassName('addToList');
<<<<<<< HEAD
var numCheckOut = 0;
const cartCount = document.getElementById('cartCount');

//function add/updates number of items to cart (doesn't fully add to cart yet)
=======
const numCheckOutref = document.getElementById('numCheckOut');
var numCheckOut = 0;

>>>>>>> 7c1451ed33e4aecae3228325cb1e063270180b0f
for (var btn of addToListBtns) {
  btn.addEventListener('click', () => {
    console.log('added to list');
    numCheckOut++;
<<<<<<< HEAD
    cartCount.textContent = numCheckOut;
=======
    numCheckOutref.innerHTML = 'Check Out: ' + numCheckOut;
>>>>>>> 7c1451ed33e4aecae3228325cb1e063270180b0f
  });
}

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