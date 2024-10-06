//import { TatumSDK, Network } from '@tatumio/tatum'
//import {initializeApp} from 'firebase/app';
//const firebaseConfig = {
 //  apiKey: "AIzaSyBDv1tMw7yrNc2cGoDqmExtO8ZqHK9svdQ",
 //   authDomain: "item-banc-3.firebaseapp.com",
 //  projectId: "item-banc-3",
 //   storageBucket: "item-banc-3.appspot.com",
 //   messagingSenderId: "661445491998",
 //   appId: "1:661445491998:web:0a48995552cd6488535d0f",
 //   measurementId: "G-7304YVN3DY"
 //};

//firebase.initializeApp(firebaseConfig);
//const app = initializeApp(firebaseConfig);

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