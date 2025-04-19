# Branching Strategy - GitFlow Model

## Overview
The GitFlow model provides a robust framework for managing features, releases, and hotfixes in a distributed development environment.

## Branch Types
•	main: Holds production-ready code only.
•	develop: Integration branch where features and fixes are merged before release.
•	feature/: Branches for new features, created from develop.
•	release/: Branches for preparing production releases, created from develop.
•	hotfix/: Branches for quick fixes in main, merged back into both main and develop.

## Workflow Example
1.	Start a feature: git checkout -b feature/login develop
2.	Merge feature when done: git checkout develop → git merge feature/login
3.	Create a release: git checkout -b release/v1.0-beta develop
4.	Finalize release: Merge into main and develop, tag release v1.0-beta
5.	Fix urgent bug: git checkout -b hotfix/fix-ui main → merge into main and develop

## Version Tagging
Use annotated tags to mark milestones:
git tag -a v1.0-alpha -m "Alpha release"
git tag -a v1.0-beta -m "Beta release"
Tags are pushed with:
git push origin --tags

## Benefits
•	Parallel development using isolated branches
•	Clear release and hotfix processes
•	Maintains a clean and stable main branch

