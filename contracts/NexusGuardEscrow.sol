// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract NexusGuardEscrow is Ownable, ReentrancyGuard {
    struct Job {
        address client;
        uint256 amount;
        bool isFunded;
        bool isCompleted;
    }

    mapping(string => Job) public jobs;

    event JobCreated(string indexed jobId, address indexed client, uint256 amount);
    event FundsReleased(string indexed jobId, address indexed freelancer, uint256 amount);
    event JobRefunded(string indexed jobId, address indexed client, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // Client creates a job and deposits native token (ARC/USDC)
    function createJob(string calldata jobId) external payable nonReentrant {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(!jobs[jobId].isFunded, "Job already exists and is funded");

        jobs[jobId] = Job({
            client: msg.sender,
            amount: msg.value,
            isFunded: true,
            isCompleted: false
        });

        emit JobCreated(jobId, msg.sender, msg.value);
    }

    // Swarm Consensus (Owner) releases funds to the freelancer
    function releaseFunds(string calldata jobId, address payable freelancer) external onlyOwner nonReentrant {
        Job storage job = jobs[jobId];
        require(job.isFunded, "Job is not funded");
        require(!job.isCompleted, "Job is already completed");
        require(freelancer != address(0), "Invalid freelancer address");

        uint256 amountToTransfer = job.amount;
        job.amount = 0;
        job.isCompleted = true;

        (bool success, ) = freelancer.call{value: amountToTransfer}("");
        require(success, "Transfer failed");

        emit FundsReleased(jobId, freelancer, amountToTransfer);
    }

    // Swarm Consensus (Owner) refunds the client
    function refund(string calldata jobId) external onlyOwner nonReentrant {
        Job storage job = jobs[jobId];
        require(job.isFunded, "Job is not funded");
        require(!job.isCompleted, "Job is already completed");

        uint256 amountToRefund = job.amount;
        job.amount = 0;
        job.isCompleted = true;

        (bool success, ) = payable(job.client).call{value: amountToRefund}("");
        require(success, "Refund failed");

        emit JobRefunded(jobId, job.client, amountToRefund);
    }
}
