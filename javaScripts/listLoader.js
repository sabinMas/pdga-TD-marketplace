//Javascript for list.html

var listOutput = document.getElementById('listOutput')
const allOnlineBtn = document.getElementById('allOnline');
const allLocalBtn = document.getElementById('allLocal');

allLocalBtn.addEventListener('click', () => {
    locOnlnUpdate('local')
});

allOnlineBtn.addEventListener('click', () => { 
    locOnlnUpdate('online')
});

var locOnlnUpdate = function(option) {
    //console.log('clicked');
    var locOnlnBtnWrappers = document.getElementsByClassName('locOnlnBtnWrapper');
    for(var wrapper of locOnlnBtnWrappers) {
        //console.log(wrapper)
        for(var i = 0; i < wrapper.children.length;i++) {
            if(wrapper.children[i].tagName == 'INPUT') {
                console.log('inside input');
                if(wrapper.children[i].value == option) {
                    wrapper.children[i].checked = true;
                } else {
                    wrapper.children[i].checked = false;
                }
            }
        }
    }
}

document.addEventListener('DOMContentLoaded',() => {
    var retrieveListString = localStorage.getItem('localList')
    var retrievedListObj = JSON.parse(retrieveListString);

    for(item in retrievedListObj) {

        var listItem = document.createElement('div');
        listItem.classList.add('item-details');
        var text = `item: ${item} --SPACING-- Qty: `;
        
        var qtyInput = document.createElement('input');
        qtyInput.type='number';
        qtyInput.value= retrievedListObj[item]
        
        var textNode = document.createTextNode(text)
        var newP = document.createElement('p')
        newP.appendChild(textNode);
        newP.appendChild(qtyInput);
        listItem.appendChild(newP);
        
        var locOnlnBtnWrapper = document.createElement('div');
        locOnlnBtnWrapper.classList.add('locOnlnBtnWrapper');

        //creating local button
        var localTextNode = document.createTextNode('local');
        var newLabel = document.createElement('label');
        var newBtn = document.createElement('input');
        //adding attributes to local radio button
        newBtn.type = 'radio';
        newBtn.value= 'local';
        newBtn.name = `${item}`;
        //appending 
        newLabel.appendChild(localTextNode);
        locOnlnBtnWrapper.appendChild(newLabel);
        locOnlnBtnWrapper.appendChild(newBtn)
        //newLabel.appendChild(newBtn)
        listItem.appendChild(locOnlnBtnWrapper);
        
        //creating international button
        var onlineTextNode = document.createTextNode('Online');
        newLabel = document.createElement('label');
        newBtn = document.createElement('input');
        //adding attributes to international button
        newBtn.type = 'radio';
        newBtn.value= 'online';
        newBtn.name = `${item}`;
        //appending
        newLabel.appendChild(onlineTextNode);
        locOnlnBtnWrapper.appendChild(newLabel);
        locOnlnBtnWrapper.appendChild(newBtn)
        listItem.appendChild(locOnlnBtnWrapper);
        
        //append to output div
        listOutput.appendChild(listItem);

    }
});

