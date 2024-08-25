// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ResearchFund {
    struct Project {
        address mentee;
        string projectDetails;
        uint256 requestedAmount;
        bool funded;
    }

    address public owner;
    mapping(address => bool) public mentors;
    mapping(address => bool) public mentees;
    mapping(uint256 => Project) public projects;
    uint256 public projectCount;

    event MentorAdded(address indexed mentor);
    event MenteeAdded(address indexed mentee);
    event ProjectRequested(address indexed mentee, uint256 indexed projectId, uint256 amount);
    event ProjectFunded(address indexed mentor, uint256 indexed projectId, uint256 amount);

    constructor() {
        owner = msg.sender; // contract owner
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyMentor() {
        require(mentors[msg.sender], "Only mentors can perform this action");
        _;
    }

    modifier onlyMentee() {
        require(mentees[msg.sender], "Only mentees can perform this action");
        _;
    }

    // Function to add mentors (by owner)
    function addMentor(address _mentor) external onlyOwner {
        mentors[_mentor] = true;
        emit MentorAdded(_mentor);
    }

    // Function to add mentees (by owner)
    function addMentee(address _mentee) external onlyOwner {
        mentees[_mentee] = true;
        emit MenteeAdded(_mentee);
    }

    // Function for mentees to request project funding
    function requestFunding(string calldata _projectDetails, uint256 _requestedAmount) external onlyMentee {
        require(_requestedAmount > 0, "Requested amount should be greater than 0");

        projectCount++;
        projects[projectCount] = Project({
            mentee: msg.sender,
            projectDetails: _projectDetails,
            requestedAmount: _requestedAmount,
            funded: false
        });

        emit ProjectRequested(msg.sender, projectCount, _requestedAmount);
    }

    // Function for mentors to fund a project
    function fundProject(uint256 _projectId) external payable onlyMentor {
        Project storage project = projects[_projectId];
        require(!project.funded, "Project already funded");
        require(msg.value >= project.requestedAmount, "Insufficient amount to fund the project");

        project.funded = true;
        payable(project.mentee).transfer(msg.value);

        emit ProjectFunded(msg.sender, _projectId, msg.value);
    }

    // Function to get details of a project
    function getProject(uint256 _projectId) external view returns (address, string memory, uint256, bool) {
        Project storage project = projects[_projectId];
        return (project.mentee, project.projectDetails, project.requestedAmount, project.funded);
    }

    // Function to get the contract's balance
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
