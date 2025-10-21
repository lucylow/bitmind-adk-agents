// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BitMindAgentToken
 * @dev Token representing ownership in BitMind DAO Governance Co-pilot Agent
 * Follows ATP (Agent Tokenization Platform) standards for IQ AI
 * 
 * Features:
 * - Revenue distribution to token holders from agent earnings
 * - Capability unlocking based on market cap milestones
 * - Autonomous agent wallet management
 * - Integration with IQ token pairing
 */
contract BitMindAgentToken is ERC20, Ownable {
    // Agent wallet that can execute autonomous transactions
    address public agentWallet;
    
    // IQ token pairing (required by ATP)
    address public immutable IQ_TOKEN;
    
    // Revenue distribution tracking
    uint256 public totalRevenue;
    uint256 public revenuePerToken;
    mapping(address => uint256) public lastClaimedRevenue;
    
    // Agent capabilities that unlock with token supply milestones
    struct Capability {
        string name;
        uint256 requiredMarketCap;
        bool unlocked;
        uint256 unlockedAt;
    }
    Capability[] public capabilities;
    
    // Fee structure for agent services
    struct FeeConfig {
        uint256 basicAnalysisFee;
        uint256 premiumAnalysisFee;
        uint256 customStrategyFee;
        uint256 revenueSharePercentage; // Percentage shared with token holders (basis points)
    }
    FeeConfig public feeConfig;
    
    // Events
    event CapabilityUnlocked(string capabilityName, uint256 marketCap, uint256 timestamp);
    event RevenueClaimed(address indexed holder, uint256 amount);
    event RevenueDeposited(uint256 amount, uint256 newRevenuePerToken);
    event AgentWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event FeeConfigUpdated(uint256 basicFee, uint256 premiumFee, uint256 customFee);
    
    constructor(
        string memory name,
        string memory symbol,
        address _agentWallet,
        address _iqToken,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(_agentWallet != address(0), "Invalid agent wallet");
        require(_iqToken != address(0), "Invalid IQ token");
        
        agentWallet = _agentWallet;
        IQ_TOKEN = _iqToken;
        _mint(msg.sender, initialSupply);
        
        // Initialize fee structure (in wei for Fraxtal)
        feeConfig = FeeConfig({
            basicAnalysisFee: 0.01 ether,      // 0.01 ETH for basic analysis
            premiumAnalysisFee: 0.1 ether,      // 0.1 ETH for premium analysis
            customStrategyFee: 0.5 ether,       // 0.5 ETH for custom strategies
            revenueSharePercentage: 8000        // 80% shared with token holders (8000 basis points)
        });
        
        // Define capability milestones (market cap in tokens)
        capabilities.push(Capability({
            name: "Premium Analysis",
            requiredMarketCap: 10000 ether,
            unlocked: false,
            unlockedAt: 0
        }));
        
        capabilities.push(Capability({
            name: "Multi-DAO Support",
            requiredMarketCap: 50000 ether,
            unlocked: false,
            unlockedAt: 0
        }));
        
        capabilities.push(Capability({
            name: "Delegation Optimization",
            requiredMarketCap: 100000 ether,
            unlocked: false,
            unlockedAt: 0
        }));
        
        capabilities.push(Capability({
            name: "Cross-Chain Governance",
            requiredMarketCap: 500000 ether,
            unlocked: false,
            unlockedAt: 0
        }));
        
        capabilities.push(Capability({
            name: "AI-Powered Predictions",
            requiredMarketCap: 1000000 ether,
            unlocked: false,
            unlockedAt: 0
        }));
    }
    
    /**
     * @dev Agent deposits revenue from its operations
     * Called by agent wallet when it earns fees from providing services
     */
    function depositRevenue() external payable {
        require(msg.sender == agentWallet, "Only agent can deposit");
        require(msg.value > 0, "Must deposit non-zero amount");
        
        totalRevenue += msg.value;
        uint256 supply = totalSupply();
        require(supply > 0, "No tokens in circulation");
        
        revenuePerToken = totalRevenue / supply;
        
        emit RevenueDeposited(msg.value, revenuePerToken);
        
        // Check if new capabilities should unlock based on market cap
        _checkAndUnlockCapabilities();
    }
    
    /**
     * @dev Internal function to check and unlock capabilities
     */
    function _checkAndUnlockCapabilities() internal {
        uint256 marketCap = totalSupply();
        
        for (uint i = 0; i < capabilities.length; i++) {
            if (!capabilities[i].unlocked && marketCap >= capabilities[i].requiredMarketCap) {
                capabilities[i].unlocked = true;
                capabilities[i].unlockedAt = block.timestamp;
                emit CapabilityUnlocked(capabilities[i].name, marketCap, block.timestamp);
            }
        }
    }
    
    /**
     * @dev Token holders claim their share of revenue
     */
    function claimRevenue() external {
        uint256 balance = balanceOf(msg.sender);
        require(balance > 0, "No tokens held");
        
        uint256 totalOwed = revenuePerToken * balance;
        uint256 owed = totalOwed - lastClaimedRevenue[msg.sender];
        require(owed > 0, "No revenue to claim");
        
        lastClaimedRevenue[msg.sender] = totalOwed;
        
        (bool success, ) = payable(msg.sender).call{value: owed}("");
        require(success, "Revenue transfer failed");
        
        emit RevenueClaimed(msg.sender, owed);
    }
    
    /**
     * @dev Check pending revenue for an address
     */
    function pendingRevenue(address holder) external view returns (uint256) {
        uint256 balance = balanceOf(holder);
        if (balance == 0) return 0;
        
        uint256 totalOwed = revenuePerToken * balance;
        return totalOwed - lastClaimedRevenue[holder];
    }
    
    /**
     * @dev Check if specific capability is unlocked
     */
    function isCapabilityUnlocked(string memory capabilityName) external view returns (bool) {
        for (uint i = 0; i < capabilities.length; i++) {
            if (keccak256(bytes(capabilities[i].name)) == keccak256(bytes(capabilityName))) {
                return capabilities[i].unlocked;
            }
        }
        return false;
    }
    
    /**
     * @dev Get all capabilities and their status
     */
    function getAllCapabilities() external view returns (
        string[] memory names,
        uint256[] memory requiredMarketCaps,
        bool[] memory unlockStatuses,
        uint256[] memory unlockedTimestamps
    ) {
        uint256 length = capabilities.length;
        names = new string[](length);
        requiredMarketCaps = new uint256[](length);
        unlockStatuses = new bool[](length);
        unlockedTimestamps = new uint256[](length);
        
        for (uint i = 0; i < length; i++) {
            names[i] = capabilities[i].name;
            requiredMarketCaps[i] = capabilities[i].requiredMarketCap;
            unlockStatuses[i] = capabilities[i].unlocked;
            unlockedTimestamps[i] = capabilities[i].unlockedAt;
        }
    }
    
    /**
     * @dev Update agent wallet address (only owner)
     */
    function updateAgentWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet address");
        address oldWallet = agentWallet;
        agentWallet = newWallet;
        emit AgentWalletUpdated(oldWallet, newWallet);
    }
    
    /**
     * @dev Update fee configuration (only owner)
     */
    function updateFeeConfig(
        uint256 basicFee,
        uint256 premiumFee,
        uint256 customFee,
        uint256 revenueShare
    ) external onlyOwner {
        require(revenueShare <= 10000, "Revenue share must be <= 100%");
        
        feeConfig = FeeConfig({
            basicAnalysisFee: basicFee,
            premiumAnalysisFee: premiumFee,
            customStrategyFee: customFee,
            revenueSharePercentage: revenueShare
        });
        
        emit FeeConfigUpdated(basicFee, premiumFee, customFee);
    }
    
    /**
     * @dev Get current fee configuration
     */
    function getFeeConfig() external view returns (
        uint256 basicFee,
        uint256 premiumFee,
        uint256 customFee,
        uint256 revenueShare
    ) {
        return (
            feeConfig.basicAnalysisFee,
            feeConfig.premiumAnalysisFee,
            feeConfig.customStrategyFee,
            feeConfig.revenueSharePercentage
        );
    }
    
    /**
     * @dev Override transfer to update revenue claims
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        // Update claimed revenue tracking on transfer
        if (from != address(0) && balanceOf(from) > 0) {
            lastClaimedRevenue[from] = (revenuePerToken * (balanceOf(from) - value));
        }
        if (to != address(0)) {
            lastClaimedRevenue[to] = (revenuePerToken * (balanceOf(to) + value));
        }
        
        super._update(from, to, value);
    }
}

