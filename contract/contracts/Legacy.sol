// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// AutomationCompatible.sol imports the functions from both ./AutomationBase.sol and
// ./interfaces/AutomationCompatibleInterface.sol
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "./TransferHelper.sol";

interface IERC20 {
    function balanceOf(address owner) external returns (uint256 balance);

    function allowance(address owner, address spender)
        external
        returns (uint256 remaining);
}

contract Legacy is AutomationCompatibleInterface {
    LEGACY[] private legacies;
    mapping(address => uint256) private legacyId;

    struct LEGACY {
        address owner;
        address legatee;
        address[] tokens;
        uint256 lastSeen;
        uint256 checkInterval;
        bool fulfilled;
    }

    constructor() {
        create(address(0), 0);
    }

    modifier hasActiveLegacy(address _owner) {
        uint256 _index = legacyId[msg.sender];
        require(_index != 0, "You do not have an active legacy!");
        _;
    }

    function create(address _legatee, uint256 _checkInterval) public {
        uint256 _index = legacies.length;
        // Revert if msg.sender already has an active legacy!
        require(legacyId[msg.sender] == 0, "Legacy exist!");
        legacies.push(
            LEGACY(
                msg.sender,
                _legatee,
                new address[](0),
                block.timestamp,
                _checkInterval,
                false
            )
        );
        legacyId[msg.sender] = _index;
    }

    function cancel() public hasActiveLegacy(msg.sender) {
        delete legacies[legacyId[msg.sender]];
        legacyId[msg.sender] = 0;
    }

    function update(address _legatee, uint256 _checkInterval)
        public
        hasActiveLegacy(msg.sender)
    {
        uint256 _index = legacyId[msg.sender];
        legacies[_index].checkInterval = _checkInterval;
        legacies[_index].legatee = _legatee;
    }

    function checkIn() public hasActiveLegacy(msg.sender) {
        uint256 _index = legacyId[msg.sender];
        legacies[_index].lastSeen = block.timestamp;
    }

    function addTokens(address[] memory _tokens) public {
        uint256 _index = legacyId[msg.sender];
        for (uint256 i = 0; i < _tokens.length; i++) {
            IERC20 _token = IERC20(_tokens[i]);
            //Confirm token approval
            require(
                _token.allowance(msg.sender, address(this)) ==
                    type(uint256).max,
                "token not approved!"
            );
            legacies[_index].tokens.push(_tokens[i]);
        }
    }

    function updateCheckInterval(uint256 _checkInterval)
        public
        hasActiveLegacy(msg.sender)
    {
        uint256 _index = legacyId[msg.sender];
        legacies[_index].checkInterval = _checkInterval;
    }

    function updateHeir(address _legatee) public hasActiveLegacy(msg.sender) {
        uint256 _index = legacyId[msg.sender];
        legacies[_index].legatee = _legatee;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        uint256 _nextDueLegacy = _getNextDueLegacy();
        if (_nextDueLegacy == 0) {
            upkeepNeeded = false;
        } else {
            upkeepNeeded = true;
            performData = abi.encode(_nextDueLegacy);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        //Decode perfromData
        uint256 _id = abi.decode(performData, (uint256));
        _fufillLegacy(_id);
    }

    // Getters

    function getLegacy(address _owner) public view returns (LEGACY memory) {
        return legacies[legacyId[_owner]];
    }

    function getLegacyTokens(address _owner)
        public
        view
        returns (address[] memory)
    {
        return legacies[legacyId[_owner]].tokens;
    }

    function hasLegacy(address _owner) public view returns (bool) {
        if (legacyId[_owner] == 0) {
            return false;
        } else {
            return true;
        }
    }

    // Internal functions
    function _getNextDueLegacy() internal view returns (uint256) {
        for (uint256 i = 1; i < legacies.length; i++) {
            LEGACY memory _legacy = legacies[i];
            if (
                !_legacy.fulfilled &&
                block.timestamp - _legacy.lastSeen > _legacy.checkInterval
            ) {
                return i;
            }
        }
        return 0;
    }

    function _fufillLegacy(uint256 _id) internal {
        LEGACY memory _legacy = legacies[_id];
        //Confirm legacy is due
        require(
            block.timestamp - _legacy.lastSeen > _legacy.checkInterval,
            "not due!"
        );
        legacies[_id].fulfilled = true;

        //Transfer tokens to legatee
        for (uint256 i = 0; i < _legacy.tokens.length; i++) {
            address _token = _legacy.tokens[i];
            uint256 _allowed = IERC20(_token).allowance(
                _legacy.owner,
                address(this)
            );
            uint256 _balance = IERC20(_token).balanceOf(_legacy.owner);
            // Skip tokens not approved
            if (_allowed < _balance) {
                continue;
            }
            TransferHelper.safeTransferFrom(
                _token,
                _legacy.owner,
                _legacy.legatee,
                _balance
            );
        }
    }
}
