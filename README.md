# ResearchFund Smart Contract

## Overview

The `ResearchFund` smart contract is designed to facilitate funding for research projects. It allows mentors to fund projects requested by mentees. The contract ensures that only registered mentors can fund projects and only registered mentees can request funding.

## Table of Contents

- [Contract Details](#contract-details)
- [Functionality](#functionality)
- [Events](#events)
- [Modifiers](#modifiers)
- [Usage](#usage)
- [License](#license)

## Contract Details

- **Contract Name:** `ResearchFund`
- **Version:** Solidity ^0.8.0
- **License:** MIT

## Functionality

1. **Owner Management:**

   - **Add Mentor:** `addMentor(address _mentor)` - Adds a mentor to the system.
   - **Add Mentee:** `addMentee(address _mentee)` - Adds a mentee to the system.

2. **Project Funding:**

   - **Request Funding:** `requestFunding(string calldata _projectDetails, uint256 _requestedAmount)` - Allows mentees to request funding for their projects.
   - **Fund Project:** `fundProject(uint256 _projectId)` - Allows mentors to fund a requested project.

3. **Project Details:**
   - **Get Project:** `getProject(uint256 _projectId)` - Retrieves details of a specific project.
   - **Get Balance:** `getBalance()` - Returns the contract's balance.

## Events

- **MentorAdded:** Emitted when a new mentor is added.
- **MenteeAdded:** Emitted when a new mentee is added.
- **ProjectRequested:** Emitted when a mentee requests funding for a project.
- **ProjectFunded:** Emitted when a mentor funds a project.

## Modifiers

- **onlyOwner:** Restricts function access to the contract owner.
- **onlyMentor:** Restricts function access to registered mentors.
- **onlyMentee:** Restricts function access to registered mentees.

## Usage

1. **Deploy the Contract:**

   - The contract is initialized with the deployer as the owner.

2. **Add Mentors and Mentees:**

   - The owner can add mentors and mentees using the `addMentor` and `addMentee` functions, respectively.

3. **Request Funding:**

   - Registered mentees can request funding for their projects by providing project details and the requested amount.

4. **Fund Projects:**

   - Registered mentors can fund projects by specifying the project ID and sending the required amount of Ether.

5. **View Project Details:**

   - Any user can view the details of a specific project by providing the project ID.

6. **Check Contract Balance:**
   - Any user can check the contract's balance to see how much Ether is held by the contract.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
