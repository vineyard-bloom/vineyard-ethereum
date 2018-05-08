pragma solidity ^0.4.16;

contract Sender {
  event Tester(address);
    function send(address to, uint256 amount) public {
      to.send(amount);
    }
    function() public payable {}
}