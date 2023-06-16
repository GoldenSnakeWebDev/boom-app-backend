// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";

import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/MulticallUpgradeable.sol";
import {BoomERC721} from "./tokens/BoomERC721.sol";
import {TokenERC20} from "./tokens/TokenERC20.sol";
import {Marketplace} from "./marketplace/Marketplace.sol";

// INTERNAL IMPORTS
import "./openzeppelin/metatx/ERC2771ContextUpgradeable.sol";

contract BoomFactory is
    Initializable,
    ReentrancyGuardUpgradeable,
    MulticallUpgradeable,
    AccessControlEnumerableUpgradeable
{
    bytes32 private constant MODULE_TYPE = bytes32("BoomFactory");
    uint256 private constant VERSION = 1;
    /// @dev Only lister role holders can create listings, when listings are restricted by lister address.
    bytes32 private constant DEPLOYER_ROLE = keccak256("DEPLOYER_ROLE");
    /// @dev The adress that receives all primary sales value.
    address public primarySaleRecipient;
    address public NATIVE_TOKEN;
    string public CONTRACT_URL;

    /// @dev The adress that receives all primary sales value.
    address public platformFeeRecipient;
    address[] public trustedForwarders;
    address private defaultAdmin;
    address private _owner;

    /// @dev The recipient of who gets the royalty.
    address private royaltyRecipient;

    /// @dev The percentage of royalty how much royalty in basis points.
    uint128 private royaltyBps;

    /// @dev The % of primary sales collected by the contract as fees.
    uint128 public platformFeeBps;

    /// @dev Contract level metadata.
    string public contractURI;

    /// @dev The storage for address
    Marketplace public marketplace;
    BoomERC721 public boomER721Token;
    TokenERC20 public boomERC20Token;

    /// @dev Initiliazes the contract, like a constructor.
    function initialize(
        address _defaultAdmin,
        string memory _contractURI,
        address[] memory _trustedForwarders,
        address _saleRecipient,
        address _royaltyRecipient,
        uint128 _royaltyBps,
        uint128 _platformFeeBps,
        address _platformFeeRecipient,
        address _nativeTokenWrapper
    ) external initializer {
        // Initialize inherited contracts, most base-like -> most derived.
        __ReentrancyGuard_init();
        // Initialize this contract's state.
        royaltyRecipient = _royaltyRecipient;
        royaltyBps = _royaltyBps;
        platformFeeRecipient = _platformFeeRecipient;
        primarySaleRecipient = _saleRecipient;
        trustedForwarders = _trustedForwarders;
        CONTRACT_URL = _contractURI;
        platformFeeBps = uint64(_platformFeeBps);
        _owner = _defaultAdmin;

        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        defaultAdmin = _defaultAdmin;
        // native wrapped token
        NATIVE_TOKEN = _nativeTokenWrapper;
    }

    /// @dev Returns the module type of the contract.
    function contractType() external pure returns (bytes32) {
        return MODULE_TYPE;
    }

    /// @dev Returns the version of the contract.
    function contractVersion() external pure returns (uint8) {
        return uint8(VERSION);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view returns (address) {
        return hasRole(DEFAULT_ADMIN_ROLE, _owner) ? _owner : address(0);
    }

    function deployBoom721Token(
        string memory _name,
        string memory _symbol
    ) external returns (BoomERC721 _token) {
        _token = new BoomERC721();
        _token.initialize(
            defaultAdmin,
            _name,
            _symbol,
            CONTRACT_URL,
            trustedForwarders,
            primarySaleRecipient,
            platformFeeBps,
            platformFeeRecipient
        );
        boomER721Token = _token;
    }

    function deployBoomERC20Token(
        string memory _name,
        string memory _symbol
    ) external returns (TokenERC20 _token) {
        _token = new TokenERC20();
        _token.initialize(
            defaultAdmin,
            _name,
            _symbol,
            CONTRACT_URL,
            trustedForwarders,
            primarySaleRecipient,
            platformFeeRecipient,
            platformFeeBps
        );
        boomERC20Token = _token;
    }

    function deployMarketplace() external returns (Marketplace _marketplace) {
        _marketplace = new Marketplace();
        _marketplace.initialize(
            defaultAdmin,
            CONTRACT_URL,
            trustedForwarders,
            platformFeeRecipient,
            platformFeeBps,
            NATIVE_TOKEN
        );
        marketplace = _marketplace;
    }

    /// @dev Lets a contract admin set the URI for the contract-level metadata.
    function setContractURI(
        string calldata _uri
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contractURI = _uri;
    }
}
