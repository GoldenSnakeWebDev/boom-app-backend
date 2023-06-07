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
    address public defaultAdmin = vm.envAddress("DEFAULT_ADMIN");
    address public deployer = vm.envAddress("DEPLOYER");
    address public saleRecipient = vm.envAddress("SALE_RECIPIENT");
    address public royaltyRecipient = vm.envAddress("ROYALTY_RECIPIENT");
    address public platformFeeRecipient =
        vm.envAddress("PLATFORM_FEE_RECIPIENT");

    function setUp() public virtual {
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
