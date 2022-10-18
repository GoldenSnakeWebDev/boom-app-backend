// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;
import "forge-std/console.sol";
import "./utils/BaseTest.sol";
import {Marketplace, IMarketplace} from "@boom/contracts/marketplace/Marketplace.sol";
import {ITokenERC721} from "@boom/contracts/interfaces/ITokenERC721.sol";

contract MarketplaceTest is BaseTest {
    Marketplace.ListingParameters public directListing;
    Marketplace.ListingParameters public auctionListing;

    function setUp() public override {
        super.setUp();
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
            Marketplace.ListingParameters memory listing
        )
    {
        uint256 tokenId = boomERC721.mintTo(to, "https://");
        vm.prank(to);
        boomERC721.setApprovalForAll(address(MARKET_PLACE), true);

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
        vm.prank(to);
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

    function getWinningBid(uint256 _listingId)
        public
        view
        returns (Marketplace.Offer memory winningBid)
    {
        (
            uint256 listingId,
            address offeror,
            uint256 quantityWanted,
            address currency,
            uint256 pricePerToken,

        ) = MARKET_PLACE.winningBid(_listingId);
        winningBid.listingId = listingId;
        winningBid.offeror = offeror;
        winningBid.quantityWanted = quantityWanted;
        winningBid.currency = currency;
        winningBid.pricePerToken = pricePerToken;
    }

    function test_createListingFor_autction_and_listing() public {
        vm.warp(0);
        (
            uint256 createdListingId,
            Marketplace.ListingParameters memory createdListing
        ) = createERC721Listing(
                getActor(0),
                NATIVE_TOKEN,
                1 ether,
                IMarketplace.ListingType.Auction
            );

        Marketplace.Listing memory listing = getListing(createdListingId);
        assertEq(createdListingId, listing.listingId);
        assertEq(createdListing.assetContract, listing.assetContract);
        assertEq(createdListing.tokenId, listing.tokenId);
        assertEq(createdListing.startTime, listing.startTime);
        assertEq(
            createdListing.startTime + createdListing.secondsUntilEndTime,
            listing.endTime
        );
        assertEq(createdListing.quantityToList, listing.quantity);
        assertEq(createdListing.currencyToAccept, listing.currency);
        assertEq(
            createdListing.reservePricePerToken,
            listing.reservePricePerToken
        );
        assertEq(
            createdListing.buyoutPricePerToken,
            listing.buyoutPricePerToken
        );
        assertEq(
            uint8(IMarketplace.TokenType.ERC721),
            uint8(listing.tokenType)
        );
        assertEq(
            uint8(IMarketplace.ListingType.Auction),
            uint8(listing.listingType)
        );
    }

    function test_offer_bidForAuctionNativeToken() public {}
}
