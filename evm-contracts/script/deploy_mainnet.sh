#!/usr/bin/env bash

if [ -f .env ]
then 
    export $(cat .env |  xargs)
else  
    echo "Please set your .env file with required items"
fi 

# echo  "Deploying verify contracts to mainnet ====== BOOM ERC721 TOKEN ==================="
# forge script ./script/DeployERC721.s.sol:DeployScript  --rpc-url ${MAINNET_RPC} --private-key ${PRIVATE_KEY} --etherscan-api-key ${ETHERSCAN_API_KEY}  --verify --broadcast -vvvv
echo  "Deploying verify contracts to mainnet ====== MARKETPLACE =========================="
forge script ./script/DeployMarketplace.s.sol:DeployScript --rpc-url ${MAINNET_RPC} --private-key ${PRIVATE_KEY} --etherscan-api-key ${ETHERSCAN_API_KEY}  --verify --broadcast --legacy -vvvv