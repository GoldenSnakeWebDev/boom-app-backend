// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "@boom/test/utils/BoomFactory.t.sol";
import "@boom/contracts/tokens/BoomERC721.sol";

contract NFTTest is BoomFactoryTest {
    BoomERC721 public boomERC721;

    function setUp() public override {
        super.setUp();
        boomERC721 = factory.boomER721Token();
    }

    // function testContractType() public {
    //     assertEq(boomERC721.contractType(), bytes32("BoomERC721"));
    // }

    function testContractVersion() public {
        assertEq(boomERC721.contractVersion(), 1);
    }

    function testFailSetContractURL(string calldata uri) public {
        boomERC721.setContractURI(uri);
    }

    function testFailOnZeroAddress() public {
        _mintTokenERC721To(address(0), "some");
    }

    // function testMintTo() public {
    //     address recipient = getActor(0);

    //     assertBalERC20Eq(address(boomERC721), recipient, 0);

    //     vm.startPrank(defaultAdmin);
    //     boomERC721.mintTo(recipient, "");
    //     vm.stopPrank();

    //     assertBalERC20Eq(address(boomERC721), recipient, 1);
    // }

    // function testSetPlatformFeeInfo(address platformFeeRecipient) public {
    //     uint256 platformFeeBps = 100;
    //     vm.expectRevert(
    //         "AccessControl: account 0xb4c79dab8f259c7aee6e5b2aa729821864227e84 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
    //     );
    //     boomERC721.setPlatformFeeInfo(platformFeeRecipient, platformFeeBps);

    //     vm.startPrank(defaultAdmin);
    //     boomERC721.setPlatformFeeInfo(platformFeeRecipient, platformFeeBps);
    //     vm.stopPrank();

    //     (address _platformFeeRecipient, uint16 _platformFeeBPS) = boomERC721
    //         .getPlatformFeeInfo();

    //     assertEq(_platformFeeRecipient, platformFeeRecipient);
    //     assertEq(_platformFeeBPS, platformFeeBps);
    // }

    // function testSetPrimarySaleRecipient(address primarySaleRecipient) public {
    //     vm.expectRevert(
    //         "AccessControl: account 0xb4c79dab8f259c7aee6e5b2aa729821864227e84 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
    //     );
    //     boomERC721.setPrimarySaleRecipient(primarySaleRecipient);

    //     vm.startPrank(defaultAdmin);
    //     boomERC721.setPrimarySaleRecipient(primarySaleRecipient);
    //     vm.stopPrank();

    //     assertEq(boomERC721.primarySaleRecipient(), primarySaleRecipient);
    // }

    // function testSetDefaultRoyaltyInfor(address royaltyRecipient) public {
    //     uint16 royaltyBps = uint16(100);
    //     vm.expectRevert(
    //         "AccessControl: account 0xb4c79dab8f259c7aee6e5b2aa729821864227e84 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
    //     );
    //     boomERC721.setDefaultRoyaltyInfo(royaltyRecipient, royaltyBps);

    //     vm.startPrank(defaultAdmin);
    //     boomERC721.setDefaultRoyaltyInfo(royaltyRecipient, royaltyBps);
    //     vm.stopPrank();

    //     (address _royaltyRecipient, uint16 _royaltyBps) = boomERC721
    //         .getDefaultRoyaltyInfo();

    //     assertEq(_royaltyRecipient, royaltyRecipient);
    //     assertEq(_royaltyBps, royaltyBps);
    // }

    // function testSetContractURI(string calldata uri) public {
    //     vm.expectRevert(
    //         "AccessControl: account 0xb4c79dab8f259c7aee6e5b2aa729821864227e84 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
    //     );
    //     boomERC721.setContractURI(uri);

    //     vm.startPrank(defaultAdmin);
    //     boomERC721.setContractURI(uri);
    //     vm.stopPrank();

    //     assertEq(boomERC721.contractURI(), uri);
    // }
}
