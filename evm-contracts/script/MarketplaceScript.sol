// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "forge-std/Script.sol";
import "@boom/contracts/Forwarder.sol";
import "@boom/contracts/tokens/TokenERC20.sol";
import {BaseDeploy}  "./utils/BaseScript.sol";
import "@boom/contracts/marketplace/Marketplace.sol";

contract MarketplaceScript is BaseDeploy {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        _deployMarketPlace();
        vm.stopBroadcast();
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
