import {
  Image,
  Column,
  Row,
  Button,
  Container,
  Col,
  Accordion,
  Form,
  FormControl,
  FormLabel,
  Card,
  Badge,
  Modal,
} from "react-bootstrap";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { supabase } from "./supabaeClient";
import { ethers } from "ethers";
import contractInterface from "../contract-abi.json";
import contractInterface2 from "../wrapper-contract-abi.json";

import React, { useState, useEffect } from "react";
import Picker from "emoji-picker-react";
import { BsBorder, BsEmojiHeartEyesFill } from "react-icons/bs";
import { BsTwitter } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";
import TokenToggle from "./TokenToggle";
import CenterModal from "./CenterModal";

function Home() {
  const [modalShow, setModalShow] = useState(false);
  const wrapperAdd = "0x2Cc8342d7c8BFf5A213eb2cdE39DE9a59b3461A7";
  const [userIndex, setUserIndex] = useState(-1);
  const [tokenIdToggle, setTokenIdToggle] = useState(false);
  const [availableChecks, setAvailableChecks] = useState("0");
  const [resetBool, setResetBool] = useState(1);
  const [userBool, setUserBool] = useState(98);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({ userAddress: "", userCount: "" });
  const { userAddress, userCount } = user;

  const defaultTokenName = "satoshi";
  const [userAdd, setUserAdd] = useState("");
  const [inputStr, setInputStr] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [wrappedOwner, setWrappedOwner] = useState(
    "0x0000000000000000000000000000000000000000"
  );
  const [showPicker, setShowPicker] = useState(false);
  const [inputBytes, setBytes] = useState();
  const [owned, setOwnedBool] = useState(5);
  const [currentOwner, setOwner] = useState();
  const { isConnected } = useAccount();
  const account = useAccount({
    onConnect({ address, connector, isReconnected }) {
      console.log("Connected", { address, connector, isReconnected });
      setUserAdd(account.address);
    },
  });

  async function fetchUsers() {
    const { data } = await supabase.from("lnrRegistry").select();
    setUsers(data);
    console.log("data : ", data);
  }

  async function createUser() {
    await supabase
      .from("lnrRegistry")
      .insert([{ userAddress, userCount }])
      .single();
    setUser({ userAddress: "", userCount: "" });
    fetchUsers();
  }

  async function updateUser() {
    await supabase
      .from("lnrRegistry")
      .update([{ userCount: user.userCount }])
      .match({ userAddress: userAdd });
    setUser({ userAddress: "", userCount: "" });
    fetchUsers();
  }

  useEffect(async () => {
    const index = users.findIndex(
      (item) => item.userAddress == String(userAdd)
    );
    if (index >= 0) {
      const set1 = await setUser({
        userAddress: String(users[index].userAddress),
      });
      const set2 = await setUser({
        userCount: Number(users[index].userCount) - 1,
      });
      const settingIndex = await setUserIndex(index);
      const settingAvailable = await setAvailableChecks(
        users[index].userCount - 1
      );
      console.log(user);
      if (users[index].userCount == 0) {
        setUserBool(99);
      } else {
        setUserBool(100);
        setTokenIdToggle(true);
      }
    }
  }, [users]);

  useEffect(async () => {
    fetchUsers();
  }, []);

  const LNRcontractConfig = {
    addressOrName: "0x5564886ca2C518d1964E5FCea4f423b41Db9F561",
    contractInterface: contractInterface,
  };

  const wrappercontractConfig = {
    addressOrName: "0x2Cc8342d7c8BFf5A213eb2cdE39DE9a59b3461A7",
    contractInterface: contractInterface2,
  };

  const truncate = (input, len) =>
    input.length > len ? `${input.substring(0, len)}...` : input;

  //----------------CHECK NAME-----------------

  const { refetch } = useContractRead({
    ...LNRcontractConfig,
    functionName: "owner",
    args: inputBytes,
  });

  const { refetch: wrapperFetch } = useContractRead({
    ...wrappercontractConfig,
    functionName: "nameToId",
    args: inputBytes,
  });

  const { refetch: wrapperFetchOwner } = useContractRead({
    ...wrappercontractConfig,
    functionName: "ownerOf",
    args: tokenId,
  });

  useEffect(async () => {
    const ownerRes = await wrapperFetchOwner(Number(tokenId));
    setWrappedOwner(ownerRes.data);
    console.log(String(ownerRes.data));
  }, [tokenId]);

  useEffect(async () => {
    setInputStr("");
    setOwnedBool(5);
    console.log(tokenIdToggle);
  }, [tokenIdToggle]);

  const handleNewSearch = async () => {
    setOwnedBool(5);
  };

  const handleClick = async () => {
    if (inputStr.length !== 0) {
      setResetBool(0);
      setOwnedBool(3);
      console.log("clicked");
      const res = await refetch();
      if (userBool == 100 && tokenIdToggle == true) {
        const tokenRes = (await wrapperFetch()).data.toString();
        setTokenId(tokenRes);
        updateUser();
        console.log(tokenId);
      }
      console.log(`owner is:`, res.data);

      if (
        typeof res.data !== "undefined" &&
        res.data.toString() !== "0x0000000000000000000000000000000000000000"
      ) {
        setOwner(res.data.toString());
        setOwnedBool(1);
        console.log("Not available");
      }
      if (
        typeof res.data !== "undefined" &&
        res.data.toString() == "0x0000000000000000000000000000000000000000"
      ) {
        setOwnedBool(0);
        console.log("Available!");
      }
    }
  };

  //----------STRING TO BYTES32------------------

  useEffect(() => {
    setResetBool(1);
    console.log("input : ", inputStr);
    if (typeof inputStr !== "undefined" && inputStr !== "") {
      const bytes = setBytes(
        ethers.utils.formatBytes32String(inputStr).toString()
      );
      console.log(bytes);
    }
  }, [inputStr]);

  //-------------Reserve---------------------
  const { config: reserveConfig } = usePrepareContractWrite({
    ...LNRcontractConfig,
    functionName: "reserve",
    args: inputBytes,
  });

  const {
    data: reserveData,
    write: reserve,
    isLoading: reserveLoading,
    isSuccess: reserveStarted,
    error: reserveError,
  } = useContractWrite(reserveConfig);

  //----------TRACK TRANSACTION------------------

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: reserveData?.hash,
  });

  const isMinted = txSuccess;

  const onEmojiClick = (event, emojiObject) => {
    setInputStr((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
    console.log(inputStr);
  };
  return (
    <div id="container1">
      <CenterModal show={modalShow} onHide={() => setModalShow(false)} />
      <Row style={{ justifyContent: "center", marginTop: "20px" }}>
        <Row>
          <input
            placeholder="userAddress"
            value={userAddress}
            onChange={(e) => setUser({ ...user, userAddress: e.target.value })}
          ></input>
          <input
            placeholder="userCount"
            value={userCount}
            onChange={(e) => setUser({ ...user, userCount: e.target.value })}
          ></input>
          <Button
            style={{ backgroundColor: "#5BC236", borderColor: "5BC236" }}
            onClick={createUser}
          >
            Create User
          </Button>
          <Button style={{ textDecoration: "none" }} onClick={updateUser}>
            Update User
          </Button>
          <p
            id="txt"
            className="pt-3"
            style={{
              backgroundColor: "#36454f",
              fontSize: "1em",
              color: "rgb(255,255,255,3",
              lineHeight: "1.5em",
              textDecoration: "none",
            }}
          >
            Registering new names (1 transaction) is feeless to use. Mint to
            Opensea only (1 transaction instead of 3) & Registering &#38;
            Minting To Opensea (1 transaction instead of 4) has a small fee of
            0.0005ETH. 🙏{" "}
          </p>
          <p
            id="txt"
            style={{
              backgroundColor: "#ffc107",

              fontSize: "1em",
              color: "#000000",
              lineHeight: "1.5em",
              textDecoration: "none",
            }}
          >
            Alternatively, you can get 50 free credits for a small donation of
            0.015 ETH. Credits can be used for OpenSea Match searches &
            Registering, Minting all in a single transaction saving gas fees
            with 0 fee.
          </p>
          
            <Container style={{ margin: "0px", padding: "0px" }}>
              <Row className="p-0">
                <Col className="col-1"></Col>
                <Col className="m-0 p-0 d-flex justify-content-center">
                  <Button
                  
                    onClick={() => setModalShow(true)}
                    variant="warning"
                    className="mt-2 mb-2"
                  >
                    <span style={{ textDecoration: "underline" }}>
                      👉🏾 Donate 0.02 ETH to claim 50 free credits. 👈🏾
                    </span>{" "}
                  </Button>
                </Col>
                <Col className="col-1"></Col>
              </Row>
              
              <Row>
              <Col className="col-1"></Col>
              <Col className="d-flex justify-content-center">
                {isConnected ? (
                  <Button
                  onClick={() => setModalShow(true)}
                  variant="warning"
                  className="mb-2 mt-1"
                >
                  <span>You Have</span>{" "}
                  <Badge style={{ fontSize: "1em" }} bg="success">
                    {availableChecks == -1 ? 0 : availableChecks}
                  </Badge>{" "}
                  <span>FREE Credits.</span>{" "}
                </Button>
                ):(
                  <Button
                  style={{cursor:"default"}}
                  variant="warning"
                  className="mb-2 mt-1"
                >
                  <span>Wallet Not Connected!</span>{" "}
                </Button>
                ) }
              </Col>
              <Col className="col-1"></Col>
            </Row>
            </Container>
          
        </Row>
        {owned == 5 && (
          <Card className="fluid" style={{ width: "20rem" }}>
            <Button
              className="square border border-0"
              id="buttonBg2"
              variant="primary"
              size="md"
              style={{
                height: "250px",
                marginTop: "0.7em",
                fontSize: "1.5em",
                cursor: "default",
              }}
            >
              {inputStr.length == 0 ? defaultTokenName : inputStr}
            </Button>

            <Card.Body>
              <Row>
                <Col id="forcol" style={{ fontSize: "1.4em" }}>
                  <p>Opensea Search</p>
                  <p style={{ fontSize: "0.8em" }}>(1 Credit)</p>
                </Col>
                <Col className="justify-content-end col-3">
                  {userBool == 100 ? (
                    <TokenToggle
                      toggleIsTrue={tokenIdToggle}
                      setToggleIsTrue={() => setTokenIdToggle(!tokenIdToggle)}
                    />
                  ) : (
                    <TokenToggle toggleIsTrue={tokenIdToggle} />
                  )}
                </Col>
              </Row>
              <Card.Title>
                <p style={{ marginTop: 5, color: "black" }}>
                  Status :{" "}
                  <span style={{ color: "red" }}>Already Registered</span>{" "}
                </p>
              </Card.Title>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}>
                  OpenSea Match :{" "}
                  <span>
                    <Badge
                      style={{ backgroundColor: "limegreen" }}
                      bg="success"
                    >
                      100% MATCH
                    </Badge>{" "}
                  </span>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}>
                  Token ID :{" "}
                  <span>
                    <Badge
                      style={{ backgroundColor: "limegreen" }}
                      bg="success"
                    >
                      27198
                    </Badge>{" "}
                  </span>
                  <Badge bg="warning">
                    <a
                      style={{ color: "black" }}
                      href={`https://opensea.io/assets/ethereum/0x2cc8342d7c8bff5a213eb2cde39de9a59b3461a7/27198`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View On Opensea
                    </a>
                  </Badge>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>
                  Owner :{" "}
                  <a
                    style={{ color: "red" }}
                    href={`https://etherscan.io/address/0xbC392d3ec49e1a67a12dD3294055fE34Ebac255F`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    0xbC392d3ec49e1a67a12dD3294055fE34Ebac255F
                  </a>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>ByteCode : </p>
                <span>
                  0x7361746f73686900000000000000000000000000000000000000000000000000
                </span>
              </Card.Text>
              <Row>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="primary"
                  size="md"
                  onClick={handleClick}
                >
                  Search
                </Button>
                <Col
                  style={{
                    paddingLeft: "0",
                    paddingRight: "0.8em",
                    marginRight: "0",
                  }}
                  className="mt-2 justify-content-center align-items-center"
                >
                  <FormControl
                    className="m-0"
                    type="string"
                    value={inputStr}
                    style={{ fontSize: "1.1em" }}
                    placeholder="Type Here"
                    required
                    onChange={(e) => setInputStr(e.target.value)}
                  ></FormControl>
                </Col>
                <Col
                  id="cent"
                  className="mt-2 justify-content-start pt-1 align-items-center col-1 col-sm-1 col-md-1 col-lg-1"
                  style={{
                    backgroundColor: "ffffff",
                    paddingLeft: "0",
                    paddingRight: "1.1em",
                    marginLeft: "0",
                  }}
                >
                  <BsEmojiHeartEyesFill
                    id="grow"
                    style={{ fontSize: "1.5em" }}
                    onClick={() => setShowPicker((val) => !val)}
                  />
                </Col>
                {showPicker && (
                  <Picker
                    pickerStyle={{ width: "100%", alignItems: "center" }}
                    onEmojiClick={onEmojiClick}
                  />
                )}

                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={() => reserve?.()}
                  disabled
                >
                  {reserveLoading && "Pending..."}
                  {reserveStarted && "Minting..."}
                  {!reserveLoading && !reserveStarted && "Register Only"}
                </Button>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  {userBool == 100
                    ? "Mint To Opensea Only (1 credit)"
                    : "Mint To Opensea Only (single transaction, saves gas)"}
                </Button>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  {userBool == 100
                    ? "Register & Mint To Opensea (1 credit)"
                    : "Register & Mint To Opensea (single transaction, saves gas)"}
                </Button>
              </Row>
            </Card.Body>
          </Card>
        )}
        {owned == 3 && (
          <Card className="fluid" style={{ width: "20rem" }}>
            <Button
              className="square border border-0"
              id="buttonBg2"
              variant="primary"
              size="md"
              style={{
                height: "250px",
                marginTop: "0.7em",
                fontSize: "1.5em",
                cursor: "default",
              }}
            >
              {inputStr.length == 0 ? defaultTokenName : inputStr}
            </Button>
            <Card.Body>
              <Row>
                <Col id="forcol" style={{ fontSize: "1.4em" }}>
                  <p>Opensea Search</p>
                  <p style={{ fontSize: "0.8em" }}>(1 Credit)</p>
                </Col>
                <Col className="justify-content-end col-3">
                  {userBool == 100 ? (
                    <TokenToggle
                      toggleIsTrue={tokenIdToggle}
                      setToggleIsTrue={() => setTokenIdToggle(!tokenIdToggle)}
                    />
                  ) : (
                    <TokenToggle toggleIsTrue={tokenIdToggle} />
                  )}
                </Col>
              </Row>
              <Card.Title>
                <p style={{ marginTop: 5, color: "black" }}>
                  Status :{" "}
                  <span style={{ color: "rgb(255, 190, 46)" }}>Fetching</span>{" "}
                </p>
              </Card.Title>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}>
                  OpenSea Match :{" "}
                  <span style={{ color: "rgb(255, 190, 46)" }}>Fetching</span>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}>
                  Token ID :{" "}
                  <span style={{ color: "rgb(255, 190, 46)" }}>Fetching</span>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>
                  Owner :{" "}
                  <span style={{ color: "rgb(255, 190, 46)" }}>Fetching</span>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>ByteCode : </p>
                <span>{inputBytes}</span>
              </Card.Text>
              <Row>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="primary"
                  size="md"
                  onClick={handleClick}
                >
                  Search
                </Button>
                <Col
                  style={{
                    paddingLeft: "0",
                    paddingRight: "0.8em",
                    marginRight: "0",
                  }}
                  className="mt-2 justify-content-center align-items-center"
                >
                  <FormControl
                    className="m-0"
                    type="string"
                    value={inputStr}
                    style={{ fontSize: "1.1em" }}
                    placeholder="Type Here"
                    required
                    onChange={(e) => setInputStr(e.target.value)}
                  ></FormControl>
                </Col>
                <Col
                  id="cent"
                  className="mt-2 justify-content-start pt-1 align-items-center col-1 col-sm-1 col-md-1 col-lg-1"
                  style={{
                    backgroundColor: "ffffff",
                    paddingLeft: "0",
                    paddingRight: "1.1em",
                    marginLeft: "0",
                  }}
                >
                  <BsEmojiHeartEyesFill
                    id="grow"
                    style={{ fontSize: "1.5em" }}
                    onClick={() => setShowPicker((val) => !val)}
                  />
                </Col>
                {showPicker && (
                  <Picker
                    pickerStyle={{ width: "100%", alignItems: "center" }}
                    onEmojiClick={onEmojiClick}
                  />
                )}
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  Register Only
                </Button>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  {userBool == 100
                    ? "Mint To Opensea Only (1 credit)"
                    : "Mint To Opensea Only (single transaction, saves gas)"}
                </Button>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  {userBool == 100
                    ? "Register & Mint To Opensea (1 credit)"
                    : "Register & Mint To Opensea (single transaction, saves gas)"}
                </Button>
              </Row>
            </Card.Body>
          </Card>
        )}
        {owned == 1 && (
          <Card className="fluid" style={{ width: "20rem" }}>
            {currentOwner == wrapperAdd ? (
              <Button
                className="square border border-0"
                id="mintSuccessBtn"
                variant="primary"
                size="md"
                style={{
                  height: "250px",
                  marginTop: "0.7em",
                  fontSize: "1.5em",
                  cursor: "default",
                }}
              >
                {inputStr.length == 0 ? defaultTokenName : inputStr}
              </Button>
            ) : (
              <Button
                className="square border border-0"
                id="registerSuccessButton"
                variant="primary"
                size="md"
                style={{
                  height: "250px",
                  marginTop: "0.7em",
                  fontSize: "1.5em",
                  cursor: "default",
                }}
              >
                {inputStr.length == 0 ? defaultTokenName : inputStr}
              </Button>
            )}
            <Card.Body>
              <Row>
                <Col id="forcol" style={{ fontSize: "1.4em" }}>
                  <p>Opensea Search</p>
                  <p style={{ fontSize: "0.8em" }}>(1 Credit)</p>
                </Col>
                <Col className="justify-content-end col-3">
                  {userBool == 100 ? (
                    <TokenToggle
                      toggleIsTrue={tokenIdToggle}
                      setToggleIsTrue={() => setTokenIdToggle(!tokenIdToggle)}
                    />
                  ) : (
                    <TokenToggle toggleIsTrue={tokenIdToggle} />
                  )}
                </Col>
              </Row>
              <Card.Title>
                <p style={{ marginTop: 5, color: "black" }}>
                  Status :{" "}
                  <span style={{ color: "red" }}>Already Registered</span>{" "}
                </p>
              </Card.Title>
              {currentOwner == wrapperAdd ? (
                <Card.Text>
                  <p
                    style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}
                  >
                    OpenSea Match :{" "}
                    <span>
                      <Badge
                        style={{ backgroundColor: "limegreen" }}
                        bg="success"
                      >
                        100% MATCH
                      </Badge>{" "}
                    </span>
                  </p>
                </Card.Text>
              ) : (
                <Card.Text>
                  <p
                    style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}
                  >
                    OpenSea Match :{" "}
                    <span>
                      <Badge
                        style={{ backgroundColor: "limegreen" }}
                        bg="success"
                      >
                        NO MATCH
                      </Badge>{" "}
                    </span>
                  </p>
                </Card.Text>
              )}
              {currentOwner == wrapperAdd ? (
                <Card.Text>
                  <p
                    style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}
                  >
                    Token ID :{" "}
                    <span>
                      {userBool == 100 ? (
                        <>
                          {tokenIdToggle == true ? (
                            <>
                              <Badge
                                style={{ backgroundColor: "limegreen" }}
                                bg="success"
                              >
                                {tokenId}
                              </Badge>{" "}
                            </>
                          ) : (
                            <>
                              <Badge
                                style={{ backgroundColor: "limegreen" }}
                                bg="success"
                              >
                                SEARCH OFF
                              </Badge>{" "}
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Badge bg="danger">HIDDEN</Badge>{" "}
                        </>
                      )}
                    </span>
                    {tokenIdToggle == true && (
                      <Badge bg="warning">
                        {userBool == 100 && (
                          <a
                            style={{ color: "black" }}
                            href={`https://opensea.io/assets/ethereum/0x2cc8342d7c8bff5a213eb2cde39de9a59b3461a7/${tokenId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View On Opensea
                          </a>
                        )}
                      </Badge>
                    )}
                  </p>
                </Card.Text>
              ) : (
                <Card.Text>
                  <p
                    style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}
                  >
                    Token ID :{" "}
                    <span>
                      <Badge
                        style={{ backgroundColor: "limegreen" }}
                        bg="success"
                      >
                        NOT WRAPPED
                      </Badge>{" "}
                    </span>
                  </p>
                </Card.Text>
              )}
              {currentOwner == wrapperAdd ? (
                <Card.Text>
                  <p style={{ marginTop: 5, color: "black" }}>
                    Owner :{" "}
                    {tokenIdToggle == false ? (
                      <a
                        style={{ color: "red" }}
                        href={`https://etherscan.io/address/${currentOwner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {currentOwner == userAdd
                          ? "YOU OWN THIS"
                          : currentOwner}
                      </a>
                    ) : (
                      <a
                        style={{ color: "red" }}
                        href={`https://etherscan.io/address/${wrappedOwner}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {wrappedOwner == userAdd
                          ? "YOU OWN THIS"
                          : wrappedOwner}
                      </a>
                    )}
                  </p>
                </Card.Text>
              ) : (
                <Card.Text>
                  <p style={{ marginTop: 5, color: "black" }}>
                    Owner :{" "}
                    <a
                      style={{ color: "red" }}
                      href={`https://etherscan.io/address/${currentOwner}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {currentOwner == userAdd ? "YOU OWN THIS" : currentOwner}
                    </a>
                  </p>
                </Card.Text>
              )}
              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>ByteCode : </p>
                <span>{inputBytes}</span>
              </Card.Text>
              <Row>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="primary"
                  size="md"
                  onClick={handleClick}
                >
                  Search
                </Button>
                <Col
                  style={{
                    paddingLeft: "0",
                    paddingRight: "0.8em",
                    marginRight: "0",
                  }}
                  className="mt-2 justify-content-center align-items-center"
                >
                  <FormControl
                    className="m-0"
                    type="string"
                    value={inputStr}
                    style={{ fontSize: "1.1em" }}
                    placeholder="Type Here"
                    required
                    onChange={(e) => setInputStr(e.target.value)}
                  ></FormControl>
                </Col>
                <Col
                  id="cent"
                  className="mt-2 justify-content-start pt-1 align-items-center col-1 col-sm-1 col-md-1 col-lg-1"
                  style={{
                    backgroundColor: "ffffff",
                    paddingLeft: "0",
                    paddingRight: "1.1em",
                    marginLeft: "0",
                  }}
                >
                  <BsEmojiHeartEyesFill
                    id="grow"
                    style={{ fontSize: "1.5em" }}
                    onClick={() => setShowPicker((val) => !val)}
                  />
                </Col>
                {showPicker && (
                  <Picker
                    pickerStyle={{ width: "100%", alignItems: "center" }}
                    onEmojiClick={onEmojiClick}
                  />
                )}
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  Register Only
                </Button>
                {currentOwner == userAdd &&
                currentOwner !== wrapperAdd &&
                resetBool !== 1 ? (
                  <Button
                    style={{ marginTop: "0.5em" }}
                    variant="primary"
                    size="md"
                    onClick={handleClick}
                  >
                    {userBool == 100
                      ? "Mint To Opensea Only (1 credit)"
                      : "Mint To Opensea Only (single transaction, saves gas)"}
                  </Button>
                ) : (
                  <Button
                    style={{ marginTop: "0.5em" }}
                    variant="danger"
                    size="md"
                    onClick={handleClick}
                    disabled
                  >
                    {userBool == 100
                      ? "Mint To Opensea Only (1 credit)"
                      : "Mint To Opensea Only (single transaction, saves gas)"}
                  </Button>
                )}
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  {userBool == 100
                    ? "Register & Mint To Opensea (1 credit)"
                    : "Register & Mint To Opensea (single transaction, saves gas)"}
                </Button>
              </Row>
            </Card.Body>
          </Card>
        )}
        {owned == 0 && (
          <Card className="fluid" style={{ width: "20rem" }}>
            <Button
              className="square border border-0"
              id="buttonBg2"
              variant="primary"
              size="md"
              style={{
                height: "250px",
                marginTop: "0.7em",
                fontSize: "1.5em",
                cursor: "default",
              }}
            >
              {inputStr.length == 0 && !isMinted ? defaultTokenName : inputStr}
              {isMinted && `${inputStr} Registered!`}
            </Button>
            <Card.Body>
              <Row>
                <Col id="forcol" style={{ fontSize: "1.4em" }}>
                  <p>Opensea Search</p>
                  <p style={{ fontSize: "0.8em" }}>(1 Credit)</p>
                </Col>
                <Col className="justify-content-end col-3">
                  {userBool == 100 ? (
                    <TokenToggle
                      toggleIsTrue={tokenIdToggle}
                      setToggleIsTrue={() => setTokenIdToggle(!tokenIdToggle)}
                    />
                  ) : (
                    <TokenToggle toggleIsTrue={tokenIdToggle} />
                  )}
                </Col>
              </Row>
              <Card.Title>
                <p style={{ marginTop: 5, color: "black" }}>
                  Status : <span style={{ color: "limegreen" }}>Available</span>{" "}
                </p>
              </Card.Title>

              <Card.Text>
                <p style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}>
                  OpenSea Match :{" "}
                  <span>
                    <Badge bg="danger">NO MATCH</Badge>{" "}
                  </span>
                </p>
              </Card.Text>

              <Card.Text>
                <p style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}>
                  Token ID :{" "}
                  <span>
                    <Badge bg="danger">NOT WRAPPED</Badge>
                  </span>
                </p>
              </Card.Text>

              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>
                  Owner :{" "}
                  <span>
                    <Badge bg="success">NO OWNER</Badge>
                  </span>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>ByteCode : </p>
                <span>{inputBytes}</span>
              </Card.Text>
              <Row>
                {isMinted ? (
                  <Button
                    style={{ marginTop: "0.5em" }}
                    variant="warning"
                    size="md"
                    onClick={handleNewSearch}
                  >
                    Start New Search
                  </Button>
                ) : (
                  <Button
                    style={{ marginTop: "0.5em" }}
                    variant="primary"
                    size="md"
                    onClick={handleClick}
                  >
                    Search
                  </Button>
                )}
                <Col
                  style={{
                    paddingLeft: "0",
                    paddingRight: "0.8em",
                    marginRight: "0",
                  }}
                  className="mt-2 justify-content-center align-items-center"
                >
                  <FormControl
                    className="m-0"
                    type="string"
                    value={inputStr}
                    style={{ fontSize: "1.1em" }}
                    placeholder="Type Here"
                    required
                    onChange={(e) => setInputStr(e.target.value)}
                  ></FormControl>
                </Col>
                <Col
                  id="cent"
                  className="mt-2 justify-content-start pt-1 align-items-center col-1 col-sm-1 col-md-1 col-lg-1"
                  style={{
                    backgroundColor: "ffffff",
                    paddingLeft: "0",
                    paddingRight: "1.1em",
                    marginLeft: "0",
                  }}
                >
                  <BsEmojiHeartEyesFill
                    id="grow"
                    style={{ fontSize: "1.5em" }}
                    onClick={() => setShowPicker((val) => !val)}
                  />
                </Col>
                {showPicker && (
                  <Picker
                    pickerStyle={{ width: "100%", alignItems: "center" }}
                    onEmojiClick={onEmojiClick}
                  />
                )}
                {resetBool !== 1 ? (
                  <Button
                    style={{ marginTop: "0.5em" }}
                    variant={isMinted ? "success" : "primary"}
                    size="md"
                    onClick={() => reserve?.()}
                    disabled={isConnected ? 0:1}
                  >
                    {isMinted && (
                      <Row>
                        <span>Registered!!</span>
                        <br></br>
                        <p>
                          View on{" "}
                          <a
                            href={`https://etherscan.io/tx/${reserveData?.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Etherscan
                          </a>
                        </p>
                      </Row>
                    )}
                    {reserveLoading && "Pending..."}
                    {reserveStarted && "Registering..."}
                    {!reserveLoading && !reserveStarted && "Register Only"}
                  </Button>
                ) : (
                  <Button
                    style={{ marginTop: "0.5em" }}
                    variant="danger"
                    size="md"
                    onClick={handleClick}
                    disabled
                  >
                    Register Only
                  </Button>
                )}

                <Button
                  style={{ marginTop: "0.5em" }}
                  variant={"danger"}
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  {userBool == 100
                    ? "Mint To Opensea Only (1 credit)"
                    : "Mint To Opensea Only (single transaction, saves gas)"}
                </Button>
                {resetBool !== 1 ? (
                  <Button
                    style={{ marginTop: "0.5em" }}
                    variant="primary"
                    size="md"
                    onClick={handleClick}
                    disabled={isConnected? 0:1}
                  >
                    {userBool == 100
                      ? "Register & Mint To Opensea (1 credit)"
                      : "Register & Mint To Opensea (single transaction, saves gas)"}
                  </Button>
                ) : (
                  <Button
                    style={{ marginTop: "0.5em" }}
                    variant="danger"
                    size="md"
                    onClick={handleClick}
                    disabled
                  >
                    {userBool == 100
                      ? "Register & Mint To Opensea (1 credit)"
                      : "Register & Mint To Opensea (single transaction, saves gas)"}
                  </Button>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}
        {txError && (
          <Card className="fluid" style={{ width: "20rem" }}>
            <Button
              className="square border border-0"
              id="buttonBg2"
              variant="primary"
              size="md"
              style={{
                height: "250px",
                marginTop: "0.7em",
                fontSize: "1.5em",
                cursor: "default",
              }}
            >
              {inputStr.length == 0 ? defaultTokenName : inputStr}
            </Button>

            <Card.Body>
              <Row>
                <Col id="forcol" style={{ fontSize: "1.4em" }}>
                  <p>Opensea Search</p>
                  <p style={{ fontSize: "0.8em" }}>(1 Credit)</p>
                </Col>
                <Col className="justify-content-end col-3">
                  {userBool == 100 ? (
                    <TokenToggle
                      toggleIsTrue={tokenIdToggle}
                      setToggleIsTrue={() => setTokenIdToggle(!tokenIdToggle)}
                    />
                  ) : (
                    <TokenToggle toggleIsTrue={tokenIdToggle} />
                  )}
                </Col>
              </Row>
              <Card.Title>
                <p style={{ marginTop: 5, color: "black" }}>
                  Status : <span>Error: {txError.message}</span>{" "}
                </p>
              </Card.Title>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}>
                  OpenSea Match :{" "}
                  <span>
                    <Badge bg="dark">Error</Badge>{" "}
                  </span>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black", fontSize: "1.1em" }}>
                  Token ID :{" "}
                  <span>
                    <Badge bg="dark">Error</Badge>{" "}
                  </span>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>
                  Owner :{" "}
                  <span>
                    <Badge bg="dark">Error</Badge>{" "}
                  </span>
                </p>
              </Card.Text>
              <Card.Text>
                <p style={{ marginTop: 5, color: "black" }}>ByteCode : </p>
                <span>{inputBytes}</span>
              </Card.Text>
              <Row>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="primary"
                  size="md"
                  onClick={handleClick}
                >
                  Search
                </Button>

                <Col
                  style={{
                    paddingLeft: "0",
                    paddingRight: "0.8em",
                    marginRight: "0",
                  }}
                  className="mt-2 justify-content-center align-items-center"
                >
                  <FormControl
                    className="m-0"
                    type="string"
                    value={inputStr}
                    style={{ fontSize: "1.1em" }}
                    placeholder="Type Here"
                    required
                    onChange={(e) => setInputStr(e.target.value)}
                  ></FormControl>
                </Col>
                <Col
                  id="cent"
                  className="mt-2 justify-content-start pt-1 align-items-center col-1 col-sm-1 col-md-1 col-lg-1"
                  style={{
                    backgroundColor: "ffffff",
                    paddingLeft: "0",
                    paddingRight: "1.1em",
                    marginLeft: "0",
                  }}
                >
                  <BsEmojiHeartEyesFill
                    id="grow"
                    style={{ fontSize: "1.5em" }}
                    onClick={() => setShowPicker((val) => !val)}
                  />
                </Col>
                {showPicker && (
                  <Picker
                    pickerStyle={{ width: "100%", alignItems: "center" }}
                    onEmojiClick={onEmojiClick}
                  />
                )}

                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={() => reserve?.()}
                  disabled
                >
                  {reserveLoading && "Pending..."}
                  {reserveStarted && "Minting..."}
                  {!reserveLoading && !reserveStarted && "Register Only"}
                </Button>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  {userBool == 100
                    ? "Mint To Opensea Only (1 credit)"
                    : "Mint To Opensea Only (single transaction, saves gas)"}
                </Button>
                <Button
                  style={{ marginTop: "0.5em" }}
                  variant="danger"
                  size="md"
                  onClick={handleClick}
                  disabled
                >
                  {userBool == 100
                    ? "Register & Mint To Opensea (1 credit)"
                    : "Register & Mint To Opensea (single transaction, saves gas)"}
                </Button>
              </Row>
            </Card.Body>
          </Card>
        )}
      </Row>
      <Container className="mt-4">
        <Accordion
          className="py-3 px-2"
          style={{ boxShadow: "none" }}
          defaultActiveKey={["0"]}
          alwaysOpen
        >
          <Accordion.Item eventKey="0">
            <Accordion.Header style={{ color: "green" }}>
              What is DCLC?
            </Accordion.Header>
            <Accordion.Body
              style={{
                backgroundColor: "#000000",
                lineHeight: "1.3em",
                color: "#ffffff",
              }}
            >
              DCLC is a degenerates only private club. Degenerates in the club
              might make money together. Wink!
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              Does degen chimp have any utility?
            </Accordion.Header>
            <Accordion.Body
              style={{
                backgroundColor: "#000000",
                lineHeight: "1.3em",
                color: "#ffffff",
              }}
            >
              A true non-degen question! Do we have to answer? Maybe our smart
              contract might have some hints.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2" alwaysOpen>
            <Accordion.Header style={{ color: "teal" }}>
              When will the degen chimps be revealed?
            </Accordion.Header>
            <Accordion.Body
              style={{
                backgroundColor: "#000000",
                lineHeight: "1.3em",
                color: "#ffffff",
              }}
            >
              Degen chimps will be revealed when 50% of the DC's have been
              minted. Just some extra measure to verify holders are real degens.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3" alwaysOpen>
            <Accordion.Header style={{ color: "teal" }}>
              What happens when all the chimps have been minted?
            </Accordion.Header>
            <Accordion.Body
              style={{
                backgroundColor: "#000000",
                lineHeight: "1.3em",
                color: "#ffffff",
              }}
            >
              We move to phase 2 of the club roadmap.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4" alwaysOpen>
            <Accordion.Header style={{ color: "teal" }}>
              Where can i see the roadmap?
            </Accordion.Header>
            <Accordion.Body
              style={{
                backgroundColor: "#000000",
                lineHeight: "1.3em",
                color: "#ffffff",
              }}
            >
              No you can't see our roadmap, imposter degen! DC holders might get
              a sneak in our discord and telegram.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5" alwaysOpen>
            <Accordion.Header style={{ color: "teal" }}>
              What is random minting?
            </Accordion.Header>
            <Accordion.Body
              style={{
                backgroundColor: "#000000",
                lineHeight: "1.3em",
                color: "#ffffff",
              }}
            >
              Random minting is a technique to mint tokens id in a
              non-predicatable manner. DCLC smart contract uses chainlink VRF to
              generate provably random token id's to prevent selective minting
              and maintain fair distribution of Degen Chimps.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <Row className="pt-3 pb-4 d-flex justify-content-center align-items-center px-2">
          <Col>
            <p style={{ color: "#ffffff" }}>© 2022 DCLC</p>
          </Col>
          <Col className="d-flex justify-content-end">
            <span style={{ color: "#ffffff" }} className="px-2">
              <BsTwitter id="links" style={{ fontSize: "1.5em" }} />
            </span>
            <span style={{ color: "#ffffff" }} className="px-2">
              <FaTelegramPlane id="links" style={{ fontSize: "1.5em" }} />
            </span>
            <span style={{ color: "#ffffff" }} className="px-2">
              <FaDiscord id="links" style={{ fontSize: "1.5em" }} />
            </span>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
