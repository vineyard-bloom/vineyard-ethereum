pragma solidity ^0.4.16;

contract Sender {

    function send(uint256 to) public {
        address(this).transfer(to);
    }
}