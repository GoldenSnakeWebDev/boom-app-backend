// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

// Interface
import {ITokenERC721} from "../interfaces/ITokenERC721.sol";

// Token
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
// Signature utils
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";

// Access Control + security
import "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

// Meta transactions
import "../openzeppelin/metatx/ERC2771ContextUpgradeable.sol";

// Utils
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/MulticallUpgradeable.sol";

// Helper interfaces
import "@openzeppelin/contracts-upgradeable/interfaces/IERC2981Upgradeable.sol";
import {Currency} from "../libraries/Currency.sol";
import {IContract} from "../interfaces/IContract.sol";
import {IOwnable} from "../interfaces/IOwnable.sol";
import {IPrimarySale} from "../interfaces/IPrimarySale.sol";
import {IPlatformFee} from "../interfaces/IPlatformFee.sol";

contract BoomERC721 is
    Initializable,
    IContract,
    IOwnable,
    IPrimarySale,
    IPlatformFee,
    ITokenERC721,
    ReentrancyGuardUpgradeable,
    EIP712Upgradeable,
    ERC2771ContextUpgradeable,
    MulticallUpgradeable,
    AccessControlEnumerableUpgradeable,
    ERC721EnumerableUpgradeable
{
    using ECDSAUpgradeable for bytes32;
    using StringsUpgradeable for uint256;

    bytes32 private constant MODULE_TYPE = bytes32("BoomERC721");
    uint256 private constant VERSION = 1;

    bytes32 private constant TYPEHASH =
        keccak256(
            "MintRequest(address to,address royaltyRecipient,uint256 royaltyBps,address primarySaleRecipient,string uri,uint256 price,address currency,uint128 validityStartTimestamp,uint128 validityEndTimestamp,bytes32 uid)"
        );
    /// @dev Only MINTER_ROLE holders can sign off on `MintRequest`s.
    bytes32 private constant MINTER_ROLE = keccak256("MINTER_ROLE");

    /// @dev Max bps  potara system
    uint256 private constant MAX_BPS = 10_000;

    /// @dev The address interpreted as native token of the chain.
    address private constant NATIVE_TOKEN =
        0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /// @dev Owner of the contract (purpose: OpenSea compatibility, etc.)
    address private _owner;

    /// @dev The token ID of the next token to mint.
    uint256 public nextTokenIdToMint;

    /// @dev The adress that receives all primary sales value.
    address public primarySaleRecipient;

    /// @dev The adress that receives all primary sales value.
    address public platformFeeRecipient;

    /// @dev The % of primary sales collected by the contract as fees.
    uint128 public platformFeeBps;

    /// @dev Contract level metadata.
    string public contractURI;

    /// @dev Mapping from mint request UID => whether the mint request is processed.
    mapping(bytes32 => bool) private minted;

    /// @dev Mapping from tokenId => URI
    mapping(uint256 => string) private uri;

    /// @dev Initiliazes the contract, like a constructor.
    function initialize(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol,
        string memory _contractURI,
        address[] memory _trustedForwarders,
        address _saleRecipient,
        uint128 _platformFeeBps,
        address _platformFeeRecipient
    ) external initializer {
        // Initialize inherited contracts, most base-like -> most derived.
        __ReentrancyGuard_init();
        __EIP712_init("TokenERC721", "1");
        __ERC2771Context_init(_trustedForwarders);
        __ERC721_init(_name, _symbol);

        // Initialize this contract's state
        platformFeeRecipient = _platformFeeRecipient;
        primarySaleRecipient = _saleRecipient;
        contractURI = _contractURI;
        platformFeeBps = _platformFeeBps;

        _owner = _defaultAdmin;
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);
        _setupRole(MINTER_ROLE, _defaultAdmin);
        // _setupRole(TRANSFER_ROLE, address(0));
    }

    ///     =====   Public functions  =====

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

    /// @dev Verifies that a mint request is signed by an account holding MINTER_ROLE (at the time of the function call).
    function verify(
        MintRequest calldata _req,
        bytes calldata _signature
    ) public view returns (bool, address) {
        address signer = recoverAddress(_req, _signature);
        return (!minted[_req.uid] && hasRole(MINTER_ROLE, signer), signer);
    }

    /// @dev Returns the URI for a tokenId
    function tokenURI(
        uint256 _tokenId
    ) public view override returns (string memory) {
        return uri[_tokenId];
    }

    /// @dev Lets an account with MINTER_ROLE mint an NFT.
    function mintTo(
        address _to,
        string calldata _uri
    )
        external
        returns (
            // onlyRole(MINTER_ROLE)
            uint256
        )
    {
        // `_mintTo` is re-used. `mintTo` just adds a minter role check.
        return _mintTo(_to, _uri);
    }

    /// @dev Mints an NFT according to the provided mint request.
    function mintWithSignature(
        MintRequest calldata _req,
        bytes calldata _signature
    ) external payable nonReentrant returns (uint256 tokenIdMinted) {
        address signer = verifyRequest(_req, _signature);
        address receiver = _req.to == address(0) ? _msgSender() : _req.to;

        tokenIdMinted = _mintTo(receiver, _req.uri);

        collectPrice(_req);

        emit TokensMintedWithSignature(signer, receiver, tokenIdMinted, _req);
    }

    //      =====   Setter functions  =====

    /// @dev Lets a module admin set the default recipient of all primary sales.
    function setPrimarySaleRecipient(
        address _saleRecipient
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        primarySaleRecipient = _saleRecipient;
        emit PrimarySaleRecipientUpdated(_saleRecipient);
    }

    /// @dev Lets a module admin update the fees on primary sales.
    function setPlatformFeeInfo(
        address _platformFeeRecipient,
        uint256 _platformFeeBps
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_platformFeeBps <= MAX_BPS, "bps <= 10000.");

        platformFeeBps = uint64(_platformFeeBps);
        platformFeeRecipient = _platformFeeRecipient;

        emit PlatformFeeInfoUpdated(_platformFeeRecipient, _platformFeeBps);
    }

    /// @dev Lets a module admin set a new owner for the contract. The new owner must be a module admin.
    function setOwner(address _newOwner) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _newOwner),
            "new owner not module admin."
        );
        address _prevOwner = _owner;
        _owner = _newOwner;

        emit OwnerUpdated(_prevOwner, _newOwner);
    }

    /// @dev Lets a module admin set the URI for contract-level metadata.
    function setContractURI(
        string calldata _uri
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        contractURI = _uri;
    }

    ///     =====   Getter functions    =====

    /// @dev Returns the platform fee bps and recipient.
    function getPlatformFeeInfo() external view returns (address, uint16) {
        return (platformFeeRecipient, uint16(platformFeeBps));
    }

    ///     =====   Internal functions  =====

    /// @dev Mints an NFT to `to`
    function _mintTo(
        address _to,
        string calldata _uri
    ) internal returns (uint256 tokenIdToMint) {
        // Increment new token ID
        nextTokenIdToMint += 1;
        tokenIdToMint = nextTokenIdToMint;
        uri[tokenIdToMint] = _uri;
        // MINT token
        _mint(_to, tokenIdToMint);
        // set new tokenId globally
        // nextTokenIdToMint = tokenIdToMint;

        emit TokensMinted(_to, tokenIdToMint, _uri);
    }

    /// @dev Returns the address of the signer of the mint request.
    function recoverAddress(
        MintRequest calldata _req,
        bytes calldata _signature
    ) private view returns (address) {
        return
            _hashTypedDataV4(keccak256(_encodeRequest(_req))).recover(
                _signature
            );
    }

    /// @dev Resolves 'stack too deep' error in `recoverAddress`.
    function _encodeRequest(
        MintRequest calldata _req
    ) private pure returns (bytes memory) {
        return
            abi.encode(
                TYPEHASH,
                _req.to,
                _req.royaltyRecipient,
                _req.royaltyBps,
                _req.primarySaleRecipient,
                keccak256(bytes(_req.uri)),
                _req.price,
                _req.currency,
                _req.validityStartTimestamp,
                _req.validityEndTimestamp,
                _req.uid
            );
    }

    /// @dev Verifies that a mint request is valid.
    function verifyRequest(
        MintRequest calldata _req,
        bytes calldata _signature
    ) internal returns (address) {
        (bool success, address signer) = verify(_req, _signature);
        require(success, "invalid signature");

        require(
            _req.validityStartTimestamp <= block.timestamp &&
                _req.validityEndTimestamp >= block.timestamp,
            "request expired"
        );

        minted[_req.uid] = true;

        return signer;
    }

    /// @dev Collects and distributes the primary sale value of tokens being claimed.
    function collectPrice(MintRequest memory _req) internal {
        if (_req.price == 0) {
            return;
        }

        uint256 totalPrice = _req.price;
        uint256 platformFees = (totalPrice * platformFeeBps) / MAX_BPS;

        if (_req.currency == NATIVE_TOKEN) {
            require(msg.value == totalPrice, "must send total price.");
        }

        address saleRecipient = _req.primarySaleRecipient == address(0)
            ? primarySaleRecipient
            : _req.primarySaleRecipient;

        Currency.transferCurrency(
            _req.currency,
            _msgSender(),
            platformFeeRecipient,
            platformFees
        );
        Currency.transferCurrency(
            _req.currency,
            _msgSender(),
            saleRecipient,
            totalPrice - platformFees
        );
    }

    ///     =====   Low-level overrides  =====

    /// @dev Burns `tokenId`. See {ERC721-_burn}.
    function burn(uint256 tokenId) public virtual {
        //solhint-disable-next-line max-line-length
        require(
            _isApprovedOrOwner(_msgSender(), tokenId),
            "ERC721Burnable: caller is not owner nor approved"
        );
        _burn(tokenId);
    }

    /// @dev See {ERC721-_beforeTokenTransfer}.
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            AccessControlEnumerableUpgradeable,
            ERC721EnumerableUpgradeable,
            IERC165Upgradeable
        )
        returns (bool)
    {
        return
            super.supportsInterface(interfaceId) ||
            interfaceId == type(IERC2981Upgradeable).interfaceId;
    }

    function _msgSender()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (address sender)
    {
        return ERC2771ContextUpgradeable._msgSender();
    }

    function _msgData()
        internal
        view
        virtual
        override(ContextUpgradeable, ERC2771ContextUpgradeable)
        returns (bytes calldata)
    {
        return ERC2771ContextUpgradeable._msgData();
    }
}
