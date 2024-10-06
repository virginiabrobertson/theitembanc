
function checkForPhantom(){
    const isPhantomInstalled = window.solana?.isPhantom;
    if (!isPhantomInstalled) {
        console.log("phantom wallet is not installed");
        const noPhantomMessage = document.getElementById('noPhantomWallet');
        if (noPhantomMessage) {
            noPhantomMessage.textContent = "To Use this app you will need to install the Phantom Wallet";           
        }else{
            alert("please install the Phantom Wallet to use this app");
        }
    }

}

//get the html elements to display

const itemNameDisplay = document.getElementById('itemNameDisplay');
const itemLocationDisplay = document.getElementById('itemLocationDisplay');
const itemPriceDisplay = document.getElementById('itemPriceDisplay');

//display the info function
function displayInfo(){

    //get values entered by the user from the HTML
    const itemName = document.getElementById('itemName').value;
    const itemLocation = document.getElementById('itemLocation').value;
    const itemPrice = document.getElementById('itemPrice').value;

    //display on screen
    itemNameDisplay.textContent = `What is Item: ${itemName}`;
    itemLocationDisplay.textContent = `Where is Item: ${itemLocation}`;
    itemPriceDisplay.textContent = `What Price: ${itemPrice}`;
}