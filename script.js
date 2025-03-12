// Переключение темы
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;
const icon = toggleButton.querySelector('.icon');

const savedTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', savedTheme);
icon.textContent = savedTheme === 'light' ? '☀️' : '🌙';

toggleButton.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    icon.textContent = newTheme === 'light' ? '☀️' : '🌙';
});

// Логика генерации смарт-контракта
const generateButton = document.getElementById('generate-contract');
const tokenNameInput = document.getElementById('token-name');
const tokenSymbolInput = document.getElementById('token-symbol');
const totalSupplyInput = document.getElementById('total-supply');
const decimalsInput = document.getElementById('decimals');
const mintableCheckbox = document.getElementById('mintable');
const burnableCheckbox = document.getElementById('burnable');
const pausableCheckbox = document.getElementById('pausable');
const contractStatusOutput = document.getElementById('contract-status');
const downloadSolButton = document.getElementById('download-sol');

let generatedContract = '';

generateButton.addEventListener('click', () => {
    const tokenName = tokenNameInput.value.trim();
    const tokenSymbol = tokenSymbolInput.value.trim();
    const totalSupply = totalSupplyInput.value.trim();
    const decimals = decimalsInput.value.trim();
    const isMintable = mintableCheckbox.checked;
    const isBurnable = burnableCheckbox.checked;
    const isPausable = pausableCheckbox.checked;

    // Валидация
    if (!tokenName) {
        alert('Please enter a Token Name');
        return;
    }
    if (!tokenSymbol) {
        alert('Please enter a Token Symbol');
        return;
    }
    if (!totalSupply || isNaN(totalSupply) || totalSupply <= 0) {
        alert('Please enter a valid Total Supply (greater than 0)');
        return;
    }
    if (!decimals || isNaN(decimals) || decimals < 0 || decimals > 18) {
        alert('Please enter valid Decimals (0-18)');
        return;
    }

    // Генерация контракта
    generatedContract = generateSmartContract(tokenName, tokenSymbol, totalSupply, decimals, isMintable, isBurnable, isPausable);
    contractStatusOutput.textContent = `Contract "${tokenName}" generated successfully!`;
    downloadSolButton.disabled = false;
});

// Генерация кода смарт-контракта
function generateSmartContract(name, symbol, supply, decimals, mintable, burnable, pausable) {
    let contractCode = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
${pausable ? 'import "@openzeppelin/contracts/security/Pausable.sol";' : ''}
${mintable ? 'import "@openzeppelin/contracts/access/Ownable.sol";' : ''}

contract ${name} is ERC20${mintable ? ', Ownable' : ''}${pausable ? ', Pausable' : ''} {
    constructor() ERC20("${name}", "${symbol}")${mintable ? ' Ownable()' : ''} {
        _mint(msg.sender, ${supply} * 10 ** uint256(${decimals}));
    }
`;

    if (mintable) {
        contractCode += `
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
`;
    }

    if (burnable) {
        contractCode += `
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
`;
    }

    if (pausable) {
        contractCode += `
    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
`;
    }

    contractCode += '}';
    return contractCode;
}

// Скачивание файла
function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

downloadSolButton.addEventListener('click', () => {
    if (generatedContract) {
        downloadFile(generatedContract, `${tokenNameInput.value || 'Token'}.sol`, 'text/plain');
    }
});

// Копирование Bitcoin-адреса
const copyBtcButton = document.querySelector('.btc-address .copy-btn');
copyBtcButton.addEventListener('click', () => {
    const btcCode = document.getElementById('btc-code').textContent;
    navigator.clipboard.writeText(btcCode).then(() => {
        copyBtcButton.textContent = 'Copied!';
        setTimeout(() => {
            copyBtcButton.textContent = 'Copy';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
});
