/* eslint-disable no-implied-eval */
/* eslint-disable react-hooks/rules-of-hooks */
import { toaster } from "evergreen-ui";
export const legacyAddress = "TGNNQbUshY9Y7aC7tr4XBS7USKDSxj1HCq";

export async function createLegacy(legatee, checkInterval) {
  try{
    const Legacy = await window.tronWeb.contract().at(legacyAddress);
    const txHash = await Legacy.create(legatee, checkInterval).send();
    return true;
  } catch (err) {
    console.log(err)
    toaster.danger('Could not create legacy');
    return false
  }
}

export async function editLegacy(legatee, checkInterval) {
  try{
    const Legacy = await window.tronWeb.contract().at(legacyAddress);
    const txHash = await Legacy.updateLegacy(legatee, checkInterval).send();
    return true;
  } catch (err) {
    console.log(err)
    toaster.danger('Could not create legacy');
    return false
  }
}

export const addTokens = async(tokens) => {
  try {
    const Legacy = await window.tronWeb.contract().at(legacyAddress);
    const addTokensTxHash = await Legacy.addTokens(tokens).send();
    return true;
  } catch(err) {
    console.log(err);
    return false;
  }
}


export const getLegacyTokens = async(address) => {
  try {
    const Legacy = await window.tronWeb.contract().at(legacyAddress);
    const legacyIndex = Number(await Legacy.legacyIndexes(address).call());
    let legacyTokens = await Legacy.getLegacyTokens(legacyIndex).call();
    legacyTokens = legacyTokens.map((token) => {
      return window.tronWeb.address.fromHex(token);
    })
    return legacyTokens;
  } catch(err) {
    console.log(err);
  }
}

export async function checkIn() {
  try{
    const Legacy = await window.tronWeb.contract().at(legacyAddress);
    const txHash = await Legacy.checkIn().send();
    return true;
  } catch (err) {
    console.log(err)
    toaster.danger('An error occured');
    return false
  }
}

export const hasLegacy = async(address) => {
  try {
    const Legacy = await window.tronWeb.contract().at(legacyAddress);
    const legacyIndex = Number(await Legacy.legacyIndexes(address).call());
    if (legacyIndex == 0) {
      return false;
    } else {
      return true;
    }
  } catch(err) {
    console.log(err);
  }
}

export async function connect() {
  if(window.tronWeb) {
      if(window.confirm("Are you sure you want to connect your wallet. This would let Legacy see your wallet address and account balance")) {
        try {
          const res = await window.tronLink.request({method: 'tron_requestAccounts'});
          if (res.code == 4001) {
            window.alert("Please accept wallet connection!");
          } else {
            const address = window.tronWeb.defaultAddress;
            localStorage.removeItem('isDisconnected');
            return address.base58;
          }
        } catch(e) {
          window.alert("Could not detect TronLink wallet");
          console.log(e);
        }
      }
  }
}


export const disconnect = () => {
  localStorage.setItem("isDisconnected", "true");
}

export const isDisconnected = () => {
  if (localStorage.getItem('isDisconnected')) {
    return true
  } else {
    return false
  }
}

export function checkConnection() {
  try {
    const address = window.tronWeb.defaultAddress;
    return address.base58;
  } catch (error) {
    console.log(error)
  }
}

const getUserInterval = async() => {
        try {
          const Legacy = await window.tronWeb.contract().at(legacyAddress);
          const index = await Legacy.legacyIndexes(checkConnection()).call();
          console.log(index);
            const res = await Legacy.legacies(Number(index)).call();
              console.log(res)
              const legatee = window.tronWeb.address.fromHex(res[1]);
              //Convert lastSeen to minutes (just for the sake of demo)
              let ls = Math.floor( ((Number(new Date()) / 1000) - Number(res[2])) / (3600 * 24) );
              const lastSeen = ls == 0 ? "Today" : `${ls} days ago`;
              //Convert checkInterval to seconds (just for the sake of demo)
              const secs = Number(res[3]);
              const intervaldays = Math.floor(secs / (3600 * 24));
              console.log('interval secs', secs);
              const interval = `Every ${intervaldays} days`;
              return {legatee, lastSeen, interval};
        } catch (error) {
          toaster.danger('An error occured!')
          return;
        }
};

export default getUserInterval;