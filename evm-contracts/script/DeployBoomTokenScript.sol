// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "forge-std/Script.sol";
import "@boom/contracts/Forwarder.sol";
import "@boom/contracts/tokens/TokenERC20.sol";
import {BaseDeploy}  "./utils/BaseScript.sol";

contract DeployBoomTokenScript is BaseDeploy {
    function setUp() public {}

    function run() public {
        vm.broadcast();
        _deployTokenERC20();
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
}
