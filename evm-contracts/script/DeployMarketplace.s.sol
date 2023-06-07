// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "forge-std/console.sol";
import "forge-std/Script.sol";
import "@boom/contracts/Forwarder.sol";
import "@boom/contracts/tokens/BoomERC721.sol";
import "@boom/contracts/tokens/TokenERC20.sol";
import {BaseDeploy} from "./BaseDeploy.sol";
import {Marketplace} from "@boom/contracts/marketplace/Marketplace.sol";

contract DeployScript is BaseDeploy {
    function setUp() public override {}

    function run() public {
        vm.broadcast();
        console.log("================ MARKETPLACE =====================");
        _deployMarketPlace();
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
}
