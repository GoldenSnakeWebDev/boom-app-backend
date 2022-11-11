-include .env

.PHONY: all test clean

all: clean remove install update build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install :; forge install forge-std openzeppelin/openzeppelin-contracts

# Update Dependencies
update:; forge update

build:; forge build
#testing 
test :; forge test -vvv  --gas-report --fork-url $BSC_RPC_URL
#get snapshot
snapshot :; forge snapshot
# anvil
anvil :; anvil --fork-url=$BSC_RPC_URL
# bsc
bsctest :; @forge script --fork-url $BSC_RPC_URL --private-key $BSC_PRIVATE_KEY script/DeployScript.sol:DeployScript  --broadcast -vvvv
bscdeploy :; @forge script --fork-url $BSC_RPC_URL --private-key $BSC_PRIVATE_KEY script/DeployScript.sol:DeployScript --broadcast -vvvv
# matic
matictest :; @forge script --fork-url $BSC_RPC_URL --private-key $MATIC_PRIVATE_KEY script/DeployScript.sol:DeployScript --broadcast -vvvv
maticdeploy :; @forge script --fork-url $BSC_RPC_URL --private-key $MATIC_PRIVATE_KEY script/DeployScript.sol:DeployScript  --broadcast -vvvv
