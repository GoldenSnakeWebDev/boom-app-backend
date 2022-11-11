// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "forge-std/console.sol";
import "forge-std/Script.sol";
import "@boom/contracts/Forwarder.sol";
import "@boom/contracts/tokens/BoomERC721.sol";
import "@boom/contracts/tokens/TokenERC20.sol";
import {BoomFactory} from "@boom/contracts/BoomFactory.sol";
import {Marketplace} from "@boom/contracts/marketplace/Marketplace.sol";

contract BaseDeploy is Script {
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

    function setUp() public {
        forwarder = deployForwarder();
    }

    function deployForwarder() internal returns (Forwarder _forwarder) {
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

// Deploy all the other smart contract
contract DeployScript is BaseDeploy {
    // function setUp() public override {
    //     vm.setUp();
    // }

    function run() public {
        vm.broadcast();
        console.log("TOKEN");
        _deployTokenERC20();
        vm.stopBroadcast();

        vm.broadcast();
        console.log("NFT TOKEN");
        _deployBoomERC721();
        vm.stopBroadcast();

        vm.broadcast();
        console.log("Marketplace");
        _deployMarketPlace();
        vm.stopBroadcast();
    }

    function _deployTokenERC20() internal returns (TokenERC20 _token) {
        _token = new TokenERC20();
        _token.initialize(
            defaultAdmin,
            NAME,
            SYMBOL,
            CONTRACT_URI,
            forwarders(),
            saleRecipient,
            platformFeeRecipient,
            platformFeeBps
        );
    }

    function _deployMarketPlace() internal returns (Marketplace _marketplace) {
        _marketplace = new Marketplace();
        _marketplace.initialize(
            defaultAdmin,
            CONTRACT_URI,
            forwarders(),
            platformFeeRecipient,
            platformFeeBps,
            NATIVE_TOKEN
        );
    }

    function _deployBoomERC721() internal returns (BoomERC721 _token) {
        _token = new BoomERC721();
        _token.initialize(
            defaultAdmin,
            NAME,
            SYMBOL,
            CONTRACT_URI,
            forwarders(),
            saleRecipient,
            royaltyRecipient,
            royaltyBps,
            platformFeeBps,
            platformFeeRecipient
        );
    }
}
