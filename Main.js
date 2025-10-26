var addToListBtns = document.getElementsByClassName('addToList');
var numCheckOut = 0;
const cartCount = document.getElementById('cartCount');
const listBtn = document.getElementById('listBtn');

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
    
    console.log(list);
    numCheckOut++;
    cartCount.textContent = numCheckOut;
  });
}

//not functioning yet because list.html doesn't see the the listBtn on tournementItems.html
//may need to do an on load or something
listBtn.addEventListener('click', function() {
  var listOutput = document.getElementById('listOutput')
  for(item in list) {
    var listItem = document.createElement('div');
    listItem.classList.add('item-details');
    var text = `
      item: ${item} ==SPACING-- Qty: ${list[item]}`
    var textNode = document.createTextNode(text)
    console.log(textNode)
    var newP = document.createElement('p')
    newP.appendChild(textNode);
    listItem.appendChild(newP);
    
    console.log(newP)
    console.log(listItem);

    var localTextNode = document.createTextNode('local');
    var newLabel = document.createElement('label');
    var newBtn = document.createElement('input');
    newBtn.type = 'radio';
    newLabel.appendChild(localTextNode);
    newLabel.appendChild(newBtn)
    listItem.appendChild(newLabel);

    var IntTextNode = document.createTextNode('International');
    newLabel = document.createElement('label');
    newBtn = document.createElement('input');
    newBtn.type = 'radio';
    newLabel.appendChild(IntTextNode);
    newLabel.appendChild(newBtn)
    listItem.appendChild(newLabel);

    listOutput.appendChild(listItem);
    //console.log(listOutput);

  }
});

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('q');
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

    if (searchInput) {
      searchInput.addEventListener('keyup', filterProducts)
    }
    // function to filter products based on user input
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const products = document.querySelectorAll('.product-card');

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