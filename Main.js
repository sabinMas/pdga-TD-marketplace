var addToListBtns = document.getElementsByClassName("addToList");
const numCheckOutref = document.getElementById("numCheckOut");
var numCheckOut = 0;

for(var btn of addToListBtns){
    btn.addEventListener('click', ()=> {
        console.log("added to list");
        numCheckOut++;
        numCheckOutref.innerHTML="Check Out: " + numCheckOut;
    })
};

<<<<<<< HEAD

/* Search Bar Mechanisim */
=======
>>>>>>> 9e68e26759c939248cfc8eba4ea3f3f0ff6ffd33
// Note: this is only currently working for the tournamentItems.html page
document.addEventListener('DOMContentLoaded',()=> {
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
