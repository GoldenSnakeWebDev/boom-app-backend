// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "forge-std/console.sol";
import "forge-std/Script.sol";
import "@boom/contracts/Forwarder.sol";
import "@boom/contracts/tokens/BoomERC721.sol";
import "@boom/contracts/tokens/TokenERC20.sol";
import {BaseDeploy} from "./BaseDeploy.sol";

contract DeployScript is BaseDeploy {
    function setUp() public override {}

    function run() public {
        vm.broadcast();
        console.log(
            "===================== ERC 721 Token ====================="
        );
        _deployBoomERC721();
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
            platformFeeBps,
            platformFeeRecipient
        );
    }
}
