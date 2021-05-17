// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract PhotoOwnership is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => PhotoLicensing) private _licensingContracts;

    constructor() ERC721("PhotoOwnershipToken", "POT") {
    }

    function mintPOT(string memory photoHash, uint256 initialPrice, uint256 initialSupply) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, photoHash);

        PhotoLicensing licensing = new PhotoLicensing(msg.sender, newItemId, initialPrice, initialSupply);
        _licensingContracts[newItemId] = licensing;

        return newItemId;
    }

    function getPLTPrice(uint256 tokenId) public view returns (uint256) {
        return _licensingContracts[tokenId].price();
    }

    function setPLTPrice(uint256 tokenId, uint price) public {
        require(_isApprovedOrOwner(msg.sender, tokenId));
        _licensingContracts[tokenId].setPrice(price);
    }

    function mintPLT(uint256 tokenId, uint256 amount)
        public
    {
        require(_isApprovedOrOwner(msg.sender, tokenId));
        _licensingContracts[tokenId].mint(msg.sender, amount);
    }

    function obtainLicense(uint256 tokenId) public payable {
        require(_exists(tokenId), "Nonexistent token");
        require(ownerOf(tokenId) != msg.sender, "This is your own token");
        require(msg.value == _licensingContracts[tokenId].price() * 1 ether, "Insufficient funding");
        address ownerPOT = ownerOf(tokenId);
        payable(ownerPOT).transfer(msg.value);
        _licensingContracts[tokenId].transferPLT(ownerPOT, msg.sender, 1);
    }

    function totalLicenses(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Nonexistent token");
        return _licensingContracts[tokenId].totalSupply();
    }

    function myLicenses(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Nonexistent token");
        return _licensingContracts[tokenId].balanceOf(msg.sender);
    }
}

contract PhotoLicensing is ERC20PresetMinterPauser {

    uint256 private _associatedTokenId;
    uint256 private _price;

    constructor(address emitter, uint256 assocTokenId, uint256 initialPrice, uint256 initialSupply) ERC20PresetMinterPauser("PhotoLicensing", "PLT") {
        _associatedTokenId = assocTokenId;
        _price = initialPrice;
        mint(emitter, initialSupply);
    }

    function transferPLT(address owner, address recipient, uint256 amount) external {
        _transfer(owner, recipient, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function price() public view virtual returns (uint256) {
        return _price;
    }

    function setPrice(uint newPrice) external {
        _price = newPrice;
    }

    function associatedTokenId() external view returns (uint256) {
        return _associatedTokenId;
    }
}
