var addToListBtns = document.getElementsByClassName('addToList');

const numCheckOutref = document.getElementById('numCheckOut');
var numCheckOut = 0;

var addToListBtns = document.getElementsByClassName('addToList');

var shoppingList = [];

for (var btn of addToListBtns) {
  var e = btn.closest('.product-details'); 
  
  
  btn.addEventListener('click', addtoList(itemDetails));
}

function addtoList(itemDetails) {
  var name = itemDetails.children[0].innerHTML;
  console.log(name);
  numCheckOut++;
  numCheckOutref.innerHTML = 'Check Out: ' + numCheckOut;

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