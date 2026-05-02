# Collaborative Document Approval System


## How It Works
- Sequential step → only one approver needed
- Parallel step → all approvers must approve
- Rejection anywhere → document rejected immediately
- Final step approved → document approved

# Expected flow:
- HR creates document
- Team lead approves
- Finance + Legal approve in parallel
- Document moves forward / completes approval
- A tiny caution: your code assumes workflow is always present and valid. In production, add validation before .map() or JavaScript will throw a tantrum if workflow is missing.


## Approval Workflow
- Step 1: 
    Sequential approval: Only [team.lead@company.com] approves first

- Step 2: 
    Parallel approval: Both:[finance.head@company.com,legal.head@company.com] must approve before moving on.

- Step 3: 
    Final sequential approval by: [ceo@company.com]