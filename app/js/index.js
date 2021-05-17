import EmbarkJS from 'Embark/EmbarkJS';
import detectEthereumProvider from '@metamask/detect-provider';
import Web3 from 'web3';
import { PhotoOwnership } from '../../embarkArtifacts/contracts';
import 'bootstrap/dist/css/bootstrap.css';


const app = {
}

// import your contracts
// e.g if you have a contract named SimpleStorage:
//import SimpleStorage from 'Embark/contracts/SimpleStorage';

EmbarkJS.onReady(async (error) => {
  if (error) {
    console.error('Error while connecting to web3', error);
  }

  await startApp();

  // PhotoOwnership.methods.symbol().call().then(console.log);
  // PhotoOwnership.methods.hello("abc").send().then(console.log);
  // PhotoOwnership.methods.mintPOT("abcd").send({gas: 2100000}).then(console.log);
  // You can execute contract calls after the connection
});

async function startApp() {
  // get provider from e.g. Metamask
  const provider = await detectEthereumProvider();
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (provider !== window.ethereum) {
    console.error('Do you have multiple wallets installed?');
    return Promise.reject();
  }
  EmbarkJS.Blockchain.Providers.web3.setProvider(provider);
  provider.on('chainChanged', handleChainChanged);
  provider.on('accountsChanged', handleAccountsChanged);
  await attachUI();
}

async function attachUI() {

  let extractor = (form) => {
    return form.querySelector('#tokenURI').value;
  };
  let action = (value) => {
    return createToken(value).then(result => {
      return `Successfully minted POT with ID ${result}.`;
    })
  }
  buildForm('form-createToken', extractor, action);

  extractor = (form) => {
    let tokenId = form.querySelector('#licTokenId').value;
    let number = form.querySelector('#licNum').value;
    return [tokenId, number];
  };
  action = (args) => {
    return mintLicenses(args[0], args[1]).then(result => {
      return `Successfully minted ${args[1]} PLT for token ${args[0]}.`;
    })
  }
  buildForm('form-mintLicenses', extractor, action);

  extractor = (form) => {
    let tokenId = form.querySelector('#buyTokenId').value;
    return tokenId;
  };
  action = (tokenId) => {
    return buyLicense(tokenId).then(result => {
      return `Successfully bought PLT for token ${tokenId}.`;
    })
  }
  buildForm('form-buyLicense', extractor, action);

  extractor = (form) => {
    let tokenId = form.querySelector('#supplyTokenId').value;
    return tokenId;
  };
  action = (tokenId) => {
    return fetchSupply(tokenId).then(result => {
      return `A total of ${result} PLT have been emitted for POT ${tokenId}.`;
    })
  }
  buildForm('form-supply', extractor, action);

  extractor = (form) => {
    let tokenId = form.querySelector('#balanceTokenId').value;
    return tokenId;
  };
  action = (tokenId) => {
    return fetchBalance(tokenId).then(result => {
      return `You own ${result} PLT for POT ${tokenId}.`;
    })
  }
  buildForm('form-balance', extractor, action);
}

function buildForm(formId, valueExtractor, action) {
  let form = document.getElementById(formId);
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let btn = e.target.querySelector('button');
    let alert = e.target.querySelector('.alert');
    toggleButton(btn);
    action(valueExtractor(form)).then(result => {
      toggleButton(btn);
      formAlert(alert, result, true);
    })
    .catch(err => {
      toggleButton(btn);
      formAlert(alert, err.message, false);
    });
  });
}

function toggleButton(btn) {
  let spinner = btn.querySelector('.spinner-border');
  let label = btn.querySelector('.label');
  if (spinner.style.display === "none") {
    spinner.style.display = "block";
    btn.disabled = true;
    label.textContent = '';
  } else {
    spinner.style.display = "none";
    btn.disabled = false;
    label.textContent = 'Submit';
  }
}

function formAlert(element, msg, success) {
  element.classList.remove('alert-danger');
  element.classList.remove('alert-success');
  element.innerText = msg;
  element.classList.add(success ? 'alert-success' : 'alert-danger');
  element.style.display = 'block';
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    console.log('Please connect to MetaMask.');
  } else if (accounts[0] !== app.currentAccount) {
    app.currentAccount = accounts[0];
    // Do any other work!
  }
}

function handleChainChanged(_chainId) {
  // We recommend reloading the page, unless you must do otherwise
  window.location.reload();
}

async function connect() {
  try {
    const accounts = await EmbarkJS.enableEthereum();
    handleAccountsChanged(accounts);
    // access granted
  } catch (error) {
    if (err.code === 4001) {
      // EIP-1193 userRejectedRequest error
      // If this happens, the user rejected the connection request.
      console.log('Please connect to MetaMask.');
    } else {
      console.error(err);
    }
  }
}

async function createToken(tokenURI) {
  await connect();
  console.log(tokenURI);
  console.log(app.currentAccount);
  const result = await PhotoOwnership.methods.mintPOT(tokenURI).send({ from: app.currentAccount, gas: 2100000 });
  console.log(result);
  const tokenId = result.events.Transfer.returnValues.tokenId;
  return tokenId;
}

async function mintLicenses(tokenId, num) {
  await connect();
  const result = await PhotoOwnership.methods.mintPLT(tokenId, num).send({ from: app.currentAccount, gas: 2100000 });
  console.log(result);
  return result.status;
}

async function buyLicense(tokenId) {
  await connect();
  try {
    const result = await PhotoOwnership.methods.obtainLicense(tokenId)
      .send({ from: app.currentAccount, gas: 2100000, value: Web3.utils.toWei('1')});
    return Promise.resolve(result.status);
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

async function fetchSupply(tokenId) {
  await connect();
  try {
    const result = await PhotoOwnership.methods.totalLicenses(tokenId)
      .call({ from: app.currentAccount});
    console.log(result)
    return Promise.resolve(result);
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

async function fetchBalance(tokenId) {
  await connect();
  try {
    const result = await PhotoOwnership.methods.myLicenses(tokenId)
      .call({ from: app.currentAccount});
    console.log(result)
    return Promise.resolve(result);
  } catch (err) {
    console.error(err);
    return Promise.reject(err);
  }
}

// OR if using "library: 'web3'" in config/contracts.js

// import web3 from '../../embarkArtifacts/web3.js';
// import SimpleStorage from '../embarkArtifacts/contracts/SimpleStorage';
// web3.onReady(async () => {
//  let accounts = await web3.eth.getAccounts();
//})
