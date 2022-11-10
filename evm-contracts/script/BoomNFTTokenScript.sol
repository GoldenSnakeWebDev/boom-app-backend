// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "forge-std/Script.sol";
import "@boom/contracts/Forwarder.sol";
import "@boom/contracts/tokens/BoomERC721.sol";
import {BaseDeploy}  "./utils/BaseScript.sol";

contract BoomNFTTokenScript is BaseDeploy {
    function setUp() public override  {
        vm.setUp();
    }

    function run() public {
        vm.broadcast();
        _deployBoomERC721();
        vm.stopBroadcast();
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
