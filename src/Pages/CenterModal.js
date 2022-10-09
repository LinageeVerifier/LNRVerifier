import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { Row } from "react-bootstrap";

export default function MyVerticallyCenteredModal(props) {
    const handleTSubmit = (e) => {
        e.preventDefault();
        props.transferChimp(sendTo);
      };
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Donate to LinageeVerifier
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4 style={{ lineHeight: "1.2em" }}>
          Choose Your Donation Amount :
          {/* Click "Donate" to make a<span style={{color:"#0d6efd"}}> one-time donation</span> of 0.015 ETH to
          LinageeVerifier. As a thank you for your donation, you will receive
          <span style={{color:"#0d6efd"}}> 50 FREE credits</span> that can be used for OpenSea Match Checks
          & Zero Fee Gas Saving Single Transactions. */}
        </h4>
        <br></br>
        <Row>
        <Button className="mb-2" variant="warning">
          Donate 0.02 ETH - Claim 50 FREE Credits
        </Button>
        </Row>
        <Row>
        <Button className="mb-2" variant="warning">
          Donate 0.04 ETH - Claim 100 FREE Credits
        </Button>
        </Row>
        <Row>
        <Button className="mb-3" variant="warning">
          Donate 0.1 ETH - Claim 300 FREE Credits
        </Button>
        </Row>
        <br></br>
        <p>
          "Upon choosing your donation amount, you will get a metamask pop-up for a one-time
          donation of your selected amount + gas. Hit confirm & wait for transaction
          confirmation."
        </p>
        <br></br>
        <p>
          (FREE credits will be reflected upon transaction confirmation.)
        </p>
      </Modal.Body>
      
    </Modal>
  );
}
