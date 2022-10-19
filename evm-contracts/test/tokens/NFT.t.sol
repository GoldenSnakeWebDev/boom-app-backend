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

    // Test Contract Type --name to be Vault;
    function testContractType() public {
        assertEq(boomERC721.contractType(), bytes32("BoomERC721"));
    }

    // Test Contract Version
    function testContractVersion() public {
        assertEq(boomERC721.contractVersion(), 1);
    }

    // Test Set contract On Fail
    function testFailSetContractURL(string calldata uri) public {
        boomERC721.setContractURI(uri);
    }

    // Fail to mint with Zero Address
    function testFailOnZeroAddress() public {
        _mintTokenERC721To(address(0), "some");
    }

    function testMintTo() public {
        address recipient = getActor(0);

        // ensure recipient has no tokens
        assertBalERC20Eq(address(boomERC721), recipient, 0);

        // admin mint tokens to recipient
        vm.startPrank(defaultAdmin);
        boomERC721.mintTo(recipient, "");
        vm.stopPrank();

        // ensure recipient has tokens
        assertBalERC20Eq(address(boomERC721), recipient, 1);
    }

    // TODO: 1 Test mint with signature

    // TODO: 2 Test mint with signature with price > 0 and ensure that saleRecipient receives the payout value

    // NOTE: TODO 1 and TODO 2 can be done with the same test.

    // Test that platform fee can be set and it's only done by user with defaultAdmin role
    function testSetPlatformFeeInfo(address platformFeeRecipient) public {
        uint256 platformFeeBps = 100;
        // test that only admin can set platform fee
        vm.expectRevert(
            "AccessControl: account 0xb4c79dab8f259c7aee6e5b2aa729821864227e84 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        boomERC721.setPlatformFeeInfo(platformFeeRecipient, platformFeeBps);

        vm.startPrank(defaultAdmin);
        boomERC721.setPlatformFeeInfo(platformFeeRecipient, platformFeeBps);
        vm.stopPrank();

        (address _platformFeeRecipient, uint16 _platformFeeBPS) = boomERC721
            .getPlatformFeeInfo();

        assertEq(_platformFeeRecipient, platformFeeRecipient);
        assertEq(_platformFeeBPS, platformFeeBps);
    }

    // test that only admin can set primary sale recipient
    function testSetPrimarySaleRecipient(address primarySaleRecipient) public {
        vm.expectRevert(
            "AccessControl: account 0xb4c79dab8f259c7aee6e5b2aa729821864227e84 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        boomERC721.setPrimarySaleRecipient(primarySaleRecipient);

        vm.startPrank(defaultAdmin);
        boomERC721.setPrimarySaleRecipient(primarySaleRecipient);
        vm.stopPrank();

        assertEq(boomERC721.primarySaleRecipient(), primarySaleRecipient);
    }

    // test that only admin can set default royalty info
    function testSetDefaultRoyaltyInfor(address royaltyRecipient) public {
        uint16 royaltyBps = uint16(100);
        vm.expectRevert(
            "AccessControl: account 0xb4c79dab8f259c7aee6e5b2aa729821864227e84 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        boomERC721.setDefaultRoyaltyInfo(royaltyRecipient, royaltyBps);

        vm.startPrank(defaultAdmin);
        boomERC721.setDefaultRoyaltyInfo(royaltyRecipient, royaltyBps);
        vm.stopPrank();

        (address _royaltyRecipient, uint16 _royaltyBps) = boomERC721
            .getDefaultRoyaltyInfo();

        assertEq(_royaltyRecipient, royaltyRecipient);
        assertEq(_royaltyBps, royaltyBps);
    }

    // TODO: 4 Test contract pause/unpause and ensure that it works

    /// Test that admin can set contract URI
    function testSetContractURI(string calldata uri) public {
        // test that only admin can set contract URI
        vm.expectRevert(
            "AccessControl: account 0xb4c79dab8f259c7aee6e5b2aa729821864227e84 is missing role 0x0000000000000000000000000000000000000000000000000000000000000000"
        );
        boomERC721.setContractURI(uri);

        vm.startPrank(defaultAdmin);
        boomERC721.setContractURI(uri);
        vm.stopPrank();

        assertEq(boomERC721.contractURI(), uri);
    }
}
