var addToListBtns = document.getElementsByClassName('addToList');
var numCheckOut = 0;
const cartCount = document.getElementById('cartCount');
const listBtn = document.getElementById('listBtn');
if (listBtn) {
    listBtn.addEventListener('click', function() {
    });
}

var list = {}

//for loop to add eventListeners to all 'add to list' buttons
for (var btn of addToListBtns) {
  //adds items to a list object, and counter for number of items in cart
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
    
    localStorage.setItem('localList', JSON.stringify(list));
    
    console.log(list);
    numCheckOut++;
    cartCount.textContent = numCheckOut;
    console.log(localStorage.getItem('localList'))

  });
}

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('q');
    const saved = JSON.parse(localStorage.getItem('pdga_user') || 'null');
    const userInfo = document.getElementById('userInfo');
    const guestInfo = document.getElementById('guestInfo');

    // function to filter products based on user input
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const products = document.querySelectorAll(' .product-grid article.product-card');

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

    if (searchForm) {
        searchForm.addEventListener('input', (event) => {
            event.preventDefault(); 
        });
    }

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

    if (searchInput) {
      searchInput.addEventListener('keyup', filterProducts)
    }
});