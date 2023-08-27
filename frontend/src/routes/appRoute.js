import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { render } from "react-dom";
import Home from "../pages/home";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";
import CheckInterval from "../pages/checkInterval";
import Form from "../pages/form";
import SelectTokens from "../pages/selectTokens";
import SuccessMessage from "../pages/successMsg";
import Edit from "../pages/edit";
import 'aos/dist/aos.css';
import Aos from "aos";
import '@rainbow-me/rainbowkit/styles.css';

import { publicProvider } from 'wagmi/providers/public';
import { WagmiConfig, configureChains, createConfig, } from 'wagmi';
import { RainbowKitProvider, getDefaultWallets } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  optimism,
  goerli,
  arbitrum, arbitrumGoerli, arbitrumNova,
  bscTestnet,
} from 'wagmi/chains';

const { chains, publicClient } = configureChains(
  [mainnet, optimism, goerli, bscTestnet, arbitrum, arbitrumGoerli, arbitrumNova],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Willow',
  projectId: `${process.env.REACT_APP_PROJECT_ID}`,
  chains
});

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  connectors
})

const AppRoute = () => {

    const legacy = localStorage.getItem('has_legacy');

    useEffect(() => {
      Aos.init();
    }, [])
    
  return render(
    <BrowserRouter>
     <ChakraProvider theme={theme} resetCSS>
     <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains}>
          <Routes>
            <Route index path="/" element={legacy ? <CheckInterval /> : <Home />} />
            <Route path="/get-started" element={<Form />} />
            <Route path="/select-token" element={<SelectTokens />} />
            <Route path="/profile" element={<CheckInterval />} />
            <Route path="/success" element={<SuccessMessage />} />
            <Route path="/edit" element={<Edit />} />
          </Routes>
        </RainbowKitProvider>
     </WagmiConfig>
     </ChakraProvider>
    </BrowserRouter>,
    document.getElementById("root")
  );
};

export default AppRoute;
