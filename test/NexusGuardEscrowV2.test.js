const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("NexusGuardEscrowV2", function () {
  let escrow;
  let owner, client, freelancer, other;

  const JOB_ID = "job_001";
  const ONE_ETH = ethers.parseEther("1");
  const HOUR = 3600;

  // ethers v6 returns enums as bigints
  const MilestoneStatus = { Pending: 0n, Released: 1n, Refunded: 2n, Disputed: 3n };
  const DisputeResult = { None: 0n, FreelancerWins: 1n, ClientWins: 2n };

  beforeEach(async function () {
    [owner, client, freelancer, other] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory("NexusGuardEscrowV2");
    escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
  });

  async function createJob({
    jobId = JOB_ID,
    percentages = [50, 50],
    value = ONE_ETH,
    deadlineOffset = HOUR,
    by,
  } = {}) {
    const signer = by || client;
    const deadline = (await time.latest()) + deadlineOffset;
    const tx = await escrow
      .connect(signer)
      .createJob(jobId, percentages.length, percentages, deadline, { value });
    await tx.wait();
    return deadline;
  }

  describe("createJob", function () {
    it("should create a job and lock the deposited funds", async function () {
      const deadline = await createJob({ percentages: [40, 60], value: ONE_ETH });

      const job = await escrow.jobs(JOB_ID);
      expect(job.client).to.equal(client.address);
      expect(job.freelancer).to.equal(ethers.ZeroAddress);
      expect(job.totalAmount).to.equal(ONE_ETH);
      expect(job.releasedAmount).to.equal(0n);
      expect(job.milestoneCount).to.equal(2);
      expect(job.deadline).to.equal(deadline);
      expect(job.isActive).to.equal(true);
      expect(job.isCompleted).to.equal(false);
    });

    it("should allocate milestone amounts proportionally", async function () {
      await createJob({ percentages: [25, 75], value: ONE_ETH });

      const ms0 = await escrow.getMilestone(JOB_ID, 0);
      expect(ms0.amount).to.equal(ONE_ETH / 4n);

      const ms1 = await escrow.getMilestone(JOB_ID, 1);
      expect(ms1.amount).to.equal((ONE_ETH * 3n) / 4n);
    });

    it("should emit JobCreated", async function () {
      const deadline = (await time.latest()) + HOUR;
      await expect(
        escrow
          .connect(client)
          .createJob(JOB_ID, 2, [50, 50], deadline, { value: ONE_ETH })
      )
        .to.emit(escrow, "JobCreated")
        .withArgs(JOB_ID, client.address, ONE_ETH, 2, deadline);
    });

    it("should revert when no value is sent", async function () {
      const deadline = (await time.latest()) + HOUR;
      await expect(
        escrow.connect(client).createJob(JOB_ID, 1, [100], deadline, { value: 0 })
      ).to.be.revertedWith("Deposit must be greater than 0");
    });

    it("should revert when the job already exists", async function () {
      await createJob();
      await expect(
        escrow.connect(client).createJob(JOB_ID, 1, [100], (await time.latest()) + HOUR, {
          value: ONE_ETH,
        })
      ).to.be.revertedWith("Job already exists");
    });

    it("should revert with 0 or more than 10 milestones", async function () {
      const deadline = (await time.latest()) + HOUR;
      await expect(
        escrow.connect(client).createJob(JOB_ID, 0, [], deadline, { value: ONE_ETH })
      ).to.be.revertedWith("Milestones: 1-10");

      await expect(
        escrow.connect(client).createJob(JOB_ID, 11, Array(11).fill(9n), deadline, {
          value: ONE_ETH,
        })
      ).to.be.revertedWith("Milestones: 1-10");
    });

    it("should revert when percentages length mismatches milestone count", async function () {
      const deadline = (await time.latest()) + HOUR;
      await expect(
        escrow.connect(client).createJob(JOB_ID, 3, [50, 50], deadline, { value: ONE_ETH })
      ).to.be.revertedWith("Percentages length mismatch");
    });

    it("should revert when percentages do not sum to 100", async function () {
      const deadline = (await time.latest()) + HOUR;
      await expect(
        escrow.connect(client).createJob(JOB_ID, 2, [50, 40], deadline, { value: ONE_ETH })
      ).to.be.revertedWith("Percentages must sum to 100");
    });

    it("should revert when a milestone has 0%", async function () {
      const deadline = (await time.latest()) + HOUR;
      await expect(
        escrow.connect(client).createJob(JOB_ID, 2, [100, 0], deadline, { value: ONE_ETH })
      ).to.be.revertedWith("Each milestone must have > 0%");
    });

    it("should revert when the deadline is not in the future", async function () {
      const past = (await time.latest()) - 1;
      await expect(
        escrow.connect(client).createJob(JOB_ID, 1, [100], past, { value: ONE_ETH })
      ).to.be.revertedWith("Deadline must be in the future");
    });
  });

  describe("assignFreelancer", function () {
    it("should assign a freelancer as the client", async function () {
      await createJob();
      await expect(escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address))
        .to.emit(escrow, "FreelancerAssigned")
        .withArgs(JOB_ID, freelancer.address);

      const job = await escrow.jobs(JOB_ID);
      expect(job.freelancer).to.equal(freelancer.address);
    });

    it("should allow the owner to assign a freelancer", async function () {
      await createJob();
      await escrow.connect(owner).assignFreelancer(JOB_ID, freelancer.address);
      const job = await escrow.jobs(JOB_ID);
      expect(job.freelancer).to.equal(freelancer.address);
    });

    it("should revert for non-client/non-owner callers", async function () {
      await createJob();
      await expect(
        escrow.connect(other).assignFreelancer(JOB_ID, freelancer.address)
      ).to.be.revertedWith("Only client or owner can assign");
    });

    it("should revert with the zero address", async function () {
      await createJob();
      await expect(
        escrow.connect(client).assignFreelancer(JOB_ID, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid freelancer address");
    });

    it("should revert when a freelancer is already assigned", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await expect(
        escrow.connect(client).assignFreelancer(JOB_ID, other.address)
      ).to.be.revertedWith("Freelancer already assigned");
    });

    it("should revert when the job does not exist", async function () {
      await expect(
        escrow.connect(client).assignFreelancer("nope", freelancer.address)
      ).to.be.revertedWith("Job does not exist or is inactive");
    });
  });

  describe("releaseMilestone", function () {
    it("should release funds to the freelancer and mark the milestone released", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH });
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);

      const balanceBefore = await ethers.provider.getBalance(freelancer.address);

      await expect(escrow.connect(owner).releaseMilestone(JOB_ID, 0))
        .to.emit(escrow, "MilestoneReleased")
        .withArgs(JOB_ID, 0, freelancer.address, ONE_ETH / 2n);

      const balanceAfter = await ethers.provider.getBalance(freelancer.address);
      expect(balanceAfter - balanceBefore).to.equal(ONE_ETH / 2n);

      const ms = await escrow.getMilestone(JOB_ID, 0);
      expect(ms.status).to.equal(MilestoneStatus.Released);
      expect(ms.amount).to.equal(0n);

      const job = await escrow.jobs(JOB_ID);
      expect(job.releasedAmount).to.equal(ONE_ETH / 2n);
    });

    it("should complete the job when all milestones are released", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH });
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);

      await escrow.connect(owner).releaseMilestone(JOB_ID, 0);
      let job = await escrow.jobs(JOB_ID);
      expect(job.isCompleted).to.equal(false);
      expect(job.isActive).to.equal(true);

      await escrow.connect(owner).releaseMilestone(JOB_ID, 1);
      job = await escrow.jobs(JOB_ID);
      expect(job.isCompleted).to.equal(true);
      expect(job.isActive).to.equal(false);
    });

    it("should revert when called by a non-owner", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await expect(
        escrow.connect(freelancer).releaseMilestone(JOB_ID, 0)
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });

    it("should revert when no freelancer is assigned", async function () {
      await createJob();
      await expect(escrow.connect(owner).releaseMilestone(JOB_ID, 0)).to.be.revertedWith(
        "No freelancer assigned"
      );
    });

    it("should revert for an invalid milestone index", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await expect(escrow.connect(owner).releaseMilestone(JOB_ID, 5)).to.be.revertedWith(
        "Invalid milestone index"
      );
    });

    it("should revert when the milestone is not pending", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH });
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(owner).releaseMilestone(JOB_ID, 0);

      await expect(escrow.connect(owner).releaseMilestone(JOB_ID, 0)).to.be.revertedWith(
        "Milestone not pending"
      );
    });

    it("should revert while a dispute is open", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(freelancer).openDispute(JOB_ID, 0, "deliverable missing");

      await expect(escrow.connect(owner).releaseMilestone(JOB_ID, 0)).to.be.revertedWith(
        "Milestone is under dispute"
      );
    });
  });

  describe("openDispute", function () {
    it("should open a dispute for the freelancer", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await expect(escrow.connect(freelancer).openDispute(JOB_ID, 0, "late payment"))
        .to.emit(escrow, "DisputeOpened")
        .withArgs(JOB_ID, 0, freelancer.address, "late payment");

      const ms = await escrow.getMilestone(JOB_ID, 0);
      expect(ms.disputeOpen).to.equal(true);
      expect(ms.disputeReason).to.equal("late payment");
    });

    it("should open a dispute for the client", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(client).openDispute(JOB_ID, 0, "bad work");
      const ms = await escrow.getMilestone(JOB_ID, 0);
      expect(ms.disputeOpen).to.equal(true);
    });

    it("should revert for outsiders", async function () {
      await createJob();
      await expect(
        escrow.connect(other).openDispute(JOB_ID, 0, "hack")
      ).to.be.revertedWith("Only client or freelancer can perform this action");
    });

    it("should revert for an invalid milestone index", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await expect(
        escrow.connect(client).openDispute(JOB_ID, 9, "oops")
      ).to.be.revertedWith("Invalid milestone index");
    });

    it("should revert when a dispute is already open", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(freelancer).openDispute(JOB_ID, 0, "first");
      await expect(
        escrow.connect(client).openDispute(JOB_ID, 0, "second")
      ).to.be.revertedWith("Dispute already open");
    });

    it("should revert on a non-pending milestone", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(owner).releaseMilestone(JOB_ID, 0);
      await expect(
        escrow.connect(client).openDispute(JOB_ID, 0, "too late")
      ).to.be.revertedWith("Milestone not pending");
    });
  });

  describe("resolveDispute", function () {
    it("should pay the freelancer when the freelancer wins", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH });
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(freelancer).openDispute(JOB_ID, 0, "scam");

      const balanceBefore = await ethers.provider.getBalance(freelancer.address);

      await expect(escrow.connect(owner).resolveDispute(JOB_ID, 0, true))
        .to.emit(escrow, "DisputeResolved")
        .withArgs(JOB_ID, 0, DisputeResult.FreelancerWins);

      const balanceAfter = await ethers.provider.getBalance(freelancer.address);
      expect(balanceAfter - balanceBefore).to.equal(ONE_ETH / 2n);

      const ms = await escrow.getMilestone(JOB_ID, 0);
      expect(ms.status).to.equal(MilestoneStatus.Released);
      expect(ms.disputeOpen).to.equal(false);
      expect(ms.disputeResult).to.equal(DisputeResult.FreelancerWins);
    });

    it("should refund the client when the client wins", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH });
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(client).openDispute(JOB_ID, 0, "freelancer ghosted");

      const balanceBefore = await ethers.provider.getBalance(client.address);

      await expect(escrow.connect(owner).resolveDispute(JOB_ID, 0, false))
        .to.emit(escrow, "DisputeResolved")
        .withArgs(JOB_ID, 0, DisputeResult.ClientWins);

      const balanceAfter = await ethers.provider.getBalance(client.address);
      expect(balanceAfter - balanceBefore).to.equal(ONE_ETH / 2n);

      const ms = await escrow.getMilestone(JOB_ID, 0);
      expect(ms.status).to.equal(MilestoneStatus.Refunded);
      expect(ms.disputeResult).to.equal(DisputeResult.ClientWins);
    });

    it("should revert when called by a non-owner", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(freelancer).openDispute(JOB_ID, 0, "x");
      await expect(
        escrow.connect(client).resolveDispute(JOB_ID, 0, true)
      ).to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
    });

    it("should revert when there is no open dispute", async function () {
      await createJob();
      await expect(escrow.connect(owner).resolveDispute(JOB_ID, 0, true)).to.be.revertedWith(
        "No dispute to resolve"
      );
    });

    it("should revert for an invalid milestone index", async function () {
      await createJob();
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(freelancer).openDispute(JOB_ID, 0, "x");
      await expect(escrow.connect(owner).resolveDispute(JOB_ID, 9, true)).to.be.revertedWith(
        "Invalid milestone index"
      );
    });
  });

  describe("claimRefundAfterDeadline", function () {
    it("should refund all pending milestones after the deadline", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH, deadlineOffset: HOUR });

      await time.increase(HOUR + 1);

      // The client pays gas for the refund tx, so assert via the contract balance
      // instead of the client's wallet balance.
      const contractBefore = await ethers.provider.getBalance(escrow.target);
      await expect(escrow.connect(client).claimRefundAfterDeadline(JOB_ID))
        .to.emit(escrow, "DeadlineRefund")
        .withArgs(JOB_ID, client.address, ONE_ETH);
      const contractAfter = await ethers.provider.getBalance(escrow.target);
      expect(contractBefore - contractAfter).to.equal(ONE_ETH);

      const job = await escrow.jobs(JOB_ID);
      expect(job.isCompleted).to.equal(true);
      expect(job.isActive).to.equal(false);
    });

    it("should not refund already-released milestones", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH, deadlineOffset: HOUR });
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(owner).releaseMilestone(JOB_ID, 0);

      await time.increase(HOUR + 1);

      const contractBefore = await ethers.provider.getBalance(escrow.target);
      await escrow.connect(client).claimRefundAfterDeadline(JOB_ID);
      const contractAfter = await ethers.provider.getBalance(escrow.target);
      expect(contractBefore - contractAfter).to.equal(ONE_ETH / 2n);
    });

    it("should revert when called before the deadline", async function () {
      await createJob({ deadlineOffset: HOUR * 10 });
      await expect(escrow.connect(client).claimRefundAfterDeadline(JOB_ID)).to.be.revertedWith(
        "Deadline has not passed yet"
      );
    });

    it("should revert when there are no funds to refund", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH, deadlineOffset: HOUR });
      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);

      // Release one milestone; open an unresolved dispute on the other so the
      // job stays active but has no refundable (pending, undisputed) funds.
      await escrow.connect(owner).releaseMilestone(JOB_ID, 0);
      await escrow.connect(client).openDispute(JOB_ID, 1, "under review");

      await time.increase(HOUR + 1);
      await expect(escrow.connect(client).claimRefundAfterDeadline(JOB_ID)).to.be.revertedWith(
        "No funds available for refund"
      );
    });

    it("should revert for non-client callers", async function () {
      await createJob({ deadlineOffset: HOUR });
      await time.increase(HOUR + 1);
      await expect(escrow.connect(other).claimRefundAfterDeadline(JOB_ID)).to.be.revertedWith(
        "Only the client can perform this action"
      );
    });
  });

  describe("view functions", function () {
    it("should return the remaining balance", async function () {
      await createJob({ percentages: [50, 50], value: ONE_ETH });
      expect(await escrow.getRemainingBalance(JOB_ID)).to.equal(ONE_ETH);

      await escrow.connect(client).assignFreelancer(JOB_ID, freelancer.address);
      await escrow.connect(owner).releaseMilestone(JOB_ID, 0);
      expect(await escrow.getRemainingBalance(JOB_ID)).to.equal(ONE_ETH / 2n);
    });

    it("should return all milestones for a job", async function () {
      await createJob({ percentages: [25, 25, 50], value: ONE_ETH });
      const all = await escrow.getJobMilestones(JOB_ID);

      expect(all.length).to.equal(3);
      expect(all[0].amount).to.equal(ONE_ETH / 4n);
      expect(all[1].amount).to.equal(ONE_ETH / 4n);
      expect(all[2].amount).to.equal(ONE_ETH / 2n);
      expect(all[0].status).to.equal(MilestoneStatus.Pending);
    });

    it("should reject creating the same job twice across signers", async function () {
      await createJob();
      await expect(
        escrow.connect(other).createJob(JOB_ID, 1, [100], (await time.latest()) + HOUR, {
          value: ONE_ETH,
        })
      ).to.be.revertedWith("Job already exists");
    });
  });
});
