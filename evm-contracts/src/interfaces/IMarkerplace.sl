// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "./IContract.sol";
import "./IPlatformFee.sol";

interface IMarketplace is IContract, IPlatformFee {
    //@dev type of nft token that can be liste

    enum TokenType {
        ERC721,
        ERC1155
    }

    /**
     * @notice There are two types of listing
     *  Direct ** NFT listed for sale at a fixed price
     *  Auction ** NFT listed for sale in an auction
     */

    enum ListingType {
        Direct,
        Auction
    }


    /**
     * @notice
     * _listingId  List uid of the Listing Item
     * _tokenOwner  The owner of the token to be listed
     * _assetContract The Boom NFT tokens
     * _tokenId  The NFT token Id
     * _quantity The number of token to list
     * _currency What is the currency that are willing to accept in your marketplace
     * _pricePerToken   What is the price per token
     */
    struct Listing {
        uint256 _listingId;
        address _tokenOwner;
        address _assetContract;
        uint256 _tokenId;
        uint256 _quantity;
        address _currency;
        uint256 _pricePerToken;
        TokenType _tokenType;
        ListingType _listingType;
    }


    /**
     * @notice 
     *  _listingId  - The uid for the listing 
     *  _tokenOwner - The owner of the token address
     *  _assetContract - The contract address of the NFT to list for sale
     *  _tokenId - List token unique Id
     *  _quantiy - Number of tokens to list in the market place 
     *  _price -  The Fixed price for Direct List (We will on support direct listing)
     *  _tokenType -  The type of the NFT either ERC721/ERC1155
     *  _listingType - List type of the NFT either Direct/Auction ->  For now we support Direct
     */ 

    struct Listing  {
       uint256 _listingId,
       address _tokenOwner,
       address _assetContract,
       address _tokenId
       uint256 _quantitiy,
       uint256 _price,
       TokenType _tokenType,
       ListingType _listingType
    }


    event ListingAdded(uint256 indexed _listingId, address indexed _assetContract, address indexed lister, Listing _listing);
    event ListingUpdated(uint256 indexed _listingId, address indexed _lister);
    event ListingRemoved(uint256 indexed _listingId, address indexed _lister);


    event NewSale(
        uint256 indexed _listingId,
        address indexed _assetContract,
        address indexed _lister,
        address _buyer,
        uint256 _quantitiyBought,
        uint256 _totalPricePaid
    );

    event NewOffer(
        uint256 indexed _listingId,
        address indexed _offeror,
        ListingType indexed _listingType,
        uint256 _quantityWanted,
        uint256 _totalOfferAmount
        );

    function createListing(ListinParameters memory _params) external;

    function buy(
        uint256 _listingId,
        address _buyFor,
        uint256 _quantity,
        address _currency,
        uint256 _totalPrice
    ) external payable;

}
