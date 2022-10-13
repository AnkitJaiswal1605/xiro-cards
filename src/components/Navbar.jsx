const Navbar = ({ login, logout, account, logoutText, connectButtonText }) => {
    
    const walletStyle = {color: "#1be505", borderColor: "#1be505"};

    return (

        <div className="navbar">
            <div className="logo">XIROVERSE</div>
        
            <div className="connection-div">
                <p className="logout" onClick={logout}>{logoutText}</p>
                <div className="wallet-div">
                    <button 
                        className="wallet-btn" 
                        style={account && walletStyle} 
                        onClick={login}>
                        {connectButtonText}
                    </button>
                    <p className="accountText">{account ? account.substring(0,5) + "..." + account.substring(account.length - 5) : "Network : Ethereum"}</p>
                </div>
            </div>
        </div>
    )

}

export default Navbar;