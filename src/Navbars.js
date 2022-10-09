import 'bootstrap/dist/css/bootstrap.css'
import { Container, Nav, Navbar, Image, Row, Col } from 'react-bootstrap'
import logo from "./LOGO.png"
import { Link } from "react-router-dom";
import './Navbars.css';
import { BsTwitter } from "react-icons/bs";
import { FaTelegramPlane } from "react-icons/fa";
import { FaDiscord } from "react-icons/fa";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function Navbars() {
    return (
      <div className="center">
        <Navbar className="Navbar" variant="dark border-0"
          sticky="top" expand="lg" collapseOnSelect>
            <Container>
          <Navbar.Brand>
            <Link to="/">
              {/* <h3>LinageeTools</h3> */}
            <Image  src={logo} width="auto" height="60em"/>{' '}
            </Link>
          </Navbar.Brand><Row className="mt-2 mt-sm-2">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ConnectButton />
            </div>
          </Row>
          </Container>
        </Navbar>
      </div>
    );
  }
  
  export default Navbars;