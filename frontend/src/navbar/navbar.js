import { Box, Flex, Image, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../src/assets/icons/logo.svg";
import { close, hamburger } from "../assets/svgs/svg";
import CustomButton from "../common/CustomButton";
import { toaster } from "evergreen-ui";
import { useNavigate } from "react-router-dom";
import getUserInterval, {
  connect as connectWallet,
  checkConnection,
  disconnect as disconnectWallet,
  isDisconnected,
  hasLegacy
} from "../utils/helpers"
import HeadTag from "../common/headTag";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useEnsName } from "wagmi";

const Navbar = () => {
  const navigate = useNavigate();
  const [openNavBar, setOpenNavBar] = useState(false);
  const [user, setUser] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { address } = useAccount();

  const { data } = useEnsName({
    address: address,
  });
  

  const disconnect = () => {
    disconnectWallet();
    setIsConnected(false);
    navigate('/');
  }

  const goToProfile = async () => {
    if (!isDisconnected()) {
      if (await hasLegacy(checkConnection())) {
        navigate('/profile');
      }
    }
  };

  useEffect(() => {
    if (address) {
      setUser(address);
      setIsConnected(true);
    } else {
      setUser(null);
      setIsConnected(false)
    }
  }, [address]);

  useEffect(() => {
    try {
      if (!isDisconnected()) {
        checkConnection().then((account) => {
          if (account) {
            setIsConnected(true)
            setUser(account);
          }
          else {
            disconnect();
            navigate('/');
          }
        });
      } else {
        navigate('/')
      }
    } catch (err) {
      console.log(err);
    }
  }, [])

  return (
    <>
    <HeadTag title="About Us" />
      <Flex
        justifyContent="space-between"
        alignItems="center"
        display={{ base: "block", lg: "flex" }}
      >
        <Flex
          alignItems="center"
          justifyContent="space-around"
          display={{ base: "none", lg: "flex" }}
        >
          <Flex alignItems="center" justifyContent="space-between">
            <Link to="/">
              <Image w={{ base: "40px", lg: "60px" }} src={logo} alt="logo" />
            </Link>
            <Box
              onClick={() => setOpenNavBar(!openNavBar)}
              display={{ base: "block", lg: "none" }}
            >
              {openNavBar ? close : hamburger}
            </Box>
          </Flex>
          <Text
            cursor="pointer"
            ml={{ base: "0", lg: "100px" }}
            mt={{ base: "20px", lg: "0" }}
            _hover={{ color: "brand.teal" }}
            color="brand.white"
            onClick={() => { goToProfile() }}
            style={{ transition: "all 1.2s ease" }}
          >
            Profile
          </Text>
          <a href ="/#about-us">
            <Text
              cursor="pointer"
              ml={{ base: "0", lg: "100px" }}
              mt={{ base: "20px", lg: "0" }}
              _hover={{ color: "brand.teal" }}
              color="brand.white"
              style={{ transition: "all 1.2s ease" }}
            >
              About us
            </Text>
          </a>
          <a href="/#how-it-works">
            <Text
              cursor="pointer"
              mt={{ base: "20px", lg: "0" }}
              ml={{ base: "0", lg: "100px" }}
              _hover={{ color: "brand.teal" }}
              color="brand.white"
              style={{ transition: "all 1.2s ease" }}
            >
              How it works
            </Text>
          </a>
        </Flex>
        <Flex borderRadius="8px" border="1px solid #FFFFFF" padding="8px" color="white">
            <Text>Ens Name:</Text>
            <Text ml="5px">{data || '-'}</Text>
          </Flex>
        <ConnectButton label="Connect wallet" accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }} />
      </Flex>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        mt="20px"
        display={{ base: "flex", lg: "none" }}
      >
        <Link to="/">
          <Image w={{ base: "40px", lg: "60px" }} src={logo} alt="logo" />
        </Link>
        <Box
          onClick={() => setOpenNavBar(!openNavBar)}
          display={{ base: "block", lg: "none" }}
        >
          {openNavBar ? close : hamburger}
        </Box>
      </Flex>

      {openNavBar && (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          display={{ base: "block", lg: "flex" }}
          height={{ base: "100vh", lg: "" }}
        >
          <Flex
            alignItems="center"
            justifyContent="space-around"
            display={{ base: "block", lg: "flex" }}
            w="100%"
          >
            <Text
              cursor="pointer"
              textAlign="center"
              ml={{ base: "0", lg: "100px" }}
              mt={{ base: "20px", lg: "0" }}
              _hover={{ color: "brand.teal" }}
              color="brand.white"
              onClick={() => { goToProfile() }}
            >
              Profile
            </Text>
            <Text
              cursor="pointer"
              textAlign="center"
              ml={{ base: "0", lg: "100px" }}
              mt={{ base: "20px", lg: "0" }}
              _hover={{ color: "brand.teal" }}
              color="brand.white"
            >
              About us
            </Text>
            <Text
              cursor="pointer"
              textAlign="center"
              mt={{ base: "20px", lg: "0" }}
              ml={{ base: "0", lg: "100px" }}
              _hover={{ color: "brand.teal" }}
              color="brand.white"
            >
              How it works
            </Text>
          </Flex>
        </Flex>
      )}
    </>
  );
};

export default Navbar;
