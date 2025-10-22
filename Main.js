var addToListBtns = document.getElementsByClassName("addToList");
const numCheckOutref = document.getElementById("numCheckOut");
var numCheckOut = 0;

for(var btn of addToListBtns){
    btn.addEventListener('click',()=>{
        console.log("added to list");
        numCheckOut++;
        numCheckOutref.innerHTML="Check Out: " + numCheckOut;
    })
};


