pragma solidity ^0.4.18;
contract D {
  uint public n;
  address public sender;
  event TesterD(uint _value);

  function callSetN(address _e, uint _n) public {
    _e.call(bytes4(keccak256("setN(uint256)")), _n); // E's storage is set, D is not modified 
  }

  function callcodeSetN(address _e, uint _n) public {
    _e.callcode(bytes4(keccak256("setN(uint256)")), _n); // D's storage is set, E is not modified 
  }

  function delegatecallSetN(address _e, uint _n, address _address) public {
    emit TesterD(_n);
    _e.delegatecall(bytes4(keccak256("setN(uint256, address)")), _n, _address); // D's storage is set, E is not modified 
  }

  function () public payable {}

}

contract E {
  uint public n;
  address public sender;
  event TesterE(uint _value);

  function setN(uint _n, address _address) public {
    n = _n;
    sender = msg.sender;
    emit TesterE(_n);
    // _address.send(n);
    // msg.sender is D if invoked by D's callcodeSetN. None of E's storage is updated
    // msg.sender is C if invoked by C.foo(). None of E's storage is updated

    // the value of "this" is D, when invoked by either D's callcodeSetN or C.foo()

  }

}

contract C {
  event TesterC(uint _value);
    function foo(D _d, E _e, uint _n) public {
        emit TesterC(_d.balance);
        // msg.sender.send(_n);
        bytes32 sampleByte = "Thingy";
        address sampleAddress = 0x822b0be76f7223399f8a7a59041f2016f710f35e;
        ecrecover(sampleByte, 44, sampleByte, sampleByte);
        _d.delegatecallSetN(_e, _n, msg.sender);
    }

  function () public payable {}
}