

var listOutput = document.getElementById('listOutput')

document.addEventListener('DOMContentLoaded',() => {
    //console.log(localStorage.getItem('localList'))
    var retrieveListString = localStorage.getItem('localList')
    var retrievedListObj = JSON.parse(retrieveListString)
    //console.log(retrievedListObj)

    for(item in retrievedListObj) {
        var listItem = document.createElement('div');
        listItem.classList.add('item-details');
        var text = `
          item: ${item} --SPACING-- Qty: ${retrievedListObj[item]}`
        var textNode = document.createTextNode(text)
        //console.log(textNode)
        var newP = document.createElement('p')
        newP.appendChild(textNode);
        listItem.appendChild(newP);
        
        //console.log(newP)
        //console.log(listItem);

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

    }
});

