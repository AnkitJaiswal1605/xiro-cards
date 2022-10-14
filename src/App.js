import React, { useState, useEffect } from 'react'
import { ethers } from "ethers"
import Navbar from './components/Navbar';
import XiroNFT_Abi from './contractsData/XiroNFT_Abi.json'
import XiroNFT_Address from './contractsData/XiroNFT_Address.json'
import cards from './cardsImg.png'
import './App.css';
import axios from 'axios';

function App() {
  
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(null);
  const [account, setAccount] = useState(null);

  const [connectButtonText, setConnectButtonText] = useState("Connect Wallet");
  const [logoutText, setLogoutText] = useState(null);

  const [xiroNFT, setXiroNFT] = useState(null);
  const [nftBalanceValue, setNftBalanceValue] = useState(null);

  const [mintQty, setMintQty] = useState(1);

/************************************* Login and Logout *******************************************/ 

  const login = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    if (chainId == 1) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
      const signer = provider.getSigner();
      loadContracts(signer);
      localStorage.setItem('loggedIn', true);
      nftBalance();
      setConnectButtonText("Connected");
      setLogoutText('Logout');
    } else {
      alert('Please connect to Ethereum network');
    }
  }

  const logout = () => {  
    setXiroNFT(null);
    setAccount(null);
    localStorage.setItem('loggedIn', false);
    setNftBalanceValue(null);
    setConnectButtonText('Connect Wallet');
    setLogoutText(null);
  }

/************************************* On Page Load *******************************************/

  useEffect(() => {
    const onPageLoad = async () => {
        if (localStorage?.getItem('loggedIn')) {
            await login();
        }
     }
     onPageLoad();
   }, []);

/************************************* On Account Change *******************************************/

  if(account) {
    window.ethereum.on('accountsChanged', async () => {
      document.location.reload()
    })
  }

/************************************* Load Contracts *******************************************/

  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const xiroNFT = new ethers.Contract(XiroNFT_Address.address, XiroNFT_Abi.abi, signer);
    setXiroNFT(xiroNFT);
    setLoading(false);
  }

/************************************* Write Functions *******************************************/

  const mintNFT = async (e) => {
    if(account) {
      e.preventDefault();
      const response = await axios.post('https://alpha-api.xiroverse.com/v1/sign' + account);
      if(response.status != 200) {
        return alert("Sorry, you're not whitelisted!!")
      }
      let pricePerNFT = 0.1;
      let totalPrice = mintQty * pricePerNFT;
      const txResponse = await xiroNFT.mint(mintQty, response.data.signature, {value: ethers.utils.parseEther(String(totalPrice))});
      setLoadingMsg('Processing...');
      await txResponse.wait();
      await nftBalance();
      setLoadingMsg(null);
      alert('NFT Minted!!');
    } else {
      alert('Please connect wallet!');
    }
  }

  const add = async => {
    if(mintQty<10) {
      setMintQty(mintQty + 1);
    }
  }

  const subtract = async => {
    if(mintQty>1) {
      setMintQty(mintQty - 1);
    }
  }

/************************************* Read Functions *******************************************/
 
  const nftBalance = async () => {
    if(account) {
      let balBN = await xiroNFT.balanceOf(account);
      let bal = Number(balBN);
      setNftBalanceValue(bal);
      return bal;
    } 
  }

  const getBalance = async () => {
    if(account) {
      nftBalance();
    } else {
      alert('Please connect wallet!');
    }
  }

/************************************* App Component *******************************************/

  return (
    <div className="App background">

      <Navbar 
        login={login} 
        logout = {logout} 
        account={account} 
        logoutText={logoutText}
        connectButtonText={connectButtonText}
      />

      <div>
        <img src={cards} alt="xiro-cards" class="bg-card" />
      </div>

      <div>
        {loading ? (
          <div className="container">
            <h1>CONNECT WALLET</h1>
            <h2 className='nftCount'>Accepted Wallet : <span className="green-text">Metamask</span></h2>
          </div>
        ) : (
          <div className="container">
            <h1 className='containerHeader'>MINT XIRO NFT</h1>

            <h2 className='nftCount'>
              YOUR XIRO NFT COUNT: <span className="green-text">{nftBalanceValue && nftBalanceValue}</span>
              {!nftBalanceValue ?
              <button className="get-btn" onClick={getBalance}>CHECK</button> :
              <button className="get-btn" onClick={() => setNftBalanceValue(null)}>CLEAR</button>}
            </h2>

            <div className="mint-qty">
					    <div className="enter-qty">
                <span className="subtract" onClick={subtract}>-</span>
                <span className="final-qty">{mintQty}</span>
                <span className="add" onClick={add}>+</span>
              </div>

              <div className="green-text max-qty">10 MAX</div>
            </div> 

            <h2 class="price">PRICE:<span class="green-text">&nbsp;0.1</span> ETH (+GAS FEES)</h2>

            <form onSubmit={mintNFT} autoComplete="off">
              <button className="send-btn" type="submit">MINT</button>
            </form>

            <h3 className="loading-msg">{loadingMsg}</h3>
            <br />
          </div>
         )}
      </div>
    </div>
  );
}

export default App;