// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NexusGuardEscrowV2
 * @notice Advanced Escrow with Milestones, Disputes, Deadline Auto-Refund & Freelancer Assignment
 * @dev Protects both Client and Freelancer transparently on-chain
 */
contract NexusGuardEscrowV2 is Ownable, ReentrancyGuard {

    enum MilestoneStatus { Pending, Released, Refunded, Disputed }
    enum DisputeResult { None, FreelancerWins, ClientWins }

    struct Milestone {
        uint256 amount;
        MilestoneStatus status;
        bool disputeOpen;
        DisputeResult disputeResult;
        string disputeReason;
    }

    struct Job {
        address client;
        address freelancer;
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 milestoneCount;
        uint256 deadline;
        bool isActive;
        bool isCompleted;
    }

    mapping(string => Job) public jobs;
    mapping(string => Milestone[]) public milestones;

    // ─── Events ───
    event JobCreated(string indexed jobId, address indexed client, uint256 totalAmount, uint256 milestoneCount, uint256 deadline);
    event FreelancerAssigned(string indexed jobId, address indexed freelancer);
    event MilestoneReleased(string indexed jobId, uint256 milestoneIndex, address indexed freelancer, uint256 amount);
    event MilestoneRefunded(string indexed jobId, uint256 milestoneIndex, address indexed client, uint256 amount);
    event DisputeOpened(string indexed jobId, uint256 milestoneIndex, address indexed opener, string reason);
    event DisputeResolved(string indexed jobId, uint256 milestoneIndex, DisputeResult result);
    event DeadlineRefund(string indexed jobId, address indexed client, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // ─── Modifiers ───
    modifier jobExists(string calldata jobId) {
        require(jobs[jobId].isActive, "Job does not exist or is inactive");
        _;
    }

    modifier onlyClient(string calldata jobId) {
        require(msg.sender == jobs[jobId].client, "Only the client can perform this action");
        _;
    }

    modifier onlyParty(string calldata jobId) {
        Job storage job = jobs[jobId];
        require(
            msg.sender == job.client || msg.sender == job.freelancer,
            "Only client or freelancer can perform this action"
        );
        _;
    }

    // ═══════════════════════════════════════════════
    // 1. CREATE JOB WITH MILESTONES
    // ═══════════════════════════════════════════════

    /**
     * @notice Client creates a job with milestone-based payments
     * @param jobId Unique identifier for the job
     * @param milestoneCount Number of milestones (payment stages)
     * @param milestonePercentages Array of percentages for each milestone (must sum to 100)
     * @param deadline Unix timestamp for the job deadline
     */
    function createJob(
        string calldata jobId,
        uint256 milestoneCount,
        uint256[] calldata milestonePercentages,
        uint256 deadline
    ) external payable nonReentrant {
        require(msg.value > 0, "Deposit must be greater than 0");
        require(!jobs[jobId].isActive, "Job already exists");
        require(milestoneCount > 0 && milestoneCount <= 10, "Milestones: 1-10");
        require(milestonePercentages.length == milestoneCount, "Percentages length mismatch");
        require(deadline > block.timestamp, "Deadline must be in the future");

        // Validate percentages sum to 100
        uint256 totalPercent = 0;
        for (uint256 i = 0; i < milestoneCount; i++) {
            require(milestonePercentages[i] > 0, "Each milestone must have > 0%");
            totalPercent += milestonePercentages[i];
        }
        require(totalPercent == 100, "Percentages must sum to 100");

        // Create job
        jobs[jobId] = Job({
            client: msg.sender,
            freelancer: address(0),
            totalAmount: msg.value,
            releasedAmount: 0,
            milestoneCount: milestoneCount,
            deadline: deadline,
            isActive: true,
            isCompleted: false
        });

        // Create milestones
        for (uint256 i = 0; i < milestoneCount; i++) {
            uint256 msAmount = (msg.value * milestonePercentages[i]) / 100;
            milestones[jobId].push(Milestone({
                amount: msAmount,
                status: MilestoneStatus.Pending,
                disputeOpen: false,
                disputeResult: DisputeResult.None,
                disputeReason: ""
            }));
        }

        emit JobCreated(jobId, msg.sender, msg.value, milestoneCount, deadline);
    }

    // ═══════════════════════════════════════════════
    // 2. ASSIGN FREELANCER
    // ═══════════════════════════════════════════════

    /**
     * @notice Client or Owner assigns a freelancer to the job
     */
    function assignFreelancer(string calldata jobId, address freelancer) 
        external 
        jobExists(jobId) 
        nonReentrant 
    {
        Job storage job = jobs[jobId];
        require(
            msg.sender == job.client || msg.sender == owner(),
            "Only client or owner can assign"
        );
        require(freelancer != address(0), "Invalid freelancer address");
        require(job.freelancer == address(0), "Freelancer already assigned");

        job.freelancer = freelancer;
        emit FreelancerAssigned(jobId, freelancer);
    }

    // ═══════════════════════════════════════════════
    // 3. RELEASE MILESTONE (Owner/AI decides)
    // ═══════════════════════════════════════════════

    /**
     * @notice Owner releases funds for a specific milestone to the freelancer
     */
    function releaseMilestone(string calldata jobId, uint256 milestoneIndex)
        external
        onlyOwner
        jobExists(jobId)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        require(job.freelancer != address(0), "No freelancer assigned");
        require(milestoneIndex < job.milestoneCount, "Invalid milestone index");

        Milestone storage ms = milestones[jobId][milestoneIndex];
        require(ms.status == MilestoneStatus.Pending, "Milestone not pending");
        require(!ms.disputeOpen, "Milestone is under dispute");

        uint256 amount = ms.amount;
        ms.status = MilestoneStatus.Released;
        ms.amount = 0;
        job.releasedAmount += amount;

        (bool success, ) = payable(job.freelancer).call{value: amount}("");
        require(success, "Transfer failed");

        emit MilestoneReleased(jobId, milestoneIndex, job.freelancer, amount);

        // Check if all milestones are done
        _checkJobCompletion(jobId);
    }

    // ═══════════════════════════════════════════════
    // 4. DISPUTE MECHANISM
    // ═══════════════════════════════════════════════

    /**
     * @notice Client or Freelancer opens a dispute on a specific milestone
     */
    function openDispute(string calldata jobId, uint256 milestoneIndex, string calldata reason)
        external
        jobExists(jobId)
        onlyParty(jobId)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        require(milestoneIndex < job.milestoneCount, "Invalid milestone index");

        Milestone storage ms = milestones[jobId][milestoneIndex];
        require(ms.status == MilestoneStatus.Pending, "Milestone not pending");
        require(!ms.disputeOpen, "Dispute already open");

        ms.disputeOpen = true;
        ms.disputeReason = reason;

        emit DisputeOpened(jobId, milestoneIndex, msg.sender, reason);
    }

    /**
     * @notice Owner resolves a dispute — decides who gets the milestone funds
     * @param freelancerWins If true, funds go to freelancer. If false, refunded to client.
     */
    function resolveDispute(string calldata jobId, uint256 milestoneIndex, bool freelancerWins)
        external
        onlyOwner
        jobExists(jobId)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        require(milestoneIndex < job.milestoneCount, "Invalid milestone index");

        Milestone storage ms = milestones[jobId][milestoneIndex];
        require(ms.disputeOpen, "No dispute to resolve");
        require(ms.status == MilestoneStatus.Pending, "Milestone not pending");

        uint256 amount = ms.amount;
        ms.amount = 0;
        ms.disputeOpen = false;

        if (freelancerWins) {
            require(job.freelancer != address(0), "No freelancer assigned");
            ms.status = MilestoneStatus.Released;
            ms.disputeResult = DisputeResult.FreelancerWins;
            job.releasedAmount += amount;

            (bool success, ) = payable(job.freelancer).call{value: amount}("");
            require(success, "Transfer to freelancer failed");

            emit MilestoneReleased(jobId, milestoneIndex, job.freelancer, amount);
        } else {
            ms.status = MilestoneStatus.Refunded;
            ms.disputeResult = DisputeResult.ClientWins;

            (bool success, ) = payable(job.client).call{value: amount}("");
            require(success, "Refund to client failed");

            emit MilestoneRefunded(jobId, milestoneIndex, job.client, amount);
        }

        emit DisputeResolved(jobId, milestoneIndex, ms.disputeResult);
        _checkJobCompletion(jobId);
    }

    // ═══════════════════════════════════════════════
    // 5. DEADLINE AUTO-REFUND
    // ═══════════════════════════════════════════════

    /**
     * @notice Client can claim refund on all unreleased milestones after deadline passes
     */
    function claimRefundAfterDeadline(string calldata jobId)
        external
        jobExists(jobId)
        onlyClient(jobId)
        nonReentrant
    {
        Job storage job = jobs[jobId];
        require(block.timestamp > job.deadline, "Deadline has not passed yet");

        uint256 refundTotal = 0;

        for (uint256 i = 0; i < job.milestoneCount; i++) {
            Milestone storage ms = milestones[jobId][i];
            if (ms.status == MilestoneStatus.Pending && !ms.disputeOpen) {
                refundTotal += ms.amount;
                ms.amount = 0;
                ms.status = MilestoneStatus.Refunded;
            }
        }

        require(refundTotal > 0, "No funds available for refund");

        job.isCompleted = true;
        job.isActive = false;

        (bool success, ) = payable(job.client).call{value: refundTotal}("");
        require(success, "Refund failed");

        emit DeadlineRefund(jobId, job.client, refundTotal);
    }

    // ═══════════════════════════════════════════════
    // 6. VIEW FUNCTIONS
    // ═══════════════════════════════════════════════

    function getMilestone(string calldata jobId, uint256 index) 
        external 
        view 
        returns (
            uint256 amount,
            MilestoneStatus status,
            bool disputeOpen,
            DisputeResult disputeResult,
            string memory disputeReason
        ) 
    {
        Milestone storage ms = milestones[jobId][index];
        return (ms.amount, ms.status, ms.disputeOpen, ms.disputeResult, ms.disputeReason);
    }

    function getJobMilestones(string calldata jobId) 
        external 
        view 
        returns (Milestone[] memory) 
    {
        return milestones[jobId];
    }

    function getRemainingBalance(string calldata jobId) external view returns (uint256) {
        Job storage job = jobs[jobId];
        return job.totalAmount - job.releasedAmount;
    }

    // ─── Internal ───
    function _checkJobCompletion(string memory jobId) internal {
        Job storage job = jobs[jobId];
        Milestone[] storage ms = milestones[jobId];

        bool allDone = true;
        for (uint256 i = 0; i < ms.length; i++) {
            if (ms[i].status == MilestoneStatus.Pending) {
                allDone = false;
                break;
            }
        }

        if (allDone) {
            job.isCompleted = true;
            job.isActive = false;
        }
    }
}
