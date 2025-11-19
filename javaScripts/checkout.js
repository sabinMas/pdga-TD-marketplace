//recommendation arrows function
const list = document.getElementById('items');
const output = document.getElementById('cart');
function scrollLeftBtn() {
    list.scrollBy({left: -250, behavior: 'smooth'});
}

function scrollRightBtn() {
    list.scrollBy({left: 250, behavior: 'smooth'});
}

document.addEventListener('DOMContentLoaded', () => {
    var saved = (sessionStorage.getItem('checkoutList'));
    var items = JSON.parse(saved);
    console.log('page load')

    for(const item in items) {
        const itemInCart = document.createElement('div')
        itemInCart.classList.add('items-in-cart');

        const cartItem = document.createElement('div');
        cartItem.classList.add('cart-item');
        
        var img = document.createElement('img');
        img.classList.add('item-image');
        cartItem.appendChild(img);

        var itemInfo = document.createElement('div');
        itemInfo.classList.add('cart-item-info');
        
        var itemName = document.createElement('p');
        itemName.classList.add('cart-item-name');
        itemName.innerHTML = item;
        itemInfo.appendChild(itemName);

        var itemDetails = document.createElement('p');
        itemDetails.classList.add('cart-item-details');
        itemDetails.innerHTML = 'details';
        itemInfo.appendChild(itemDetails);
        
        cartItem.appendChild(itemInfo);

        var quantity = document.createElement('p');
        quantity.classList.add('cart-item-quantity')
        quantity.innerHTML = `Quantity: ${items[item]}`
        cartItem.appendChild(quantity);

        var price = document.createElement('p');
        price.classList.add('cart-item-price');
        price.innerHTML = "$10.00"
        cartItem.appendChild(price);

        itemInCart.appendChild(cartItem);
        output.appendChild(itemInCart)

    }
});
