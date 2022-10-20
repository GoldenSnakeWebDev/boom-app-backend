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

test :; forge test -vvv  --gas-report --fork-url=$(RPC_URL)

snapshot :; forge snapshot

anvil :; anvil --fork-url=$(RPC_URL)

# use the "@" to hide the command from your shell 
deploy-mainnet :; @forge script script/DeployBoomFactory.s.sol:DeployBoomFactoryScript --fork-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast -vvvv


# Fork Mainnet
test-mainnet :; @forge test -vvvv  --rpc-url $(RPC_URL) 


deploytest :; @forge script script/DeployBoomFactory.s.sol:DeployBoomFactoryScript --fork-url $(RPC_URL) --private-key $(PRIVATE_KEY)  --broadcast -vvvv
deploymainnet :; @forge script script/DeployBoomFactory.s.sol:DeployBoomFactoryScript --fork-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast -vvvv
