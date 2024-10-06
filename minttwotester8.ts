import { getMintLen, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, ExtensionType, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE, getTokenMetadata, createMintToInstruction, mintTo, getMint, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount, ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { createInitializeInstruction, createUpdateFieldInstruction, TokenMetadata, pack } from "@solana/spl-token-metadata";
import {Connection, Keypair, clusterApiUrl, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction, NonceAccount, PublicKey, VersionedTransaction, TransactionMessage, sendAndConfirmRawTransaction } from "@solana/web3.js";
//import { Network, TatumSDK, Solana } from "@tatumio/tatum";

declare global  { interface Window {solana?: any;}}

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


const getProvider = () => {
    if ('phantom' in window) {
        const provider = window.solana;
        if (provider?.isPhantom) {
            return provider;
        }
    }
    window.open('https://phantom.app/', '_blank');
};


console.log ('Testing with holdup');

//const connection = new Connection('https://api.devnet.solana.com');
//const connection = new Connection('https://solana-mainnet.g.alchemy.com/v2/tPStYMmjpA4dZXrBxwGL5tqnZw_ccf89');
//const connection = new Connection('https://solana-mainnet.gateway.tatum.io');

const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=e8935d99-c004-41b1-b1b9-f770f2db7f58');



async function mainPayer() {

      

    await window.solana.connect();
    
    const provider =  await getProvider();
    const payer= provider.publicKey.toString();
    console.log('payer as provider.pub to string', payer);
    console.log('provider.publicKey', provider.publicKey);
    
    const mint = Keypair.generate();
        console.log("mint", mint.publicKey.toBase58());
    const newTokenPayer = Keypair.generate();
        console.log('new token payer', newTokenPayer.publicKey.toBase58);

   

    const urlParams = new URLSearchParams(window.location.search);
    // get the values from the url params
    let itemName = urlParams.get('itemName');
    let itemDescription = urlParams.get('itemName');
    let itemLocation = urlParams.get('itemLocation');
    let itemPrice = urlParams.get('itemPrice');

    // display the item details
    let itemDetails = document.getElementById('itemDetails');
       itemDetails.textContent = 
     "What is the Item: "+ itemName + "\n" +
     "Where is the Item: " + itemLocation + "\n" +
     "What is the Price: " + itemPrice
     ;

    const metadata : TokenMetadata= {
            mint: mint.publicKey,
            name: itemName,
            symbol: "item",
            uri: "https://itembanc.io",
            additionalMetadata: [
                ["what", itemDescription],
                ["where", itemLocation],
                ["whatprice", itemPrice] 
            ]
        };
    //have to initialize the mint as above before the metadata as below
    const mintSpace = getMintLen([ExtensionType.MetadataPointer]);
    const metadataSpace = TYPE_SIZE + LENGTH_SIZE + TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
    const lamports = await connection.getMinimumBalanceForRentExemption(
        mintSpace + metadataSpace);
    console.log('lamports', lamports);
    
    const message= "Please sign to authorize creation of NFTs";
    const encodeMessage= new TextEncoder().encode(message);
    const {signature1}= await window.solana.signMessage(encodeMessage, 'utf8');
    console.log('message signed ');


//Get metadata values from the url params in itemtwo.html



const createAccountIx = SystemProgram.createAccount({
        fromPubkey: provider.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintSpace, lamports,
        programId: TOKEN_2022_PROGRAM_ID
        });
    
const initializeMetadataPointerIx = createInitializeMetadataPointerInstruction(
        mint.publicKey,
        provider.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
        );
    
const initializeMintIx= createInitializeMintInstruction(
        mint.publicKey,
        2,
        provider.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
        ); 

    const initializeMetadataIx = createInitializeInstruction({
    mint: mint.publicKey,
    metadata: mint.publicKey,
    mintAuthority: provider.publicKey,
    name: metadata.name,
    symbol: metadata.symbol,
    uri: metadata.uri,
    programId: TOKEN_2022_PROGRAM_ID,
    updateAuthority: provider.publicKey
    });

    const updateMetadataField1 = createUpdateFieldInstruction({
    metadata: mint.publicKey,
    programId: TOKEN_2022_PROGRAM_ID,
    updateAuthority: provider.publicKey,
    field: metadata.additionalMetadata[0][0],
    value: metadata.additionalMetadata[0][1]
    });

    const updateMetadataField2 = createUpdateFieldInstruction({
    metadata: mint.publicKey,
    programId: TOKEN_2022_PROGRAM_ID,
    updateAuthority: provider.publicKey,
    field: metadata.additionalMetadata[1][0],
    value: metadata.additionalMetadata[1][1]
    });

    const updateMetadataField3 = createUpdateFieldInstruction({
    metadata: mint.publicKey,
    programId: TOKEN_2022_PROGRAM_ID,
    updateAuthority: provider.publicKey,
    field: metadata.additionalMetadata[2][0],
    value: metadata.additionalMetadata[2][1]
    });

    

    try {
       
        console.log("provider public", payer);
        const mintpublic= mint.publicKey.toBase58();
        console.log("mint", mintpublic);
        console.log("mintspace", mintSpace);
        console.log('lamports', lamports);
      
        let {blockhash} = await connection.getLatestBlockhash();
        const transaction = new Transaction();
        transaction.recentBlockhash = blockhash;
        const latestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
        transaction.feePayer = provider.publicKey;
       
        
        transaction.add(
            createAccountIx,
            initializeMetadataPointerIx,
            initializeMintIx,
            //mint must preceed metadata
            initializeMetadataIx,
            updateMetadataField1,
            updateMetadataField2,
            updateMetadataField3
        );
        
        async function wait5Seconds() {
            console.log('wait 5 seconds...');
            await new Promise(resolve =>setTimeout(resolve, 5000));
            console.log('ok lets go...');
        };
       
        console.log ('transaction', transaction);
        console.log('payer', payer);
        console.log('mint', mint.publicKey);
        transaction.sign(mint);
        const sig1 = await window.solana.signTransaction(transaction);
        if (sig1.recentBlockhash !== transaction.recentBlockhash) {
            throw new Error ('Transaction has changed since signing');
        }

        console.log("phantom account signed", sig1);
        console.log('mintpair', mint);
        
        console.log('sig1 transaction mint signed too', sig1)
        console.log("transaction2", transaction);
        const serializedTransaction= sig1.serialize();
        wait5Seconds();
        console.log("serialTrans", serializedTransaction);

       
       
        const txsignature=await connection.sendRawTransaction(serializedTransaction);
      
       
       
        wait5Seconds()
        console.log('raw sig', txsignature);
       
       
        } catch (error) {
        console.error("error in transaction", error);
  
        } 

        async function waithere100000Seconds() {
            console.log('wait 100000 seconds...');
            await new Promise(resolve =>setTimeout(resolve, 1000000000));
            console.log('ok lets go...');
        };

        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds();
        
        const message2= "Please sign for creation of token";
        const encodeMessage2= new TextEncoder().encode(message2);
        const {signature2}= await window.solana.signMessage(encodeMessage2, 'utf8');
        console.log('message signed ');

       

        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds(); 

        try{

        let {blockhash} = await connection.getLatestBlockhash();
        const transaction2 = new Transaction();
        transaction2.recentBlockhash = blockhash;
        const latestBlockhash = await connection.getLatestBlockhash();
        transaction2.recentBlockhash = latestBlockhash.blockhash;
        transaction2.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;
        transaction2.feePayer = provider.publicKey;
       
        console.log('mint.publicKey: ', mint.publicKey);
        console.log('provider.publicKey: ', provider.publicKey)

        async function wait8Seconds() {
            console.log('wait 8 seconds...');
            await new Promise(resolve =>setTimeout(resolve, 8000));
            console.log('ok lets go...');
        };
   
        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds();
        waithere100000Seconds(); 
    
        const getata=await getAssociatedTokenAddress(
        mint.publicKey, 
        provider.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const ata = getata.toBase58();
    
        console.log('ata', ata);

        const makeata = createAssociatedTokenAccountInstruction(
        provider.publicKey,
        getata,
        provider.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
        );

       
        const makeTokens = createMintToInstruction(
        mint.publicKey, 
        getata, 
        provider.publicKey, 
        100n, 
        provider, 
        TOKEN_2022_PROGRAM_ID
        );
    

        async function wait100000Seconds() {
            console.log('wait 100000 seconds...');
            await new Promise(resolve =>setTimeout(resolve, 1000000000));
            console.log('ok lets go...');
        };
   
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();


     
        transaction2.add(
        makeata,
        makeTokens
        );

        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
       
        const message3= "Please Wait JUST a Minute then sign";
        const encodeMessage3= new TextEncoder().encode(message3);
        const {signature3}= await window.solana.signMessage(encodeMessage3, 'utf8');
        console.log('message minute signed ');
   
          
        const sig2 = await window.solana.signTransaction(transaction2);
        if (sig2.recentBlockhash !== transaction2.recentBlockhash) {
        throw new Error ('Transaction has changed since signing');
        }

       
       
        console.log('token mint signed too', sig2)
        console.log("transaction2", transaction2);
        const serializedTransaction2= sig2.serialize();
        console.log("serialTrans", serializedTransaction2);
       
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
       
        
        const txsignature2 = await connection.sendRawTransaction(serializedTransaction2);
        
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();
        wait100000Seconds();

        console.log('raw sig', txsignature2);
       
        try{
            
            if (txsignature2) {
                
                console.log("Minted ", mint.publicKey.toBase58());
                const itemMinted = document.getElementById('itemMinted');
                itemMinted.textContent = 
                "Minted: " + (mint.publicKey.toBase58());
                document.getElementById('nextButton').style.display = 'block';
                //test option to go make another one
            
            }
            } catch (error) {
            console.error('check mint');
            }
        

        }catch(error){
            console.error("error in transaction", error);
        }

        
    
    }

mainPayer().catch(error => {
    console.error("Error:", error);
});