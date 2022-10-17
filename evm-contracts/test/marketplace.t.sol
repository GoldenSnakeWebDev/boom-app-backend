// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "./utils/BaseTest.sol";
import {Marketplace, IMarketplace} from "@boom/contracts/marketplace/Marketplace.sol";
import {ITokenERC721} from "@boom/contracts/interfaces/ITokenERC721.sol";

contract MarketplaceTest is BaseTest {
    Marketplace.ListingParameters public directListing;
    Marketplace.ListingParameters public auctionListing;

    function setUp() public override {
        super.setUp();
    }

    function test_create_listing() public {
        assertEq(true, true);
    }

    // helper methods
    function createERC721Listing(
        address to,
        address currency,
        uint256 price,
        IMarketplace.ListingType listingType
    )
        public
        returns (
            uint256 listingId,
            IMarketplace.ListingParameters memory listing
        )
    {
        vm.startPrank(defaultAdmin);
        uint256 tokenId = boomERC721.mintTo(to, "");
        // approve token to be spent by the marketplace

        // end of approve
        vm.stopPrank();

        listing.assetContract = address(boomERC721);
        listing.tokenId = tokenId;
        listing.startTime = 0;
        listing.secondsUntilEndTime = 1 * 24 * 60 * 60; // 1 day
        listing.quantityToList = 1;
        listing.currencyToAccept = currency;
        listing.reservePricePerToken = 0;
        listing.buyoutPricePerToken = price;
        listing.listingType = listingType;

        listingId = MARKET_PLACE.totalListings();
        vm.startPrank(to);
        MARKET_PLACE.createListing(listing);
    }

    function getListing(uint256 _listingId)
        public
        view
        returns (Marketplace.Listing memory listing)
    {
        (
            uint256 listingId,
            address tokenOwner,
            address assetContract,
            uint256 tokenId,
            uint256 startTime,
            uint256 endTime,
            uint256 quantity,
            address currency,
            uint256 reservePricePerToken,
            uint256 buyoutPricePerToken,
            IMarketplace.TokenType tokenType,
            IMarketplace.ListingType listingType
        ) = MARKET_PLACE.listings(_listingId);

        listing.listingId = listingId;
        listing.tokenOwner = tokenOwner;
        listing.assetContract = assetContract;
        listing.tokenId = tokenId;
        listing.startTime = startTime;
        listing.endTime = endTime;
        listing.quantity = quantity;
        listing.currency = currency;
        listing.reservePricePerToken = reservePricePerToken;
        listing.buyoutPricePerToken = buyoutPricePerToken;
        listing.tokenType = tokenType;
        listing.listingType = listingType;
    }
}
