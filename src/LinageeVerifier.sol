// SPDX-License-Identifier: MIT

// File: @openzeppelin/contracts/security/ReentrancyGuard.sol
// OpenZeppelin Contracts v4.4.1 (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        // On the first call to nonReentrant, _notEntered will be true
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;

        _;

        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}

// File: @openzeppelin/contracts/utils/Context.sol
// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: @openzeppelin/contracts/access/Ownable.sol


// OpenZeppelin Contracts (last updated v4.7.0) (access/Ownable.sol)

pragma solidity ^0.8.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// File: contracts/LinageeVerifier.sol

pragma solidity ^0.8.0;

interface ILNR {
   function owner(bytes32 _name) external view returns(address);
   function transfer(bytes32 _name, address _to) external;
   function reserve(bytes32 _name) external;
}

interface IERLW {
  function nameToId(bytes32) view external returns (uint256);
  function createWrapper(bytes32 _name) external;
  function wrap(bytes32 _name) external;
  function safeTransferFrom(address from, address to, uint256 tokenId) external;
}

contract LNR_Verifier is ReentrancyGuard , Ownable{

    address public lnrAddress = 0x5564886ca2C518d1964E5FCea4f423b41Db9F561;
    address public erlwAddress = 0x2Cc8342d7c8BFf5A213eb2cdE39DE9a59b3461A7;
    uint256 smallFee = 0.0005 ether; // only applies for register & minting if you don't have a credit balance. 
    uint256 public fiftyCredits = 0.02 ether; // get 50 credits for 0.02 eth donation
    uint256 public hundredCredits = 0.04 ether; // get 100 credits for 0.04 eth donation
    uint256 public threeHundredCredits = 0.1 ether; // get 300 credits for 0.1 eth donation

    mapping(address => uint256) public availableCredits;

    constructor() payable Ownable(){
    }

    function deposit() public payable { //adds credit values to your account based on the donation amount
        if (msg.value == fiftyCredits) {
            availableCredits[msg.sender] += 50; 
        }
        if (msg.value == hundredCredits) {
            availableCredits[msg.sender] += 100; 
        }
        if (msg.value == threeHundredCredits) {
            availableCredits[msg.sender] += 300; 
        }
    }

    function wrapLNR(bytes32 _name) public nonReentrant payable{ //wraps already registered name in single transaction instead of 3 to save gas for 0.0005 small fee.
      require(msg.value == smallFee);
      IERLW(erlwAddress).createWrapper(_name);
      ILNR(lnrAddress).transfer(_name, erlwAddress);
      IERLW(erlwAddress).wrap(_name);
      IERLW(erlwAddress).safeTransferFrom(address(this), msg.sender, IERLW(erlwAddress).nameToId(_name));
    }

    function wrapLNRWCredit(bytes32 _name, uint256 _creditsUsed) public nonReentrant payable{  //wraps already registered name in single transaction instead of 3 to save gas for 1 credit.
      require(_creditsUsed > 0 && availableCredits[msg.sender] > 0);
      availableCredits[msg.sender] = availableCredits[msg.sender] - _creditsUsed;
      IERLW(erlwAddress).createWrapper(_name);
      ILNR(lnrAddress).transfer(_name, erlwAddress);
      IERLW(erlwAddress).wrap(_name);
      IERLW(erlwAddress).safeTransferFrom(address(this), msg.sender, IERLW(erlwAddress).nameToId(_name));
    }

    function registerAndWrapLNR(bytes32 _name) public nonReentrant payable{ //Registers & wraps new name in single transaction instead of 4 to save gas for 0.0005 small fee.
      require(msg.value == smallFee);
      ILNR(lnrAddress).reserve(_name);
      IERLW(erlwAddress).createWrapper(_name);
      ILNR(lnrAddress).transfer(_name, erlwAddress);
      IERLW(erlwAddress).wrap(_name);
      IERLW(erlwAddress).safeTransferFrom(address(this), msg.sender, IERLW(erlwAddress).nameToId(_name));
    }

    function registerAndWrapLNRWCredit(bytes32 _name, uint256 _creditsUsed) public nonReentrant payable{//Registers & wraps new name in single transaction instead of 4 to save gas for 1 credit.
      require(_creditsUsed > 0 && availableCredits[msg.sender] > 0);
      availableCredits[msg.sender] = availableCredits[msg.sender] - _creditsUsed;
      ILNR(lnrAddress).reserve(_name);
      IERLW(erlwAddress).createWrapper(_name);
      ILNR(lnrAddress).transfer(_name, erlwAddress);
      IERLW(erlwAddress).wrap(_name);
      IERLW(erlwAddress).safeTransferFrom(address(this), msg.sender, IERLW(erlwAddress).nameToId(_name));
    }

    function withdraw() public payable onlyOwner { // allows me to withdraw donations received to this contract
    (bool success, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(success);
  }
}