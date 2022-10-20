// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "forge-std/Script.sol";
import "@boom/contracts/Forwarder.sol";
import "@boom/contracts/tokens/BoomERC721.sol";
import "@boom/contracts/tokens/TokenERC20.sol";
import {BoomFactory} from "@boom/contracts/BoomFactory.sol";

contract DeployBoomFactoryScript is Script {
    string public constant NAME = "BOOM TOKEN";
    string public constant SYMBOL = "BTN";
    string public constant CONTRACT_URI = "URL";
    string public constant uri =
        "ipfs://QmWtWLf7Z9K5V7ZNC7vpkpXVezWXvhFnCfTVNYpdKjDxo";
    uint128 public royaltyBps = 500; // 5%
    uint128 public platformFeeBps = 500; // 5%
    uint256 public constant MAX_BPS = 10_000; // 100%
    Forwarder public forwarder;
    BoomFactory public factory;
    address public NATIVE_TOKEN = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
    address public defaultAdmin = address(0x10000);
    address public deployer = address(0x40000);
    address public saleRecipient = address(0x30000);
    address public royaltyRecipient = address(0x30001);
    address public platformFeeRecipient = address(0x30002);

    function setUp() public {}

    function run() public {
        vm.broadcast();
        forwarder = _deployForwarder();
        factory = _deployBoomFactory();
        factory.deployBoom721Token(NAME, SYMBOL);
        factory.deployBoomERC20Token(NAME, SYMBOL);
        factory.deployMarketplace();
        vm.stopBroadcast();
    }

    function _mintTokenERC721To(address recipient, string memory url)
        internal
        returns (uint256 _tokenId)
    {
        vm.startPrank(defaultAdmin);
        _tokenId = factory.boomER721Token().mintTo(recipient, url);
        vm.stopPrank();
    }

    function _deployBoomFactory() internal returns (BoomFactory _factory) {
        _factory = new BoomFactory();
        _factory.initialize(
            defaultAdmin,
            CONTRACT_URI,
            forwarders(),
            saleRecipient,
            royaltyRecipient,
            royaltyBps,
            platformFeeBps,
            platformFeeRecipient,
            NATIVE_TOKEN
        );
    }

    function _deployForwarder() internal returns (Forwarder _forwarder) {
        _forwarder = new Forwarder();
    }

    function getActor(uint160 _index) public pure returns (address) {
        return address(uint160(0x50000 + _index));
    }

    function forwarders() public view returns (address[] memory _forwarders) {
        _forwarders = new address[](1);
        _forwarders[0] = address(forwarder);
    }
}
