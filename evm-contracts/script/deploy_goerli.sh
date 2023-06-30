#!/usr/bin/env bash

if [ -f .env ]
then 
    export $(cat .env |  xargs)
else  
    echo "Please set your .env file with required items"
fi 

# echo  "Deploying verify contracts to testnet ====== BOOM ERC721 TOKEN ==================="
# forge script ./script/DeployERC721.s.sol:DeployScript  --rpc-url ${BSC_TESTNET_RPC} --private-key ${PRIVATE_KEY} --etherscan-api-key ${ETHERSCAN_API_KEY}  --verify --broadcast -vvvv
# echo  "Deploying verify contracts to testnet ====== MARKETPLACE =========================="
forge script ./script/DeployMarketplace.s.sol:DeployScript --rpc-url ${BSC_TESTNET_RPC} --private-key ${PRIVATE_KEY} --etherscan-api-key ${ETHERSCAN_API_KEY}  --verify --broadcast -vvvv